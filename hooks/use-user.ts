import { getUser } from '@/actions/user.action'
import { IUser } from '@/app.types'
import { useAuth, useUser as useClerkUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRefresh } from './use-refresh'

const useUser = () => {
	const [user, setUser] = useState<IUser | null>(null)

	const { onOpen } = useRefresh()
	const { userId } = useAuth()
	const { user: clerkUser } = useClerkUser()

	useEffect(() => {
		const getData = async () => {
			try {
				// Clerk ma'lumotlarini ham yuboramiz - user avtomatik yaratilishi uchun
				const clerkUserData = clerkUser ? {
					fullName: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
					email: clerkUser.primaryEmailAddress?.emailAddress || '',
					picture: clerkUser.imageUrl || '',
				} : undefined

				const data = await getUser(userId!, clerkUserData)
				data === 'notFound' && onOpen()
				setUser(data)
			} catch (error) {
				setUser(null)
			}
		}

		userId && clerkUser && getData()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, clerkUser])

	return { user }
}

export default useUser
