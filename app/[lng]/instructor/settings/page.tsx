import { Separator } from '@/components/ui/separator'
import Header from '../../../../components/shared/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Profile from './_components/profile'
import Account from './_components/account'
import { auth } from '@clerk/nextjs'
import { getUserById } from '@/actions/user.action'
import { translation } from '@/i18n/server'

async function Page({ params }: { params: { lng: string } }) {
	const { userId } = auth()
	const { t } = await translation(params.lng)
	const userJSON = await getUserById(userId!)

	const user = JSON.parse(JSON.stringify(userJSON))

	return (
		<>
			<Header title={t('settings')} description={t('settingsDescription')} />
			<Separator className='my-3 bg-muted-foreground' />
			<Tabs defaultValue='profile'>
				<TabsList>
					<TabsTrigger value='profile'>{t('profile')}</TabsTrigger>
					<TabsTrigger value='account'>{t('account')}</TabsTrigger>
				</TabsList>
				<TabsContent value='profile'>
					<Profile />
				</TabsContent>
				<TabsContent value='account'>
					<Account {...user} />
				</TabsContent>
			</Tabs>
		</>
	)
}

export default Page
