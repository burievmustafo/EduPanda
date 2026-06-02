import { ApiError, type Role } from '@/lib/mobile/api'
import Course from '@/database/course.model'
import Section from '@/database/section.model'
import Lesson from '@/database/lesson.model'
import SectionQuiz from '@/database/section-quiz.model'

// Teacher kontent yaratish uchun ownership tekshiruvlari (DATABASE_AND_API_PLAN.md §6.2).

export function requireTeacher(role: Role) {
	if (role !== 'teacher' && role !== 'admin') {
		throw new ApiError(403, 'forbidden', 'Teacher role required')
	}
}

export async function assertCourseOwner(courseId: string, userId: unknown) {
	const course = await Course.findById(courseId)
	if (!course) throw new ApiError(404, 'not_found', 'Course not found')
	if (String((course as any).instructor) !== String(userId)) {
		throw new ApiError(403, 'forbidden', 'Not your course')
	}
	return course
}

export async function assertSectionOwner(sectionId: string, userId: unknown) {
	const section = await Section.findById(sectionId)
	if (!section) throw new ApiError(404, 'not_found', 'Section not found')
	await assertCourseOwner(String((section as any).course), userId)
	return section
}

export async function assertLessonOwner(lessonId: string, userId: unknown) {
	const lesson = await Lesson.findById(lessonId)
	if (!lesson) throw new ApiError(404, 'not_found', 'Lesson not found')
	await assertSectionOwner(String((lesson as any).section), userId)
	return lesson
}

export async function assertQuizOwner(quizId: string, userId: unknown) {
	const quiz = await SectionQuiz.findById(quizId)
	if (!quiz) throw new ApiError(404, 'not_found', 'Quiz not found')
	await assertSectionOwner(String((quiz as any).section), userId)
	return quiz
}

/** Oddiy slug generatori (en sarlavhadan). */
export function slugify(text: string): string {
	const base = (text || 'course')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 50)
	return `${base || 'course'}-${Math.random().toString(36).slice(2, 7)}`
}
