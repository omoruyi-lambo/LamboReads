"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { ImagePlus, X, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/useUpload";
import { BUCKET_CONFIGS, mimeTypesToAccept } from "@/lib/upload";

const CONFIG = BUCKET_CONFIGS["book-covers"];

interface Props {
  /**
   * The book's UUID — used to build the storage path covers/{bookId}/…
   * Pass the bookId once it is known (e.g. after creating the book row or
   * using a client-generated UUID before submit).
   */
  bookId: string;
  initialUrl?: string | null;
  onUploaded: (url: string, storagePath: string) => void;
  onRemoved?: () => void;
  className?: string;
}

export function CoverUpload({
  bookId,
  initialUrl,
  onUploaded,
  onRemoved,
  className,
}: Props) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { state, upload, retry, reset, deleteFile } = useUpload({
    bucket: "book-covers",
    entityId: bookId,
  });

  useEffect(() => {
    if (initialUrl) setPreview(initialUrl);
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

  // Clipboard paste support
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
          "relative flex aspect-[2/3] w-full max-w-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 transition-all duration-150",
          isDragActive
            ? "border-[#10B981] bg-[#ECFDF5] scale-[1.02]"
            : preview
            ? "border-[#E5E7EB] hover:border-[#10B981]"
            : "border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#10B981] hover:bg-[#F0FDF4]"
        )}
      >
        <input {...getInputProps()} />

        {/* Cover preview */}
        {preview && (
          <Image
            src={preview}
            alt="Cover preview"
            fill
            className="object-cover"
            sizes="200px"
            unoptimized={preview.startsWith("blob:")}
          />
        )}

        {/* Uploading overlay */}
        {state.status === "uploading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white gap-2 p-3">
            <div className="text-2xl font-bold">{state.progress}%</div>
            <div className="w-full h-1.5 rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-[#10B981] transition-all"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success badge */}
        {state.status === "success" && (
          <div className="absolute top-2 right-2 rounded-full bg-[#10B981] p-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </div>
        )}

        {/* Empty state */}
        {!preview && state.status !== "uploading" && (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <ImagePlus className="h-8 w-8 text-[#94A3B8]" />
            <p className="text-xs text-[#64748B] leading-relaxed">
              Drop image here, click to browse, or paste
            </p>
            <p className="text-[10px] text-[#94A3B8]">
              {CONFIG.formatLabels.join(" · ")} · max {CONFIG.maxLabel}
            </p>
          </div>
        )}

        {/* Replace / Remove controls on hover */}
        {preview && state.status !== "uploading" && (
          <div className="absolute inset-0 flex items-end justify-between p-2 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
            <button
              type="button"
              onClick={handleReplace}
              className="flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-[#111827] hover:bg-white"
            >
              <RefreshCw className="h-3 w-3" /> Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-md bg-red-500/90 p-1 hover:bg-red-500"
              aria-label="Remove cover"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {state.status === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 max-w-[200px]">
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

      {isDragActive && (
        <p className="text-xs text-[#10B981] font-medium max-w-[200px]">
          Drop to upload cover…
        </p>
      )}
    </div>
  );
}
