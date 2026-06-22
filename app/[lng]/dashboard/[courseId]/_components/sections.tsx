'use client'

import { completeLesson, uncompleteLesson } from '@/actions/lesson.action'
import { ILesson, ISection } from '@/app.types'
import SectionLoading from '@/components/shared/section-loading'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import useTranslate from '@/hooks/use-translate'
import { useAuth } from '@clerk/nextjs'
import { CheckedState } from '@radix-ui/react-checkbox'
import { ListChecks, Lock, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
	sections: ISection[]
	quizSectionIds: string[]
}
function Sections({ sections, quizSectionIds }: Props) {
	const [mount, setMount] = useState(false)

	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()

	const sectionId = searchParams.get('s')

	const onSelect = (text: string) => {
		const current = new URLSearchParams(Array.from(searchParams.entries()))

		if (!text) {
			current.delete('s')
		} else {
			current.set('s', text)
		}

		const search = current.toString()
		const query = search ? `?${search}` : ''

		router.push(`${pathname}${query}`)
	}

	useEffect(() => {
		if (sectionId) {
			setMount(true)
		}
	}, [sectionId])

	return mount ? (
		<Accordion
			type='single'
			collapsible
			className='mt-1'
			defaultValue={sectionId!}
			value={sectionId!}
			onValueChange={onSelect}
		>
			{sections.map(section => (
				<SectionList
					key={section._id}
					{...section}
					hasQuiz={quizSectionIds.includes(section._id)}
				/>
			))}
		</Accordion>
	) : (
		<div className='mt-4 flex flex-col space-y-2'>
			{Array.from({ length: sections.length }).map((_, i) => (
				<SectionLoading key={i} />
			))}
		</div>
	)
}

export default Sections

function SectionList({
	hasQuiz,
	...section
}: ISection & { hasQuiz: boolean }) {
	const { get } = useSearchParams()
	const sectionId = get('s')
	const { lng, courseId } = useParams()
	const t = useTranslate()

	const lessonsCompleted =
		section.lessons.length > 0 &&
		section.lessons.every(lesson =>
			lesson.userProgress.map(p => p.lessonId).includes(lesson._id)
		)

	return (
		<AccordionItem value={section._id} className='mt-1'>
			<AccordionTrigger
				className={cn(
					'text-left hover:no-underline hover:bg-gray-50 hover:dark:bg-gray-800 px-3 bg-gray-100 dark:bg-black/20',
					sectionId === section._id && 'bg-white dark:bg-gray-800'
				)}
			>
				{section.title}
			</AccordionTrigger>

			<AccordionContent>
				{section.lessons.map(lesson => (
					<LessonList
						key={lesson._id}
						lesson={lesson}
						sectionId={section._id}
					/>
				))}

				{hasQuiz &&
					(lessonsCompleted ? (
						<Link
							href={`/${lng}/dashboard/${courseId}/quiz/${section._id}`}
							className='mx-auto mt-2 flex h-12 w-[calc(100%-12px)] items-center gap-x-2 rounded-none px-3 text-sm font-medium text-primary hover:bg-secondary'
						>
							<ListChecks size={16} />
							{t('takeSectionQuiz')}
						</Link>
					) : (
						<div
							className='mx-auto mt-2 flex h-12 w-[calc(100%-12px)] cursor-not-allowed items-center gap-x-2 rounded-none px-3 text-sm text-muted-foreground'
							title={t('sectionQuizLockedHint')}
						>
							<Lock size={16} />
							{t('sectionQuizLocked')}
						</div>
					))}
			</AccordionContent>
		</AccordionItem>
	)
}

interface LessonProps {
	lesson: ILesson
	sectionId: string
}
function LessonList({ lesson, sectionId }: LessonProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [mount, setMount] = useState(false)

	const { userId } = useAuth()
	const pathname = usePathname()
	const { courseId, lessonId } = useParams()

	const isCompleted = lesson.userProgress
		.map(item => item.lessonId)
		.includes(lesson._id)

	const onCheck = (checked: CheckedState) => {
		setIsLoading(true)
		let promise

		if (checked) {
			promise = completeLesson(lesson._id, userId!, pathname)
		} else {
			promise = uncompleteLesson(lesson._id, userId!, pathname)
		}

		promise.finally(() => setIsLoading(false))
	}

	useEffect(() => setMount(true), [])

	return (
		<Button
			className={cn(
				'mx-auto mt-2 flex h-12 w-[calc(100%-12px)] items-center justify-between gap-x-2 rounded-none p-0 px-2 text-sm',
				lessonId === lesson._id && 'bg-secondary'
			)}
			variant={'ghost'}
		>
			<Link
				href={`/dashboard/${courseId}/${lesson._id}?s=${sectionId}`}
				className='flex size-full justify-start px-3'
			>
				<div className='flex max-w-[90%] items-center gap-x-2'>
					<div className='flex-1'>
						<PlayCircle size={16} />
					</div>
					{lesson.title.length > 30
						? `${lesson.title.slice(0, 30)}...`
						: lesson.title}
				</div>
			</Link>
			<div className='w-[10%]'>
				{mount && (
					<Checkbox
						defaultChecked={isCompleted}
						checked={isCompleted}
						onCheckedChange={onCheck}
						disabled={isLoading}
						className={cn(isLoading && 'opacity-50 cursor-not-allowed')}
					/>
				)}
			</div>
		</Button>
	)
}
