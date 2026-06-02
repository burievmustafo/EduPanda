import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { li18n } from '@/lib/mobile/dto'
import Course from '@/database/course.model'
import Section from '@/database/section.model'
import Purchase from '@/database/purchase.model'
import SectionQuiz from '@/database/section-quiz.model'
import QuizAttempt from '@/database/quiz-attempt.model'

export async function GET(req: Request) {
	try {
		const { user } = await requireUser(req)

		// Faqat o'z kurslari (ownership: instructor = user._id)
		const courses = await Course.find({ instructor: user._id }).lean()

		const result = []
		for (const c of courses) {
			const studentCount = await Purchase.countDocuments({ course: c._id })

			const sections = await Section.find({ course: c._id }).select('_id').lean()
			const secIds = sections.map((s: any) => s._id)
			const quizzes = await SectionQuiz.find({ section: { $in: secIds } })
				.select('_id')
				.lean()
			const attempts = await QuizAttempt.find({
				quiz: { $in: quizzes.map((q: any) => q._id) },
			})
				.select('score passed')
				.lean()
			const avgScore =
				attempts.length > 0
					? Math.round(
							attempts.reduce((s: number, a: any) => s + (a.score || 0), 0) /
								attempts.length
					  )
					: 0

			result.push({
				courseId: String(c._id),
				title: li18n((c as any).titleI18n, (c as any).title),
				published: Boolean((c as any).published),
				studentCount,
				attempts: attempts.length,
				avgScore,
			})
		}

		return ok({ courses: result })
	} catch (e) {
		return handleError(e)
	}
}
