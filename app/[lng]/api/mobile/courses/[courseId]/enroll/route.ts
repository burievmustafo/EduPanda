import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { enrollFreeCourse, getCourseCheckoutPrice } from '@/lib/mobile/payment'

/** Faqat bepul kurslar — pullik kurslar uchun `/payment/checkout` ishlating. */
export async function POST(
	req: Request,
	{ params }: { params: { courseId: string } }
) {
	try {
		const { user } = await requireUser(req)
		if (!user.clerkId) {
			throw new ApiError(400, 'no_clerk_id', 'User has no clerkId')
		}
		const { price } = await getCourseCheckoutPrice(params.courseId)
		if (price > 0) {
			throw new ApiError(
				402,
				'payment_required',
				'Paid courses require Stripe checkout',
			)
		}
		const result = await enrollFreeCourse(user.clerkId, params.courseId)
		return ok(result)
	} catch (e) {
		return handleError(e)
	}
}
