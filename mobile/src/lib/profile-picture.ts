/** HTTP(S) profil rasmi — bo'sh yoki noto'g'ri URL ni filtrlash. */
export function resolveProfilePictureUri(
	mongoPicture?: string | null,
	clerkImageUrl?: string | null,
	localPreview?: string | null,
): string | undefined {
	const local = localPreview?.trim()
	if (local && (local.startsWith('file:') || local.startsWith('data:'))) {
		return local
	}

	for (const raw of [clerkImageUrl, mongoPicture]) {
		const url = raw?.trim()
		if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
			return url
		}
	}
	return undefined
}
