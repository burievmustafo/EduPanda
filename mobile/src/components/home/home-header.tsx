import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

type Props = {
	displayName: string
	loading?: boolean
	unreadCount?: number
	onNotificationsPress?: () => void
}

export function HomeHeader({
	displayName,
	loading,
	unreadCount = 0,
	onNotificationsPress,
}: Props) {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()

	const onBell = () => {
		onNotificationsPress?.()
	}

	const welcomeText = displayName
		? t('home.welcomeName', { name: displayName })
		: t('home.welcome')

	return (
		<View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
			<View style={styles.row}>
				{loading ? (
					<ActivityIndicator color={theme.heading} style={styles.loader} />
				) : (
					<AppText variant="title" style={[styles.greeting, { color: theme.heading }]} numberOfLines={1}>
						{welcomeText}
					</AppText>
				)}
				<Pressable
					onPress={onBell}
					hitSlop={12}
					style={styles.bell}
					accessibilityRole="button"
					accessibilityLabel={t('home.notifications')}>
					<Ionicons name="notifications-outline" size={22} color={theme.heading} />
					{unreadCount > 0 ? (
						<View style={[styles.badge, { backgroundColor: theme.danger }]}>
							<AppText variant="small" style={styles.badgeText}>
								{unreadCount > 99 ? '99+' : String(unreadCount)}
							</AppText>
						</View>
					) : null}
				</Pressable>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.sm,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		minHeight: 32,
	},
	greeting: {
		flex: 1,
		fontSize: 20,
		fontWeight: '700',
		letterSpacing: 1,
		marginRight: spacing.md,
	},
	loader: { flex: 1, alignSelf: 'flex-start' },
	bell: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	badge: {
		position: 'absolute',
		top: 4,
		right: 2,
		minWidth: 18,
		height: 18,
		borderRadius: 9,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 4,
	},
	badgeText: {
		color: '#fff',
		fontSize: 10,
		fontWeight: '700',
		lineHeight: 12,
	},
})
