import {
	requireUser,
	ok,
	handleError,
	ApiError,
} from '@/lib/mobile/api'
import {
	clearAllNotifications,
	listNotificationsForUser,
} from '@/lib/mobile/notifications'

export async function GET(req: Request) {
	try {
		const { user } = await requireUser(req)
		if (!user.clerkId) {
			throw new ApiError(400, 'no_clerk_id', 'User has no clerkId')
		}
		const items = await listNotificationsForUser(user.clerkId)
		return ok(items)
	} catch (e) {
		return handleError(e)
	}
}

export async function DELETE(req: Request) {
	try {
		const { user } = await requireUser(req)
		if (!user.clerkId) {
			throw new ApiError(400, 'no_clerk_id', 'User has no clerkId')
		}
		await clearAllNotifications(user.clerkId)
		return ok({ cleared: true })
	} catch (e) {
		return handleError(e)
	}
}
