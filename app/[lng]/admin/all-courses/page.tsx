import { getAdminCourses } from '@/actions/course.action'
import { SearchParamsProps } from '@/app.types'
import AdminCourseCard from '@/components/cards/admin-course.card'
import Header from '@/components/shared/header'
import Pagination from '@/components/shared/pagination'
import { translation } from '@/i18n/server'

async function Page({ params, searchParams }: SearchParamsProps & { params: { lng: string } }) {
	const page = searchParams.page ? +searchParams.page : 1
	const { t } = await translation(params.lng)
	const courseData = await getAdminCourses({ page, pageSize: 6 })

	return (
		<>
			<Header
				title={t('allCourses')}
				description={t('allCoursesDesc')}
			/>

			<div className='mt-4 grid grid-cols-3 gap-4'>
				{courseData.courses.map(item => (
					<AdminCourseCard
						key={item._id}
						course={JSON.parse(JSON.stringify(item))}
					/>
				))}
			</div>
			<div className='mt-6'>
				<Pagination pageNumber={page} isNext={courseData.isNext} />
			</div>
		</>
	)
}

export default Page
