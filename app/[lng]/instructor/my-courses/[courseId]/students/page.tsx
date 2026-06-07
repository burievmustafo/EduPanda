import { getCourseById } from '@/actions/course.action'
import { getCourseStudents } from '@/actions/enrollment.action'
import Header from '@/components/shared/header'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChevronLeftCircle } from 'lucide-react'
import Link from 'next/link'
import StudentsManager from './_components/students-manager'

async function Page({ params }: { params: { courseId: string } }) {
	const courseJSON = await getCourseById(params.courseId)
	const course = JSON.parse(JSON.stringify(courseJSON))
	const students = await getCourseStudents(params.courseId)

	return (
		<>
			<div className='flex items-center gap-2'>
				<Link href={`/en/instructor/my-courses/${params.courseId}`}>
					<Button size={'icon'} variant={'outline'}>
						<ChevronLeftCircle />
					</Button>
				</Link>
				<Header
					title={`${course.title} — Students`}
					description='See who is enrolled and how they are doing.'
				/>
			</div>
			<Separator className='my-3 bg-muted-foreground' />

			<StudentsManager courseId={params.courseId} students={students} />
		</>
	)
}

export default Page
