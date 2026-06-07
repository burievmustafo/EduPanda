import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'

import { colors, layout, radius, spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'

type SearchBarProps = {
	value: string
	onChangeText: (text: string) => void
	placeholder: string
	onFocus?: () => void
	onBlur?: () => void
}

export function SearchBar({
	value,
	onChangeText,
	placeholder,
	onFocus,
	onBlur,
}: SearchBarProps) {
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')

	return (
		<View
			style={[
				styles.box,
				{
					borderColor: palette.border,
					backgroundColor: palette.surface,
				},
			]}>
			<Ionicons name="search-outline" size={22} color={palette.textSecondary} />
			<TextInput
				style={[styles.input, { color: palette.textPrimary }]}
				placeholder={placeholder}
				placeholderTextColor={palette.textTertiary}
				value={value}
				onChangeText={onChangeText}
				onFocus={onFocus}
				onBlur={onBlur}
				returnKeyType="search"
				autoCorrect={false}
			/>
			{value ? (
				<Pressable onPress={() => onChangeText('')} hitSlop={8}>
					<Ionicons name="close-circle" size={20} color={palette.textTertiary} />
				</Pressable>
			) : null}
		</View>
	)
}

const styles = StyleSheet.create({
	box: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		paddingHorizontal: spacing.lg,
		height: layout.primaryButtonHeight,
		borderWidth: 1.5,
		borderRadius: radius.md,
	},
	input: {
		flex: 1,
		fontSize: 16,
		lineHeight: 22,
	},
})
