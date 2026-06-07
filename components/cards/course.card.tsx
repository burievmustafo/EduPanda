import Link from 'next/link'
import { Card, CardContent } from '../ui/card'
import { Separator } from '../ui/separator'
import { ICourse } from '@/app.types'
import CustomImage from '../shared/custom-image'

function formatUsd(price?: number | null) {
	if (typeof price !== 'number' || Number.isNaN(price)) return null
	return price.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	})
}

function CourseCard(course: ICourse) {
	const oldPrice = formatUsd(course.oldPrice)
	const currentPrice = formatUsd(course.currentPrice)

	return (
		<Link href={`/course/${course._id}`} className='block h-full'>
			<Card className='group flex h-full w-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
				<CardContent className='relative aspect-[16/10] w-full overflow-hidden p-0'>
					<CustomImage src={course.previewImage} alt={course.title} />
				</CardContent>
				<div className='flex flex-1 flex-col space-y-3 p-4'>
					<h2 className='line-clamp-2 min-h-[64px] font-space-grotesk text-2xl font-bold leading-tight'>
						{course.title}
					</h2>
					<Separator />
					<div className='flex items-center justify-between gap-3'>
						<div className='flex min-w-0 items-center gap-2'>
							<div className='relative size-[40px]'>
								<CustomImage
									src={course.instructor.picture}
									alt={course.instructor.fullName}
									className='rounded-full'
								/>
							</div>
							<p className='line-clamp-2 text-sm leading-tight text-muted-foreground'>
								{course.instructor.fullName}
							</p>
						</div>

						<div className='flex shrink-0 items-end gap-2'>
							{oldPrice ? (
								<div className='self-start font-space-grotesk text-xs text-muted-foreground line-through'>
									{oldPrice}
								</div>
							) : null}
							<div className='font-space-grotesk text-base font-bold'>
								{currentPrice ?? 'Free'}
							</div>
						</div>
					</div>
				</div>
			</Card>
		</Link>
	)
}

export default CourseCard
