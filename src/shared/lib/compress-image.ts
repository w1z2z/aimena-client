const LISTING_MAX_EDGE = 2048;
const AVATAR_MAX_EDGE = 1024;
const DEFAULT_QUALITY = 0.82;

type CompressOptions = {
  maxEdge?: number;
  quality?: number;
};

function supportsWebpEncoding(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

function loadImageBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Не удалось сжать изображение"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

/**
 * Client-side resize/compress before multipart upload.
 * Prefers WebP when the browser can encode it; falls back to JPEG.
 * Non-images (e.g. PDF) are returned unchanged.
 */
export async function compressImageForUpload(
  file: File,
  options: CompressOptions = {},
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const maxEdge = options.maxEdge ?? LISTING_MAX_EDGE;
  const quality = options.quality ?? DEFAULT_QUALITY;

  let bitmap: ImageBitmap;
  try {
    bitmap = await loadImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);

    const useWebp = supportsWebpEncoding();
    const mime = useWebp ? "image/webp" : "image/jpeg";
    const blob = await canvasToBlob(canvas, mime, quality);

    // Keep original if compression did not help (rare for photos).
    if (blob.size >= file.size && scale === 1 && file.type === mime) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    const extension = useWebp ? "webp" : "jpg";
    return new File([blob], `${baseName}.${extension}`, {
      type: mime,
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}

export function compressAvatarForUpload(file: File): Promise<File> {
  return compressImageForUpload(file, {
    maxEdge: AVATAR_MAX_EDGE,
    quality: 0.84,
  });
}

export function compressListingImageForUpload(file: File): Promise<File> {
  return compressImageForUpload(file, {
    maxEdge: LISTING_MAX_EDGE,
    quality: DEFAULT_QUALITY,
  });
}
