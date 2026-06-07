import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { confirmCoursePurchase } from '@/lib/mobile/payment'

export async function POST(req: Request) {
	try {
		const { user } = await requireUser(req)
		if (!user.clerkId) {
			throw new ApiError(400, 'no_clerk_id', 'User has no clerkId')
		}

		const body = await req.json().catch(() => ({}))
		const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : ''
		const paymentIntentId =
			typeof body.paymentIntentId === 'string' ? body.paymentIntentId.trim() : ''

		if (!courseId || !paymentIntentId) {
			throw new ApiError(400, 'invalid_body', 'courseId and paymentIntentId required')
		}

		const result = await confirmCoursePurchase(
			user.clerkId,
			courseId,
			paymentIntentId,
		)
		return ok(result)
	} catch (e) {
		return handleError(e)
	}
}
