/**
 * Generic retry utility with exponential backoff.
 * Used to wrap backend calls that may fail due to network timeouts or transient errors.
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
}

/**
 * Retries an async function with exponential backoff.
 * Delays: 1s, 2s, 4s (for maxAttempts=3, baseDelayMs=1000)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 1000 } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parses a backend error (from trap or StorageError) into a user-friendly message.
 * Distinguishes between image-too-large, unauthorized, and general network errors.
 */
export function parseBackendError(err: unknown): string {
  const message = extractErrorMessage(err);

  if (!message) return 'An unexpected error occurred. Please try again.';

  const lower = message.toLowerCase();

  if (lower.includes('size') || lower.includes('limit') || lower.includes('too large') || lower.includes('exceeds')) {
    return 'Image is too large. Please use an image under 1.5MB or try a smaller file.';
  }

  if (lower.includes('unauthorized') || lower.includes('only admin')) {
    return 'You are not authorized to perform this action. Please verify your admin access.';
  }

  if (lower.includes('timeout') || lower.includes('timed out')) {
    return 'The request timed out. Please check your connection and try again.';
  }

  if (lower.includes('network') || lower.includes('fetch') || lower.includes('connection')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  if (lower.includes('not found')) {
    return 'The saree was not found. It may have been deleted. Please refresh and try again.';
  }

  if (lower.includes('already exists')) {
    return 'A saree with this name already exists. Please use a different name.';
  }

  // Return the raw message if it's reasonably short and readable
  if (message.length < 200) {
    return `Error: ${message}`;
  }

  return 'Failed to save saree after multiple attempts. Please try again later.';
}

function extractErrorMessage(err: unknown): string {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.StorageError === 'string') return obj.StorageError;
    if (typeof obj.error === 'string') return obj.error;
  }
  return String(err);
}
