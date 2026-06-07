import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

export function InboxHeader() {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()

	return (
		<View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
			<AppText variant="title" style={[styles.title, { color: theme.heading }]} numberOfLines={1}>
				{t('inbox.title')}
			</AppText>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.md,
	},
	title: {
		fontSize: 21,
		fontWeight: '700',
		letterSpacing: 1.05,
	},
})
