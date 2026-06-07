import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import {
	createCoursePaymentIntent,
	enrollFreeCourse,
	getCourseCheckoutPrice,
} from '@/lib/mobile/payment'

export async function POST(req: Request) {
	try {
		const { user } = await requireUser(req)
		if (!user.clerkId) {
			throw new ApiError(400, 'no_clerk_id', 'User has no clerkId')
		}

		const body = await req.json().catch(() => ({}))
		const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : ''
		if (!courseId) {
			throw new ApiError(400, 'invalid_body', 'courseId required')
		}

		const { totals } = await getCourseCheckoutPrice(courseId)

		if (totals.amountCents <= 0) {
			const result = await enrollFreeCourse(user.clerkId, courseId)
			return ok({
				free: true,
				isEnrolled: result.isEnrolled,
				totals,
				clientSecret: null,
				paymentIntentId: null,
			})
		}

		const paymentMethodId =
			typeof body.paymentMethodId === 'string' ? body.paymentMethodId.trim() : ''
		if (!paymentMethodId) {
			throw new ApiError(400, 'invalid_body', 'paymentMethodId required')
		}

		const intent = await createCoursePaymentIntent(
			user.clerkId,
			courseId,
			paymentMethodId,
		)

		return ok({
			free: false,
			totals: intent.totals,
			clientSecret: intent.clientSecret,
			paymentIntentId: intent.paymentIntentId,
		})
	} catch (e) {
		return handleError(e)
	}
}
