'use client'

import Image from 'next/image'
import { Badge } from '../ui/badge'
import { ICourse } from '@/app.types'
import Link from 'next/link'
import useTranslate from '@/hooks/use-translate'
import { useParams } from 'next/navigation'

interface Props {
	course: ICourse
}

function InstructorCourseCard({ course }: Props) {
	const t = useTranslate()
	const { lng } = useParams()

	return (
		<Link href={`/${lng}/instructor/my-courses/${course._id}`}>
			<div className='flex flex-col space-y-2 rounded-md bg-background p-2'>
				<div className='relative h-52 w-full'>
					<Image
						src={course.previewImage}
						alt={course.title}
						fill
						className='rounded-md object-cover'
					/>
				</div>
				<div className='flex items-center justify-between gap-3 px-2'>
					<h1 className='min-w-0 font-space-grotesk text-2xl font-bold'>
						{course.title}
					</h1>
					<Badge
						variant={course.published ? 'default' : 'destructive'}
						className='shrink-0 whitespace-nowrap'
					>
						{course.published ? t('published') : t('draft')}
					</Badge>
				</div>
			</div>
		</Link>
	)
}

export default InstructorCourseCard
