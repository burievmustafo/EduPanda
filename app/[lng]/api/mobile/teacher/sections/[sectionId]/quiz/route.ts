import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { assertSectionOwner, requireTeacher } from '@/lib/mobile/ownership'
import SectionQuiz from '@/database/section-quiz.model'

// Section uchun yakuniy test yaratish/yangilash (har section'da bitta).
export async function POST(
	req: Request,
	{ params }: { params: { sectionId: string } }
) {
	try {
		const { user, role } = await requireUser(req)
		requireTeacher(role)
		const section: any = await assertSectionOwner(params.sectionId, user._id)
		const body = await req.json().catch(() => ({}))

		let quiz: any = await SectionQuiz.findOne({ section: section._id })
		if (!quiz) {
			quiz = await SectionQuiz.create({
				section: section._id,
				title: body.title || { en: 'Final Quiz' },
				passScore: body.passScore ?? 70,
				isPublished: true,
			})
		} else {
			if (body.title) quiz.title = body.title
			if (body.passScore != null) quiz.passScore = body.passScore
			await quiz.save()
		}

		return ok({ id: String(quiz._id) })
	} catch (e) {
		return handleError(e)
	}
}
