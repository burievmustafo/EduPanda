import { getInstructors } from '@/actions/user.action'
import Header from '@/components/shared/header'
import { translation } from '@/i18n/server'
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import Item from './_components/item'

async function Page({ params }: { params: { lng: string } }) {
	const { t } = await translation(params.lng)
	const instructors = await getInstructors()

	return (
		<>
			<Header
				title={t('instructors')}
				description={t('instructorsPageDesc')}
			/>

			<Table className='mt-4 bg-background'>
				<TableHeader>
					<TableRow>
						<TableHead className='w-[100px]'>{t('tableRole')}</TableHead>
						<TableHead className='w-[100px]'>{t('tableEmail')}</TableHead>
						<TableHead className='w-[100px]'>{t('tablePortfolio')}</TableHead>
						<TableHead className='w-[100px]'>{t('tableYouTube')}</TableHead>
						<TableHead className='w-[100px]'>{t('tableGithub')}</TableHead>
						<TableHead>{t('tableJob')}</TableHead>
						<TableHead className='text-right'>{t('tableActions')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{instructors.map(instructor => (
						<Item
							key={instructor._id}
							item={JSON.parse(JSON.stringify(instructor))}
						/>
					))}
				</TableBody>
			</Table>
		</>
	)
}

export default Page
