import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import type { ReactElement, ReactNode } from 'react'
import {
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	View,
	type RefreshControlProps,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppText } from '@/components/ui/app-text'
import { figmaLight, useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

export function ProfileSubpage({
	title,
	children,
	headerRight,
	refreshControl,
}: {
	title: string
	children: ReactNode
	/** O‘ng tomondagi tugma (masalan “Clear”). */
	headerRight?: ReactNode
	refreshControl?: ReactElement<RefreshControlProps>
}) {
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()

	return (
		<View style={[styles.screen, { paddingTop: insets.top, backgroundColor: theme.background }]}>
			<View style={[styles.header, { borderBottomColor: theme.progressTrack }]}>
				<Pressable
					onPress={() => router.back()}
					hitSlop={12}
					style={styles.backButton}
					accessibilityRole="button">
					<Ionicons name="chevron-back" size={28} color={theme.heading} />
				</Pressable>
				<AppText variant="title" style={[styles.title, { color: theme.heading }]} numberOfLines={1}>
					{title}
				</AppText>
				{headerRight ? (
					<View style={styles.headerRight}>{headerRight}</View>
				) : (
					<View style={styles.headerSpacer} />
				)}
			</View>

			<ScrollView
				contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing['4xl'] }]}
				showsVerticalScrollIndicator={false}
				refreshControl={refreshControl}>
				{children}
			</ScrollView>
		</View>
	)
}

export function ProfileInfoCard({ children }: { children: ReactNode }) {
	const theme = useFigmaTheme()
	return (
		<View
			style={[
				styles.card,
				{
					backgroundColor: theme.surface,
					borderColor: theme.notificationCardBg,
					shadowColor: theme.cardShadow,
				},
			]}>
			{children}
		</View>
	)
}

export function ProfileEmptyBlock({
	icon,
	title,
	description,
}: {
	icon: keyof typeof Ionicons.glyphMap
	title: string
	description: string
}) {
	const theme = useFigmaTheme()
	return (
		<View style={styles.empty}>
			<View style={[styles.emptyIcon, { backgroundColor: theme.notificationCardBg }]}>
				<Ionicons name={icon} size={44} color={theme.accent} />
			</View>
			<AppText variant="title" style={[styles.emptyTitle, { color: theme.heading }]}>
				{title}
			</AppText>
			<AppText variant="body" style={[styles.emptyDesc, { color: theme.textMuted }]}>
				{description}
			</AppText>
		</View>
	)
}

export function ProfileActionButton({
	title,
	onPress,
}: {
	title: string
	onPress: () => void
}) {
	const theme = useFigmaTheme()
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.actionButton,
				{ backgroundColor: theme.buttonBg },
				pressed && styles.pressed,
			]}
			accessibilityRole="button">
			<AppText variant="bodyStrong" style={[styles.actionButtonText, { color: theme.buttonText }]}>
				{title}
			</AppText>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: figmaLight.background,
	},
	header: {
		minHeight: 56,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: spacing.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: figmaLight.progressTrack,
	},
	backButton: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		flex: 1,
		textAlign: 'center',
		color: figmaLight.heading,
		fontSize: 19,
		fontWeight: '800',
	},
	headerSpacer: { width: 44 },
	headerRight: {
		minWidth: 44,
		alignItems: 'flex-end',
		justifyContent: 'center',
	},
	content: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
	},
	card: {
		backgroundColor: figmaLight.background,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: figmaLight.notificationCardBg,
		padding: spacing.md,
		marginBottom: spacing.md,
		shadowColor: '#2563EB',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	empty: {
		alignItems: 'center',
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing['5xl'],
	},
	emptyIcon: {
		width: 96,
		height: 96,
		borderRadius: 48,
		backgroundColor: figmaLight.notificationCardBg,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: spacing.lg,
	},
	emptyTitle: {
		color: figmaLight.heading,
		fontWeight: '800',
		textAlign: 'center',
	},
	emptyDesc: {
		color: figmaLight.textMuted,
		textAlign: 'center',
		marginTop: spacing.sm,
		lineHeight: 22,
	},
	actionButton: {
		minHeight: 46,
		borderRadius: 9,
		backgroundColor: figmaLight.buttonBg,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: spacing.md,
	},
	actionButtonText: {
		color: figmaLight.buttonText,
	},
	pressed: { opacity: 0.88 },
})
