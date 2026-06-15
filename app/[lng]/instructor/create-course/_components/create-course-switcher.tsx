'use client'

import CourseFieldsForm from '@/components/forms/course-fields.form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import useTranslate from '@/hooks/use-translate'
import { FileJson, Sparkles } from 'lucide-react'
import { useState } from 'react'
import AiCourseBuilder from './ai-course-builder'
import ImportCourseBuilder from './import-course-builder'

type Mode = 'manual' | 'ai' | 'import'

function CreateCourseSwitcher() {
	const t = useTranslate()
	const [mode, setMode] = useState<Mode>('manual')

	return (
		<>
			<div className='mb-4 flex gap-2'>
				<Button
					variant={mode === 'manual' ? 'default' : 'outline'}
					size='sm'
					onClick={() => setMode('manual')}
				>
					{t('manualMode')}
				</Button>
				<Button
					variant={mode === 'ai' ? 'default' : 'outline'}
					size='sm'
					onClick={() => setMode('ai')}
				>
					<Sparkles className='mr-2 size-4' />
					{t('aiBuilder')}
				</Button>
				<Button
					variant={mode === 'import' ? 'default' : 'outline'}
					size='sm'
					onClick={() => setMode('import')}
				>
					<FileJson className='mr-2 size-4' />
					{t('importCourse')}
				</Button>
			</div>

			<h3 className='font-space-grotesk text-lg font-medium'>
				{mode === 'manual'
					? t('basicInformation')
					: mode === 'ai'
						? t('aiBuilderTitle')
						: t('importCourseTitle')}
			</h3>
			<Separator className='my-3' />

			{mode === 'manual' ? (
				<CourseFieldsForm />
			) : mode === 'ai' ? (
				<AiCourseBuilder />
			) : (
				<ImportCourseBuilder />
			)}
		</>
	)
}

export default CreateCourseSwitcher
