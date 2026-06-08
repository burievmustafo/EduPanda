'use client'

import { sendNotification } from '@/actions/notification.action'
import { updateUser } from '@/actions/user.action'
import { IUser } from '@/app.types'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import useTranslate from '@/hooks/use-translate'
import { MoreHorizontal } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
	item: IUser
}
function Item({ item }: Props) {
	const pathname = usePathname()
	const t = useTranslate()
	const isPendingInstructor =
		item.approvedInstructor && item.role !== 'instructor' && !item.isAdmin

	const onRoleChange = async () => {
		const isApproving = item.role !== 'instructor'
		const isConfirmed = confirm(
			isApproving ? `${t('approve')}?` : `${t('disapprove')}?`
		)

		if (isConfirmed) {
			const upd = updateUser({
				clerkId: item.clerkId,
				updatedData: { role: item.role === 'instructor' ? 'student' : 'instructor' },
				path: pathname,
			})

			const not = sendNotification(
				item.clerkId,
				`messageRoleChanged ${item.role === 'instructor' ? 'student' : 'instructor'}`
			)

			const promise = Promise.all([upd, not])

			toast.promise(promise, {
				loading: t('loading'),
				success: t('successfully'),
				error: t('error'),
			})
		}
	}

	const onAdmin = async () => {
		const isConfirmed = confirm(
			item.isAdmin ? `${t('removeAdmin')}?` : `${t('makeAdmin')}?`
		)

		if (isConfirmed) {
			const upd = updateUser({
				clerkId: item.clerkId,
				updatedData: item.isAdmin
					? { isAdmin: false, role: 'student' }
					: { isAdmin: true, role: 'admin', approvedInstructor: false },
				path: pathname,
			})

			const not = sendNotification(
				item.clerkId,
				item.isAdmin ? 'messageYoureNotAdmin' : 'messageYoureAdmin'
			)

			const promise = Promise.all([upd, not])

			toast.promise(promise, {
				loading: t('loading'),
				success: t('successfully'),
				error: t('error'),
			})
		}
	}

	const onDelete = async () => {
		const isConfirmed = confirm(`${t('delete')}?`)

		if (isConfirmed) {
			const upd = updateUser({
				clerkId: item.clerkId,
				updatedData: { approvedInstructor: false, role: 'student' },
				path: pathname,
			})

			const not = sendNotification(item.clerkId, 'messageDeleteInstructor')

			const promise = Promise.all([upd, not])

			toast.promise(promise, {
				loading: t('loading'),
				success: t('successfully'),
				error: t('error'),
			})
		}
	}

	return (
		<TableRow>
			<TableCell className='text-xs capitalize'>
				{item.isAdmin ? t('admin') : isPendingInstructor ? t('pending') : item.role}
			</TableCell>
			<TableCell className='text-xs'>{item.email}</TableCell>
			<TableCell
				className='cursor-pointer text-xs text-primary hover:underline'
				onClick={() => item.website && window.open(item.website, '_blank')}
			>
				{item.website?.replace(/^https?:\/\//, '') || '-'}
			</TableCell>
			<TableCell
				className='cursor-pointer text-xs text-primary hover:underline'
				onClick={() => item.youtube && window.open(item.youtube, '_blank')}
			>
				{item.youtube?.replace(/^https?:\/\//, '') || '-'}
			</TableCell>
			<TableCell
				className='cursor-pointer text-xs text-primary hover:underline'
				onClick={() => item.github && window.open(item.github, '_blank')}
			>
				{item.github?.replace(/^https?:\/\//, '') || '-'}
			</TableCell>
			<TableCell className='text-xs'>{item.job || '-'}</TableCell>
			<TableCell className='text-right'>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size={'icon'} variant={'ghost'}>
							<MoreHorizontal className='size-6' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>{t('manageLabel')}</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={onRoleChange}>
							{item.role === 'instructor' ? t('disapprove') : t('approve')}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onAdmin}>
							{item.isAdmin ? t('removeAdmin') : t('makeAdmin')}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onDelete}>{t('delete')}</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	)
}

export default Item
