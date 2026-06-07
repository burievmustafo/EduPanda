import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import type { InboxThread } from '@/lib/figma-inbox-threads'

type Props = {
	thread: InboxThread
	onPress: () => void
}

function initials(name: string): string {
	const parts = name.trim().split(/\s+/)
	if (parts.length >= 2) {
		return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
	}
	return (name[0] ?? '?').toUpperCase()
}

export function InboxThreadRow({ thread, onPress }: Props) {
	const theme = useFigmaTheme()
	const hasUnread = (thread.unreadCount ?? 0) > 0

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [styles.row, pressed && styles.pressed]}
			accessibilityRole="button">
			<View style={[styles.avatar, { backgroundColor: thread.avatarColor }]}>
				<AppText variant="captionStrong" style={[styles.avatarText, { color: theme.buttonText }]}>
					{initials(thread.name)}
				</AppText>
			</View>

			<View style={styles.body}>
				<View style={styles.topLine}>
					<AppText
						variant="bodyStrong"
						style={[styles.name, { color: theme.heading }, hasUnread && styles.nameUnread]}
						numberOfLines={1}>
						{thread.name}
					</AppText>
					<AppText variant="small" style={[styles.time, { color: theme.accent }]}>
						{thread.timeAgo}
					</AppText>
				</View>
				<View style={styles.bottomLine}>
					<AppText variant="small" style={[styles.preview, { color: theme.textMuted }]} numberOfLines={1}>
						{thread.preview}
					</AppText>
					{hasUnread ? (
						<View style={[styles.badge, { backgroundColor: theme.tabActiveBg }]}>
							<AppText variant="small" style={[styles.badgeText, { color: theme.buttonText }]}>
								{thread.unreadCount}
							</AppText>
						</View>
					) : null}
				</View>
			</View>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		minHeight: 72,
	},
	pressed: { opacity: 0.92 },
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.md,
	},
	avatarText: {
		fontSize: 14,
		fontWeight: '700',
	},
	body: {
		flex: 1,
		gap: 4,
	},
	topLine: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
	},
	name: {
		flex: 1,
		fontSize: 14,
		fontWeight: '600',
		letterSpacing: 0.28,
	},
	nameUnread: {
		fontWeight: '700',
	},
	time: {
		fontSize: 10,
		letterSpacing: 0.2,
	},
	bottomLine: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
	},
	preview: {
		flex: 1,
		fontSize: 11,
		letterSpacing: 0.22,
	},
	badge: {
		minWidth: 18,
		height: 18,
		borderRadius: 9,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 4,
	},
	badgeText: {
		fontSize: 9,
		fontWeight: '700',
	},
})
