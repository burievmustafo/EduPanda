/** Figma W9 da reyting ko‘rsatiladi — API yo‘q, barqaror mock. */
export function getFigmaMockRating(seed: string): string {
	let hash = 0
	for (let i = 0; i < seed.length; i++) {
		hash = (hash + seed.charCodeAt(i) * (i + 1)) % 997
	}
	const value = 4.4 + (hash % 6) * 0.1
	return value.toFixed(1)
}
