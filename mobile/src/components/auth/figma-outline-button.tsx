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
	style?: StyleProp<ViewStyle>
}

export function FigmaOutlineButton({ title, loading, disabled, style, ...rest }: Props) {
	const isDisabled = disabled || loading

	return (
		<Pressable
			disabled={isDisabled}
			style={({ pressed }) => [
				styles.base,
				isDisabled && styles.disabled,
				pressed && !isDisabled && styles.pressed,
				style,
			]}
			{...rest}>
			{loading ? (
				<ActivityIndicator color={figmaAuth.heading} />
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
		flex: 1,
		minHeight: 50,
		paddingHorizontal: 15,
		paddingVertical: 15,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: figmaAuth.border,
		backgroundColor: figmaAuth.white,
		alignItems: 'center',
		justifyContent: 'center',
	},
	disabled: { opacity: 0.5 },
	pressed: { opacity: 0.9 },
	label: {
		color: figmaAuth.heading,
		textTransform: 'uppercase',
		letterSpacing: 0.32,
		fontSize: 16,
	},
})
