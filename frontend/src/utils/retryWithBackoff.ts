/**
 * Retries an async function with exponential backoff.
 * Attempts: up to 3 tries with 1s, 2s, 4s delays between retries.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Don't retry on the last attempt
      if (attempt < maxAttempts - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Converts raw backend/IC errors into user-friendly messages.
 */
export function parseBackendError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);

  // IC blob storage / HTTP gateway protocol errors
  if (
    msg.includes('Expected v3 response body') ||
    msg.includes('v3 response') ||
    msg.includes('response body')
  ) {
    return 'Upload failed due to a network issue. Please check your connection and try again.';
  }

  if (
    msg.toLowerCase().includes('image too large') ||
    msg.toLowerCase().includes('payload too large') ||
    msg.toLowerCase().includes('request entity too large')
  ) {
    return 'Image is too large. Please use a smaller image (under 1 MB after compression).';
  }

  if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('only admins')) {
    return 'You are not authorized to perform this action.';
  }

  if (msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('timed out')) {
    return 'The request timed out. Please try again.';
  }

  if (
    msg.toLowerCase().includes('network') ||
    msg.toLowerCase().includes('fetch') ||
    msg.toLowerCase().includes('failed to fetch')
  ) {
    return 'Network error. Please check your connection and try again.';
  }

  if (msg.toLowerCase().includes('not found')) {
    return 'The item was not found. It may have been deleted.';
  }

  // Return a cleaned-up version of the raw message as fallback
  return msg.length > 120 ? 'An unexpected error occurred. Please try again.' : msg;
}
