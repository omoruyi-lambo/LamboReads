"use client";

/**
 * useUpload hook — LamboReads
 *
 * Handles client-side file uploads directly to Supabase Storage via XHR so
 * we get real upload progress events (the Supabase JS SDK does not expose them).
 *
 * Features:
 *  • Real progress percentage + speed + ETA
 *  • UUID-based unique filenames (via buildBookFilePath / buildAuthorImagePath)
 *  • Retry on failure
 *  • Abort / cancel in-flight upload
 *  • Delete a previously uploaded file from storage
 *  • Signed URL generation for private buckets
 */

import { useState, useCallback, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  type StorageBucket,
  BUCKET_CONFIGS,
  buildBookFilePath,
  buildAuthorImagePath,
  validateFile,
  formatSpeed,
  formatRemaining,
} from "@/lib/upload";

export type { StorageBucket };
export { formatSpeed, formatRemaining };

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadState {
  status: UploadStatus;
  /** 0–100 */
  progress: number;
  /** bytes/second — updated during upload */
  speedBps: number;
  /** estimated seconds remaining */
  remainingSecs: number;
  /** public URL (public buckets) or storage path (private buckets) */
  publicUrl: string | null;
  /** storage object path, e.g. "covers/bookId/uuid.jpg" */
  storagePath: string | null;
  error: string | null;
}

const INITIAL: UploadState = {
  status: "idle",
  progress: 0,
  speedBps: 0,
  remainingSecs: 0,
  publicUrl: null,
  storagePath: null,
  error: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────────────────────────────────────

export interface UseUploadOptions {
  bucket: StorageBucket;
  /**
   * For book-related buckets: pass bookId.
   * For author-images: pass userId.
   * The hook decides the correct path builder automatically.
   */
  entityId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UploadResult {
  /** Public URL for public buckets; storage path for private buckets */
  url: string;
  /** Always the raw storage object path, e.g. "books/bookId/uuid.pdf" */
  storagePath: string;
}

export function useUpload({ bucket, entityId }: UseUploadOptions) {
  const [state, setState] = useState<UploadState>(INITIAL);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const config = BUCKET_CONFIGS[bucket];

  const reset = useCallback(() => {
    xhrRef.current?.abort();
    setState(INITIAL);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      // ── Validate ────────────────────────────────────────────────────────
      const validation = validateFile(file, bucket);
      if (!validation.valid) {
        setState({ ...INITIAL, status: "error", error: validation.error! });
        return null;
      }

      // ── Build storage path ───────────────────────────────────────────────
      const path =
        bucket === "author-images"
          ? buildAuthorImagePath(entityId, file)
          : buildBookFilePath(bucket, entityId, file);

      setState({ ...INITIAL, status: "uploading" });

      const supabase = getSupabaseClient();

      return new Promise((resolve) => {
        // Retrieve the session token asynchronously, then start XHR
        supabase.auth.getSession().then(({ data: { session } }) => {
          const token =
            session?.access_token ??
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
            "";

          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;

          const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

          let lastLoaded = 0;
          let lastTime = Date.now();

          xhr.upload.onprogress = (e) => {
            if (!e.lengthComputable) return;

            const now = Date.now();
            const dtSecs = (now - lastTime) / 1000;
            const loaded = e.loaded - lastLoaded;

            const speedBps = dtSecs > 0 ? loaded / dtSecs : 0;
            const remainingSecs =
              speedBps > 0 ? (e.total - e.loaded) / speedBps : Infinity;
            const progress = Math.round((e.loaded / e.total) * 100);

            lastLoaded = e.loaded;
            lastTime = now;

            setState((prev) => ({
              ...prev,
              progress,
              speedBps,
              remainingSecs,
            }));
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              let publicUrl: string | null = null;

              if (config.isPublic) {
                const { data } = supabase.storage
                  .from(bucket)
                  .getPublicUrl(path);
                publicUrl = data.publicUrl;
              }

              // Set state with the storagePath synchronously BEFORE resolving,
              // so that any component reading state immediately after await
              // already has the correct storagePath.
              setState({
                status: "success",
                progress: 100,
                speedBps: 0,
                remainingSecs: 0,
                publicUrl,
                storagePath: path,
                error: null,
              });

              // Return a typed result so callers never need to read state
              // to discover the storagePath — it's always in the return value.
              resolve({ url: publicUrl ?? path, storagePath: path });
            } else {
              let msg = `Upload failed (HTTP ${xhr.status}).`;
              try {
                const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
                msg = body.message ?? body.error ?? msg;
              } catch {
                // ignore JSON parse error
              }
              setState((prev) => ({
                ...prev,
                status: "error",
                error: msg,
              }));
              resolve(null);
            }
          };

          xhr.onerror = () => {
            setState((prev) => ({
              ...prev,
              status: "error",
              error: "Network error — check your connection and try again.",
            }));
            resolve(null);
          };

          xhr.onabort = () => {
            setState(INITIAL);
            resolve(null);
          };

          xhr.open("POST", storageUrl);
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          // x-upsert: true lets us overwrite an existing object at the same path
          xhr.setRequestHeader("x-upsert", "true");

          // Supabase Storage REST API expects multipart/form-data
          const form = new FormData();
          form.append("", file, path.split("/").pop()!);
          xhr.send(form);
        });
      });
    },
    [bucket, entityId, config.isPublic]
  );

  /** Retry with the same file. */
  const retry = useCallback(
    (file: File) => {
      reset();
      return upload(file);
    },
    [reset, upload]
  );
  /** Cancel an in-progress upload. */
  const abort = useCallback(() => {
    xhrRef.current?.abort();
  }, []);

  /**
   * Delete a previously uploaded file from storage.
   * Pass the storagePath returned by upload(), e.g. "covers/bookId/uuid.jpg"
   */
  const deleteFile = useCallback(
    async (storagePath: string): Promise<{ error: string | null }> => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.storage
        .from(bucket)
        .remove([storagePath]);
      return { error: error?.message ?? null };
    },
    [bucket]
  );

  /**
   * Generate a short-lived signed URL for a private bucket object.
   * Default expiry: 1 hour.
   */
  const getSignedUrl = useCallback(
    async (
      storagePath: string,
      expiresInSeconds = 3600
    ): Promise<string | null> => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(storagePath, expiresInSeconds);
      if (error || !data) return null;
      return data.signedUrl;
    },
    [bucket]
  );

  return {
    state,
    config,
    upload,
    retry,
    abort,
    reset,
    deleteFile,
    getSignedUrl,
  };
}
