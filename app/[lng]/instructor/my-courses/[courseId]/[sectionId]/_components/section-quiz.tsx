'use client'

import {
	addQuizQuestion,
	deleteQuizQuestion,
	initSectionQuiz,
	updateSectionQuiz,
} from '@/actions/quiz.action'
import { IQuizQuestion, ISectionQuiz } from '@/app.types'
import FillLoading from '@/components/shared/fill-loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import useToggleEdit from '@/hooks/use-toggle-edit'
import useTranslate from '@/hooks/use-translate'
import { BadgePlus, CheckCircle2, Trash2, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import QuestionForm, { INormalizedQuestion } from './question-form'

const MAX_QUESTIONS = 10

const pick = (v?: { en?: string; ja?: string }) => v?.en || v?.ja || ''

interface Props {
	sectionId: string
	quiz: ISectionQuiz | null
	questions: IQuizQuestion[]
}

function SectionQuiz({ sectionId, quiz, questions }: Props) {
	const [isLoading, setIsLoading] = useState(false)
	const [passScore, setPassScore] = useState(`${quiz?.passScore ?? 70}`)
	const { state, onToggle } = useToggleEdit()
	const t = useTranslate()

	const path = usePathname()
	const isFull = questions.length >= MAX_QUESTIONS

	const onCreate = () => {
		setIsLoading(true)
		const promise = initSectionQuiz(sectionId, path).finally(() =>
			setIsLoading(false)
		)
		toast.promise(promise, {
			loading: t('loading'),
			success: t('successfullyCreated'),
			error: t('error'),
		})
	}

	const onSavePassScore = () => {
		if (!quiz) return
		setIsLoading(true)
		const promise = updateSectionQuiz({
			quizId: quiz._id,
			passScore: Number(passScore) || 70,
			path,
		}).finally(() => setIsLoading(false))
		toast.promise(promise, {
			loading: t('loading'),
			success: t('save'),
			error: t('error'),
		})
	}

	const onAdd = async (data: INormalizedQuestion) => {
		if (!quiz) return
		setIsLoading(true)
		return addQuizQuestion({ quizId: quiz._id, data, path })
			.then(() => onToggle())
			.finally(() => setIsLoading(false))
	}

	const onDelete = (questionId: string) => {
		const isConfirmed = confirm(t('deleteQuestion') + '?')
		if (!isConfirmed) return
		setIsLoading(true)
		const promise = deleteQuizQuestion(questionId, path).finally(() =>
			setIsLoading(false)
		)
		toast.promise(promise, {
			loading: t('loading'),
			success: t('successfullyDeleted'),
			error: t('error'),
		})
	}

	return (
		<Card>
			<CardContent className='relative p-6'>
				{isLoading && <FillLoading />}

				<div className='flex items-center justify-between'>
					<span className='text-lg font-medium'>{t('manageQuiz')}</span>
					{quiz && (
						<Button
							size={'icon'}
							variant={'ghost'}
							onClick={onToggle}
							disabled={isFull}
							title={isFull ? `Maximum ${MAX_QUESTIONS} questions` : t('addQuestion')}
						>
							{state ? <X /> : <BadgePlus />}
						</Button>
					)}
				</div>
				<Separator className='my-3' />

				{!quiz ? (
					<div className='flex flex-col items-start gap-3'>
						<p className='text-sm text-muted-foreground'>{t('noQuizDesc')}</p>
						<Button onClick={onCreate}>{t('createSectionQuiz')}</Button>
					</div>
				) : (
					<div className='space-y-4'>
						<div className='flex flex-wrap items-end gap-3'>
							<div className='space-y-1'>
								<label className='text-xs font-medium text-muted-foreground'>
									{t('passScore')}
								</label>
								<Input
									type='number'
									min={0}
									max={100}
									value={passScore}
									onChange={e => setPassScore(e.target.value)}
									className='h-9 w-28 bg-secondary'
								/>
							</div>
							<Button variant={'outline'} size={'sm'} onClick={onSavePassScore}>
								{t('save')}
							</Button>
							<span className='ml-auto text-sm text-muted-foreground'>
								{t('quizzes')}: {questions.length} / {MAX_QUESTIONS}
							</span>
						</div>

						{state && (
							<>
								<Separator />
								<QuestionForm submitLabel={t('addQuestion')} onSubmit={onAdd} />
							</>
						)}

						<Separator />

						{!questions.length ? (
							<p className='text-sm text-muted-foreground'>{t('noQuestionsYet')}</p>
						) : (
							<div className='space-y-3'>
								{questions.map((q, index) => (
									<div
										key={q._id}
										className='rounded-md border bg-secondary p-3 text-sm'
									>
										<div className='flex items-start justify-between gap-2'>
											<p className='font-medium'>
												{index + 1}. {pick(q.question)}
											</p>
											<Trash2
												className='size-4 shrink-0 cursor-pointer transition hover:opacity-75'
												onClick={() => onDelete(q._id)}
											/>
										</div>
										<div className='mt-2 grid gap-1'>
											{q.options.map(opt => {
												const correct = opt.id === q.correctOptionId
												return (
													<div
														key={opt.id}
														className={
															'flex items-center gap-2 ' +
															(correct ? 'font-medium text-green-600' : '')
														}
													>
														{correct ? (
															<CheckCircle2 className='size-4' />
														) : (
															<span className='size-4 text-center text-xs uppercase text-muted-foreground'>
																{opt.id}
															</span>
														)}
														<span>{pick(opt.text)}</span>
													</div>
												)
											})}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default SectionQuiz
