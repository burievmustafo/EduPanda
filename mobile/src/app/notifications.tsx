import { Stack, useFocusEffect } from 'expo-router'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Alert,
	RefreshControl,
	StyleSheet,
	View,
} from 'react-native'

import { clearNotifications, deleteNotification } from '@/api/notifications'
import { NotificationRow } from '@/components/notifications/notification-row'
import {
	ProfileActionButton,
	ProfileEmptyBlock,
	ProfileInfoCard,
	ProfileSubpage,
} from '@/components/profile/profile-subpage'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { useNotifications } from '@/hooks/queries'
import { useLocale } from '@/hooks/use-locale'
import { queryClient } from '@/lib/query-client'

function invalidateNotificationQueries() {
	queryClient.invalidateQueries({ queryKey: ['notifications'] })
	queryClient.invalidateQueries({ queryKey: ['notificationCount'] })
}

export default function NotificationsScreen() {
	const { t } = useTranslation()
	const locale = useLocale()
	const theme = useFigmaTheme()

	const { data: items = [], isLoading, isRefetching, refetch, error } = useNotifications()

	useFocusEffect(
		useCallback(() => {
			void refetch()
		}, [refetch]),
	)

	useEffect(() => {
		if (!isLoading && !error) {
			queryClient.setQueryData(['notificationCount'], 0)
		}
	}, [isLoading, error, items])

	const onClearAll = () => {
		Alert.alert(t('notifications.clearAll'), t('notifications.clearConfirm'), [
			{ text: t('common.back'), style: 'cancel' },
			{
				text: t('notifications.clearAll'),
				style: 'destructive',
				onPress: async () => {
					try {
						await clearNotifications()
						invalidateNotificationQueries()
					} catch {
						Alert.alert(t('common.appName'), t('common.retry'))
					}
				},
			},
		])
	}

	const onDelete = async (id: string) => {
		try {
			await deleteNotification(id)
			invalidateNotificationQueries()
		} catch {
			Alert.alert(t('common.appName'), t('common.retry'))
		}
	}

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<ProfileSubpage
				title={t('myCourses.notificationsTitle')}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching}
						onRefresh={() => void refetch()}
						tintColor={theme.accent}
						colors={[theme.accent]}
					/>
				}>
				<ProfileInfoCard>
					<AppText variant="body" style={{ color: theme.textMuted, lineHeight: 22 }}>
						{t('notifications.description')}
					</AppText>
				</ProfileInfoCard>

				{isLoading ? (
					<View style={styles.loading}>
						<ActivityIndicator size="large" color={theme.accent} />
					</View>
				) : error ? (
					<>
						<ProfileEmptyBlock
							icon="cloud-offline-outline"
							title={t('common.retry')}
							description={t('notifications.loadError')}
						/>
						<ProfileActionButton title={t('common.retry')} onPress={() => void refetch()} />
					</>
				) : items.length === 0 ? (
					<ProfileEmptyBlock
						icon="notifications-off-outline"
						title={t('notifications.emptyTitle')}
						description={t('notifications.emptyDescription')}
					/>
				) : (
					<>
						<AppText variant="captionStrong" style={[styles.sectionLabel, { color: theme.textMuted }]}>
							{t('notifications.recent', { count: items.length })}
						</AppText>
						<View
							style={[
								styles.group,
								{
									backgroundColor: theme.surface,
									borderColor: theme.notificationCardBg,
									shadowColor: theme.cardShadow,
								},
							]}>
							{items.map((item, index) => (
								<NotificationRow
									key={item.id}
									item={item}
									locale={locale}
									isLast={index === items.length - 1}
									onDelete={() => void onDelete(item.id)}
								/>
							))}
						</View>
						<ProfileActionButton
							title={t('notifications.clearAll')}
							onPress={onClearAll}
						/>
					</>
				)}
			</ProfileSubpage>
		</>
	)
}

const styles = StyleSheet.create({
	loading: {
		paddingVertical: spacing['5xl'],
		alignItems: 'center',
	},
	sectionLabel: {
		marginBottom: spacing.sm,
		letterSpacing: 0.8,
	},
	group: {
		borderRadius: 12,
		borderWidth: 1,
		overflow: 'hidden',
		marginBottom: spacing.md,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
})
