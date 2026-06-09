'use client'

import CourseFieldsForm from '@/components/forms/course-fields.form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import useTranslate from '@/hooks/use-translate'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import AiCourseBuilder from './ai-course-builder'

type Mode = 'manual' | 'ai'

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
			</div>

			<h3 className='font-space-grotesk text-lg font-medium'>
				{mode === 'manual' ? t('basicInformation') : t('aiBuilderTitle')}
			</h3>
			<Separator className='my-3' />

			{mode === 'manual' ? <CourseFieldsForm /> : <AiCourseBuilder />}
		</>
	)
}

export default CreateCourseSwitcher
