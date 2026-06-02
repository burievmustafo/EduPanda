import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { li18n } from '@/lib/mobile/dto'
import Purchase from '@/database/purchase.model'
import Course from '@/database/course.model'
import Section from '@/database/section.model'
import Lesson from '@/database/lesson.model'
import LessonProgress from '@/database/lesson-progress.model'
import SectionQuiz from '@/database/section-quiz.model'
import QuizAttempt from '@/database/quiz-attempt.model'

export async function GET(req: Request) {
	try {
		const { user } = await requireUser(req)

		// Yozilgan kurslar + progress
		const purchases = await Purchase.find({ user: user._id }).lean()
		const courseIds = purchases.map((p: any) => p.course)
		const courses = await Course.find({ _id: { $in: courseIds } }).lean()

		const inProgress = []
		for (const c of courses) {
			const sections = await Section.find({ course: c._id }).select('_id').lean()
			const secIds = sections.map((s: any) => s._id)
			const lessons = await Lesson.find({ section: { $in: secIds } })
				.select('_id')
				.lean()
			const totalLessons = lessons.length
			const completed = await LessonProgress.countDocuments({
				student: user._id,
				course: c._id,
				isCompleted: true,
			})
			inProgress.push({
				courseId: String(c._id),
				title: li18n((c as any).titleI18n, (c as any).title),
				totalLessons,
				completedLessons: completed,
				percent:
					totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
			})
		}

		// Oxirgi test natijalari
		const attempts = await QuizAttempt.find({ student: user._id })
			.sort({ submittedAt: -1 })
			.limit(5)
			.lean()
		const quizIds = attempts.map((a: any) => a.quiz)
		const quizzes = await SectionQuiz.find({ _id: { $in: quizIds } }).lean()
		const quizMap = new Map(quizzes.map((q: any) => [String(q._id), q]))

		const recentAttempts = attempts.map((a: any) => ({
			attemptId: String(a._id),
			quizTitle: li18n(quizMap.get(String(a.quiz))?.title),
			score: a.score,
			passed: a.passed,
			submittedAt: a.submittedAt,
		}))

		return ok({ inProgress, recentAttempts })
	} catch (e) {
		return handleError(e)
	}
}
