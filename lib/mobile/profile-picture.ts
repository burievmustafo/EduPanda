import { clerkClient } from '@clerk/nextjs'

/** Clerk profil rasmini Mongo `picture` bilan sinxronlaydi (web UserProfile bilan bir xil manba). */
export async function syncPictureFromClerk(
	clerkId: string,
	currentPicture?: string | null,
): Promise<string | undefined> {
	try {
		const cu = await clerkClient.users.getUser(clerkId)
		const imageUrl = cu.imageUrl?.trim()
		return imageUrl || currentPicture?.trim() || undefined
	} catch {
		return currentPicture?.trim() || undefined
	}
}

/** Base64 (data URL yoki xom) → Clerk profil rasmi; yangi `imageUrl` qaytaradi. */
export async function uploadClerkProfileImage(
	clerkId: string,
	imageBase64: string,
): Promise<string> {
	const trimmed = imageBase64.trim()
	if (!trimmed) {
		throw new Error('Empty image data')
	}

	const dataUrl = trimmed.startsWith('data:')
		? trimmed
		: `data:image/jpeg;base64,${trimmed}`

	const comma = dataUrl.indexOf(',')
	const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
	const mimeMatch = dataUrl.match(/^data:([^;]+);/)
	const mime = mimeMatch?.[1] || 'image/jpeg'

	const buffer = Buffer.from(base64, 'base64')
	if (buffer.length < 16) {
		throw new Error('Invalid image data')
	}
	if (buffer.length > 5 * 1024 * 1024) {
		throw new Error('Image too large (max 5MB)')
	}

	const ext = mime.includes('png') ? 'png' : 'jpg'
	const file = new File([buffer], `avatar.${ext}`, { type: mime })

	const updated = await clerkClient.users.updateUserProfileImage(clerkId, { file })
	const imageUrl = updated.imageUrl?.trim()
	if (!imageUrl) {
		throw new Error('Clerk did not return image URL')
	}
	return imageUrl
}
