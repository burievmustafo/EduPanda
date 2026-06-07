import Navbar from '@/components/shared/navbar'
import Sidebar from '@/components/shared/sidebar'
import { ChildProps } from '@/types'
import { getRole } from '@/actions/user.action'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

async function Layout({
	children,
	params,
}: ChildProps & { params: { lng: string } }) {
	const { userId } = auth()
	if (!userId) redirect(`/${params.lng}/sign-in`)

	const user = await getRole(userId)
	if (!user || (!user.isAdmin && user.role !== 'instructor')) {
		redirect(`/${params.lng}`)
	}

	return (
		<>
			<Navbar />
			<Sidebar page='instructor' />
			<main className='w-full p-4 pl-[320px] pt-[12vh]'>
				<div className='size-full rounded-md bg-secondary px-4 pb-4'>
					{children}
				</div>
			</main>
		</>
	)
}

export default Layout
