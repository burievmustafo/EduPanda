import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	type PressableProps,
	type ViewStyle,
} from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { colors, layout, radius, spacing } from '@/design/tokens'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'

type AppButtonProps = PressableProps & {
	title: string
	variant?: Variant
	loading?: boolean
	fullWidth?: boolean
	compact?: boolean
}

export function AppButton({
	title,
	variant = 'primary',
	loading,
	disabled,
	fullWidth = true,
	compact,
	style,
	...rest
}: AppButtonProps) {
	const isDisabled = disabled || loading

	const variantStyle: ViewStyle =
		variant === 'primary'
			? { backgroundColor: colors.primary }
			: variant === 'secondary'
				? { backgroundColor: colors.surfaceMuted }
				: variant === 'outline'
					? {
							backgroundColor: colors.white,
							borderWidth: 1,
							borderColor: colors.border,
						}
					: { backgroundColor: 'transparent' }

	const labelColor =
		variant === 'primary'
			? colors.white
			: variant === 'ghost'
				? colors.primary
				: colors.textPrimary

	return (
		<Pressable
			disabled={isDisabled}
			style={({ pressed }) => [
				styles.base,
				compact && styles.compact,
				variantStyle,
				fullWidth && styles.fullWidth,
				isDisabled && styles.disabled,
				pressed && !isDisabled && styles.pressed,
				style as ViewStyle,
			]}
			{...rest}>
			{loading ? (
				<ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
			) : (
				<AppText variant={compact ? 'captionStrong' : 'bodyStrong'} style={{ color: labelColor }}>
					{title}
				</AppText>
			)}
		</Pressable>
	)
}

const styles = StyleSheet.create({
	base: {
		minHeight: layout.primaryButtonHeight,
		paddingHorizontal: spacing['2xl'],
		borderRadius: radius.md,
		alignItems: 'center',
		justifyContent: 'center',
	},
	compact: {
		minHeight: 32,
		paddingHorizontal: spacing.md,
		borderRadius: radius.sm,
	},
	fullWidth: { width: '100%' },
	disabled: { opacity: 0.45 },
	pressed: { opacity: 0.88 },
})
