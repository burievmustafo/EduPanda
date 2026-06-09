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
import { getCourseById } from '@/actions/course.action'
import SectionQuiz from './_components/section-quiz'
import { translation } from '@/i18n/server'

interface Params {
	params: { sectionId: string; courseId: string; lng: string }
}
async function Page({ params }: Params) {
	const { t } = await translation(params.lng)
	const sectionJSON = await getSectionById(params.sectionId)
	const lessonsJSON = await getLessons(params.sectionId)
	const quizData = await getSectionQuiz(params.sectionId)
	const courseJSON = await getCourseById(params.courseId)

	const section = JSON.parse(JSON.stringify(sectionJSON))
	const lessons = JSON.parse(JSON.stringify(lessonsJSON))
	const course = JSON.parse(JSON.stringify(courseJSON))

	// AI prompt uchun dars konteksti: nom + HTML'siz qisqa parcha
	const lessonsContext = (lessons as any[]).map(l => ({
		title: l.title,
		excerpt:
			typeof l.content === 'string'
				? l.content
						.replace(/<[^>]+>/g, ' ')
						.replace(/\s+/g, ' ')
						.trim()
						.slice(0, 160)
				: undefined,
	}))

	return (
		<>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Link href={`/${params.lng}/instructor/my-courses/${params.courseId}`}>
						<Button size={'icon'} variant={'outline'}>
							<ChevronLeftCircle />
						</Button>
					</Link>
					<Header
						title={section.title}
						description={t('manageSectionDesc')}
					/>
				</div>
				<Action {...section} />
			</div>
			<Separator className='my-3 bg-muted-foreground' />

			<div className='grid grid-cols-2 gap-4'>
				<div className='flex flex-col space-y-2'>
					<div className='flex items-center gap-2'>
						<span className='font-space-grotesk text-3xl font-medium'>
							{t('lessons')}
						</span>{' '}
						<Settings2 />
					</div>
					<Lessons section={section} lessons={lessons} />
				</div>
				<div className='flex flex-col space-y-2'>
					<div className='flex items-center gap-2'>
						<span className='font-space-grotesk text-3xl font-medium'>
							{t('sectionField')}
						</span>{' '}
						<Settings />
					</div>
					<SectionField {...section} />
				</div>
			</div>

			<div className='mt-6 flex flex-col space-y-2'>
				<div className='flex items-center gap-2'>
					<span className='font-space-grotesk text-3xl font-medium'>
						{t('sectionQuiz')}
					</span>{' '}
					<ListChecks />
				</div>
				<SectionQuiz
					sectionId={params.sectionId}
					sectionTitle={section.title}
					courseTitle={course?.title}
					courseLevel={course?.level}
					courseLanguage={course?.language}
					lessons={lessonsContext}
					quiz={quizData.quiz}
					questions={quizData.questions}
				/>
			</div>
		</>
	)
}

export default Page
