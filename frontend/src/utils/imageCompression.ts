/**
 * Client-side image compression using the browser Canvas API.
 * Compresses images to stay under the Internet Computer's message size limit.
 */

const MAX_SIZE_BYTES = 1.4 * 1024 * 1024; // 1.4MB target (safe under IC's ~2MB limit)
const MAX_DIMENSION = 1200; // Max width or height in pixels

export interface CompressionResult {
  blob: Blob;
  bytes: Uint8Array<ArrayBuffer>;
  originalSizeKB: number;
  compressedSizeKB: number;
  wasCompressed: boolean;
}

/**
 * Compresses an image File using the Canvas API.
 * Automatically resizes and reduces quality to stay under MAX_SIZE_BYTES.
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSizeKB = Math.round(file.size / 1024);

  // If already small enough, just convert to bytes
  if (file.size <= MAX_SIZE_BYTES) {
    const buf = await file.arrayBuffer() as ArrayBuffer;
    const bytes = new Uint8Array(buf) as Uint8Array<ArrayBuffer>;
    return {
      blob: file,
      bytes,
      originalSizeKB,
      compressedSizeKB: originalSizeKB,
      wasCompressed: false,
    };
  }

  // Load image into an ImageBitmap
  const imageBitmap = await createImageBitmap(file);
  const { width: origW, height: origH } = imageBitmap;

  // Calculate scaled dimensions
  let targetW = origW;
  let targetH = origH;
  if (origW > MAX_DIMENSION || origH > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / origW, MAX_DIMENSION / origH);
    targetW = Math.round(origW * ratio);
    targetH = Math.round(origH * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.drawImage(imageBitmap, 0, 0, targetW, targetH);
  imageBitmap.close();

  // Try progressively lower quality until under size limit
  const qualities = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35];
  let resultBlob: Blob | null = null;

  for (const quality of qualities) {
    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (blob.size <= MAX_SIZE_BYTES) {
      resultBlob = blob;
      break;
    }
    // If still too large at lowest quality, use it anyway
    if (quality === qualities[qualities.length - 1]) {
      resultBlob = blob;
    }
  }

  if (!resultBlob) {
    // Fallback: use the file as-is
    const buf = await file.arrayBuffer() as ArrayBuffer;
    const bytes = new Uint8Array(buf) as Uint8Array<ArrayBuffer>;
    return { blob: file, bytes, originalSizeKB, compressedSizeKB: originalSizeKB, wasCompressed: false };
  }

  const buf = await resultBlob.arrayBuffer() as ArrayBuffer;
  const bytes = new Uint8Array(buf) as Uint8Array<ArrayBuffer>;
  return {
    blob: resultBlob,
    bytes,
    originalSizeKB,
    compressedSizeKB: Math.round(resultBlob.size / 1024),
    wasCompressed: true,
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      },
      type,
      quality
    );
  });
}

/** Format bytes as a human-readable string */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
