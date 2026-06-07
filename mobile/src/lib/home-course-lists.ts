import { filterCoursesByCategory } from '@/lib/home-categories'
import type { CourseDTO } from '@/types/dto'

/** Home horizontal rail — ko‘proq kurs ko‘rinsin, to‘liq ro‘yxat See All da. */
export const HOME_RAIL_LIMIT = 6

export function getHomeFilteredCourses(
	courses: CourseDTO[] | undefined,
	selectedCategory: string | null,
): CourseDTO[] {
	return filterCoursesByCategory(courses, selectedCategory)
}

/** Suggestions: avval enroll qilinmagan, keyin qolganlari (rail to‘lishi uchun). */
export function getAllSuggestionCourses(
	courses: CourseDTO[] | undefined,
	selectedCategory: string | null,
): CourseDTO[] {
	const pool = getHomeFilteredCourses(courses, selectedCategory)
	const notEnrolled = pool.filter((c) => !c.isEnrolled)
	const enrolled = pool.filter((c) => c.isEnrolled)
	return [...notEnrolled, ...enrolled]
}

export function getSuggestionCourses(
	courses: CourseDTO[] | undefined,
	selectedCategory: string | null,
	limit = HOME_RAIL_LIMIT,
): CourseDTO[] {
	return getAllSuggestionCourses(courses, selectedCategory).slice(0, limit)
}

/** Top courses: darslar soni bo‘yicha. */
export function getAllTopCourses(
	courses: CourseDTO[] | undefined,
	selectedCategory: string | null,
): CourseDTO[] {
	return [...getHomeFilteredCourses(courses, selectedCategory)].sort(
		(a, b) => b.lessonsCount - a.lessonsCount,
	)
}

export function getTopCourses(
	courses: CourseDTO[] | undefined,
	selectedCategory: string | null,
	limit = HOME_RAIL_LIMIT,
): CourseDTO[] {
	return getAllTopCourses(courses, selectedCategory).slice(0, limit)
}
