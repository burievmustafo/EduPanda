'use client'

import { importSectionQuizQuestions } from '@/actions/quiz.action'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useTranslate from '@/hooks/use-translate'
import { parseQuizText, type ImportIssue } from '@/lib/quiz-import'
import {
	AlertCircle,
	CheckCircle2,
	ClipboardCopy,
	Sparkles,
	Upload,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { ChangeEvent, useMemo, useState } from 'react'
import { toast } from 'sonner'

const MAX_QUESTIONS = 10
const SAMPLE = 'Konnichiwa?, Hello, Bye, Thanks, Sorry, A, Daytime greeting'

export interface LessonCtx {
	title: string
	excerpt?: string
}

interface Props {
	sectionId: string
	sectionTitle: string
	courseTitle?: string
	courseLevel?: string
	courseLanguage?: string
	lessons?: LessonCtx[]
	existingCount: number
}

// Qadam raqami uchun dumaloq nishon
function StepBadge({ n }: { n: number }) {
	return (
		<span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>
			{n}
		</span>
	)
}

function QuizImportDialog({
	sectionId,
	sectionTitle,
	courseTitle,
	courseLevel,
	courseLanguage,
	lessons,
	existingCount,
}: Props) {
	const t = useTranslate()
	const path = usePathname()
	const router = useRouter()

	const [open, setOpen] = useState(false)
	const [raw, setRaw] = useState('')
	const [focus, setFocus] = useState('')
	const [loading, setLoading] = useState(false)

	const result = useMemo(
		() => (raw.trim() ? parseQuizText(raw) : null),
		[raw]
	)

	const lang = courseLanguage || 'english'
	// Modeldagi til sloti faqat en/ja — yaponcha bo'lsa ja, qolgani en.
	const slot: 'en' | 'ja' = courseLanguage === 'japanese' ? 'ja' : 'en'

	const room = MAX_QUESTIONS - existingCount
	const overflow = result ? Math.max(0, result.questions.length - room) : 0
	const hasIssues = !!result && result.issues.length > 0
	const isFull = room <= 0
	const canImport =
		!!result && result.questions.length > 0 && !hasIssues && !isFull

	// Promptga dars konteksti — AI bo'lim mavzusini biladi va aniq savol yozadi.
	const lessonsBlock =
		lessons && lessons.length
			? 'LESSONS IN THIS SECTION (base the questions strictly on these):\n' +
				lessons
					.map(l => `- ${l.title}${l.excerpt ? `: ${l.excerpt}` : ''}`)
					.join('\n')
			: ''
	const focusBlock = focus.trim() ? `\nTEACHER NOTES: ${focus.trim()}` : ''

	const prompt = `You are an expert instructor writing a quiz for ONE section of an online course.

COURSE: "${courseTitle || ''}"${courseLevel ? ` (level: ${courseLevel})` : ''}
SECTION: "${sectionTitle}"
${lessonsBlock}${focusBlock}

Write ${Math.max(1, room)} multiple-choice questions that test the ACTUAL subject knowledge taught in this section's lessons — NOT generic facts about courses, "introductions", or study methods. Write every question, option and explanation in ${lang}.

Guidelines:
- Each question checks a concrete fact, term, rule, or skill from the lessons above.
- Exactly 4 options; exactly ONE is correct; the other three are plausible but clearly wrong.
- Vary the difficulty. Keep each question short and unambiguous.
- "explanation" briefly states why the correct answer is right.

Output ONLY a CSV table, nothing else, with this EXACT header row:
question,option_a,option_b,option_c,option_d,correct,explanation

Format rules:
- "correct" is a single letter only: A, B, C, or D.
- Wrap any field that contains a comma in double quotes ("...").
- No text, notes, or code fences before or after the table.`

	const onCopyPrompt = async () => {
		try {
			await navigator.clipboard.writeText(prompt)
			toast.success(t('promptCopied'))
		} catch {
			toast.error(t('error'))
		}
	}

	const onFile = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		file.text().then(setRaw)
	}

	const issueText = (issue: ImportIssue) =>
		t(`quizImport_${issue.code}`, { row: issue.row, value: issue.value })

	const onImport = async () => {
		if (!result || result.questions.length === 0) return
		setLoading(true)
		try {
			const res = await importSectionQuizQuestions({
				sectionId,
				questions: result.questions,
				language: slot,
				path,
			})
			toast.success(t('quizImportDone', { n: res.added }))
			setRaw('')
			setOpen(false)
			router.refresh()
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('error'))
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='outline' size='sm'>
					<Sparkles className='mr-2 size-4' />
					{t('importQuestions')}
				</Button>
			</DialogTrigger>
			<DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Sparkles className='size-5 text-primary' />
						{t('importQuestions')}
					</DialogTitle>
					<DialogDescription>{t('importQuestionsDesc')}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					{/* 1-qadam: AI prompt */}
					<div className='rounded-lg border bg-muted/30 p-4'>
						<div className='flex items-start gap-3'>
							<StepBadge n={1} />
							<div className='flex-1 space-y-2'>
								<p className='text-sm font-medium leading-tight'>
									{t('importStep1')}
								</p>
								<p className='text-xs text-muted-foreground'>
									{t('importStep1Hint')}
								</p>

								<div className='space-y-1 pt-1'>
									<label className='text-xs font-medium text-muted-foreground'>
										{t('importFocusLabel')}
									</label>
									<Textarea
										value={focus}
										onChange={e => setFocus(e.target.value)}
										placeholder={t('importFocusPlaceholder')}
										className='h-16 resize-none bg-background text-xs'
									/>
								</div>

								<Button
									variant='secondary'
									size='sm'
									onClick={onCopyPrompt}
									className='mt-1'
								>
									<ClipboardCopy className='mr-2 size-4' />
									{t('copyAiPrompt')}
								</Button>
							</div>
						</div>
					</div>

					{/* 2-qadam: paste yoki upload */}
					<div className='rounded-lg border bg-muted/30 p-4'>
						<div className='flex items-start gap-3'>
							<StepBadge n={2} />
							<div className='flex-1 space-y-2'>
								<div className='flex items-center justify-between gap-2'>
									<p className='text-sm font-medium leading-tight'>
										{t('importStep2')}
									</p>
									<label className='inline-flex shrink-0 cursor-pointer items-center rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium transition hover:bg-accent'>
										<Upload className='mr-1.5 size-3.5' />
										{t('orUploadCsv')}
										<input
											type='file'
											accept='.csv,text/csv,text/plain'
											className='hidden'
											onChange={onFile}
										/>
									</label>
								</div>
								<Textarea
									value={raw}
									onChange={e => setRaw(e.target.value)}
									placeholder='question,option_a,option_b,option_c,option_d,correct,explanation'
									className='h-36 resize-none bg-background font-mono text-xs'
								/>
								<p className='truncate text-xs text-muted-foreground'>
									{t('importExample')}:{' '}
									<code className='rounded bg-muted px-1 py-0.5'>{SAMPLE}</code>
								</p>
							</div>
						</div>
					</div>

					{/* Bo'sh holat */}
					{!result && (
						<div className='rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground'>
							{t('importEmptyHint')}
						</div>
					)}

					{/* Preview */}
					{result && (
						<div className='space-y-3'>
							{/* Status banner */}
							{isFull ? (
								<div className='flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400'>
									<AlertCircle className='size-4 shrink-0' />
									{t('quizFull')}
								</div>
							) : hasIssues ? (
								<div className='space-y-2 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/40'>
									<p className='flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400'>
										<AlertCircle className='size-4 shrink-0' />
										{t('importErrorsTitle')}
									</p>
									<ul className='space-y-1 pl-6'>
										{result.issues.map((iss, i) => (
											<li
												key={i}
												className='list-disc text-xs text-red-600 dark:text-red-400'
											>
												{issueText(iss)}
											</li>
										))}
									</ul>
								</div>
							) : (
								<div className='flex items-center justify-between gap-2 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/40'>
									<p className='flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400'>
										<CheckCircle2 className='size-4 shrink-0' />
										{t('importFound', { n: result.questions.length })}
									</p>
									<Badge variant='secondary'>
										{existingCount}/{MAX_QUESTIONS}
									</Badge>
								</div>
							)}

							{!hasIssues && !isFull && overflow > 0 && (
								<p className='text-xs text-amber-600 dark:text-amber-500'>
									{t('importOverflow', { n: overflow })}
								</p>
							)}

							{/* Savol kartalari */}
							{result.questions.length > 0 && (
								<div className='max-h-56 space-y-2 overflow-y-auto pr-1'>
									{result.questions.map((q, i) => (
										<div
											key={i}
											className='rounded-md border bg-secondary/50 p-2.5 text-xs'
										>
											<p className='font-medium'>
												{i + 1}. {q.question}
											</p>
											<div className='mt-1.5 grid gap-0.5'>
												{q.options.map((o, oi) => (
													<div
														key={oi}
														className={
															'flex items-center gap-1.5 ' +
															(oi === q.correctIndex
																? 'font-medium text-green-600 dark:text-green-400'
																: 'text-muted-foreground')
														}
													>
														{oi === q.correctIndex ? (
															<CheckCircle2 className='size-3 shrink-0' />
														) : (
															<span className='w-3 shrink-0 text-center uppercase'>
																{String.fromCharCode(97 + oi)}
															</span>
														)}
														<span>{o}</span>
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				<div className='flex justify-end gap-2 border-t pt-4'>
					<Button
						variant='ghost'
						onClick={() => setOpen(false)}
						disabled={loading}
					>
						{t('cancel')}
					</Button>
					<Button onClick={onImport} disabled={!canImport || loading}>
						{loading ? t('loading') : t('importAction')}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default QuizImportDialog
