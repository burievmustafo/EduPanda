import { Separator } from '@/components/ui/separator'
import Header from '../../../../components/shared/header'
import CourseFieldsForm from '@/components/forms/course-fields.form'
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
				<h3 className='font-space-grotesk text-lg font-medium'>
					{t('basicInformation')}
				</h3>
				<Separator className='my-3' />
				<CourseFieldsForm />
			</div>
		</>
	)
}

export default Page
