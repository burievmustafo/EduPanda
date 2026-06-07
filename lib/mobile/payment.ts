import { purchaseCourse } from '@/actions/course.action'
import { sendNotification } from '@/actions/notification.action'
import {
	atachPayment,
	detachPaymentMethod,
	getCustomer,
	getCustomerCards,
} from '@/actions/customer.action'
import Course from '@/database/course.model'
import { connectToDatabase } from '@/lib/mongoose'
import stripe from '@/lib/stripe'
import { generateNumericId } from '@/lib/utils'

export type MobilePaymentCardDTO = {
	id: string
	brand: string
	last4: string
	expMonth: number
	expYear: number
	name: string | null
}

export function toPaymentCardDTO(card: {
	id: string
	card?: { brand?: string; last4?: string; exp_month?: number; exp_year?: number } | null
	billing_details?: { name?: string | null }
}): MobilePaymentCardDTO {
	return {
		id: card.id,
		brand: card.card?.brand ?? 'card',
		last4: card.card?.last4 ?? '????',
		expMonth: card.card?.exp_month ?? 0,
		expYear: card.card?.exp_year ?? 0,
		name: card.billing_details?.name ?? null,
	}
}

export async function listPaymentCards(clerkId: string): Promise<MobilePaymentCardDTO[]> {
	const cards = await getCustomerCards(clerkId)
	return cards.map((c) => toPaymentCardDTO(c))
}

export async function attachPaymentCard(clerkId: string, paymentMethodId: string) {
	const customer = await getCustomer(clerkId)
	if (!customer) throw new Error('Customer not found')

	await atachPayment(paymentMethodId, customer.id)
	return listPaymentCards(clerkId)
}

export async function removePaymentCard(clerkId: string, paymentMethodId: string) {
	await detachPaymentMethod(paymentMethodId, '/profile/credit-cards')
	return listPaymentCards(clerkId)
}

export function courseCheckoutTotals(priceUsd: number) {
	const subtotal = Math.max(0, priceUsd)
	const tax = subtotal * 0.1
	const total = subtotal + tax
	return {
		subtotalUsd: subtotal,
		taxUsd: tax,
		totalUsd: total,
		amountCents: Math.round(total * 100),
	}
}

type CheckoutCourse = {
	currentPrice?: number
	instructor?: { clerkId?: string } | null
}

export async function getCourseCheckoutPrice(courseId: string) {
	await connectToDatabase()
	const course = (await Course.findById(courseId)
		.select('currentPrice title instructor')
		.populate('instructor', 'clerkId fullName')
		.lean()) as CheckoutCourse | null
	if (!course) {
		throw new Error('Course not found')
	}
	const price =
		typeof course.currentPrice === 'number' && !Number.isNaN(course.currentPrice)
			? course.currentPrice
			: 0
	return { course, price, totals: courseCheckoutTotals(price) }
}

/** Stripe PaymentIntent yaratadi (web `payment()` bilan bir xil). */
export async function createCoursePaymentIntent(
	clerkId: string,
	courseId: string,
	paymentMethodId: string,
) {
	const { totals } = await getCourseCheckoutPrice(courseId)
	if (totals.amountCents <= 0) {
		return { free: true as const, clientSecret: null, paymentIntentId: null, totals }
	}

	const customer = await getCustomer(clerkId)
	if (!customer) throw new Error('Customer not found')

	await atachPayment(paymentMethodId, customer.id)

	const paymentIntent = await stripe.paymentIntents.create({
		amount: totals.amountCents,
		currency: 'usd',
		customer: customer.id,
		payment_method: paymentMethodId,
		metadata: { orderId: generateNumericId(), courseId, source: 'mobile' },
	})

	return {
		free: false as const,
		clientSecret: paymentIntent.client_secret,
		paymentIntentId: paymentIntent.id,
		totals,
	}
}

/** To'lov tasdiqlangach kursni sotib oladi (web checkout muvaffaqiyati). */
export async function confirmCoursePurchase(
	clerkId: string,
	courseId: string,
	paymentIntentId: string,
) {
	const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
	if (intent.status !== 'succeeded') {
		throw new Error('Payment not completed')
	}

	const metaCourseId = intent.metadata?.courseId
	if (metaCourseId && metaCourseId !== courseId) {
		throw new Error('Payment does not match course')
	}

	const { course } = await getCourseCheckoutPrice(courseId)
	await purchaseCourse(courseId, clerkId)

	const instructorClerkId = course.instructor?.clerkId
	if (instructorClerkId) {
		await sendNotification(instructorClerkId, 'messageCourseSold')
	}
	await sendNotification(clerkId, 'messageCoursePurchased')

	return { isEnrolled: true }
}

/** Bepul kurs — to'lovsiz enroll. */
export async function enrollFreeCourse(clerkId: string, courseId: string) {
	const { price } = await getCourseCheckoutPrice(courseId)
	if (price > 0) {
		throw new Error('Course requires payment')
	}
	await purchaseCourse(courseId, clerkId)
	await sendNotification(clerkId, 'messageCoursePurchased')
	return { isEnrolled: true }
}
