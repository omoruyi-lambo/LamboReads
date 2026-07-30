"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpload, formatSpeed, formatRemaining } from "@/hooks/useUpload";
import { BUCKET_CONFIGS, mimeTypesToAccept, humanSize } from "@/lib/upload";

const CONFIG = BUCKET_CONFIGS["books"];

interface Props {
  /**
   * The book's UUID — used to build the storage path books/{bookId}/…
   * Generate this on the client with crypto.randomUUID() before the form is
   * submitted so file paths and the DB row share the same ID.
   */
  bookId: string;
  initialPath?: string | null;
  initialName?: string | null;
  onUploaded: (storagePath: string, fileName: string) => void;
  onRemoved?: () => void;
  className?: string;
}

export function FileUpload({
  bookId,
  initialPath,
  initialName,
  onUploaded,
  onRemoved,
  className,
}: Props) {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [existingPath, setExistingPath] = useState<string | null>(
    initialPath ?? null
  );
  const [existingName, setExistingName] = useState<string | null>(
    initialName ?? null
  );

  const { state, upload, retry, reset, deleteFile } = useUpload({
    bucket: "books",
    entityId: bookId,
  });

  const processFile = useCallback(
    async (file: File) => {
      setCurrentFile(file);
      const result = await upload(file);
      // For private buckets upload() returns the storage path as result.url
      if (result) {
        setExistingPath(result.storagePath);
        setExistingName(file.name);
        onUploaded(result.storagePath, file.name);
      }
    },
    [upload, onUploaded]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) processFile(accepted[0]);
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: mimeTypesToAccept(CONFIG.allowedTypes),
    maxSize: CONFIG.maxBytes,
    multiple: false,
  });

  const handleRemove = async () => {
    const path = existingPath ?? state.storagePath;
    if (path) await deleteFile(path);
    setCurrentFile(null);
    setExistingPath(null);
    setExistingName(null);
    reset();
    onRemoved?.();
  };

  const isUploading = state.status === "uploading";
  const isError = state.status === "error";
  const hasFile = !!(existingPath || isUploading);
  const fileExt = existingName?.split(".").pop()?.toUpperCase() ?? "";

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone — hidden once a file exists */}
      {!hasFile && (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all duration-150",
            isDragActive
              ? "border-[#10B981] bg-[#ECFDF5] scale-[1.01]"
              : "border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#10B981] hover:bg-[#F0FDF4]"
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud
            className={cn(
              "h-10 w-10",
              isDragActive ? "text-[#10B981]" : "text-[#94A3B8]"
            )}
          />
          <div className="text-center">
            <p className="text-sm font-medium text-[#111827]">
              {isDragActive ? "Drop the file here" : "Drag & drop your book file"}
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              or{" "}
              <span className="text-[#10B981] font-medium">click to browse</span>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {CONFIG.formatLabels.map((label) => (
              <span
                key={label}
                className="rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#64748B]"
              >
                {label}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-[#94A3B8]">Maximum {CONFIG.maxLabel}</p>
        </div>
      )}

      {/* Uploading state */}
      {isUploading && currentFile && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9]">
              <Loader2 className="h-5 w-5 text-[#10B981] animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111827] truncate">
                {currentFile.name}
              </p>
              <p className="text-xs text-[#94A3B8]">
                {humanSize(currentFile.size)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>{state.progress}%</span>
              <span className="flex items-center gap-3">
                {state.speedBps > 0 && (
                  <span>{formatSpeed(state.speedBps)}</span>
                )}
                {state.remainingSecs > 0 && (
                  <span>{formatRemaining(state.remainingSecs)}</span>
                )}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#10B981] transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Success / existing file */}
      {!isUploading && existingPath && (
        <div className="flex items-center gap-3 rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#A7F3D0]">
            <FileText className="h-5 w-5 text-[#059669]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#111827] truncate">
              {existingName ?? "Book file uploaded"}
            </p>
            {fileExt && (
              <span className="inline-block mt-0.5 rounded bg-[#A7F3D0] px-1.5 py-px text-[10px] font-bold text-[#059669]">
                {fileExt}
              </span>
            )}
          </div>
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#10B981]" />
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-lg p-1.5 text-[#6B7280] hover:bg-white hover:text-red-500 transition-colors"
            title="Remove file"
            aria-label="Remove book file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">Upload failed</p>
              <p className="text-xs text-red-600 mt-0.5">{state.error}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {currentFile && (
              <button
                type="button"
                onClick={() => retry(currentFile)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
