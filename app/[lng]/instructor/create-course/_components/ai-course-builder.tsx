'use client'

import {
	createCourseFromDraft,
	generateCourseOutline,
	generateSectionContent,
} from '@/actions/ai-course.action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
	COURSE_CATEGORY_OTHER,
	courseCategory,
	courseLanguage,
	courseLevels,
	resolveCourseCategory,
} from '@/constants'
import useTranslate from '@/hooks/use-translate'
import type { CourseDraft, DraftSection } from '@/lib/course-generate'
import { useUser } from '@clerk/nextjs'
import { BookOpen, ListChecks, Loader2, Sparkles } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const levelKeys: Record<string, string> = {
	beginner: 'level2',
	intermediate: 'level3',
	advanced: 'level4',
}
const langKeys: Record<string, string> = {
	english: 'langEnglish',
	uzbek: 'langUzbek',
	japanese: 'langJapanese',
}

type Phase = 'form' | 'generating' | 'preview'

function AiCourseBuilder() {
	const t = useTranslate()
	const router = useRouter()
	const { lng } = useParams()
	const { user } = useUser()

	const [phase, setPhase] = useState<Phase>('form')
	const [progress, setProgress] = useState({ current: 0, total: 0 })
	const [draft, setDraft] = useState<CourseDraft | null>(null)
	const [creating, setCreating] = useState(false)

	const [topic, setTopic] = useState('')
	const [level, setLevel] = useState(courseLevels[0])
	const [category, setCategory] = useState(courseCategory[0])
	const [categoryCustom, setCategoryCustom] = useState('')
	const [language, setLanguage] = useState(courseLanguage[0])
	const [sections, setSections] = useState(3)
	const [lessonsPer, setLessonsPer] = useState(3)
	const [questionsPer, setQuestionsPer] = useState(5)
	const [notes, setNotes] = useState('')

	const onGenerate = async () => {
		if (!topic.trim()) return toast.error(t('aiTopicRequired'))
		const finalCategory = resolveCourseCategory(category, categoryCustom)
		setPhase('generating')
		setProgress({ current: 0, total: sections })

		try {
			const outline = await generateCourseOutline({
				topic,
				level,
				category: finalCategory,
				language,
				sections,
				lessonsPerSection: lessonsPer,
				questionsPerSection: questionsPer,
				notes,
			})

			const builtSections: DraftSection[] = []
			for (let i = 0; i < outline.sections.length; i++) {
				setProgress({ current: i + 1, total: outline.sections.length })
				const s = outline.sections[i]
				const fill = await generateSectionContent({
					courseTitle: outline.title,
					level,
					language,
					sectionTitle: s.title,
					lessonTitles: s.lessonTitles,
					questionsPerSection: questionsPer,
				})
				builtSections.push({
					title: s.title,
					// AI dars matnini bermasa — sarlavhalardan bo'sh dars yaratamiz
					lessons: fill.lessons.length
						? fill.lessons
						: s.lessonTitles.map(tt => ({ title: tt, content: '' })),
					quiz: fill.quiz,
				})
			}

			setDraft({
				title: outline.title,
				description: outline.description,
				learning: outline.learning,
				requirements: outline.requirements,
				level,
				category: finalCategory,
				language,
				sections: builtSections,
			})
			setPhase('preview')
		} catch (err) {
			const code = err instanceof Error ? err.message : ''
			toast.error(code === 'AI_BUSY' ? t('aiBusy') : t('aiFailed'))
			setPhase('form')
		}
	}

	const onCreate = async () => {
		if (!draft || !user?.id) return
		setCreating(true)
		try {
			const res = await createCourseFromDraft(draft, user.id)
			toast.success(t('aiCreated'))
			router.push(`/${lng}/instructor/my-courses/${res.courseId}`)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('error'))
			setCreating(false)
		}
	}

	/* ----------------------------- Generating ---------------------------- */
	if (phase === 'generating') {
		return (
			<div className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
				<Loader2 className='size-10 animate-spin text-primary' />
				<p className='text-lg font-medium'>{t('aiGenerating')}</p>
				<p className='text-sm text-muted-foreground'>
					{progress.current === 0
						? t('aiGeneratingOutline')
						: t('aiGeneratingSection', {
								n: progress.current,
								total: progress.total,
							})}
				</p>
				<p className='max-w-md text-xs text-muted-foreground'>
					{t('aiGeneratingHint')}
				</p>
			</div>
		)
	}

	/* ------------------------------ Preview ------------------------------ */
	if (phase === 'preview' && draft) {
		const totalLessons = draft.sections.reduce(
			(a, s) => a + s.lessons.length,
			0
		)
		const totalQuiz = draft.sections.reduce((a, s) => a + s.quiz.length, 0)

		return (
			<div className='space-y-4'>
				<div className='rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/40'>
					<p className='flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400'>
						<Sparkles className='size-4' /> {t('aiDraftReady')}
					</p>
					<p className='mt-1 text-xs text-muted-foreground'>
						{t('aiPreviewNote')}
					</p>
				</div>

				{/* Kurs meta */}
				<div className='space-y-1 rounded-md border p-4'>
					<h3 className='font-space-grotesk text-xl font-bold'>{draft.title}</h3>
					<p className='text-sm text-muted-foreground'>{draft.description}</p>
					<div className='flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground'>
						<span>{draft.sections.length} {t('courseSections')}</span>
						<span>· {totalLessons} {t('lessons')}</span>
						<span>· {totalQuiz} {t('quizzes')}</span>
					</div>
				</div>

				{/* Bo'limlar */}
				<div className='space-y-3'>
					{draft.sections.map((s, i) => (
						<div key={i} className='rounded-md border'>
							<div className='flex items-center gap-2 border-b bg-muted/30 p-3'>
								<span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>
									{i + 1}
								</span>
								<span className='font-medium'>{s.title}</span>
								<span className='ml-auto flex items-center gap-3 text-xs text-muted-foreground'>
									<span className='flex items-center gap-1'>
										<BookOpen className='size-3.5' /> {s.lessons.length}
									</span>
									<span className='flex items-center gap-1'>
										<ListChecks className='size-3.5' /> {s.quiz.length}
									</span>
								</span>
							</div>
							<div className='space-y-1 p-3'>
								{s.lessons.map((l, li) => (
									<details key={li} className='group'>
										<summary className='cursor-pointer text-sm hover:text-primary'>
											{li + 1}. {l.title}
										</summary>
										<div
											className='prose prose-sm mt-1 max-w-none pl-4 text-xs text-muted-foreground'
											dangerouslySetInnerHTML={{
												__html: l.content || `<em>${t('aiNoContent')}</em>`,
											}}
										/>
									</details>
								))}
							</div>
						</div>
					))}
				</div>

				<div className='flex justify-end gap-2 border-t pt-4'>
					<Button
						variant='ghost'
						onClick={() => {
							setDraft(null)
							setPhase('form')
						}}
						disabled={creating}
					>
						{t('startOver')}
					</Button>
					<Button onClick={onCreate} disabled={creating}>
						{creating ? (
							<>
								<Loader2 className='mr-2 size-4 animate-spin' />
								{t('loading')}
							</>
						) : (
							t('createAsDraft')
						)}
					</Button>
				</div>
			</div>
		)
	}

	/* ------------------------------- Form -------------------------------- */
	return (
		<div className='space-y-4'>
			<div className='rounded-md border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground'>
				{t('aiBuilderDesc')}
			</div>

			<div className='space-y-2'>
				<Label>{t('aiTopic')}</Label>
				<Input
					value={topic}
					onChange={e => setTopic(e.target.value)}
					placeholder='Japanese for Beginners'
					className='bg-secondary'
				/>
			</div>

			<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
				<div className='space-y-2'>
					<Label>{t('level')}</Label>
					<Select value={level} onValueChange={setLevel}>
						<SelectTrigger className='bg-secondary'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{courseLevels.map(item => (
								<SelectItem key={item} value={item}>
									{t(levelKeys[item] ?? item)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className='space-y-2'>
					<Label>{t('category')}</Label>
					<Select value={category} onValueChange={setCategory}>
						<SelectTrigger className='bg-secondary'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{courseCategory.map(item => (
								<SelectItem key={item} value={item}>
									{item === COURSE_CATEGORY_OTHER ? t('other') : item}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{category === COURSE_CATEGORY_OTHER && (
						<Input
							value={categoryCustom}
							onChange={e => setCategoryCustom(e.target.value)}
							placeholder={t('customCategory')}
							className='bg-secondary'
						/>
					)}
				</div>
				<div className='space-y-2'>
					<Label>{t('language')}</Label>
					<Select value={language} onValueChange={setLanguage}>
						<SelectTrigger className='bg-secondary'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{courseLanguage.map(item => (
								<SelectItem key={item} value={item}>
									{t(langKeys[item] ?? item)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
				<div className='space-y-2'>
					<Label>{t('courseSections')}</Label>
					<Input
						type='number'
						min={1}
						max={6}
						value={sections}
						onChange={e => setSections(Number(e.target.value))}
						className='bg-secondary'
					/>
				</div>
				<div className='space-y-2'>
					<Label>{t('aiLessonsPer')}</Label>
					<Input
						type='number'
						min={1}
						max={5}
						value={lessonsPer}
						onChange={e => setLessonsPer(Number(e.target.value))}
						className='bg-secondary'
					/>
				</div>
				<div className='space-y-2'>
					<Label>{t('aiQuestionsPer')}</Label>
					<Input
						type='number'
						min={0}
						max={10}
						value={questionsPer}
						onChange={e => setQuestionsPer(Number(e.target.value))}
						className='bg-secondary'
					/>
				</div>
			</div>

			<div className='space-y-2'>
				<Label>{t('aiNotes')}</Label>
				<Textarea
					value={notes}
					onChange={e => setNotes(e.target.value)}
					placeholder={t('aiNotesPlaceholder')}
					className='h-20 resize-none bg-secondary'
				/>
			</div>

			<div className='flex justify-end'>
				<Button
					onClick={onGenerate}
					disabled={
						!topic.trim() ||
						(category === COURSE_CATEGORY_OTHER && !categoryCustom.trim())
					}
				>
					<Sparkles className='mr-2 size-4' />
					{t('generateCourse')}
				</Button>
			</div>
		</div>
	)
}

export default AiCourseBuilder
