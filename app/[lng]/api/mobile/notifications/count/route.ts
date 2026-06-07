import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { countUnreadNotifications } from '@/lib/mobile/notifications'

export async function GET(req: Request) {
	try {
		const { user } = await requireUser(req)
		if (!user.clerkId) {
			throw new ApiError(400, 'no_clerk_id', 'User has no clerkId')
		}
		const count = await countUnreadNotifications(user.clerkId)
		return ok({ count })
	} catch (e) {
		return handleError(e)
	}
}
