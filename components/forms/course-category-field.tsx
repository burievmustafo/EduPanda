'use client'

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { COURSE_CATEGORY_OTHER, courseCategory } from '@/constants'
import useTranslate from '@/hooks/use-translate'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

type Props<T extends FieldValues> = {
	control: Control<T>
	categoryName: FieldPath<T>
	customName: FieldPath<T>
	disabled?: boolean
}

export function CourseCategoryField<T extends FieldValues>({
	control,
	categoryName,
	customName,
	disabled,
}: Props<T>) {
	const category = useWatch({ control, name: categoryName })
	const t = useTranslate()

	return (
		<div className='space-y-3'>
			<FormField
				control={control}
				name={categoryName}
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							{t('category')}<span className='text-red-500'>*</span>
						</FormLabel>
						<FormControl>
							<Select
								value={field.value}
								onValueChange={field.onChange}
								disabled={disabled}
							>
								<SelectTrigger className='w-full bg-secondary'>
									<SelectValue placeholder={t('filter')} />
								</SelectTrigger>
								<SelectContent>
									{courseCategory.map((item) => (
										<SelectItem key={item} value={item}>
											{item === COURSE_CATEGORY_OTHER ? t('other') : item}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{category === COURSE_CATEGORY_OTHER ? (
				<FormField
					control={control}
					name={customName}
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{t('customCategory')}<span className='text-red-500'>*</span>
							</FormLabel>
							<FormControl>
								<Input
									{...field}
									className='bg-secondary'
									placeholder='e.g. Japanese, Cooking, Music…'
									disabled={disabled}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			) : null}
		</div>
	)
}
