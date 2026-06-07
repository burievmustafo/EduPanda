export function getYouTubeId(url?: string | null) {
	const value = url?.trim()
	if (!value) return null

	const patterns = [
		/youtube\.com\/watch\?v=([^&]+)/,
		/youtube\.com\/embed\/([^?&]+)/,
		/youtu\.be\/([^?&]+)/,
		/youtube\.com\/shorts\/([^?&]+)/,
	]

	for (const pattern of patterns) {
		const match = value.match(pattern)
		if (match?.[1]) return match[1]
	}

	return null
}

export function getYouTubeEmbedUrl(url?: string | null) {
	const id = getYouTubeId(url)
	return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1` : null
}

export function getVimeoId(url?: string | null) {
	const value = url?.trim()
	if (!value) return null
	if (/^\d+$/.test(value)) return value

	const match = value.match(/vimeo\.com\/(?:video\/)?(\d+)/)
	return match?.[1] ?? null
}

export function getDirectVideoUrl(url?: string | null) {
	const value = url?.trim()
	if (!value) return null

	try {
		const parsedUrl = new URL(value)
		const pathname = parsedUrl.pathname.toLowerCase()
		const isVideoFile = /\.(mp4|webm|mov|m4v|ogg)$/i.test(pathname)

		return isVideoFile ? value : null
	} catch {
		return null
	}
}
