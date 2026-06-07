import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { FigmaBottomTabBar } from '@/components/navigation/figma-bottom-tab-bar'

export default function TabsLayout() {
	const { t } = useTranslation()

	return (
		<Tabs
			tabBar={(props) => <FigmaBottomTabBar {...props} />}
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
			}}>
			<Tabs.Screen
				name="home"
				options={{
					title: t('tabs.home'),
					tabBarAccessibilityLabel: t('tabs.home'),
				}}
			/>
			<Tabs.Screen
				name="learning"
				options={{
					title: t('tabs.myCourses'),
					tabBarAccessibilityLabel: t('tabs.myCourses'),
				}}
			/>
			<Tabs.Screen
				name="inbox"
				options={{
					title: t('tabs.inbox'),
					tabBarAccessibilityLabel: t('tabs.inbox'),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: t('tabs.profile'),
					tabBarAccessibilityLabel: t('tabs.profile'),
				}}
			/>
		</Tabs>
	)
}
