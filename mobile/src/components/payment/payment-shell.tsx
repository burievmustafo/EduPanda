import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import type { ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

export function PaymentShell({
	title,
	children,
	footer,
}: {
	title: string
	children: ReactNode
	footer?: ReactNode
}) {
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()

	return (
		<View style={[styles.screen, { paddingTop: insets.top, backgroundColor: theme.background }]}>
			<View style={[styles.header, { borderBottomColor: theme.progressTrack }]}>
				<Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
					<Ionicons name="chevron-back" size={28} color={theme.heading} />
				</Pressable>
				<AppText variant="title" style={[styles.headerTitle, { color: theme.heading }]}>
					{title}
				</AppText>
				<View style={styles.back} />
			</View>
			<ScrollView
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: footer ? spacing['2xl'] : insets.bottom + spacing['4xl'] },
				]}
				showsVerticalScrollIndicator={false}>
				{children}
			</ScrollView>
			{footer ? (
				<View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm, borderTopColor: theme.progressTrack }]}>
					{footer}
				</View>
			) : null}
		</View>
	)
}

export function PaymentButton({
	title,
	onPress,
	loading,
}: {
	title: string
	onPress: () => void
	loading?: boolean
}) {
	const theme = useFigmaTheme()
	return (
		<Pressable
			disabled={loading}
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				{ backgroundColor: theme.buttonBg },
				pressed && styles.pressed,
				loading && styles.disabled,
			]}>
			<AppText variant="bodyStrong" style={[styles.buttonText, { color: theme.buttonText }]}>
				{title}
			</AppText>
		</Pressable>
	)
}

export function PaymentCard({ children }: { children: ReactNode }) {
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

export function PaymentRow({
	label,
	value,
	bold,
}: {
	label: string
	value: string
	bold?: boolean
}) {
	const theme = useFigmaTheme()
	return (
		<View style={styles.row}>
			<AppText variant={bold ? 'bodyStrong' : 'body'} style={{ color: theme.heading }}>
				{label}
			</AppText>
			<AppText variant={bold ? 'bodyStrong' : 'body'} style={{ color: theme.heading }}>
				{value}
			</AppText>
		</View>
	)
}

const styles = StyleSheet.create({
	screen: { flex: 1 },
	header: {
		minHeight: 56,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: spacing.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
	headerTitle: { flex: 1, textAlign: 'center', fontWeight: '800' },
	content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
	footer: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.md,
		borderTopWidth: StyleSheet.hairlineWidth,
	},
	card: {
		borderRadius: 12,
		borderWidth: 1,
		padding: spacing.md,
		marginBottom: spacing.md,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.12,
		shadowRadius: 5,
		elevation: 2,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: spacing.sm,
	},
	button: {
		minHeight: 52,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonText: { fontWeight: '800' },
	pressed: { opacity: 0.88 },
	disabled: { opacity: 0.55 },
})
