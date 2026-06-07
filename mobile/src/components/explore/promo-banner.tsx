import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/app-text'
import { colors, radius, spacing } from '@/design/tokens'

export function PromoBanner() {
	const { t } = useTranslation()

	return (
		<View style={styles.banner}>
			<View style={styles.textCol}>
				<AppText variant="bodyStrong" style={styles.title}>
					{t('explore.plusBanner')}
				</AppText>
				<AppText variant="caption" style={styles.sub}>
					{t('explore.plusSub')}
				</AppText>
			</View>
			<Pressable style={styles.btn}>
				<AppText variant="captionStrong" style={styles.btnText}>
					{t('explore.plusCta')}
				</AppText>
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create({
	banner: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.primarySoft,
		borderWidth: 1,
		borderColor: '#BBD2E6',
		borderRadius: radius.md,
		padding: spacing.lg,
		marginTop: spacing['2xl'],
		gap: spacing.md,
	},
	textCol: { flex: 1, gap: spacing.xs },
	title: { color: colors.primaryPressed },
	sub: { color: colors.primaryPressed, opacity: 0.75 },
	btn: {
		borderWidth: 1,
		borderColor: colors.primary,
		borderRadius: radius.md,
		paddingHorizontal: 14,
		paddingVertical: 9,
	},
	btnText: { color: colors.primary },
})
