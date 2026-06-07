import Section from '@/database/section.model'
import Course from '@/database/course.model'
import Purchase from '@/database/purchase.model'
import type { Role } from '@/lib/mobile/api'

// Kursga/darsga kirish huquqi (DATABASE_AND_API_PLAN.md §3.1).

export async function hasCourseAccess(
	courseId: unknown,
	userId: unknown,
	role: Role
): Promise<boolean> {
	if (role === 'admin') return true
	const course = await Course.findById(courseId).select('instructor').lean()
	if (course && String((course as any).instructor) === String(userId)) return true
	return Boolean(await Purchase.exists({ user: userId, course: courseId }))
}

export async function hasLessonAccess(
	lesson: any,
	userId: unknown,
	role: Role
): Promise<boolean> {
	if (lesson?.free) return true

	const section = await Section.findById(lesson.section).select('course').lean()
	if (!section) return false

	const course = await Course.findById((section as any).course)
		.select('published instructor')
		.lean()
	if (!course) return false

	if (role === 'admin' || String((course as any).instructor) === String(userId)) {
		return true
	}

	if (await hasCourseAccess((section as any).course, userId, role)) {
		return true
	}

	// Public preview on published courses: free lessons or any lesson with a video.
	if ((course as any).published) {
		if (lesson?.free) return true
		if (lesson?.videoUrl?.trim()) return true
	}

	return false
}
