import { Separator } from '@/components/ui/separator'
import Header from '../../../../components/shared/header'
import InstructorReviewCard from '@/components/cards/instructor-review.card'
import { auth } from '@clerk/nextjs'
import { SearchParamsProps } from '@/app.types'
import { getReviews } from '@/actions/review.action'
import Pagination from '@/components/shared/pagination'
import { translation } from '@/i18n/server'

async function Page({ params, searchParams }: SearchParamsProps & { params: { lng: string } }) {
	const { userId } = auth()

	const page = searchParams.page ? +searchParams.page : 1
	const { t } = await translation(params.lng)

	const result = await getReviews({ clerkId: userId!, page, pageSize: 6 })

	return (
		<>
			<Header
				title={t('reviews')}
				description={t('instructorReviewsDesc')}
			/>

			<div className='mt-4 rounded-md bg-background p-4'>
				<h3 className='font-space-grotesk text-lg font-medium'>{t('allReviews')}</h3>
				<Separator className='my-3' />

				<div className='flex flex-col space-y-3'>
					{result.reviews.map(review => (
						<InstructorReviewCard
							key={review._id}
							review={JSON.parse(JSON.stringify(review))}
						/>
					))}
				</div>

				<div className='mt-6'>
					<Pagination isNext={result.isNext} pageNumber={page} />
				</div>
			</div>
		</>
	)
}

export default Page
