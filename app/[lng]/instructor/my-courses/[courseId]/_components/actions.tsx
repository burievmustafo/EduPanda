'use client'

import { exportCoursePackage } from '@/actions/course-package.action'
import { deleteCourse, updateCourse } from '@/actions/course.action'
import { ICourse } from '@/app.types'
import ConfirmDeleteModal from '@/components/modals/confirm-delete.modal'
import { Button } from '@/components/ui/button'
import useTranslate from '@/hooks/use-translate'
import { useUser } from '@clerk/nextjs'
import { Download, Loader2, Users } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

function Actions(course: ICourse) {
	const pathname = usePathname()
	const router = useRouter()
	const { lng } = useParams()
	const { user } = useUser()
	const t = useTranslate()
	const [isExporting, setIsExporting] = useState(false)

	const onUpdateStatus = () => {
		let promise

		if (course.published) {
			promise = updateCourse(course._id, { published: false }, pathname)
		} else {
			promise = updateCourse(course._id, { published: true }, pathname)
		}

		toast.promise(promise, {
			loading: t('loading'),
			success: t('successfullyUpdated'),
			error: t('error'),
		})
	}

	const onDelete = () => {
		const promise = deleteCourse(course._id, `/${lng}/instructor/my-courses`).then(
			() => router.push(`/${lng}/instructor/my-courses`)
		)

		toast.promise(promise, {
			loading: t('loading'),
			success: t('successfullyDeleted'),
			error: t('error'),
		})
	}

	const onExport = async () => {
		if (!user?.id) return
		setIsExporting(true)

		try {
			const coursePackage = await exportCoursePackage(course._id, user.id)
			const blob = new Blob([JSON.stringify(coursePackage, null, 2)], {
				type: 'application/json',
			})
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			const safeTitle = (coursePackage.course.title || 'course')
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '')

			link.href = url
			link.download = `${safeTitle || 'course'}.edupanda-course.json`
			document.body.appendChild(link)
			link.click()
			link.remove()
			URL.revokeObjectURL(url)
			toast.success(t('courseExported'))
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t('error'))
		} finally {
			setIsExporting(false)
		}
	}

	return (
		<div className='flex gap-2 self-end'>
			<Link href={`/${lng}/instructor/my-courses/${course._id}/students`}>
				<Button variant={'outline'}>
					<Users className='size-4' />
					<span className='ml-2 max-sm:hidden'>{t('students')}</span>
				</Button>
			</Link>
			<Button variant={'outline'} onClick={onExport} disabled={isExporting}>
				{isExporting ? (
					<Loader2 className='size-4 animate-spin' />
				) : (
					<Download className='size-4' />
				)}
				<span className='ml-2 max-sm:hidden'>{t('exportCourse')}</span>
			</Button>
			<Button onClick={onUpdateStatus}>
				{course.published ? t('draft') : t('publish')}
			</Button>
			<ConfirmDeleteModal onConfirm={onDelete}>
				<Button variant={'destructive'}>{t('delete')}</Button>
			</ConfirmDeleteModal>
		</div>
	)
}

export default Actions
