import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { toCourseDTO } from '@/lib/mobile/dto'
import Course from '@/database/course.model'
import Section from '@/database/section.model'
import Purchase from '@/database/purchase.model'

export async function GET(req: Request) {
	try {
		const { user } = await requireUser(req)
		const courses = await Course.find({ published: true })
			.populate('instructor', 'fullName picture')
			.lean()

		const result = []
		for (const c of courses) {
			const sections = await Section.find({ course: c._id })
				.select('lessons')
				.lean()
			const lessonsCount = sections.reduce(
				(s, sec: any) => s + (sec.lessons?.length || 0),
				0
			)
			const isEnrolled = Boolean(
				await Purchase.exists({ user: user._id, course: c._id })
			)
			result.push(
				toCourseDTO(c, {
					sectionsCount: sections.length,
					lessonsCount,
					isEnrolled,
				})
			)
		}
		return ok(result)
	} catch (e) {
		return handleError(e)
	}
}
