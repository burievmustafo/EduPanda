import Header from '../../../../components/shared/header'
import CreateCourseSwitcher from './_components/create-course-switcher'
import { translation } from '@/i18n/server'

async function Page({ params }: { params: { lng: string } }) {
	const { t } = await translation(params.lng)

	return (
		<>
			<Header
				title={t('createCourse')}
				description={t('createCourseDesc')}
			/>

			<div className='mt-4 rounded-md bg-background p-4'>
				<CreateCourseSwitcher />
			</div>
		</>
	)
}

export default Page
