'use client'

import { answerTimedQuestion } from '@/actions/quiz.action'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export interface IStudentTimedQuestion {
	id: string
	triggerTimeSec: number
	question: string
	options: { id: string; text: string }[]
	required: boolean
}

interface ResultState {
	isCorrect: boolean
	correctOptionId: string
	explanation?: string
}

interface Props {
	question: IStudentTimedQuestion
	clerkId: string | null
	videoTimeSec: number
	onContinue: () => void
}

function TimedQuestionOverlay({
	question,
	clerkId,
	videoTimeSec,
	onContinue,
}: Props) {
	const [selected, setSelected] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [result, setResult] = useState<ResultState | null>(null)

	const onSubmit = async () => {
		if (!selected) return
		setSubmitting(true)
		try {
			const res = await answerTimedQuestion({
				clerkId: clerkId ?? '',
				questionId: question.id,
				selectedOptionId: selected,
				videoTimeSec,
			})
			setResult(res)
		} catch {
			toast.error('Something went wrong!')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className='absolute inset-0 z-[60] flex items-center justify-center bg-black/70 p-4'>
			<div className='w-full max-w-xl rounded-lg border bg-background p-5 shadow-xl'>
				<p className='mb-1 text-xs font-medium uppercase tracking-wide text-primary'>
					Quick question
				</p>
				<h3 className='mb-4 text-lg font-semibold'>{question.question}</h3>

				<RadioGroup
					value={selected}
					onValueChange={setSelected}
					className='gap-2'
					disabled={!!result}
				>
					{question.options.map(opt => {
						const isCorrect = result?.correctOptionId === opt.id
						const isChosenWrong =
							result && selected === opt.id && !result.isCorrect
						return (
							<label
								key={opt.id}
								htmlFor={`tq-${opt.id}`}
								className={cn(
									'flex cursor-pointer items-center gap-3 rounded-md border bg-secondary p-3 text-sm transition',
									isCorrect && 'border-green-500 bg-green-500/10',
									isChosenWrong && 'border-red-500 bg-red-500/10'
								)}
							>
								<RadioGroupItem value={opt.id} id={`tq-${opt.id}`} />
								<span className='flex-1'>{opt.text}</span>
								{isCorrect && <CheckCircle2 className='size-4 text-green-600' />}
								{isChosenWrong && <XCircle className='size-4 text-red-600' />}
							</label>
						)
					})}
				</RadioGroup>

				{result && (
					<div
						className={cn(
							'mt-4 rounded-md p-3 text-sm',
							result.isCorrect
								? 'bg-green-500/10 text-green-700 dark:text-green-400'
								: 'bg-red-500/10 text-red-700 dark:text-red-400'
						)}
					>
						<p className='font-medium'>
							{result.isCorrect ? 'Correct! 🎉' : 'Incorrect'}
						</p>
						{result.explanation && (
							<p className='mt-1 text-muted-foreground'>{result.explanation}</p>
						)}
					</div>
				)}

				<div className='mt-5 flex justify-end'>
					{!result ? (
						<Button onClick={onSubmit} disabled={!selected || submitting}>
							{submitting && <Loader2 className='mr-2 size-4 animate-spin' />}
							Submit answer
						</Button>
					) : (
						<Button onClick={onContinue}>Continue watching</Button>
					)}
				</div>
			</div>
		</div>
	)
}

export default TimedQuestionOverlay
