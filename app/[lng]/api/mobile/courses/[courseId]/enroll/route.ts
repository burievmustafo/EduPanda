import { requireUser, ok, handleError } from '@/lib/mobile/api'
import Purchase from '@/database/purchase.model'

export async function POST(
	req: Request,
	{ params }: { params: { courseId: string } }
) {
	try {
		const { user } = await requireUser(req)
		await Purchase.findOneAndUpdate(
			{ user: user._id, course: params.courseId },
			{ user: user._id, course: params.courseId, source: 'mock' },
			{ upsert: true }
		)
		return ok({ isEnrolled: true })
	} catch (e) {
		return handleError(e)
	}
}
