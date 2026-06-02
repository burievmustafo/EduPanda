import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import { toCourseDTO } from '@/lib/mobile/dto'
import Course from '@/database/course.model'
import Section from '@/database/section.model'
import Purchase from '@/database/purchase.model'

export async function GET(
	req: Request,
	{ params }: { params: { courseId: string } }
) {
	try {
		const { user } = await requireUser(req)
		const course = await Course.findById(params.courseId)
			.populate('instructor', 'fullName picture')
			.lean()
		if (!course) throw new ApiError(404, 'not_found', 'Course not found')

		const sections = await Section.find({ course: params.courseId })
			.select('lessons')
			.lean()
		const lessonsCount = sections.reduce(
			(s, sec: any) => s + (sec.lessons?.length || 0),
			0
		)
		const isEnrolled = Boolean(
			await Purchase.exists({ user: user._id, course: params.courseId })
		)
		return ok(
			toCourseDTO(course, {
				sectionsCount: sections.length,
				lessonsCount,
				isEnrolled,
			})
		)
	} catch (e) {
		return handleError(e)
	}
}
