'use client'

import { updateCourse } from '@/actions/course.action'
import { ICourse, ICourseResource } from '@/app.types'
import FillLoading from '@/components/shared/fill-loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import useToggleEdit from '@/hooks/use-toggle-edit'
import { Edit2, Plus, Trash2, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

function emptyRow(): ICourseResource {
	return { title: '', url: '', type: 'link' }
}

function Resources(course: ICourse) {
	const { state, onToggle } = useToggleEdit()

	return (
		<Card>
			<CardContent className='relative p-6'>
				<div className='flex items-center justify-between'>
					<span className='text-lg font-medium'>Resources</span>
					<Button size={'icon'} variant={'ghost'} onClick={onToggle}>
						{state ? <X /> : <Edit2 />}
					</Button>
				</div>
				<Separator className='my-3' />

				{state ? (
					<ResourcesForm course={course} onToggle={onToggle} />
				) : (
					<div className='flex flex-col gap-2'>
						{(course.resources?.length ? course.resources : []).map((item, i) => (
							<a
								key={`${item.title}-${i}`}
								href={item.url}
								target='_blank'
								rel='noreferrer'
								className='text-sm text-primary underline'
							>
								{item.title}
							</a>
						))}
						{!course.resources?.length ? (
							<p className='text-sm text-muted-foreground'>
								No resources yet. Add book links or materials for students.
							</p>
						) : null}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

function ResourcesForm({
	course,
	onToggle,
}: {
	course: ICourse
	onToggle: () => void
}) {
	const [rows, setRows] = useState<ICourseResource[]>(
		course.resources?.length ? course.resources : [emptyRow()]
	)
	const [isLoading, setIsLoading] = useState(false)
	const pathname = usePathname()

	const onSave = () => {
		const resources = rows
			.map((r) => ({
				title: r.title.trim(),
				url: r.url.trim(),
				type: r.type || 'link',
			}))
			.filter((r) => r.title && r.url)

		setIsLoading(true)
		const promise = updateCourse(course._id, { resources }, pathname)
			.then(() => onToggle())
			.finally(() => setIsLoading(false))

		toast.promise(promise, {
			loading: 'Loading...',
			success: 'Resources saved!',
			error: 'Something went wrong!',
		})
	}

	return (
		<>
			{isLoading && <FillLoading />}
			<div className='space-y-3'>
				{rows.map((row, index) => (
					<div key={index} className='grid grid-cols-12 gap-2'>
						<Input
							className='col-span-5'
							placeholder='Title (e.g. Textbook PDF)'
							value={row.title}
							onChange={(e) =>
								setRows((prev) =>
									prev.map((r, i) =>
										i === index ? { ...r, title: e.target.value } : r
									)
								)
							}
						/>
						<Input
							className='col-span-6'
							placeholder='https://...'
							value={row.url}
							onChange={(e) =>
								setRows((prev) =>
									prev.map((r, i) =>
										i === index ? { ...r, url: e.target.value } : r
									)
								)
							}
						/>
						<Button
							type='button'
							size='icon'
							variant='ghost'
							className='col-span-1'
							onClick={() =>
								setRows((prev) => prev.filter((_, i) => i !== index))
							}
						>
							<Trash2 className='size-4' />
						</Button>
					</div>
				))}
				<div className='flex gap-2'>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={() => setRows((prev) => [...prev, emptyRow()])}
					>
						<Plus className='mr-1 size-4' />
						Add resource
					</Button>
					<Button type='button' size='sm' onClick={onSave} disabled={isLoading}>
						Save
					</Button>
				</div>
			</div>
		</>
	)
}

export default Resources
