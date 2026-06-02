import { requireUser, ok, handleError } from '@/lib/mobile/api'
import ParentStudentLink from '@/database/parent-student-link.model'
import User from '@/database/user.model'
import QuizAttempt from '@/database/quiz-attempt.model'
import LessonProgress from '@/database/lesson-progress.model'

export async function GET(req: Request) {
	try {
		const { user } = await requireUser(req)

		const links = await ParentStudentLink.find({
			parent: user._id,
			status: 'active',
		}).lean()
		const studentIds = links.map((l: any) => l.student)
		const students = await User.find({ _id: { $in: studentIds } })
			.select('fullName picture email')
			.lean()

		const children = []
		for (const s of students) {
			const attempts = await QuizAttempt.find({ student: (s as any)._id })
				.sort({ submittedAt: -1 })
				.limit(5)
				.lean()
			const avgScore =
				attempts.length > 0
					? Math.round(
							attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) /
								attempts.length
					  )
					: 0
			const completedLessons = await LessonProgress.countDocuments({
				student: (s as any)._id,
				isCompleted: true,
			})
			children.push({
				studentId: String((s as any)._id),
				fullName: (s as any).fullName,
				picture: (s as any).picture,
				avgScore,
				attempts: attempts.length,
				completedLessons,
			})
		}

		return ok({ children })
	} catch (e) {
		return handleError(e)
	}
}
