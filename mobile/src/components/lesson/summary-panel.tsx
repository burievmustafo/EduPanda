import { StyleSheet } from 'react-native'

import { AppCard } from '@/components/ui/app-card'
import { AppEmptyState } from '@/components/ui/app-empty-state'
import { AppText } from '@/components/ui/app-text'
import { spacing } from '@/design/tokens'
import { tText } from '@/lib/localized'
import type { Locale, LocalizedText } from '@/types/dto'

type SummaryPanelProps = {
	content: LocalizedText
	locale: Locale
	emptyTitle: string
}

export function SummaryPanel({ content, locale, emptyTitle }: SummaryPanelProps) {
	const text = tText(content, locale).trim()
	if (!text) {
		return <AppEmptyState title={emptyTitle} />
	}

	const summary =
		text.length > 320 ? `${text.slice(0, 320).trim()}…` : text

	return (
		<AppCard style={styles.card}>
			<AppText variant="body" color="secondary">
				{summary}
			</AppText>
		</AppCard>
	)
}

const styles = StyleSheet.create({
	card: { gap: spacing.sm },
})
