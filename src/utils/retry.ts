// Универсальные утилиты для повторных попыток (retry)

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, {
  retries = 3,
  delay = 500,
  onError
}: {
  retries?: number;
  delay?: number;
  onError?: (error: any) => void;
} = {}): Promise<T> {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(delay * attempt);
      }
    }
  }
  if (onError) onError(lastError);
  throw lastError;
} 