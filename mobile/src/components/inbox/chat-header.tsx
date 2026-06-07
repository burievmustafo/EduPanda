import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import type { InboxThread } from '@/lib/figma-inbox-threads'

type Props = {
	thread: InboxThread
	onBack: () => void
	backLabel: string
}

function initials(name: string): string {
	const parts = name.trim().split(/\s+/)
	if (parts.length >= 2) {
		return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
	}
	return (name[0] ?? '?').toUpperCase()
}

export function ChatHeader({ thread, onBack, backLabel }: Props) {
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()

	return (
		<View
			style={[
				styles.wrap,
				{
					paddingTop: insets.top + spacing.xs,
					borderBottomColor: theme.progressTrack,
					backgroundColor: theme.background,
				},
			]}>
			<Pressable
				onPress={onBack}
				hitSlop={12}
				style={styles.back}
				accessibilityRole="button"
				accessibilityLabel={backLabel}>
				<Ionicons name="chevron-back" size={24} color={theme.heading} />
			</Pressable>
			<View style={[styles.avatar, { backgroundColor: thread.avatarColor }]}>
				<AppText variant="captionStrong" style={[styles.avatarText, { color: theme.buttonText }]}>
					{initials(thread.name)}
				</AppText>
			</View>
			<AppText variant="title" style={[styles.title, { color: theme.heading }]} numberOfLines={1}>
				{thread.name}
			</AppText>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: spacing.md,
		paddingBottom: spacing.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	back: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatar: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.sm,
	},
	avatarText: {
		fontSize: 12,
		fontWeight: '700',
	},
	title: {
		flex: 1,
		fontSize: 16,
		fontWeight: '700',
		letterSpacing: 0.4,
	},
})
