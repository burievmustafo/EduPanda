'use client'

import { submitSectionQuiz } from '@/actions/quiz.action'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import useTranslate from '@/hooks/use-translate'
import { cn } from '@/lib/utils'
import { useAuth } from '@clerk/nextjs'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

interface QuizOption {
	id: string
	text: string
}
interface QuizQuestion {
	id: string
	question: string
	options: QuizOption[]
}
export interface StudentQuiz {
	quizId: string
	title: string
	passScore: number
	questions: QuizQuestion[]
	latestAttempt?: QuizResult | null
}

interface ReviewItem {
	questionId: string
	selectedOptionId: string
	correctOptionId: string
	isCorrect: boolean
	explanation?: string
}
interface QuizResult {
	attemptId?: string
	totalQuestions: number
	correctAnswers: number
	score: number
	passed: boolean
	review: ReviewItem[]
}

interface Props {
	quiz: StudentQuiz
	courseId: string
	lng: string
}

function QuizRunner({ quiz, courseId, lng }: Props) {
	const { userId } = useAuth()
	const t = useTranslate()
	const [answers, setAnswers] = useState<Record<string, string>>({})
	const [submitting, setSubmitting] = useState(false)
	const [result, setResult] = useState<QuizResult | null>(quiz.latestAttempt ?? null)

	const reviewByQuestion = useMemo(() => {
		const map: Record<string, ReviewItem> = {}
		result?.review.forEach(r => (map[r.questionId] = r))
		return map
	}, [result])

	const answeredCount = Object.keys(answers).length
	const allAnswered = answeredCount === quiz.questions.length

	const onSelect = (questionId: string, optionId: string) => {
		if (result) return
		setAnswers(prev => ({ ...prev, [questionId]: optionId }))
	}

	const onSubmit = async () => {
		setSubmitting(true)
		try {
			const res = await submitSectionQuiz({
				clerkId: userId ?? '',
				quizId: quiz.quizId,
				answers: quiz.questions.map(q => ({
					questionId: q.id,
					selectedOptionId: answers[q.id] ?? '',
				})),
			})
			setResult(res)
			window.scrollTo({ top: 0, behavior: 'smooth' })
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('error'))
		} finally {
			setSubmitting(false)
		}
	}

	const onRetake = () => {
		setResult(null)
		setAnswers({})
	}

	return (
		<div className='space-y-4'>
			{result && (
				<Card>
					<CardContent
						className={cn(
							'flex flex-col items-center gap-1 p-6 text-center',
							result.passed ? 'text-green-600' : 'text-red-600'
						)}
					>
						{result.passed ? (
							<CheckCircle2 className='size-10' />
						) : (
							<XCircle className='size-10' />
						)}
						<p className='text-3xl font-bold'>{result.score}%</p>
						<p className='text-sm'>
							{result.correctAnswers} / {result.totalQuestions} {t('quizCorrectLabel')} ·{' '}
							{result.passed ? t('quizPassedStatus') : t('quizFailedStatus')} (
							{t('quizPassLabel')} {quiz.passScore}%)
						</p>
						<div className='mt-3 flex gap-2'>
							<Button variant={'outline'} onClick={onRetake}>
								{t('quizRetake')}
							</Button>
							<Link href={`/${lng}/dashboard/${courseId}`}>
								<Button>{t('quizBackToCourse')}</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			)}

			{quiz.questions.map((q, index) => {
				const review = reviewByQuestion[q.id]
				return (
					<Card key={q.id}>
						<CardContent className='p-5'>
							<h3 className='mb-3 font-medium'>
								{index + 1}. {q.question}
							</h3>
							<RadioGroup
								value={answers[q.id] ?? review?.selectedOptionId ?? ''}
								onValueChange={val => onSelect(q.id, val)}
								className='gap-2'
								disabled={!!result}
							>
								{q.options.map(opt => {
									const isCorrect = review?.correctOptionId === opt.id
									const isChosenWrong =
										review &&
										review.selectedOptionId === opt.id &&
										!review.isCorrect
									return (
										<label
											key={opt.id}
											htmlFor={`${q.id}-${opt.id}`}
											className={cn(
												'flex cursor-pointer items-center gap-3 rounded-md border bg-secondary p-3 text-sm transition',
												isCorrect && 'border-green-500 bg-green-500/10',
												isChosenWrong && 'border-red-500 bg-red-500/10'
											)}
										>
											<RadioGroupItem value={opt.id} id={`${q.id}-${opt.id}`} />
											<span className='flex-1'>{opt.text}</span>
											{isCorrect && (
												<CheckCircle2 className='size-4 text-green-600' />
											)}
											{isChosenWrong && (
												<XCircle className='size-4 text-red-600' />
											)}
										</label>
									)
								})}
							</RadioGroup>
							{review?.explanation && (
								<p className='mt-2 rounded-md bg-muted p-2 text-xs text-muted-foreground'>
									{review.explanation}
								</p>
							)}
						</CardContent>
					</Card>
				)
			})}

			{!result && (
				<div className='flex items-center justify-between'>
					<span className='text-sm text-muted-foreground'>
						{t('quizAnswered', { count: answeredCount, total: quiz.questions.length })}
					</span>
					<Button onClick={onSubmit} disabled={!allAnswered || submitting}>
						{submitting && <Loader2 className='mr-2 size-4 animate-spin' />}
						{t('quizSubmit')}
					</Button>
				</div>
			)}
		</div>
	)
}

export default QuizRunner
