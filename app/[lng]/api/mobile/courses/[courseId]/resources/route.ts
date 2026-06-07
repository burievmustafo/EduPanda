import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import Course from '@/database/course.model'
import Purchase from '@/database/purchase.model'

export async function GET(
	req: Request,
	{ params }: { params: { courseId: string } }
) {
	try {
		const { user } = await requireUser(req)
		const enrolled = await Purchase.exists({
			user: user._id,
			course: params.courseId,
		})
		if (!enrolled) {
			throw new ApiError(403, 'locked', 'Enroll to view resources')
		}

		const course = await Course.findById(params.courseId)
			.select('resources')
			.lean()
		if (!course) throw new ApiError(404, 'not_found', 'Course not found')

		const resources = ((course as any).resources || [])
			.filter((r: any) => r?.title?.trim() && r?.url?.trim())
			.map((r: any, index: number) => ({
				id: String(index),
				title: r.title.trim(),
				url: r.url.trim(),
				type: r.type === 'file' ? 'file' : 'link',
			}))

		return ok({ resources })
	} catch (e) {
		return handleError(e)
	}
}
