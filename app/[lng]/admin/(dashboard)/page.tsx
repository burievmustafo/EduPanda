import { getAdminCourses } from '@/actions/course.action'
import { getBalance } from '@/actions/payment.action'
import { getAdminReviews } from '@/actions/review.action'
import { getAdminInstructors, getRole } from '@/actions/user.action'
import AdminCourseCard from '@/components/cards/admin-course.card'
import InstructorReviewCard from '@/components/cards/instructor-review.card'
import InstructorCard from '@/components/cards/instructor.card'
import StatisticsCard from '@/components/cards/statistics.card'
import Header from '@/components/shared/header'
import { translation } from '@/i18n/server'
import { auth } from '@clerk/nextjs'
import { MessageSquare, MonitorPlay, User } from 'lucide-react'
import { redirect } from 'next/navigation'
import { GrMoney } from 'react-icons/gr'

async function Page({ params }: { params: { lng: string } }) {
	const { userId } = auth()
	const user = await getRole(userId!)

	if (!user.isAdmin) return redirect('/')

	const { t } = await translation(params.lng)
	const courseData = await getAdminCourses({})
	const reviewData = await getAdminReviews({})
	const instructorData = await getAdminInstructors({})
	const balance = await getBalance()

	return (
		<>
			<Header title={t('dashboard')} description={t('welcomeDashboard')} />

			<div className='mt-4 grid grid-cols-4 gap-4'>
				<StatisticsCard
					label={t('allCourses')}
					value={`${courseData.totalCourses}`}
					Icon={MonitorPlay}
				/>
				<StatisticsCard
					label={t('reviews')}
					value={`${reviewData.totalReviews}`}
					Icon={MessageSquare}
				/>
				<StatisticsCard
					label={t('totalSales')}
					value={`${(balance / 100).toLocaleString('en-US', {
						style: 'currency',
						currency: 'USD',
					})}`}
					Icon={GrMoney}
				/>
				<StatisticsCard
					label={t('instructors')}
					value={`${instructorData.totalInstructors}`}
					Icon={User}
				/>
			</div>

			<Header title={t('allCourses')} description={t('allCoursesDesc')} />
			<div className='mt-4 grid grid-cols-3 gap-4'>
				{courseData.courses.map(course => (
					<AdminCourseCard
						key={course._id}
						course={JSON.parse(JSON.stringify(course))}
					/>
				))}
			</div>

			<Header title={t('reviews')} description={t('latestReviewsDesc')} />
			<div className='mt-4 grid grid-cols-3 gap-4'>
				{reviewData.reviews.map(review => (
					<InstructorReviewCard
						key={review._id}
						review={JSON.parse(JSON.stringify(review))}
						isAdmin
					/>
				))}
			</div>

			<Header title={t('instructors')} description={t('adminInstructorsDesc')} />
			<div className='mt-4 grid grid-cols-4 gap-4'>
				{instructorData.instructors.map(item => (
					<InstructorCard
						key={item._id}
						instructor={JSON.parse(JSON.stringify(item))}
					/>
				))}
			</div>
		</>
	)
}

export default Page
