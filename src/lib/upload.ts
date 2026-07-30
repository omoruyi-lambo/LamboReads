/**
 * Upload utility library — LamboReads
 *
 * Centralises:
 *  • Bucket configurations (MIME types, size limits, path schemes)
 *  • UUID-based unique filename generation
 *  • Storage path construction per bucket / bookId / userId
 *  • Client-side file validation (type + size)
 *  • Path extraction from a full public URL (for delete / replace)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Bucket identifiers
// ─────────────────────────────────────────────────────────────────────────────
export type StorageBucket =
  | "book-covers"
  | "books"
  | "samples"
  | "audiobooks"
  | "author-images";

// ─────────────────────────────────────────────────────────────────────────────
// Per-bucket configuration
// ─────────────────────────────────────────────────────────────────────────────
export interface BucketConfig {
  bucket: StorageBucket;
  /** Public or private (affects whether we use getPublicUrl vs createSignedUrl) */
  isPublic: boolean;
  /** Maximum file size in bytes */
  maxBytes: number;
  /** Human-readable max size label */
  maxLabel: string;
  /** Allowed MIME types */
  allowedTypes: string[];
  /** Human-readable format labels */
  formatLabels: string[];
}

export const BUCKET_CONFIGS: Record<StorageBucket, BucketConfig> = {
  "book-covers": {
    bucket: "book-covers",
    isPublic: true,
    maxBytes: 5 * 1024 * 1024,
    maxLabel: "5 MB",
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    formatLabels: ["JPG", "PNG", "WEBP"],
  },
  books: {
    bucket: "books",
    isPublic: false,
    maxBytes: 100 * 1024 * 1024,
    maxLabel: "100 MB",
    allowedTypes: [
      "application/pdf",
      "application/epub+zip",
      "application/x-mobipocket-ebook",
      "application/octet-stream",
      "text/plain",
      "text/html",
    ],
    formatLabels: ["PDF", "EPUB", "MOBI", "TXT", "HTML"],
  },
  samples: {
    bucket: "samples",
    isPublic: true,
    maxBytes: 20 * 1024 * 1024,
    maxLabel: "20 MB",
    allowedTypes: [
      "application/pdf",
      "application/epub+zip",
      "text/plain",
      "text/html",
    ],
    formatLabels: ["PDF", "EPUB", "TXT", "HTML"],
  },
  audiobooks: {
    bucket: "audiobooks",
    isPublic: false,
    maxBytes: 500 * 1024 * 1024,
    maxLabel: "500 MB",
    allowedTypes: [
      "audio/mpeg",
      "audio/mp3",
      "audio/x-m4a",
      "audio/mp4",
      "audio/aac",
    ],
    formatLabels: ["MP3", "M4A"],
  },
  "author-images": {
    bucket: "author-images",
    isPublic: true,
    maxBytes: 5 * 1024 * 1024,
    maxLabel: "5 MB",
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    formatLabels: ["JPG", "PNG", "WEBP"],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Path generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a unique UUID v4-like filename that preserves the file extension.
 * Uses crypto.randomUUID() when available (all modern browsers + Node 19+),
 * falls back to a timestamp + random string for older environments.
 */
export function generateUniqueFilename(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  return `${id}.${ext}`;
}

/**
 * Returns the storage object path for a book-related file.
 *
 * Layout:
 *   book-covers  → covers/{bookId}/{uuid}.{ext}
 *   books        → books/{bookId}/{uuid}.{ext}
 *   samples      → samples/{bookId}/{uuid}.{ext}
 *   audiobooks   → audiobooks/{bookId}/{uuid}.{ext}
 */
export function buildBookFilePath(
  bucket: StorageBucket,
  bookId: string,
  file: File
): string {
  const filename = generateUniqueFilename(file);
  const folder = bucket; // folder name mirrors bucket name
  return `${folder}/${bookId}/${filename}`;
}

/**
 * Returns the storage object path for an author profile image.
 *
 * Layout: {userId}/{uuid}.{ext}
 */
export function buildAuthorImagePath(userId: string, file: File): string {
  const filename = generateUniqueFilename(file);
  return `${userId}/${filename}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  bucket: StorageBucket
): ValidationResult {
  const config = BUCKET_CONFIGS[bucket];

  if (!config.allowedTypes.includes(file.type)) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    // MOBI files often have type application/octet-stream; allow by extension
    if (
      bucket === "books" &&
      (ext === "mobi" || ext === "epub" || ext === "pdf" || ext === "txt" || ext === "html")
    ) {
      // pass through
    } else {
      return {
        valid: false,
        error: `File type "${file.type || ext?.toUpperCase()}" is not allowed. Accepted: ${config.formatLabels.join(", ")}.`,
      };
    }
  }

  if (file.size > config.maxBytes) {
    return {
      valid: false,
      error: `File is too large (${humanSize(file.size)}). Maximum allowed: ${config.maxLabel}.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "File appears to be empty." };
  }

  return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// URL / path helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the storage object path from a full Supabase public URL.
 *
 * Input:  https://{project}.supabase.co/storage/v1/object/public/book-covers/covers/abc/file.jpg
 * Output: covers/abc/file.jpg
 *
 * Returns null if the URL doesn't match the expected pattern.
 */
export function extractStoragePath(
  publicUrl: string,
  bucket: StorageBucket
): string | null {
  try {
    const url = new URL(publicUrl);
    // Path: /storage/v1/object/public/{bucket}/{...objectPath}
    // or:   /storage/v1/object/sign/{bucket}/{...objectPath}
    const marker = `/storage/v1/object/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;

    const afterMarker = url.pathname.slice(idx + marker.length);
    // afterMarker = "public/book-covers/covers/abc/file.jpg"
    //           or  "sign/books/books/abc/file.jpg?token=..."
    const segments = afterMarker.split("/");
    // segments[0] = "public" or "sign"
    // segments[1] = bucket name
    if (segments[1] !== bucket) return null;

    return segments.slice(2).join("/");
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────────────────

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatSpeed(bps: number): string {
  if (bps < 1024) return `${bps.toFixed(0)} B/s`;
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(1)} KB/s`;
  return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`;
}

export function formatRemaining(secs: number): string {
  if (!isFinite(secs) || secs <= 0) return "";
  if (secs < 60) return `${Math.ceil(secs)}s left`;
  return `${Math.ceil(secs / 60)}m left`;
}

// ─────────────────────────────────────────────────────────────────────────────
// react-dropzone accept map helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts an array of MIME types into a react-dropzone `accept` object.
 */
export function mimeTypesToAccept(
  mimeTypes: string[]
): Record<string, string[]> {
  return mimeTypes.reduce<Record<string, string[]>>((acc, mime) => {
    acc[mime] = [];
    return acc;
  }, {});
}
