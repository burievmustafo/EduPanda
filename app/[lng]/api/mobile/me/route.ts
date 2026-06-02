import { requireUser, ok, handleError } from '@/lib/mobile/api'

export async function GET(req: Request) {
	try {
		const { user, role } = await requireUser(req)
		return ok({
			id: String(user._id),
			clerkId: user.clerkId,
			fullName: user.fullName,
			email: user.email,
			picture: user.picture,
			role,
		})
	} catch (e) {
		return handleError(e)
	}
}
