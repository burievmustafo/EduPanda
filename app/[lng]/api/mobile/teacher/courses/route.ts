import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { requireTeacher, slugify } from '@/lib/mobile/ownership'
import Course from '@/database/course.model'

// O'qituvchi yangi kurs yaratadi.
export async function POST(req: Request) {
	try {
		const { user, role } = await requireUser(req)
		requireTeacher(role)
		const body = await req.json().catch(() => ({}))

		const titleEn = body?.titleI18n?.en?.trim() || 'Untitled course'
		const course = await Course.create({
			title: titleEn,
			titleI18n: body.titleI18n || { en: titleEn },
			description: body?.descriptionI18n?.en || '',
			descriptionI18n: body.descriptionI18n || { en: '' },
			level: body.level || 'Beginner',
			category: body.category || 'General',
			language: body.language || 'en',
			published: false,
			instructor: user._id,
			slug: slugify(titleEn),
		})

		return ok({ id: String(course._id), slug: course.slug })
	} catch (e) {
		return handleError(e)
	}
}
