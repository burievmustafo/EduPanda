import type { CourseProgressItem } from '@/api/dashboards'
import { tText } from '@/lib/localized'
import type { CourseDTO, Locale } from '@/types/dto'

export type MyCoursesTab = 'saved' | 'inProgress' | 'completed'

export type MyCourseRow = {
	courseId: string
	title: string
	institution: string
	description: string
	rating: string
	percent: number
	lessonsCount: number
	previewImage?: string
	category: string
}

export function buildInProgressRows(
	inProgress: CourseProgressItem[],
	courses: CourseDTO[] | undefined,
	locale: Locale,
): MyCourseRow[] {
	return inProgress
		.filter((p) => p.percent < 100)
		.map((row) => {
			const course = courses?.find((c) => c.id === row.courseId)
			return {
				courseId: row.courseId,
				title: tText(row.title, locale),
				institution: course?.instructor.fullName ?? '',
				description: course ? tText(course.description, locale) : '',
				rating: course?.averageRating ? course.averageRating.toFixed(1) : '',
				percent: row.percent,
				lessonsCount: row.totalLessons,
				previewImage: course?.previewImage,
				category: course?.category ?? 'General',
			}
		})
}

export function buildCompletedRows(
	inProgress: CourseProgressItem[],
	courses: CourseDTO[] | undefined,
	locale: Locale,
): MyCourseRow[] {
	return inProgress
		.filter((p) => p.percent >= 100)
		.map((row) => {
			const course = courses?.find((c) => c.id === row.courseId)
			return {
				courseId: row.courseId,
				title: tText(row.title, locale),
				institution: course?.instructor.fullName ?? '',
				description: course ? tText(course.description, locale) : '',
				rating: course?.averageRating ? course.averageRating.toFixed(1) : '',
				percent: 100,
				lessonsCount: row.totalLessons,
				previewImage: course?.previewImage,
				category: course?.category ?? 'General',
			}
		})
}

export function buildSavedRows(
	savedIds: string[],
	courses: CourseDTO[] | undefined,
	locale: Locale,
): MyCourseRow[] {
	if (!courses?.length) return []
	return savedIds
		.map((id) => courses.find((c) => c.id === id))
		.filter((c): c is CourseDTO => Boolean(c))
		.map((course) => ({
			courseId: course.id,
			title: tText(course.title, locale),
			institution: course.instructor.fullName,
			description: tText(course.description, locale),
			rating: course.averageRating ? course.averageRating.toFixed(1) : '',
			percent: 0,
			lessonsCount: course.lessonsCount,
			previewImage: course.previewImage,
			category: course.category,
		}))
}

