'use client'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { questionSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const OPTION_IDS = ['a', 'b', 'c', 'd'] as const

export interface IQuestionFormValues {
	language?: 'en' | 'ja'
	triggerTimeSec?: string
	question: string
	option1: string
	option2: string
	option3: string
	option4: string
	correct: 'a' | 'b' | 'c' | 'd'
	explanation?: string
}

export interface INormalizedQuestion {
	language: 'en' | 'ja'
	triggerTimeSec: number
	question: string
	options: string[]
	correctIndex: number
	explanation?: string
}

interface Props {
	withTime?: boolean
	defaultValues?: Partial<IQuestionFormValues>
	submitLabel: string
	onSubmit: (data: INormalizedQuestion) => Promise<void>
	onCancel?: () => void
}

function QuestionForm({
	withTime = false,
	defaultValues,
	submitLabel,
	onSubmit,
	onCancel,
}: Props) {
	const form = useForm<z.infer<typeof questionSchema>>({
		resolver: zodResolver(questionSchema),
		defaultValues: {
			language: defaultValues?.language ?? 'en',
			triggerTimeSec: defaultValues?.triggerTimeSec ?? '',
			question: defaultValues?.question ?? '',
			option1: defaultValues?.option1 ?? '',
			option2: defaultValues?.option2 ?? '',
			option3: defaultValues?.option3 ?? '',
			option4: defaultValues?.option4 ?? '',
			correct: defaultValues?.correct ?? 'a',
			explanation: defaultValues?.explanation ?? '',
		},
	})

	const handleSubmit = (values: z.infer<typeof questionSchema>) => {
		const normalized: INormalizedQuestion = {
			language: values.language,
			triggerTimeSec: Number(values.triggerTimeSec) || 0,
			question: values.question,
			options: [
				values.option1,
				values.option2,
				values.option3,
				values.option4,
			],
			correctIndex: OPTION_IDS.indexOf(values.correct),
			explanation: values.explanation || undefined,
		}

		const promise = onSubmit(normalized).then(() => form.reset())
		toast.promise(promise, {
			loading: 'Loading...',
			success: 'Successfully!',
			error: err => (err instanceof Error ? err.message : 'Something went wrong!'),
		})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-3'>
				<FormField
					control={form.control}
					name='language'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Question language (match the video)</FormLabel>
							<FormControl>
								<div className='flex gap-2'>
									{(['en', 'ja'] as const).map(lng => (
										<Button
											key={lng}
											type='button'
											size='sm'
											variant={field.value === lng ? 'default' : 'outline'}
											onClick={() => field.onChange(lng)}
										>
											{lng === 'en' ? 'English' : '日本語'}
										</Button>
									))}
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{withTime && (
					<FormField
						control={form.control}
						name='triggerTimeSec'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Trigger time (seconds)</FormLabel>
								<FormControl>
									<Input
										type='number'
										min={0}
										placeholder='e.g. 30'
										className='bg-secondary'
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormField
					control={form.control}
					name='question'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Question</FormLabel>
							<FormControl>
								<Textarea
									placeholder='Type your question'
									className='bg-secondary'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='correct'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Options (select the correct one)</FormLabel>
							<FormControl>
								<RadioGroup
									value={field.value}
									onValueChange={field.onChange}
									className='gap-2'
								>
									{OPTION_IDS.map((id, index) => (
										<div key={id} className='flex items-center gap-2'>
											<RadioGroupItem value={id} id={`opt-${id}`} />
											<FormField
												control={form.control}
												name={`option${index + 1}` as keyof z.infer<typeof questionSchema>}
												render={({ field: optField }) => (
													<FormItem className='flex-1'>
														<FormControl>
															<Input
																placeholder={`Option ${id.toUpperCase()}`}
																className='bg-secondary'
																{...optField}
																value={optField.value as string}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									))}
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='explanation'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Explanation (optional)</FormLabel>
							<FormControl>
								<Textarea
									placeholder='Why is this the correct answer?'
									className='bg-secondary'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className='flex items-center gap-2'>
					<Button type='submit'>{submitLabel}</Button>
					{onCancel && (
						<Button variant='destructive' type='button' onClick={onCancel}>
							Cancel
						</Button>
					)}
				</div>
			</form>
		</Form>
	)
}

export default QuestionForm
