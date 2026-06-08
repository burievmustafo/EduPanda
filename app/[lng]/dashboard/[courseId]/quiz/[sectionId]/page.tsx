import { getSectionQuizForStudent } from '@/actions/quiz.action'
import { Button } from '@/components/ui/button'
import { ChevronLeftCircle } from 'lucide-react'
import Link from 'next/link'
import QuizRunner from './_components/quiz-runner'
import { translation } from '@/i18n/server'

interface Props {
	params: { courseId: string; sectionId: string; lng: string }
}

async function Page({ params: { courseId, sectionId, lng } }: Props) {
	const { t } = await translation(lng)
	const quiz = await getSectionQuizForStudent(sectionId)

	return (
		<div className='mx-auto w-full max-w-3xl'>
			<div className='mb-4 flex items-center gap-2'>
				<Link href={`/${lng}/dashboard/${courseId}`}>
					<Button size={'icon'} variant={'outline'}>
						<ChevronLeftCircle />
					</Button>
				</Link>
				<h1 className='font-space-grotesk text-2xl font-bold'>{t('sectionQuiz')}</h1>
			</div>

			{!quiz || quiz.questions.length === 0 ? (
				<div className='rounded-md bg-secondary p-6 text-sm text-muted-foreground'>
					{t('sectionQuizEmpty')}
				</div>
			) : (
				<QuizRunner quiz={quiz} courseId={courseId} lng={lng} />
			)}
		</div>
	)
}

export default Page
