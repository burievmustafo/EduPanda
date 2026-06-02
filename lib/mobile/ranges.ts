type Range = { start: number; end: number }

// Overlap range'larni birlashtiradi (DATABASE_AND_API_PLAN.md §3.2).
export function mergeRanges(ranges: Range[]): Range[] {
	const valid = (ranges || [])
		.filter((r) => r && r.end > r.start)
		.sort((a, b) => a.start - b.start)
	const merged: Range[] = []
	for (const r of valid) {
		const last = merged[merged.length - 1]
		if (last && r.start <= last.end) {
			last.end = Math.max(last.end, r.end)
		} else {
			merged.push({ start: r.start, end: r.end })
		}
	}
	return merged
}

export function watchedSeconds(ranges: Range[]): number {
	return mergeRanges(ranges).reduce((s, r) => s + (r.end - r.start), 0)
}
