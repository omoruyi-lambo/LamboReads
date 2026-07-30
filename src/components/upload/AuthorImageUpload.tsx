"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  UserCircle2,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/useUpload";
import { BUCKET_CONFIGS, mimeTypesToAccept } from "@/lib/upload";

const CONFIG = BUCKET_CONFIGS["author-images"];

interface Props {
  /** Current authenticated user's ID — images land at {userId}/{uuid}.ext */
  userId: string;
  initialUrl?: string | null;
  onUploaded: (url: string, storagePath: string) => void;
  onRemoved?: () => void;
  className?: string;
}

export function AuthorImageUpload({
  userId,
  initialUrl,
  onUploaded,
  onRemoved,
  className,
}: Props) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { state, upload, retry, reset, deleteFile } = useUpload({
    bucket: "author-images",
    entityId: userId,
  });

  // Sync if an initialUrl arrives after first render (e.g. edit page hydration)
  useEffect(() => {
    if (initialUrl) {
      setPreview(initialUrl);
    }
  }, [initialUrl]);

  const processFile = useCallback(
    async (file: File) => {
      setPendingFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      const result = await upload(file);
      if (result) {
        onUploaded(result.url, result.storagePath);
      } else {
        // Revert preview on failure
        setPreview(initialUrl ?? null);
      }
    },
    [upload, onUploaded, initialUrl]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) processFile(accepted[0]);
    },
    [processFile]
  );

  // Paste support
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find(
        (i) => i.kind === "file" && CONFIG.allowedTypes.includes(i.type)
      );
      if (item) {
        const file = item.getAsFile();
        if (file) processFile(file);
      }
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: mimeTypesToAccept(CONFIG.allowedTypes),
    maxSize: CONFIG.maxBytes,
    multiple: false,
    // Don't open file picker on click when an image is already shown
    noClick: !!preview && state.status !== "error",
  });

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const path = state.storagePath;
    if (path) await deleteFile(path);
    setPreview(null);
    setPendingFile(null);
    reset();
    onRemoved?.();
  };

  const handleReplace = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setPendingFile(null);
    reset();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-150",
          isDragActive
            ? "border-[#10B981] bg-[#ECFDF5] scale-[1.02]"
            : preview
            ? "border-[#E5E7EB] hover:border-[#10B981]"
            : "border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#10B981] hover:bg-[#F0FDF4]"
        )}
      >
        <input {...getInputProps()} />

        {/* Avatar preview */}
        {preview ? (
          <Image
            src={preview}
            alt="Author profile photo"
            fill
            className="object-cover"
            sizes="112px"
            unoptimized={preview.startsWith("blob:")}
          />
        ) : (
          <UserCircle2 className="h-10 w-10 text-[#CBD5E1]" />
        )}

        {/* Uploading overlay */}
        {state.status === "uploading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white gap-1">
            <div className="text-sm font-bold">{state.progress}%</div>
            <div className="w-3/4 h-1 rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-[#10B981] transition-all"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success badge */}
        {state.status === "success" && (
          <div className="absolute top-1 right-1 rounded-full bg-[#10B981] p-0.5">
            <CheckCircle2 className="h-3 w-3 text-white" />
          </div>
        )}

        {/* Hover controls when image is set */}
        {preview && state.status !== "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-full">
            <button
              type="button"
              onClick={handleReplace}
              className="rounded-full bg-white/90 p-1.5 hover:bg-white"
              aria-label="Replace photo"
              title="Replace photo"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#111827]" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-full bg-red-500/90 p-1.5 hover:bg-red-500"
              aria-label="Remove photo"
              title="Remove photo"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Hint */}
      {!preview && state.status !== "uploading" && (
        <p className="text-[11px] text-[#94A3B8] max-w-[112px] text-center leading-tight">
          Drop, click, or paste your photo
        </p>
      )}

      {/* Error state */}
      {state.status === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 max-w-[220px]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">{state.error}</span>
          {pendingFile && (
            <button
              type="button"
              onClick={() => retry(pendingFile)}
              className="font-semibold underline whitespace-nowrap"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
