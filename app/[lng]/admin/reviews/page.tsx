import { getAdminReviews } from '@/actions/review.action'
import { SearchParamsProps } from '@/app.types'
import InstructorReviewCard from '@/components/cards/instructor-review.card'
import Header from '@/components/shared/header'
import Pagination from '@/components/shared/pagination'
import { translation } from '@/i18n/server'

async function Page({ params, searchParams }: SearchParamsProps & { params: { lng: string } }) {
	const page = searchParams.page ? +searchParams.page : 1
	const { t } = await translation(params.lng)
	const reviewData = await getAdminReviews({ page, pageSize: 6 })

	return (
		<>
			<Header
				title={t('allReviews')}
				description={t('allReviewsDesc')}
			/>

			<div className='mt-4 rounded-md bg-background p-4'>
				<div className='flex flex-col space-y-3'>
					{reviewData.reviews.map(review => (
						<InstructorReviewCard
							key={review._id}
							review={JSON.parse(JSON.stringify(review))}
						/>
					))}
				</div>

				<div className='mt-6'>
					<Pagination isNext={reviewData.isNext} pageNumber={page} />
				</div>
			</div>
		</>
	)
}

export default Page
