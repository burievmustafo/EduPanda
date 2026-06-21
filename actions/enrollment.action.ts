'use server'

import { connectToDatabase } from '@/lib/mongoose'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs'
import User from '@/database/user.model'
import Course from '@/database/course.model'
import Section from '@/database/section.model'
import Lesson from '@/database/lesson.model'
import Purchase from '@/database/purchase.model'
import SectionQuiz from '@/database/section-quiz.model'
import QuizAttempt from '@/database/quiz-attempt.model'
import { countCompletedLessons, getLessonProgressMap } from '@/lib/learning-progress'

// Joriy foydalanuvchi kurs egasimi (yoki admin) — tekshiradi.
async function requireOwnedCourse(courseId: string) {
	const { userId: clerkId } = auth()
	if (!clerkId) throw new Error('Unauthorized')
	const me = await User.findOne({ clerkId }).select('_id role')
	if (!me) throw new Error('Unauthorized')
	const course = await Course.findById(courseId)
	if (!course) throw new Error('Course not found')
	if (String(course.instructor) !== String(me._id) && me.role !== 'admin') {
		throw new Error('Forbidden')
	}
	return { me, course }
}

// Kursga yozilgan o'quvchilar + ularning progressi va test natijalari.
export const getCourseStudents = async (courseId: string) => {
	try {
		await connectToDatabase()
		await requireOwnedCourse(courseId)

		const sections = await Section.find({ course: courseId }).select('_id')
		const sectionIds = sections.map((s: any) => s._id)

		const lessons = await Lesson.find({ section: { $in: sectionIds } }).select(
			'_id'
		)
		const lessonIds = lessons.map((l: any) => String(l._id))
		const totalLessons = lessonIds.length

		const quizzes = await SectionQuiz.find({
			section: { $in: sectionIds },
		}).select('_id')
		const quizIds = quizzes.map((q: any) => q._id)

		const purchases = await Purchase.find({ course: courseId })
			.sort({ createdAt: -1 })
			.populate({
				path: 'user',
				model: User,
				select: 'fullName email picture clerkId',
			})

		const students = await Promise.all(
			purchases.map(async (p: any) => {
				const user = p.user
				if (!user) return null

				const completed = await countCompletedLessons({
					clerkId: user.clerkId,
					studentId: user._id,
					lessonIds,
				})
				const progressPercent =
					totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0

				// Test natijalari — har test bo'yicha eng yaxshi urinish.
				const attempts = await QuizAttempt.find({
					student: user._id,
					quiz: { $in: quizIds },
				})
				const bestByQuiz: Record<string, { score: number; passed: boolean }> = {}
				attempts.forEach((a: any) => {
					const k = String(a.quiz)
					if (!bestByQuiz[k] || a.score > bestByQuiz[k].score) {
						bestByQuiz[k] = { score: a.score, passed: a.passed }
					}
				})
				const results = Object.values(bestByQuiz)
				const avgScore = results.length
					? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
					: null
				const lastAttempt = attempts.sort(
					(a: any, b: any) =>
						new Date(b.submittedAt || b.createdAt).getTime() -
						new Date(a.submittedAt || a.createdAt).getTime()
				)[0]

				return {
					studentId: String(user._id),
					fullName: user.fullName,
					email: user.email,
					picture: user.picture,
					source: p.source,
					progressPercent,
					completedLessons: completed,
					totalLessons,
					quizzesTaken: results.length,
					quizzesTotal: quizIds.length,
					passedCount: results.filter(r => r.passed).length,
					avgScore,
					lastAttemptAt: lastAttempt?.submittedAt || lastAttempt?.createdAt || null,
				}
			})
		)

		return JSON.parse(JSON.stringify(students.filter(Boolean)))
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}

export const getCourseStudentResults = async (
	courseId: string,
	studentId: string
) => {
	try {
		await connectToDatabase()
		await requireOwnedCourse(courseId)

		const student: any = await User.findById(studentId)
			.select('_id clerkId fullName email picture')
			.lean()
		if (!student) throw new Error('Student not found')

		const purchase = await Purchase.findOne({
			course: courseId,
			user: student._id,
		}).lean()
		if (!purchase) throw new Error('Student is not enrolled in this course')

		const sections = await Section.find({ course: courseId })
			.select('_id title titleI18n position')
			.sort({ position: 1 })
			.lean()
		const sectionIds = sections.map((section: any) => section._id)
		const lessons = await Lesson.find({ section: { $in: sectionIds } })
			.select('_id title titleI18n section position')
			.sort({ position: 1 })
			.lean()
		const lessonIds = lessons.map((lesson: any) => lesson._id)
		const progressByLesson = await getLessonProgressMap({
			clerkId: student.clerkId,
			studentId: student._id,
			lessonIds,
		})

		const quizzes = await SectionQuiz.find({ section: { $in: sectionIds } })
			.select('_id section title passScore')
			.lean()
		const quizIds = quizzes.map((quiz: any) => quiz._id)
		const attempts = await QuizAttempt.find({
			student: student._id,
			quiz: { $in: quizIds },
		})
			.sort({ submittedAt: -1, createdAt: -1 })
			.lean()

		const attemptsByQuiz = new Map<string, any[]>()
		attempts.forEach((attempt: any) => {
			const key = String(attempt.quiz)
			attemptsByQuiz.set(key, [...(attemptsByQuiz.get(key) || []), attempt])
		})

		const lessonsBySection = new Map<string, any[]>()
		lessons.forEach((lesson: any) => {
			const key = String(lesson.section)
			lessonsBySection.set(key, [...(lessonsBySection.get(key) || []), lesson])
		})

		const quizzesBySection = new Map<string, any[]>()
		quizzes.forEach((quiz: any) => {
			const key = String(quiz.section)
			quizzesBySection.set(key, [...(quizzesBySection.get(key) || []), quiz])
		})

		const sectionResults = sections.map((section: any) => {
			const sectionLessons = lessonsBySection.get(String(section._id)) || []
			const completedLessons = sectionLessons.filter((lesson: any) => {
				const progress = progressByLesson.get(String(lesson._id))
				return Boolean(progress?.isCompleted)
			})
			const sectionQuizzes = quizzesBySection.get(String(section._id)) || []

			return {
				sectionId: String(section._id),
				title: section.titleI18n?.en || section.titleI18n?.ja || section.title || '',
				completedLessons: completedLessons.length,
				totalLessons: sectionLessons.length,
				progressPercent: sectionLessons.length
					? Math.round((completedLessons.length / sectionLessons.length) * 100)
					: 0,
				lessons: sectionLessons.map((lesson: any) => {
					const progress = progressByLesson.get(String(lesson._id))
					return {
						lessonId: String(lesson._id),
						title: lesson.titleI18n?.en || lesson.titleI18n?.ja || lesson.title || '',
						isCompleted: Boolean(progress?.isCompleted),
						watchedPercent: progress?.watchedPercent ?? 0,
					}
				}),
				quizzes: sectionQuizzes.map((quiz: any) => {
					const quizAttempts = attemptsByQuiz.get(String(quiz._id)) || []
					const bestAttempt = quizAttempts.reduce((best: any, attempt: any) => {
						if (!best || (attempt.score ?? 0) > (best.score ?? 0)) return attempt
						return best
					}, null)
					const latestAttempt = quizAttempts[0]
					return {
						quizId: String(quiz._id),
						title: quiz.title?.en || quiz.title?.ja || 'Quiz',
						passScore: quiz.passScore ?? 70,
						attemptsCount: quizAttempts.length,
						bestScore: bestAttempt?.score ?? null,
						bestPassed: bestAttempt?.passed ?? false,
						latestScore: latestAttempt?.score ?? null,
						latestPassed: latestAttempt?.passed ?? false,
						latestSubmittedAt:
							latestAttempt?.submittedAt || latestAttempt?.createdAt || null,
					}
				}),
			}
		})

		return JSON.parse(
			JSON.stringify({
				student: {
					studentId: String(student._id),
					fullName: student.fullName,
					email: student.email,
					picture: student.picture,
				},
				sections: sectionResults,
			})
		)
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}

// O'quvchiga kursni bepul ochib berish (Purchase source='admin').
export const grantCourseAccess = async (params: {
	courseId: string
	email: string
	path: string
}) => {
	const { courseId, email, path } = params
	try {
		await connectToDatabase()
		const { course } = await requireOwnedCourse(courseId)

		const normalized = email.trim()
		const student = await User.findOne({
			email: { $regex: `^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
		}).select('_id')
		if (!student) throw new Error('NO_USER')

		const exists = await Purchase.findOne({
			user: student._id,
			course: course._id,
		})
		if (exists) throw new Error('ALREADY')

		const purchase = await Purchase.create({
			user: student._id,
			course: course._id,
			source: 'admin',
		})
		;(course as any).purchases.push(purchase._id)
		await course.save()

		revalidatePath(path)
	} catch (error) {
		if (error instanceof Error && error.message === 'NO_USER') {
			throw new Error('No user found with this email')
		}
		if (error instanceof Error && error.message === 'ALREADY') {
			throw new Error('This student already has access')
		}
		throw new Error('Something went wrong!')
	}
}

// O'quvchidan kurs ruxsatini olib tashlash.
export const revokeCourseAccess = async (params: {
	courseId: string
	studentId: string
	path: string
}) => {
	const { courseId, studentId, path } = params
	try {
		await connectToDatabase()
		await requireOwnedCourse(courseId)

		const purchase = await Purchase.findOne({
			user: studentId,
			course: courseId,
		})
		if (purchase) {
			await Purchase.findByIdAndDelete(purchase._id)
			await Course.findByIdAndUpdate(courseId, {
				$pull: { purchases: purchase._id },
			})
		}
		revalidatePath(path)
	} catch (error) {
		throw new Error('Something went wrong!')
	}
}
