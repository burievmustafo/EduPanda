import { Pressable, StyleSheet, View } from 'react-native'

import { AppButton } from '@/components/ui/app-button'
import { AppCard } from '@/components/ui/app-card'
import { AppText } from '@/components/ui/app-text'
import { colors, spacing } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'
import type { CourseProgressItem } from '@/api/dashboards'
import { useLocale } from '@/hooks/use-locale'
import { tText } from '@/lib/localized'

type LearnProgressCardProps = {
	item: CourseProgressItem
	primary?: boolean
	continueLabel: string
	onPress: () => void
}

export function LearnProgressCard({
	item,
	primary,
	continueLabel,
	onPress,
}: LearnProgressCardProps) {
	const locale = useLocale()
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')
	const clamped = Math.min(100, Math.max(0, item.percent))

	return (
		<Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
			<AppCard style={primary ? styles.primaryCard : undefined}>
				<AppText variant={primary ? 'h3' : 'title'} numberOfLines={2}>
					{tText(item.title, locale)}
				</AppText>
				<View style={[styles.barBg, { backgroundColor: palette.surfaceMuted }]}>
					<View
						style={[
							styles.barFill,
							{ width: `${clamped}%`, backgroundColor: colors.primary },
						]}
					/>
				</View>
				<AppText variant="caption" color="secondary">
					{item.completedLessons}/{item.totalLessons} · {item.percent}%
				</AppText>
				{primary ? (
					<AppButton
						title={continueLabel}
						onPress={onPress}
						fullWidth={false}
						style={styles.cta}
					/>
				) : null}
			</AppCard>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	primaryCard: { gap: spacing.md },
	barBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: spacing.xs },
	barFill: { height: 6, borderRadius: 3 },
	cta: { alignSelf: 'flex-start', marginTop: spacing.xs },
})
