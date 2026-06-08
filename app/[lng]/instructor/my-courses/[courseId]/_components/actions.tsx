'use client'

import { deleteCourse, updateCourse } from '@/actions/course.action'
import { ICourse } from '@/app.types'
import ConfirmDeleteModal from '@/components/modals/confirm-delete.modal'
import { Button } from '@/components/ui/button'
import useTranslate from '@/hooks/use-translate'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'

function Actions(course: ICourse) {
	const pathname = usePathname()
	const router = useRouter()
	const { lng } = useParams()
	const t = useTranslate()

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

	return (
		<div className='flex gap-2 self-end'>
			<Link href={`/${lng}/instructor/my-courses/${course._id}/students`}>
				<Button variant={'outline'}>
					<Users className='size-4' />
					<span className='ml-2 max-sm:hidden'>{t('students')}</span>
				</Button>
			</Link>
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
