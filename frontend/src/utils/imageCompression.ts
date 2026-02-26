/**
 * Compresses an image file using the Canvas API.
 * Returns a Uint8Array<ArrayBuffer> of the compressed JPEG bytes.
 * Throws a descriptive error if compression fails or the result exceeds the IC limit.
 */
export async function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 1000,
  quality = 0.75,
): Promise<Uint8Array<ArrayBuffer>> {
  const MAX_SIZE = 1_400_000; // 1.4MB IC message limit

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error(`Unsupported image format: ${file.type}. Please use JPG, PNG, or WebP.`);
  }

  // Create ImageBitmap from file
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (err) {
    throw new Error(
      `Could not read image file. Please try a different image. (${err instanceof Error ? err.message : String(err)})`,
    );
  }

  try {
    // Calculate scaled dimensions preserving aspect ratio
    let { width, height } = bitmap;
    const aspectRatio = width / height;

    if (width > maxWidth) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    }
    if (height > maxHeight) {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }

    // Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is not available in this browser.');
    }

    ctx.drawImage(bitmap, 0, 0, width, height);

    // Try progressively lower quality until within size limit
    const qualities = [quality, 0.65, 0.55, 0.45, 0.35];
    for (const q of qualities) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', q),
      );

      if (!blob) {
        throw new Error('Canvas toBlob returned null. The image could not be compressed.');
      }

      const arrayBuffer = blob.arrayBuffer
        ? await blob.arrayBuffer()
        : await new Response(blob).arrayBuffer();

      const bytes = new Uint8Array(arrayBuffer as ArrayBuffer) as Uint8Array<ArrayBuffer>;

      if (bytes.length <= MAX_SIZE) {
        return bytes;
      }
    }

    // If still too large after all quality reductions, try smaller dimensions
    const smallerCanvas = document.createElement('canvas');
    smallerCanvas.width = Math.round(width * 0.6);
    smallerCanvas.height = Math.round(height * 0.6);
    const smallerCtx = smallerCanvas.getContext('2d');
    if (smallerCtx) {
      smallerCtx.drawImage(bitmap, 0, 0, smallerCanvas.width, smallerCanvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        smallerCanvas.toBlob(resolve, 'image/jpeg', 0.35),
      );
      if (blob) {
        const arrayBuffer = blob.arrayBuffer
          ? await blob.arrayBuffer()
          : await new Response(blob).arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer as ArrayBuffer) as Uint8Array<ArrayBuffer>;
        if (bytes.length <= MAX_SIZE) {
          return bytes;
        }
        throw new Error(
          `Image is still too large (${(bytes.length / 1024 / 1024).toFixed(2)}MB) after maximum compression. Please use a smaller image.`,
        );
      }
    }

    throw new Error(
      'Could not compress image to fit within the 1.4MB limit. Please use a smaller image.',
    );
  } finally {
    bitmap.close();
  }
}
