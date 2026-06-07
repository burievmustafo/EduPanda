import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { uploadClerkProfileImage } from '@/lib/mobile/profile-picture'

export async function POST(req: Request) {
	try {
		const { user, role } = await requireUser(req)
		if (!user.clerkId) {
			throw new ApiError(400, 'no_clerk_id', 'User has no clerkId')
		}

		const body = await req.json().catch(() => ({}))
		const imageBase64 =
			typeof body.imageBase64 === 'string' ? body.imageBase64 : ''

		const picture = await uploadClerkProfileImage(user.clerkId, imageBase64)
		user.picture = picture
		await user.save()

		return ok({
			id: String(user._id),
			clerkId: user.clerkId,
			fullName: user.fullName,
			email: user.email,
			picture,
			role,
		})
	} catch (e) {
		if (e instanceof Error && !(e as { status?: number }).status) {
			return handleError(new ApiError(400, 'invalid_image', e.message))
		}
		return handleError(e)
	}
}
