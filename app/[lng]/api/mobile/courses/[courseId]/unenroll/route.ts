import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { unenrollCourse } from '@/lib/mobile/enrollment'

export async function DELETE(
	req: Request,
	{ params }: { params: { courseId: string } }
) {
	try {
		const { user } = await requireUser(req)
		await unenrollCourse(user.clerkId!, params.courseId)
		return ok({ isEnrolled: false })
	} catch (e) {
		return handleError(e)
	}
}
