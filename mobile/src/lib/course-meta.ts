import type { CourseDTO, SectionDTO } from '@/types/dto'

import { formatUsd } from '@/lib/payment-demo'

export function getCoursePrice(course?: CourseDTO | null, courseId?: string): number {
	if (course && typeof course.currentPrice === 'number' && !Number.isNaN(course.currentPrice)) {
		return course.currentPrice
	}
	return 0
}

export function getCoursePriceLabel(course?: CourseDTO | null): {
	current: string
	old: string | null
} {
	const current = getCoursePrice(course)
	const currentLabel =
		current > 0 ? formatUsd(current) : 'Free'

	const old =
		course &&
		typeof course.oldPrice === 'number' &&
		!Number.isNaN(course.oldPrice) &&
		course.oldPrice > current
			? formatUsd(course.oldPrice)
			: null

	return { current: currentLabel, old }
}

export function getCourseDurationLabel(sections: SectionDTO[]): string {
	const totalSec = sections
		.flatMap((section) => section.lessons)
		.reduce((sum, lesson) => sum + (lesson.durationSec || 0), 0)

	if (totalSec <= 0) return '—'

	const hours = totalSec / 3600
	if (hours < 1) {
		const minutes = Math.max(1, Math.round(totalSec / 60))
		return `${minutes} min`
	}

	return `${hours.toFixed(2)} hours`
}

export function getSortedLessons(sections: SectionDTO[]) {
	return [...sections]
		.sort((a, b) => a.position - b.position)
		.flatMap((section) => [...section.lessons].sort((a, b) => a.position - b.position))
}
