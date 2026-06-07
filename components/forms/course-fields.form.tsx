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
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { v4 as uuidv4 } from 'uuid'

function CourseFieldsForm() {
	const [isLoading, setIsLoading] = useState(false)
	const [isImageUploading, setIsImageUploading] = useState(false)
	const [previewImage, setPreviewImage] = useState('')
	const [open, setOpen] = useState(false)

	const router = useRouter()
	const { user } = useUser()

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
			return toast.error('Please choose an image file')
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
					toast.warning('Firebase upload failed. The local image preview will be used.')
					return result
				})
				.finally(() => setIsImageUploading(false))

			toast.promise(promise, {
				loading: 'Uploading...',
				success: 'Successfully uploaded!',
				error: 'Something went wrong!',
			})
		}

		reader.onerror = () => {
			setIsImageUploading(false)
			toast.error('Could not read this image. Please choose another file.')
		}
	}

	function onSubmit(values: z.infer<typeof courseSchema>) {
		if (isImageUploading) {
			return toast.error('Please wait until image upload finishes')
		}
		if (!previewImage) {
			return toast.error('Please upload a preview image')
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
				router.push('/en/instructor/my-courses')
			})
			.finally(() => setIsLoading(false))

		toast.promise(promise, {
			loading: 'Loading...',
			success: 'Successfully created!',
			error: 'Something went wrong!',
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
									Course title<span className='text-red-500'>*</span>
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
									Short description<span className='text-red-500'>*</span>
								</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										className='h-44 bg-secondary'
										placeholder='Description'
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
										What will students learn in your course?
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
										Requirements
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
										Level<span className='text-red-500'>*</span>
									</FormLabel>
									<FormControl>
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}
											disabled={isLoading}
										>
											<SelectTrigger className='w-full bg-secondary'>
												<SelectValue placeholder={'Select'} />
											</SelectTrigger>
											<SelectContent>
												{courseLevels.map(item => (
													<SelectItem key={item} value={item}>
														{item}
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
										Language<span className='text-red-500'>*</span>
									</FormLabel>
									<FormControl>
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}
											disabled={isLoading}
										>
											<SelectTrigger className='w-full bg-secondary'>
												<SelectValue placeholder={'Select'} />
											</SelectTrigger>
											<SelectContent>
												{courseLanguage.map(item => (
													<SelectItem key={item} value={item}>
														{item}
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
										Old price<span className='text-red-500'>*</span>
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
										Current Price<span className='text-red-500'>*</span>
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
								Preview image<span className='text-red-500'>*</span>
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
							Clear
						</Button>
						<Button type='submit' disabled={isLoading || isImageUploading}>
							{isImageUploading ? 'Uploading image...' : 'Submit'}
						</Button>
						{previewImage && (
							<Button
								type='button'
								variant={'outline'}
								onClick={() => setOpen(true)}
							>
								<span>Image</span>
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
						Remove
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
