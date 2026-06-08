import Header from '../../../../components/shared/header'
import InstructorCourseCard from '@/components/cards/instructor-course.card'
import { getCourses } from '@/actions/course.action'
import { auth } from '@clerk/nextjs'
import { SearchParamsProps } from '@/app.types'
import Pagination from '@/components/shared/pagination'
import { translation } from '@/i18n/server'

async function Page({ params, searchParams }: SearchParamsProps & { params: { lng: string } }) {
	const { userId } = auth()
	const page = searchParams.page ? +searchParams.page : 1
	const { t } = await translation(params.lng)

	const result = await getCourses({ clerkId: userId!, page })

	return (
		<>
			<Header title={t('myCourses')} description={t('latestCoursesDesc')} />
			<div className='mt-4 grid grid-cols-3 gap-4'>
				{result.courses.map(item => (
					<InstructorCourseCard
						key={item._id}
						course={JSON.parse(JSON.stringify(item))}
					/>
				))}
			</div>
			<div className='mt-6'>
				<Pagination pageNumber={page} isNext={result.isNext} />
			</div>
		</>
	)
}

export default Page
