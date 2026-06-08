'use client'

import { courseSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select'
import { courseLanguage, courseLevels, resolveCourseCategory } from '@/constants'
import { CourseCategoryField } from '@/components/forms/course-category-field'
import { Button } from '../ui/button'
import { createCourse } from '@/actions/course.action'
import { toast } from 'sonner'
import { ChangeEvent, useState } from 'react'
import { getDownloadURL, ref, uploadString } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { ImageDown } from 'lucide-react'
import { Dialog, DialogContent } from '../ui/dialog'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { v4 as uuidv4 } from 'uuid'
import useTranslate from '@/hooks/use-translate'

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

function CourseFieldsForm() {
	const [isLoading, setIsLoading] = useState(false)
	const [isImageUploading, setIsImageUploading] = useState(false)
	const [previewImage, setPreviewImage] = useState('')
	const [open, setOpen] = useState(false)

	const router = useRouter()
	const { lng } = useParams()
	const { user } = useUser()
	const t = useTranslate()

	const form = useForm<z.infer<typeof courseSchema>>({
		resolver: zodResolver(courseSchema),
		defaultValues: defaultVal,
	})

	function onUpload(e: ChangeEvent<HTMLInputElement>) {
		const files = e.target.files
		if (!files) return null
		const file = files[0]
		if (!file) return null
		if (!file.type.startsWith('image/')) {
			return toast.error(t('error'))
		}

		const reader = new FileReader()

		reader.readAsDataURL(file)
		reader.onload = async e => {
			const refs = ref(storage, `/praktikum/course/${uuidv4()}`)
			const result = e.target?.result as string
			setPreviewImage(result)
			setIsImageUploading(true)

			const promise = uploadString(refs, result, 'data_url')
				.then(() => getDownloadURL(refs))
				.then(url => {
					setPreviewImage(url)
					return url
				})
				.catch(error => {
					console.error('Course image upload failed:', error)
					toast.warning(t('error'))
					return result
				})
				.finally(() => setIsImageUploading(false))

			toast.promise(promise, {
				loading: t('uploading'),
				success: t('successfullyUploaded'),
				error: t('error'),
			})
		}

		reader.onerror = () => {
			setIsImageUploading(false)
			toast.error(t('error'))
		}
	}

	function onSubmit(values: z.infer<typeof courseSchema>) {
		if (isImageUploading) {
			return toast.error(t('uploadingImage'))
		}
		if (!previewImage) {
			return toast.error(t('error'))
		}
		setIsLoading(true)
		const { oldPrice, currentPrice, categoryCustom, category, ...rest } = values
		const promise = createCourse(
			{
				...rest,
				category: resolveCourseCategory(category, categoryCustom),
				oldPrice: +oldPrice,
				currentPrice: +currentPrice,
				previewImage,
			},
			user?.id as string
		)
			.then(() => {
				form.reset()
				router.push(`/${lng}/instructor/my-courses`)
			})
			.finally(() => setIsLoading(false))

		toast.promise(promise, {
			loading: t('loading'),
			success: t('successfullyCreated'),
			error: t('error'),
		})
	}

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
					<FormField
						control={form.control}
						name='title'
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{t('courseTitle')}<span className='text-red-500'>*</span>
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										className='bg-secondary'
										placeholder='Learn ReactJS - from 0 to hero'
										disabled={isLoading}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='description'
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{t('shortDescription')}<span className='text-red-500'>*</span>
								</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										className='h-44 bg-secondary'
										placeholder={t('descriptionLabel')}
										disabled={isLoading}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='grid grid-cols-2 gap-4'>
						<FormField
							control={form.control}
							name='learning'
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t('whatWillLearn')}
										<span className='text-red-500'>*</span>
									</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											className='bg-secondary'
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='requirements'
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t('requirements')}
										<span className='text-red-500'>*</span>
									</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											className='bg-secondary'
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className='grid grid-cols-3 gap-4'>
						<FormField
							control={form.control}
							name='level'
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t('level')}<span className='text-red-500'>*</span>
									</FormLabel>
									<FormControl>
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}
											disabled={isLoading}
										>
											<SelectTrigger className='w-full bg-secondary'>
												<SelectValue placeholder={t('filter')} />
											</SelectTrigger>
											<SelectContent>
												{courseLevels.map(item => (
													<SelectItem key={item} value={item}>
														{t(levelKeys[item] ?? item)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<CourseCategoryField
							control={form.control}
							categoryName='category'
							customName='categoryCustom'
							disabled={isLoading}
						/>
						<FormField
							control={form.control}
							name='language'
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t('language')}<span className='text-red-500'>*</span>
									</FormLabel>
									<FormControl>
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}
											disabled={isLoading}
										>
											<SelectTrigger className='w-full bg-secondary'>
												<SelectValue placeholder={t('filter')} />
											</SelectTrigger>
											<SelectContent>
												{courseLanguage.map(item => (
													<SelectItem key={item} value={item}>
														{t(langKeys[item] ?? item)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
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
											type='number'
											disabled={isLoading}
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
											type='number'
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormItem>
							<FormLabel>
								{t('previewImage')}<span className='text-red-500'>*</span>
							</FormLabel>
							<Input
								className='bg-secondary'
								type='file'
								accept='image/*'
								disabled={isLoading || isImageUploading}
								onChange={onUpload}
							/>
						</FormItem>
					</div>

					<div className='flex justify-end gap-4'>
						<Button
							type='button'
							variant={'destructive'}
							onClick={() => form.reset()}
							disabled={isLoading}
						>
							{t('clear')}
						</Button>
						<Button type='submit' disabled={isLoading || isImageUploading}>
							{isImageUploading ? t('uploadingImage') : t('submit')}
						</Button>
						{previewImage && (
							<Button
								type='button'
								variant={'outline'}
								onClick={() => setOpen(true)}
							>
								<span>{t('previewImage')}</span>
								<ImageDown className='ml-2 size-4' />
							</Button>
						)}
					</div>
				</form>
			</Form>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<div className='relative h-72'>
						<Image
							src={previewImage}
							alt='preview-image'
							fill
							className='object-cover'
						/>
					</div>
					<Button
						className='w-fit'
						variant={'destructive'}
						onClick={() => {
							setPreviewImage('')
							setIsImageUploading(false)
							setOpen(false)
						}}
					>
						{t('remove')}
					</Button>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default CourseFieldsForm

const defaultVal = {
	title: '',
	description: '',
	learning: '',
	requirements: '',
	level: '',
	category: '',
	categoryCustom: '',
	language: '',
	oldPrice: '',
	currentPrice: '',
}
