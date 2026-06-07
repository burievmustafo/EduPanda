import { requireUser, ok, handleError, ApiError } from '@/lib/mobile/api'
import Purchase from '@/database/purchase.model'
import Review from '@/database/review.model'

export async function GET(
	req: Request,
	{ params }: { params: { courseId: string } }
) {
	try {
		const { user } = await requireUser(req)
		const review = await Review.findOne({
			user: user._id,
			course: params.courseId,
		}).lean()

		if (!review) return ok({ review: null })

		return ok({
			review: {
				id: String((review as any)._id),
				rating: (review as any).rating ?? 0,
				data: (review as any).data ?? '',
			},
		})
	} catch (e) {
		return handleError(e)
	}
}

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
	try {
		const { user } = await requireUser(req)
		const enrolled = await Purchase.exists({
			user: user._id,
			course: params.courseId,
		})
		if (!enrolled) {
			throw new ApiError(403, 'locked', 'Enroll to leave a review')
		}

		const body = await req.json()
		const rating = Number(body.rating)
		const data = typeof body.data === 'string' ? body.data.trim() : ''

		if (!rating || rating < 1 || rating > 5) {
			throw new ApiError(400, 'invalid_rating', 'Rating must be between 1 and 5')
		}
		if (data.length < 3) {
			throw new ApiError(400, 'invalid_review', 'Review text is too short')
		}

		const existing = await Review.findOne({
			user: user._id,
			course: params.courseId,
		})

		let review
		if (existing) {
			existing.rating = rating
			existing.data = data
			await existing.save()
			review = existing
		} else {
			review = await Review.create({
				user: user._id,
				course: params.courseId,
				rating,
				data,
			})
		}

		return ok({
			review: {
				id: String(review._id),
				rating: review.rating,
				data: review.data,
			},
		})
	} catch (e) {
		return handleError(e)
	}
}
