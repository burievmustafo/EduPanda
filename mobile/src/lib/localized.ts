import type { Locale, LocalizedText } from '@/types/dto';

/**
 * LocalizedText'dan joriy tilga mos matnni tanlaydi.
 * Fallback: ja bo'sh bo'lsa en qaytadi (DATABASE_AND_API_PLAN.md §1).
 */
export function tText(value: LocalizedText | undefined | null, locale: Locale): string {
  if (!value) return '';
  if (locale === 'ja' && value.ja && value.ja.trim().length > 0) return value.ja;
  return value.en;
}

/** Soniyani mm:ss formatiga aylantiradi (masalan 75 -> "1:15"). */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
