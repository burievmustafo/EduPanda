'use client'

import { importCoursePackage } from '@/actions/course-package.action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useTranslate from '@/hooks/use-translate'
import {
	type CoursePackage,
	getCoursePackageStats,
	parseCoursePackage,
} from '@/lib/course-package'
import { useUser } from '@clerk/nextjs'
import { FileJson, Loader2, Upload } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { ChangeEvent, useState } from 'react'
import { toast } from 'sonner'

function ImportCourseBuilder() {
	const t = useTranslate()
	const router = useRouter()
	const { lng } = useParams()
	const { user } = useUser()

	const [fileName, setFileName] = useState('')
	const [coursePackage, setCoursePackage] = useState<CoursePackage | null>(null)
	const [isCreating, setIsCreating] = useState(false)

	const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		setCoursePackage(null)
		setFileName('')

		if (!file) return
		if (!file.name.endsWith('.json') && file.type !== 'application/json') {
			toast.error(t('uploadCoursePackageJson'))
			return
		}

		try {
			const text = await file.text()
			const parsed = parseCoursePackage(JSON.parse(text))
			setFileName(file.name)
			setCoursePackage(parsed)
			toast.success(t('coursePackageLoaded'))
		} catch (error) {
			toast.error(t('invalidCoursePackage'))
		}
	}

	const onImport = async () => {
		if (!coursePackage || !user?.id) return
		setIsCreating(true)

		try {
			const result = await importCoursePackage(coursePackage, user.id)
			toast.success(t('courseImportedDraft'))
			router.push(`/${lng}/instructor/my-courses/${result.courseId}`)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t('error'))
			setIsCreating(false)
		}
	}

	const stats = coursePackage ? getCoursePackageStats(coursePackage) : null

	return (
		<div className='space-y-4'>
			<div className='rounded-md border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground'>
				{t('importCourseDesc')}
			</div>

			<div className='space-y-2'>
				<Label>{t('coursePackage')}</Label>
				<Input
					type='file'
					accept='application/json,.json'
					className='bg-secondary'
					disabled={isCreating}
					onChange={onFileChange}
				/>
			</div>

			{coursePackage && stats && (
				<div className='space-y-4'>
					<div className='rounded-md border p-4'>
						<p className='flex items-center gap-2 text-sm font-medium text-primary'>
							<FileJson className='size-4' />
							{fileName}
						</p>
						<h3 className='mt-3 font-space-grotesk text-xl font-bold'>
							{coursePackage.course.title}
						</h3>
						<p className='mt-1 text-sm text-muted-foreground'>
							{coursePackage.course.description || t('noDescription')}
						</p>
						<div className='mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground'>
							<span>
								{stats.sections} {t('courseSections')}
							</span>
							<span>
								{stats.lessons} {t('lessons')}
							</span>
							<span>
								{stats.questions} {t('quizzes')}
							</span>
						</div>
					</div>

					<div className='space-y-2'>
						{coursePackage.sections.map((section, index) => (
							<div key={`${section.title}-${index}`} className='rounded-md border p-3'>
								<div className='flex items-center gap-2'>
									<span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>
										{index + 1}
									</span>
									<span className='font-medium'>{section.title}</span>
									<span className='ml-auto text-xs text-muted-foreground'>
										{section.lessons.length} {t('lessons')}
									</span>
								</div>
							</div>
						))}
					</div>

					<div className='flex justify-end'>
						<Button onClick={onImport} disabled={isCreating}>
							{isCreating ? (
								<>
									<Loader2 className='mr-2 size-4 animate-spin' />
									{t('loading')}
								</>
							) : (
								<>
									<Upload className='mr-2 size-4' />
									{t('importAsDraft')}
								</>
							)}
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}

export default ImportCourseBuilder
