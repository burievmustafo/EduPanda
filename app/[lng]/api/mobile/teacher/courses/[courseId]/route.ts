import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { assertCourseOwner, requireTeacher } from '@/lib/mobile/ownership'

// Kursni tahrirlash / publish qilish (faqat egasi).
export async function PATCH(
	req: Request,
	{ params }: { params: { courseId: string } }
) {
	try {
		const { user, role } = await requireUser(req)
		requireTeacher(role)
		const course: any = await assertCourseOwner(params.courseId, user._id)
		const body = await req.json().catch(() => ({}))

		if (body.titleI18n) {
			course.titleI18n = body.titleI18n
			course.title = body.titleI18n.en
		}
		if (body.descriptionI18n) {
			course.descriptionI18n = body.descriptionI18n
			course.description = body.descriptionI18n.en
		}
		if (body.level) course.level = body.level
		if (body.category) course.category = body.category
		if (typeof body.published === 'boolean') course.published = body.published

		await course.save()
		return ok({ id: String(course._id), published: course.published })
	} catch (e) {
		return handleError(e)
	}
}
