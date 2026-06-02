import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { assertLessonOwner, requireTeacher } from '@/lib/mobile/ownership'
import TimedQuestion from '@/database/timed-question.model'

// Darsga timed savol qo'shish (video ichida belgilangan vaqtda chiqadi).
export async function POST(
	req: Request,
	{ params }: { params: { lessonId: string } }
) {
	try {
		const { user, role } = await requireUser(req)
		requireTeacher(role)
		const lesson: any = await assertLessonOwner(params.lessonId, user._id)
		const body = await req.json().catch(() => ({}))

		const count = await TimedQuestion.countDocuments({ lesson: lesson._id })
		const tq = await TimedQuestion.create({
			lesson: lesson._id,
			triggerTimeSec: body.triggerTimeSec || 0,
			type: 'single_choice',
			question: body.question || { en: '' },
			options: body.options || [],
			correctOptionId: body.correctOptionId || '',
			explanation: body.explanation,
			required: Boolean(body.required),
			isPublished: true,
			order: body.order ?? count + 1,
		})

		return ok({ id: String(tq._id) })
	} catch (e) {
		return handleError(e)
	}
}
