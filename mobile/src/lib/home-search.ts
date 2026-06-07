import { tText } from '@/lib/localized'
import type { CourseDTO, Locale } from '@/types/dto'

export function matchCourseSearch(
	course: CourseDTO,
	query: string,
	locale: Locale,
): boolean {
	const q = query.trim().toLowerCase()
	if (!q) return true

	const enTitle = course.title.en?.toLowerCase() ?? ''
	const jaTitle = course.title.ja?.toLowerCase() ?? ''
	const displayTitle = tText(course.title, locale).toLowerCase()
	const instructor = course.instructor.fullName.toLowerCase()
	const category = course.category.toLowerCase()

	return (
		displayTitle.includes(q) ||
		enTitle.includes(q) ||
		jaTitle.includes(q) ||
		instructor.includes(q) ||
		category.includes(q)
	)
}

export function filterCoursesBySearch(
	courses: CourseDTO[] | undefined,
	query: string,
	locale: Locale,
): CourseDTO[] {
	if (!courses?.length) return []
	const trimmed = query.trim()
	if (!trimmed) return courses
	return courses.filter((c) => matchCourseSearch(c, trimmed, locale))
}
