/** Web `CustomImage` bilan bir xil — default placeholder rasm emas. */
const PLACEHOLDER_PATH = '/assets/hero.png'

export function isCoursePreviewPlaceholder(url?: string | null): boolean {
	if (!url?.trim()) return true
	const value = url.trim()
	return value === PLACEHOLDER_PATH || value.endsWith(PLACEHOLDER_PATH)
}

function getWebOrigin(): string {
	const api = process.env.EXPO_PUBLIC_API_URL ?? ''
	const fromApi = api.replace(/\/en\/api\/mobile\/?$/, '')
	if (fromApi) return fromApi.replace(/\/$/, '')
	return 'https://edu-panda-wine.vercel.app'
}

/** Mobil `Image` uchun URI; placeholder yoki bo'sh bo'lsa `undefined`. */
export function getCoursePreviewImageUri(url?: string | null): string | undefined {
	if (isCoursePreviewPlaceholder(url)) return undefined
	const value = url!.trim()
	if (value.startsWith('http://') || value.startsWith('https://')) return value
	if (value.startsWith('/')) return `${getWebOrigin()}${value}`
	return value
}
