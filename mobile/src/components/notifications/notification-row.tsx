import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import type { NotificationDTO } from '@/api/notifications'
import {
	formatNotificationDate,
	formatNotificationMessage,
	formatNotificationTimeAgo,
	notificationIconName,
} from '@/lib/format-notification'

type Props = {
	item: NotificationDTO
	locale: string
	isLast?: boolean
	onDelete: () => void
}

export function NotificationRow({ item, locale, isLast, onDelete }: Props) {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const text = formatNotificationMessage(item.message, t)
	const icon = notificationIconName(item.message)
	const timeAgo = formatNotificationTimeAgo(item.createdAt, locale)
	const dateLabel = formatNotificationDate(item.createdAt, locale)

	return (
		<View
			style={[
				styles.row,
				!isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.progressTrack },
			]}>
			<View style={[styles.iconWrap, { backgroundColor: theme.notificationCardBg }]}>
				<Ionicons name={icon} size={21} color={theme.accent} />
			</View>
			<View style={styles.body}>
				<AppText variant="bodyStrong" style={{ color: theme.heading, lineHeight: 22 }}>
					{text}
				</AppText>
				<View style={styles.meta}>
					<AppText variant="small" style={{ color: theme.accent, fontWeight: '600' }}>
						{timeAgo}
					</AppText>
					<AppText variant="small" style={{ color: theme.textMuted }}>
						{dateLabel}
					</AppText>
				</View>
			</View>
			<Pressable
				onPress={onDelete}
				hitSlop={10}
				style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
				accessibilityRole="button"
				accessibilityLabel={t('notifications.delete')}>
				<Ionicons name="trash-outline" size={20} color={theme.danger} />
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.md,
		gap: spacing.md,
	},
	iconWrap: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	body: { flex: 1, gap: spacing.sm },
	meta: { gap: 2 },
	delete: {
		width: 36,
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 2,
	},
	pressed: { opacity: 0.7 },
})
