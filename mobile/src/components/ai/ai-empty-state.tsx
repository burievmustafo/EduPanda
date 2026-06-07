import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import type { AiMode } from '@/types/ai'

type Props = {
	mode: AiMode
}

export function AiEmptyState({ mode }: Props) {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const description =
		mode === 'code' ? t('ai.codeDescription') : t('ai.conversationDescr')

	return (
		<View style={styles.wrap}>
			<View style={[styles.iconWrap, { backgroundColor: theme.notificationCardBg }]}>
				<Ionicons name="sparkles" size={40} color={theme.accent} />
			</View>
			<AppText variant="h2" style={[styles.title, { color: theme.heading }]}>
				{t('ai.howCanIHelp')}
			</AppText>
			<AppText variant="body" style={[styles.desc, { color: theme.textMuted }]}>
				{description}
			</AppText>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: spacing.xl,
		paddingBottom: spacing['3xl'],
	},
	iconWrap: {
		width: 88,
		height: 88,
		borderRadius: 44,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: spacing.lg,
	},
	title: {
		textAlign: 'center',
		fontWeight: '800',
		marginBottom: spacing.sm,
	},
	desc: {
		textAlign: 'center',
		lineHeight: 22,
	},
})
