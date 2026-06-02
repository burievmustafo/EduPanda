import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { assertCourseOwner, requireTeacher } from '@/lib/mobile/ownership'
import Section from '@/database/section.model'

// Kursga section qo'shish.
export async function POST(
	req: Request,
	{ params }: { params: { courseId: string } }
) {
	try {
		const { user, role } = await requireUser(req)
		requireTeacher(role)
		const course: any = await assertCourseOwner(params.courseId, user._id)
		const body = await req.json().catch(() => ({}))

		const count = await Section.countDocuments({ course: course._id })
		const titleEn = body?.titleI18n?.en?.trim() || 'Section'
		const section = await Section.create({
			title: titleEn,
			titleI18n: body.titleI18n || { en: titleEn },
			position: body.position ?? count + 1,
			course: course._id,
			lessons: [],
		})

		return ok({ id: String(section._id) })
	} catch (e) {
		return handleError(e)
	}
}
