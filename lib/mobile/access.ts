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
	return hasCourseAccess((section as any).course, userId, role)
}
