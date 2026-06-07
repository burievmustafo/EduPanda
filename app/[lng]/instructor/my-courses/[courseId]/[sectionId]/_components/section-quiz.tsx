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
import { BadgePlus, CheckCircle2, Trash2, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import QuestionForm, { INormalizedQuestion } from './question-form'

const MAX_QUESTIONS = 10

// Matnni mavjud tilda ko'rsatadi (en yoki ja).
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

	const path = usePathname()
	const isFull = questions.length >= MAX_QUESTIONS

	const onCreate = () => {
		setIsLoading(true)
		const promise = initSectionQuiz(sectionId, path).finally(() =>
			setIsLoading(false)
		)
		toast.promise(promise, {
			loading: 'Loading...',
			success: 'Quiz created!',
			error: 'Something went wrong!',
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
			loading: 'Loading...',
			success: 'Saved!',
			error: 'Something went wrong!',
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
		const isConfirmed = confirm('Delete this question?')
		if (!isConfirmed) return
		setIsLoading(true)
		const promise = deleteQuizQuestion(questionId, path).finally(() =>
			setIsLoading(false)
		)
		toast.promise(promise, {
			loading: 'Loading...',
			success: 'Deleted!',
			error: 'Something went wrong!',
		})
	}

	return (
		<Card>
			<CardContent className='relative p-6'>
				{isLoading && <FillLoading />}

				<div className='flex items-center justify-between'>
					<span className='text-lg font-medium'>Manage section quiz</span>
					{quiz && (
						<Button
							size={'icon'}
							variant={'ghost'}
							onClick={onToggle}
							disabled={isFull}
							title={isFull ? `Maximum ${MAX_QUESTIONS} questions` : 'Add question'}
						>
							{state ? <X /> : <BadgePlus />}
						</Button>
					)}
				</div>
				<Separator className='my-3' />

				{!quiz ? (
					<div className='flex flex-col items-start gap-3'>
						<p className='text-sm text-muted-foreground'>
							This section has no final quiz yet. Create one to add up to{' '}
							{MAX_QUESTIONS} questions students take after watching the videos.
						</p>
						<Button onClick={onCreate}>Create section quiz</Button>
					</div>
				) : (
					<div className='space-y-4'>
						<div className='flex flex-wrap items-end gap-3'>
							<div className='space-y-1'>
								<label className='text-xs font-medium text-muted-foreground'>
									Pass score (%)
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
								Save
							</Button>
							<span className='ml-auto text-sm text-muted-foreground'>
								Questions: {questions.length} / {MAX_QUESTIONS}
							</span>
						</div>

						{state && (
							<>
								<Separator />
								<QuestionForm submitLabel='Add question' onSubmit={onAdd} />
							</>
						)}

						<Separator />

						{!questions.length ? (
							<p className='text-sm text-muted-foreground'>No questions yet</p>
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
