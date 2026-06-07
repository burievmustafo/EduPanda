import { Separator } from '@/components/ui/separator'
import Header from '../../../../../../components/shared/header'
import { getSectionById } from '@/actions/section.action'
import { Button } from '@/components/ui/button'
import { ChevronLeftCircle, ListChecks, Settings, Settings2 } from 'lucide-react'
import Link from 'next/link'
import Action from './_components/action'
import SectionField from './_components/section-field'
import Lessons from './_components/lessons'
import { getLessons } from '@/actions/lesson.action'
import { getSectionQuiz } from '@/actions/quiz.action'
import SectionQuiz from './_components/section-quiz'

interface Params {
	params: { sectionId: string; courseId: string }
}
async function Page({ params }: Params) {
	const sectionJSON = await getSectionById(params.sectionId)
	const lessonsJSON = await getLessons(params.sectionId)
	const quizData = await getSectionQuiz(params.sectionId)

	const section = JSON.parse(JSON.stringify(sectionJSON))
	const lessons = JSON.parse(JSON.stringify(lessonsJSON))

	return (
		<>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Link href={`/en/instructor/my-courses/${params.courseId}`}>
						<Button size={'icon'} variant={'outline'}>
							<ChevronLeftCircle />
						</Button>
					</Link>
					<Header
						title={section.title}
						description='Manage your section and see how it is performing.'
					/>
				</div>
				<Action {...section} />
			</div>
			<Separator className='my-3 bg-muted-foreground' />

			<div className='grid grid-cols-2 gap-4'>
				<div className='flex flex-col space-y-2'>
					<div className='flex items-center gap-2'>
						<span className='font-space-grotesk text-3xl font-medium'>
							Lessons
						</span>{' '}
						<Settings2 />
					</div>
					<Lessons section={section} lessons={lessons} />
				</div>
				<div className='flex flex-col space-y-2'>
					<div className='flex items-center gap-2'>
						<span className='font-space-grotesk text-3xl font-medium'>
							Section field
						</span>{' '}
						<Settings />
					</div>
					<SectionField {...section} />
				</div>
			</div>

			<div className='mt-6 flex flex-col space-y-2'>
				<div className='flex items-center gap-2'>
					<span className='font-space-grotesk text-3xl font-medium'>
						Section Quiz
					</span>{' '}
					<ListChecks />
				</div>
				<SectionQuiz
					sectionId={params.sectionId}
					quiz={quizData.quiz}
					questions={quizData.questions}
				/>
			</div>
		</>
	)
}

export default Page
