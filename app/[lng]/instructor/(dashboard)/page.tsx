import StatisticsCard from '@/components/cards/statistics.card'
import Header from '../../../../components/shared/header'
import { MessageSquare, MonitorPlay } from 'lucide-react'
import { PiStudent } from 'react-icons/pi'
import { GrMoney } from 'react-icons/gr'
import ReviewCard from '@/components/cards/review.card'
import { getCourses } from '@/actions/course.action'
import { auth } from '@clerk/nextjs'
import InstructorCourseCard from '@/components/cards/instructor-course.card'
import { formatAndDivideNumber } from '@/lib/utils'
import { getReviews } from '@/actions/review.action'
import { getRole } from '@/actions/user.action'
import { translation } from '@/i18n/server'
import { redirect } from 'next/navigation'

async function Page({ params }: { params: { lng: string } }) {
	const { userId } = auth()
	const user = await getRole(userId!)

	if (user.role !== 'instructor') return redirect('/')

	const { t } = await translation(params.lng)
	const result = await getCourses({ clerkId: userId! })
	const { reviews, totalReviews } = await getReviews({ clerkId: userId! })

	return (
		<>
			<Header title={t('dashboard')} description={t('welcomeDashboard')} />

			<div className='mt-4 grid grid-cols-4 gap-4'>
				<StatisticsCard
					label={t('totalCourses')}
					value={result.totalCourses.toString()}
					Icon={MonitorPlay}
				/>
				<StatisticsCard
					label={t('totalStudents')}
					value={formatAndDivideNumber(result.totalStudents)}
					Icon={PiStudent}
				/>
				<StatisticsCard
					label={t('reviews')}
					value={formatAndDivideNumber(totalReviews)}
					Icon={MessageSquare}
				/>
				<StatisticsCard
					label={t('totalSales')}
					value={result.totalEearnings.toLocaleString('en-US', {
						style: 'currency',
						currency: 'USD',
					})}
					Icon={GrMoney}
				/>
			</div>

			<Header title={t('latestCourses')} description={t('latestCoursesDesc')} />

			<div className='mt-4 grid grid-cols-3 gap-4'>
				{result.courses.map(course => (
					<InstructorCourseCard
						key={course.title}
						course={JSON.parse(JSON.stringify(course))}
					/>
				))}
			</div>

			<Header title={t('reviews')} description={t('latestReviewsDesc')} />

			<div className='mt-4 grid grid-cols-3 gap-4'>
				{reviews.map(review => (
					<div className='rounded-md bg-background px-4 pb-4' key={review._id}>
						<ReviewCard review={JSON.parse(JSON.stringify(review))} />
					</div>
				))}
			</div>
		</>
	)
}

export default Page
