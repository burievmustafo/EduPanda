import { IUser } from '@/app.types'
import Link from 'next/link'
import CustomImage from '../shared/custom-image'
import { Avatar, AvatarFallback } from '../ui/avatar'

interface Props {
	instructor: IUser
}

function getInitials(name?: string) {
	if (!name) return '?'
	const parts = name.trim().split(/\s+/)
	if (parts.length >= 2) {
		return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
	}
	return (parts[0]?.[0] ?? '?').toUpperCase()
}

function InstructorCard({ instructor }: Props) {
	const picture = instructor.picture?.trim()

	return (
		<Link href={`/instructors/${instructor.clerkId}`}>
			<div className='flex flex-col space-y-1'>
				<div className='relative h-72 w-full overflow-hidden rounded-md bg-muted'>
					{picture ? (
						<CustomImage
							src={picture}
							alt={instructor.fullName}
							className='rounded-md'
						/>
					) : (
						<div className='flex size-full items-center justify-center'>
							<Avatar className='size-32'>
								<AvatarFallback className='bg-primary text-4xl font-bold text-primary-foreground'>
									{getInitials(instructor.fullName)}
								</AvatarFallback>
							</Avatar>
						</div>
					)}
				</div>
				<h1 className='font-space-grotesk text-2xl font-bold'>
					{instructor.fullName}
				</h1>
				<div className='font-medium text-muted-foreground'>
					{instructor.job}
				</div>
			</div>
		</Link>
	)
}

export default InstructorCard
