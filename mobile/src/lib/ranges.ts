import type { WatchedRange } from '@/types/dto';

/**
 * Overlap range'larni birlashtiradi (DATABASE_AND_API_PLAN.md §3.2).
 * Faqat currentTime'ga ishonmaymiz — student skip qilishi mumkin.
 */
export function mergeRanges(ranges: WatchedRange[]): WatchedRange[] {
  const valid = ranges.filter((r) => r.end > r.start).sort((a, b) => a.start - b.start);
  const merged: WatchedRange[] = [];
  for (const r of valid) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
    } else {
      merged.push({ start: r.start, end: r.end });
    }
  }
  return merged;
}

/** Unique ko'rilgan soniyalar yig'indisi. */
export function watchedSeconds(ranges: WatchedRange[]): number {
  return mergeRanges(ranges).reduce((sum, r) => sum + (r.end - r.start), 0);
}

/** Ko'rilgan foiz (0..100). */
export function watchedPercent(ranges: WatchedRange[], durationSec: number): number {
  if (durationSec <= 0) return 0;
  return Math.min(100, Math.round((watchedSeconds(ranges) / durationSec) * 100));
}
