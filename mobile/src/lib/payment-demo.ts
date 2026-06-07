import type { CourseDTO } from '@/types/dto'

export type PaymentMethod = 'visa' | 'mastercard' | 'paypal'

export const PAYMENT_METHODS: Array<{
	id: PaymentMethod
	label: string
	icon: string
	detail: string
}> = [
	{ id: 'visa', label: 'Visa', icon: 'card-outline', detail: '**** 4242' },
	{ id: 'mastercard', label: 'Mastercard', icon: 'card', detail: '**** 5100' },
	{ id: 'paypal', label: 'PayPal', icon: 'logo-paypal', detail: 'paypal@example.com' },
]

export function getDemoCoursePrice(courseId: string): number {
	const seed = [...courseId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
	return [29, 35, 39, 49][seed % 4] ?? 35
}

export function getDemoCourseDuration(course?: CourseDTO): string {
	if (!course) return '4 weeks'
	if (course.lessonsCount <= 8) return '2 weeks'
	if (course.lessonsCount <= 16) return '4 weeks'
	return '6 weeks'
}

export function getPaymentMethod(method?: string | string[]): PaymentMethod {
	const value = Array.isArray(method) ? method[0] : method
	if (value === 'mastercard' || value === 'paypal' || value === 'visa') return value
	return 'visa'
}

export function formatUsd(value: number): string {
	return `$${value.toFixed(2)}`
}
