import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	type PressableProps,
	type StyleProp,
	type ViewStyle,
} from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { figmaAuth } from '@/constants/figma-auth-theme'

type Props = PressableProps & {
	title: string
	loading?: boolean
	fullWidth?: boolean
	style?: StyleProp<ViewStyle>
}

export function FigmaPrimaryButton({
	title,
	loading,
	disabled,
	fullWidth = true,
	style,
	...rest
}: Props) {
	const isDisabled = disabled || loading

	return (
		<Pressable
			disabled={isDisabled}
			style={({ pressed }) => [
				styles.base,
				fullWidth && styles.fullWidth,
				isDisabled && styles.disabled,
				pressed && !isDisabled && styles.pressed,
				style,
			]}
			{...rest}>
			{loading ? (
				<ActivityIndicator color={figmaAuth.primaryButtonText} />
			) : (
				<AppText variant="bodyStrong" style={styles.label}>
					{title}
				</AppText>
			)}
		</Pressable>
	)
}

const styles = StyleSheet.create({
	base: {
		minHeight: 50,
		paddingHorizontal: 15,
		paddingVertical: 15,
		borderRadius: 5,
		backgroundColor: figmaAuth.primaryButton,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: figmaAuth.shadow,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 1,
		shadowRadius: 4,
		elevation: 3,
	},
	fullWidth: { width: '100%' },
	disabled: { opacity: 0.5 },
	pressed: { opacity: 0.9 },
	label: {
		color: figmaAuth.primaryButtonText,
		textTransform: 'uppercase',
		letterSpacing: 0.32,
		fontSize: 16,
	},
})
