import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { figmaAuth } from '@/constants/figma-auth-theme'

type Variant = 'google' | 'facebook'

type Props = {
	variant: Variant
	title: string
	onPress?: () => void
	loading?: boolean
	disabled?: boolean
}

export function SocialAuthButton({
	variant,
	title,
	onPress,
	loading = false,
	disabled = false,
}: Props) {
	const isFacebook = variant === 'facebook'
	const isInactive = disabled || loading

	return (
		<Pressable
			onPress={onPress}
			disabled={isInactive}
			style={[
				styles.base,
				isFacebook ? styles.facebook : styles.google,
				isInactive && styles.inactive,
			]}
			accessibilityRole="button"
			accessibilityState={{ disabled: isInactive, busy: loading }}>
			{loading ? (
				<ActivityIndicator
					size="small"
					color={isFacebook ? figmaAuth.white : '#DB4437'}
				/>
			) : (
				<>
					<Ionicons
						name={isFacebook ? 'logo-facebook' : 'logo-google'}
						size={22}
						color={isFacebook ? figmaAuth.white : '#DB4437'}
					/>
					<AppText
						variant="bodyStrong"
						style={[styles.label, isFacebook && styles.labelLight]}>
						{title}
					</AppText>
				</>
			)}
		</Pressable>
	)
}

const styles = StyleSheet.create({
	base: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		minHeight: 45,
		borderRadius: 5,
		paddingHorizontal: 15,
	},
	google: {
		borderWidth: 1,
		borderColor: figmaAuth.border,
		backgroundColor: figmaAuth.white,
	},
	inactive: {
		opacity: 0.6,
	},
	facebook: {
		backgroundColor: figmaAuth.facebook,
	},
	label: {
		color: figmaAuth.textMuted,
		textTransform: 'capitalize',
		fontSize: 16,
	},
	labelLight: { color: figmaAuth.white },
})
