import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { li18n } from '@/lib/mobile/dto'
import ParentStudentLink from '@/database/parent-student-link.model'
import Course from '@/database/course.model'
import Section from '@/database/section.model'
import Lesson from '@/database/lesson.model'
import LessonProgress from '@/database/lesson-progress.model'
import SectionQuiz from '@/database/section-quiz.model'
import QuizAttempt from '@/database/quiz-attempt.model'

export async function GET(
	req: Request,
	{ params }: { params: { studentId: string } }
) {
	try {
		const { user } = await requireUser(req)

		// Access tekshiruvi: parent shu studentga bog'langan bo'lishi shart.
		const link = await ParentStudentLink.findOne({
			parent: user._id,
			student: params.studentId,
			status: 'active',
		}).lean()
		if (!link) {
			throw new ApiError(403, 'forbidden', 'Not linked to this student')
		}

		// Farzand progressi (kurslar bo'yicha)
		const progresses = await LessonProgress.find({
			student: params.studentId,
		}).lean()
		const courseIds = Array.from(
			new Set(progresses.map((p: any) => String(p.course)).filter(Boolean))
		)
		const courses = await Course.find({ _id: { $in: courseIds } }).lean()

		const byCourse = []
		for (const c of courses) {
			const sections = await Section.find({ course: c._id }).select('_id').lean()
			const secIds = sections.map((s: any) => s._id)
			const totalLessons = await Lesson.countDocuments({
				section: { $in: secIds },
			})
			const completed = progresses.filter(
				(p: any) => String(p.course) === String(c._id) && p.isCompleted
			).length
			byCourse.push({
				courseId: String(c._id),
				title: li18n((c as any).titleI18n, (c as any).title),
				totalLessons,
				completedLessons: completed,
				percent:
					totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
			})
		}

		// Oxirgi test natijalari
		const attempts = await QuizAttempt.find({ student: params.studentId })
			.sort({ submittedAt: -1 })
			.limit(10)
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

		return ok({ byCourse, recentAttempts })
	} catch (e) {
		return handleError(e)
	}
}
