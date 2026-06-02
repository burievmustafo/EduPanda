'use client'

import { SignOutButton, useUser as useClerkUser } from '@clerk/nextjs'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '../ui/dropdown-menu'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Link from 'next/link'
import useTranslate from '@/hooks/use-translate'
import useUser from '@/hooks/use-user'

function UserBox() {
	const { user } = useUser()
	const { user: clerkUser } = useClerkUser()
	const t = useTranslate()
	
	// Clerk'dan rasmni olish (har doim yangi)
	const profileImage = clerkUser?.imageUrl || user?.picture

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className='size-10 cursor-pointer'>
					<AvatarImage src={profileImage} className='object-cover' />
					<AvatarFallback className='bg-primary text-primary-foreground'>
						{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className='w-80'
				align='start'
				alignOffset={11}
				forceMount
			>
				<div className='flex items-center gap-x-3 p-2'>
					<Avatar className='size-12'>
						<AvatarImage src={profileImage} className='object-cover' />
						<AvatarFallback className='bg-primary text-primary-foreground'>
							{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
						</AvatarFallback>
					</Avatar>

					<div className='flex flex-col'>
						<p className='font-semibold text-sm'>
							{user?.fullName || clerkUser?.fullName || 'User'}
						</p>
						<p className='text-xs text-muted-foreground'>
							{user?.email || clerkUser?.primaryEmailAddress?.emailAddress}
						</p>
					</div>
				</div>

				<DropdownMenuSeparator />
				{user?.isAdmin && (
					<Link href={'/admin'}>
						<DropdownMenuItem className='w-full cursor-pointer text-muted-foreground'>
							{t('admin')}
						</DropdownMenuItem>
					</Link>
				)}
				{user?.role === 'instructor' && (
					<Link href={'/instructor'}>
						<DropdownMenuItem className='w-full cursor-pointer text-muted-foreground'>
							{t('instructor')}
						</DropdownMenuItem>
					</Link>
				)}
				<Link href={'/profile'}>
					<DropdownMenuItem className='w-full cursor-pointer text-muted-foreground'>
						{t('manageAccount')}
					</DropdownMenuItem>
				</Link>
				<DropdownMenuItem
					asChild
					className='w-full cursor-pointer text-muted-foreground'
				>
					<SignOutButton>{t('logout')}</SignOutButton>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default UserBox
