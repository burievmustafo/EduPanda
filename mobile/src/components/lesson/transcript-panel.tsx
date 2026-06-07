import { Pressable, StyleSheet, View } from 'react-native'

import { AppEmptyState } from '@/components/ui/app-empty-state'
import { AppText } from '@/components/ui/app-text'
import { AppCard } from '@/components/ui/app-card'
import { spacing } from '@/design/tokens'
import type { LocalizedText } from '@/types/dto'
import { tText } from '@/lib/localized'
import type { Locale } from '@/types/dto'

type TranscriptPanelProps = {
	content: LocalizedText
	locale: Locale
	emptyTitle: string
	seekHint?: string
	onSeek?: (timeSec: number) => void
}

export function TranscriptPanel({
	content,
	locale,
	emptyTitle,
	seekHint,
	onSeek,
}: TranscriptPanelProps) {
	const text = tText(content, locale).trim()
	if (!text) {
		return <AppEmptyState title={emptyTitle} />
	}

	const paragraphs = text.split(/\n+/).filter(Boolean)

	return (
		<AppCard style={styles.card}>
			{onSeek && seekHint ? (
				<AppText variant="caption" color="secondary">
					{seekHint}
				</AppText>
			) : null}
			{paragraphs.map((para, index) => (
				<Pressable
					key={`${index}-${para.slice(0, 12)}`}
					disabled={!onSeek}
					onPress={() => onSeek?.(index * 30)}
					style={({ pressed }) => [styles.para, pressed && onSeek && styles.paraPressed]}>
					<AppText variant="body" color="secondary">
						{para}
					</AppText>
				</Pressable>
			))}
		</AppCard>
	)
}

const styles = StyleSheet.create({
	card: { gap: spacing.md },
	para: { paddingVertical: spacing.xs },
	paraPressed: { opacity: 0.7 },
})
