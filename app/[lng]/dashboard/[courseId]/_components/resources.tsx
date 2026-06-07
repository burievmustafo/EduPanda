'use client'

import { ICourseResource } from '@/app.types'
import { Separator } from '@/components/ui/separator'
import useTranslate from '@/hooks/use-translate'
import { ExternalLink, FileText } from 'lucide-react'

interface Props {
	resources: ICourseResource[]
}

function CourseResources({ resources }: Props) {
	const t = useTranslate()
	const items = resources ?? []

	return (
		<div className='mt-4 px-1 pb-4'>
			<Separator className='mb-4' />
			<h2 className='px-2 font-space-grotesk text-sm font-semibold'>
				{t('resources')}
			</h2>

			{items.length ? (
				<div className='mt-2 flex flex-col'>
					{items.map((item, i) => (
						<a
							key={`${item.title}-${i}`}
							href={item.url}
							target='_blank'
							rel='noreferrer'
							className='flex items-center gap-2 px-3 py-2.5 text-sm text-primary transition-colors hover:bg-gray-50 hover:dark:bg-gray-800'
						>
							{item.type === 'file' ? (
								<FileText size={16} className='shrink-0' />
							) : (
								<ExternalLink size={16} className='shrink-0' />
							)}
							<span className='line-clamp-2 flex-1'>{item.title}</span>
						</a>
					))}
				</div>
			) : (
				<p className='mt-2 px-2 text-xs text-muted-foreground'>
					{t('resourcesEmptyHint')}
				</p>
			)}
		</div>
	)
}

export default CourseResources
