import { requireUser, ok, handleError } from '@/lib/mobile/api'
import { toCourseDTO } from '@/lib/mobile/dto'
import Course from '@/database/course.model'
import Section from '@/database/section.model'
import Purchase from '@/database/purchase.model'
import Review from '@/database/review.model'

export async function GET(req: Request) {
	try {
		const { user } = await requireUser(req)
		const courses = await Course.find({ published: true })
			.populate('instructor', 'fullName picture')
			.lean()

		const courseIds = courses.map((c) => c._id)
		const ratingAgg = await Review.aggregate([
			{ $match: { course: { $in: courseIds }, isFlag: { $ne: true } } },
			{
				$group: {
					_id: '$course',
					avg: { $avg: '$rating' },
					count: { $sum: 1 },
				},
			},
		])
		const ratingMap = new Map(
			ratingAgg.map((r: any) => [String(r._id), { avg: r.avg, count: r.count }])
		)

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
			const rating = ratingMap.get(String(c._id))
			result.push(
				toCourseDTO(c, {
					sectionsCount: sections.length,
					lessonsCount,
					isEnrolled,
					averageRating: rating ? Math.round(rating.avg * 10) / 10 : 0,
					reviewCount: rating?.count ?? 0,
				})
			)
		}
		return ok(result)
	} catch (e) {
		return handleError(e)
	}
}
