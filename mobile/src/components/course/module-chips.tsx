import { Pressable, ScrollView, StyleSheet } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { radius, spacing } from '@/design/tokens'
import { useLocale } from '@/hooks/use-locale'
import { tText } from '@/lib/localized'
import type { SectionDTO } from '@/types/dto'

type ModuleChipsProps = {
	sections: SectionDTO[]
	selectedId: string
	onSelect: (sectionId: string) => void
}

export function ModuleChips({ sections, selectedId, onSelect }: ModuleChipsProps) {
	const locale = useLocale()
	const theme = useFigmaTheme()
	const ordered = [...sections].sort((a, b) => a.position - b.position)

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.wrap}
			contentContainerStyle={styles.content}>
			{ordered.map((section) => {
				const selected = section.id === selectedId
				return (
					<Pressable
						key={section.id}
						onPress={() => onSelect(section.id)}
						style={[
							styles.chip,
							{
								backgroundColor: selected ? theme.notificationCardBg : theme.surface,
								borderColor: selected ? theme.accent : theme.progressTrack,
							},
						]}>
						<AppText
							variant="captionStrong"
							style={{ color: selected ? theme.accent : theme.heading }}
							numberOfLines={1}>
							{tText(section.title, locale)}
						</AppText>
					</Pressable>
				)
			})}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	wrap: { marginHorizontal: -spacing['2xl'] },
	content: {
		paddingHorizontal: spacing['2xl'],
		gap: spacing.sm,
		paddingVertical: spacing.md,
	},
	chip: {
		maxWidth: 200,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
		borderRadius: radius.full,
		borderWidth: 1,
	},
})
