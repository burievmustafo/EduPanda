'use client'

import { updateCourse } from '@/actions/course.action'
import { ICourse } from '@/app.types'
import FillLoading from '@/components/shared/fill-loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import useToggleEdit from '@/hooks/use-toggle-edit'
import useTranslate from '@/hooks/use-translate'
import { priceSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Edit2, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

function formatUsd(price?: number | null) {
	if (typeof price !== 'number' || Number.isNaN(price)) return null
	return price.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	})
}

function Price(course: ICourse) {
	const { state, onToggle } = useToggleEdit()
	const t = useTranslate()

	return (
		<Card>
			<CardContent className='relative p-6'>
				<div className='flex items-center justify-between'>
					<span className='text-lg font-medium'>{t('changePriceLabel')}</span>
					<Button size={'icon'} variant={'ghost'} onClick={onToggle}>
						{state ? <X /> : <Edit2 />}
					</Button>
				</div>
				<Separator className='my-3' />

				{state ? (
					<Forms onToggle={onToggle} course={course} />
				) : (
					<div className='flex flex-col space-y-2'>
						<div className='flex items-center gap-2'>
							<span className='font-space-grotesk font-bold text-muted-foreground'>
								{t('oldPriceLabel')}:
							</span>
							<span className='font-medium'>
								{formatUsd(course.oldPrice) ?? '—'}
							</span>
						</div>
						<div className='flex items-center gap-2'>
							<span className='font-space-grotesk font-bold text-muted-foreground'>
								{t('currentPriceLabel')}:
							</span>
							<span className='font-medium'>
								{formatUsd(course.currentPrice) ?? t('freeLabel')}
							</span>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default Price

interface FormsProps {
	course: ICourse
	onToggle: () => void
}
function Forms({ course, onToggle }: FormsProps) {
	const [isLoading, setIsLoading] = useState(false)
	const t = useTranslate()
	const pathname = usePathname()

	const form = useForm<z.infer<typeof priceSchema>>({
		resolver: zodResolver(priceSchema),
		defaultValues: {
			oldPrice: `${course.oldPrice}`,
			currentPrice: `${course.currentPrice}`,
		},
	})

	function onSubmit(values: z.infer<typeof priceSchema>) {
		setIsLoading(true)
		const { currentPrice, oldPrice } = values
		const promise = updateCourse(
			course._id,
			{ currentPrice: +currentPrice, oldPrice: +oldPrice },
			pathname
		)
			.then(() => onToggle())
			.finally(() => setIsLoading(false))

		toast.promise(promise, {
			loading: t('loading'),
			success: t('successfullyUpdated'),
			error: t('error'),
		})
	}
	return (
		<>
			{isLoading && <FillLoading />}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
					<FormField
						control={form.control}
						name='oldPrice'
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{t('oldPriceLabel')}<span className='text-red-500'>*</span>
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										className='bg-secondary'
										disabled={isLoading}
										type='number'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='currentPrice'
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{t('currentPriceLabel')}<span className='text-red-500'>*</span>
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										className='bg-secondary'
										disabled={isLoading}
										type='number'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type='submit' disabled={isLoading}>
						{t('save')}
					</Button>
				</form>
			</Form>
		</>
	)
}
