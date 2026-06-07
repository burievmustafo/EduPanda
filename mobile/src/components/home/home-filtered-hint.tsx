import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { spacing } from '@/design/tokens'

type Props = {
	sectionTitle: string
	categoryLabel: string
	onClear: () => void
}

/** Bosqich 4 gacha — filtrlangan bo‘limlar uchun vaqtincha ko‘rsatkich. */
export function HomeFilteredHint({ sectionTitle, categoryLabel, onClear }: Props) {
	const { t } = useTranslation()

	return (
		<View style={styles.wrap}>
			<AppText variant="bodyStrong" style={styles.title}>
				{sectionTitle}
			</AppText>
			<AppText variant="caption" color="secondary">
				{t('home.filteredSection', { category: categoryLabel })}
			</AppText>
			<Pressable onPress={onClear} hitSlop={8}>
				<AppText variant="caption" color="brand">
					{t('explore.clearFilter')}
				</AppText>
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		paddingHorizontal: spacing.lg,
		marginTop: spacing.xl,
		gap: spacing.xs,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
	},
})
