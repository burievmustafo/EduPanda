import Course from '@/database/course.model'
import Purchase from '@/database/purchase.model'
import User from '@/database/user.model'
import { connectToDatabase } from '@/lib/mongoose'

export async function unenrollCourse(clerkId: string, courseId: string) {
	await connectToDatabase()
	const user = await User.findOne({ clerkId }).select('_id')
	if (!user) throw new Error('User not found')

	const purchase = await Purchase.findOneAndDelete({ user: user._id, course: courseId })
	if (purchase) {
		await Course.findByIdAndUpdate(courseId, { $pull: { purchases: purchase._id } })
	}
}
