import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import {
	Pressable,
	StyleSheet,
	TextInput,
	View,
	type TextInputProps,
} from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { figmaAuth } from '@/constants/figma-auth-theme'
import { spacing } from '@/design/tokens'

type Props = TextInputProps & {
	label: string
}

export function AuthTextField({ label, secureTextEntry, style, ...rest }: Props) {
	const [hidden, setHidden] = useState(Boolean(secureTextEntry))

	return (
		<View style={styles.wrap}>
			<AppText variant="captionStrong" style={styles.label}>
				{label}
			</AppText>
			<View style={styles.inputRow}>
				<TextInput
					placeholderTextColor={figmaAuth.textMuted}
					secureTextEntry={secureTextEntry ? hidden : false}
					style={[styles.input, style]}
					{...rest}
				/>
				{secureTextEntry ? (
					<Pressable
						onPress={() => setHidden((v) => !v)}
						hitSlop={8}
						accessibilityRole="button"
						accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
						<Ionicons
							name={hidden ? 'eye-off-outline' : 'eye-outline'}
							size={18}
							color={figmaAuth.textMuted}
						/>
					</Pressable>
				) : null}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: { gap: spacing.sm },
	label: {
		color: figmaAuth.heading,
		fontSize: 13,
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: figmaAuth.border,
		borderRadius: 5,
		paddingHorizontal: 10,
		minHeight: 35,
	},
	input: {
		flex: 1,
		fontSize: 12,
		color: figmaAuth.heading,
		paddingVertical: 8,
	},
})
