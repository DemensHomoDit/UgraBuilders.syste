import { toast } from "sonner";

const shown = new Map<string, number>();

function shouldShow(key: string, ttlMs: number): boolean {
  const now = Date.now();
  const prev = shown.get(key) || 0;
  if (now - prev < ttlMs) return false;
  shown.set(key, now);
  return true;
}

export function notifySuccess(message: string, key?: string, ttlMs = 1500) {
  if (key && !shouldShow(`s:${key}`, ttlMs)) return;
  toast.success(message);
}

export function notifyError(message: string, key?: string, ttlMs = 1500) {
  if (key && !shouldShow(`e:${key}`, ttlMs)) return;
  toast.error(message);
}
