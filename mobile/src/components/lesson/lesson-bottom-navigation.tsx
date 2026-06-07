import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { layout, spacing } from '@/design/tokens'

type LessonBottomNavigationProps = {
	backLabel: string
	noteLabel: string
	nextLabel: string
	onBack: () => void
	onNote: () => void
	onNext: () => void
	nextDisabled?: boolean
}

export function LessonBottomNavigation({
	backLabel,
	noteLabel,
	nextLabel,
	onBack,
	onNote,
	onNext,
	nextDisabled,
}: LessonBottomNavigationProps) {
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()

	return (
		<View
			style={[
				styles.bar,
				{
					paddingBottom: Math.max(insets.bottom, spacing.md),
					backgroundColor: theme.surface,
					borderTopColor: theme.cardBorder,
				},
			]}>
			<NavItem icon="arrow-back" label={backLabel} onPress={onBack} />
			<NavItem icon="create-outline" label={noteLabel} onPress={onNote} />
			<NavItem
				icon="arrow-forward"
				label={nextLabel}
				onPress={onNext}
				disabled={nextDisabled}
				primary
			/>
		</View>
	)
}

function NavItem({
	icon,
	label,
	onPress,
	disabled,
	primary,
}: {
	icon: keyof typeof Ionicons.glyphMap
	label: string
	onPress: () => void
	disabled?: boolean
	primary?: boolean
}) {
	const theme = useFigmaTheme()
	const color = primary ? theme.accent : theme.heading

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={({ pressed }) => [
				styles.item,
				{ opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
			]}>
			<Ionicons name={icon} size={22} color={color} />
			<AppText variant="small" style={{ color, fontWeight: primary ? '700' : '600' }}>
				{label}
			</AppText>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	bar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
		minHeight: layout.tabBarHeight,
		borderTopWidth: StyleSheet.hairlineWidth,
		paddingTop: spacing.sm,
		paddingHorizontal: spacing.lg,
	},
	item: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.xs,
		minHeight: 52,
	},
})
