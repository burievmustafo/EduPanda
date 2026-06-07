'use client'

import {
	deleteTimedQuestion,
	getTimedQuestion,
	saveTimedQuestion,
} from '@/actions/quiz.action'
import { ITimedQuestion } from '@/app.types'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { AlarmClock, Loader2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import QuestionForm, {
	INormalizedQuestion,
	IQuestionFormValues,
} from './question-form'

const OPTION_IDS = ['a', 'b', 'c', 'd']

interface Props {
	lessonId: string
	lessonTitle: string
}

// Matnni mavjud tilda o'qiydi (en yoki ja).
const pick = (v?: { en?: string; ja?: string }) => v?.en || v?.ja || ''

// ITimedQuestion -> QuestionForm defaultValues
const toDefaults = (tq: ITimedQuestion): Partial<IQuestionFormValues> => {
	const correct = (OPTION_IDS.includes(tq.correctOptionId)
		? tq.correctOptionId
		: 'a') as 'a' | 'b' | 'c' | 'd'
	// Qaysi tilda saqlangani: ja bo'lsa ja, aks holda en.
	const language: 'en' | 'ja' = tq.question?.ja ? 'ja' : 'en'
	return {
		language,
		triggerTimeSec: `${tq.triggerTimeSec ?? ''}`,
		question: pick(tq.question),
		option1: pick(tq.options?.[0]?.text),
		option2: pick(tq.options?.[1]?.text),
		option3: pick(tq.options?.[2]?.text),
		option4: pick(tq.options?.[3]?.text),
		correct,
		explanation: pick(tq.explanation),
	}
}

function TimedQuestionDialog({ lessonId, lessonTitle }: Props) {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [existing, setExisting] = useState<ITimedQuestion | null>(null)
	const path = usePathname()

	const onOpenChange = async (next: boolean) => {
		setOpen(next)
		if (next) {
			setLoading(true)
			try {
				const tq = await getTimedQuestion(lessonId)
				setExisting(tq)
			} catch {
				toast.error('Failed to load question')
			} finally {
				setLoading(false)
			}
		}
	}

	const onSave = async (data: INormalizedQuestion) => {
		return saveTimedQuestion({
			lessonId,
			triggerTimeSec: data.triggerTimeSec,
			data,
			path,
		}).then(() => setOpen(false))
	}

	const onDelete = () => {
		const isConfirmed = confirm('Delete the in-video question for this lesson?')
		if (!isConfirmed) return
		const promise = deleteTimedQuestion(lessonId, path).then(() => {
			setExisting(null)
			setOpen(false)
		})
		toast.promise(promise, {
			loading: 'Loading...',
			success: 'Deleted!',
			error: 'Something went wrong!',
		})
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<AlarmClock
					className='size-4 cursor-pointer transition hover:opacity-75'
					aria-label='In-video question'
				/>
			</DialogTrigger>
			<DialogContent className='max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>In-video question</DialogTitle>
					<DialogDescription>
						{lessonTitle} — the video pauses at the trigger time and shows this
						single 4-option question (one per lesson).
					</DialogDescription>
				</DialogHeader>

				{loading ? (
					<div className='flex items-center justify-center py-10'>
						<Loader2 className='size-6 animate-spin' />
					</div>
				) : (
					<>
						<QuestionForm
							key={existing?._id ?? 'new'}
							withTime
							defaultValues={existing ? toDefaults(existing) : undefined}
							submitLabel={existing ? 'Update question' : 'Add question'}
							onSubmit={onSave}
						/>
						{existing && (
							<Button
								variant='destructive'
								className='w-full'
								onClick={onDelete}
							>
								Delete question
							</Button>
						)}
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}

export default TimedQuestionDialog
