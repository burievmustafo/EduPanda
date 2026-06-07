import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { enrollFreeCourse, getCourseCheckoutPrice, courseCheckoutTotals } from '@/lib/mobile/payment'
import { getCustomer } from '@/actions/customer.action'
import stripe from '@/lib/stripe'

/** PaymentSheet uchun barcha kerakli ma'lumotlarni qaytaradi. */
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

		const { price } = await getCourseCheckoutPrice(courseId)
		const totals = courseCheckoutTotals(price)

		// Bepul kurs — to'g'ridan-to'g'ri enroll
		if (totals.amountCents <= 0) {
			const result = await enrollFreeCourse(user.clerkId, courseId)
			return ok({ free: true, isEnrolled: result.isEnrolled, totals })
		}

		// Stripe Customer olish yoki yaratish
		const customer = await getCustomer(user.clerkId)
		if (!customer || customer.deleted) {
			throw new ApiError(500, 'customer_error', 'Could not get Stripe customer')
		}

		// EphemeralKey — PaymentSheet uchun mijoz sessiyasi
		const ephemeralKey = await stripe.ephemeralKeys.create(
			{ customer: customer.id },
			{ apiVersion: '2023-10-16' },
		)

		// PaymentIntent — karta saqlash imkoni bilan
		const paymentIntent = await stripe.paymentIntents.create({
			amount: totals.amountCents,
			currency: 'usd',
			customer: customer.id,
			setup_future_usage: 'off_session',
			automatic_payment_methods: { enabled: true },
			metadata: { courseId, source: 'mobile_sheet' },
		})

		return ok({
			free: false,
			clientSecret: paymentIntent.client_secret,
			ephemeralKey: ephemeralKey.secret,
			customerId: customer.id,
			paymentIntentId: paymentIntent.id,
			publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
			totals,
		})
	} catch (e) {
		return handleError(e)
	}
}
