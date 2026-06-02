/**
 * Clerk token'ini React'dan tashqarida (api/client.ts) olish uchun ko'prik.
 * Root layout ichidagi komponent `setTokenGetter(getToken)` chaqiradi.
 */
let getter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  getter = fn;
}

export async function getAuthToken(): Promise<string | null> {
  if (!getter) return null;
  try {
    return await getter();
  } catch {
    return null;
  }
}
