import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { assertSectionOwner, requireTeacher } from '@/lib/mobile/ownership'
import Section from '@/database/section.model'
import Lesson from '@/database/lesson.model'

// Section'ga dars (video) qo'shish.
export async function POST(
	req: Request,
	{ params }: { params: { sectionId: string } }
) {
	try {
		const { user, role } = await requireUser(req)
		requireTeacher(role)
		const section: any = await assertSectionOwner(params.sectionId, user._id)
		const body = await req.json().catch(() => ({}))

		const count = await Lesson.countDocuments({ section: section._id })
		const titleEn = body?.titleI18n?.en?.trim() || 'Lesson'
		const lesson = await Lesson.create({
			title: titleEn,
			titleI18n: body.titleI18n || { en: titleEn },
			content: body?.contentI18n?.en || '',
			contentI18n: body.contentI18n || { en: '' },
			videoUrl: body.videoUrl || '',
			durationSec: body.durationSec || 0,
			free: Boolean(body.free),
			position: body.position ?? count + 1,
			section: section._id,
		})

		await Section.updateOne(
			{ _id: section._id },
			{ $push: { lessons: lesson._id } }
		)

		return ok({ id: String(lesson._id) })
	} catch (e) {
		return handleError(e)
	}
}
