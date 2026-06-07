import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'

import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

type Props = {
	value: string
	onChangeText: (text: string) => void
}

export function HomeSearchBar({ value, onChangeText }: Props) {
	const { t } = useTranslation()
	const theme = useFigmaTheme()

	return (
		<View
			style={[
				styles.bar,
				{
					borderColor: theme.progressTrack,
					backgroundColor: theme.surface,
				},
			]}>
			<TextInput
				value={value}
				onChangeText={onChangeText}
				placeholder={t('home.searchPlaceholder')}
				placeholderTextColor={theme.textMuted}
				style={[styles.input, { color: theme.heading }]}
				returnKeyType="search"
				autoCorrect={false}
				autoCapitalize="none"
				clearButtonMode="while-editing"
				accessibilityLabel={t('home.searchPlaceholder')}
			/>
			{value.length > 0 ? (
				<Pressable
					onPress={() => onChangeText('')}
					hitSlop={8}
					accessibilityRole="button"
					accessibilityLabel={t('home.clearSearch')}>
					<Ionicons name="close-circle" size={18} color={theme.textMuted} />
				</Pressable>
			) : (
				<Ionicons name="search" size={16} color={theme.textMuted} />
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	bar: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: spacing.lg,
		marginBottom: spacing.lg,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
		minHeight: 44,
		borderWidth: 1,
		borderRadius: 100,
		gap: spacing.sm,
	},
	input: {
		flex: 1,
		fontSize: 12,
		letterSpacing: 0.24,
		paddingVertical: spacing.xs,
	},
})
