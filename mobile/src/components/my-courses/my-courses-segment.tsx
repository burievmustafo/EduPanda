import { Pressable, ScrollView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import type { MyCoursesTab } from '@/lib/my-courses-data'

type Props = {
	active: MyCoursesTab
	onChange: (tab: MyCoursesTab) => void
}

const TABS: MyCoursesTab[] = ['saved', 'inProgress', 'completed']

export function MyCoursesSegment({ active, onChange }: Props) {
	const { t } = useTranslation()
	const theme = useFigmaTheme()

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.scroll}
			contentContainerStyle={styles.rail}>
			{TABS.map((tab) => {
				const selected = active === tab
				const label =
					tab === 'saved'
						? t('myCourses.tabSaved')
						: tab === 'inProgress'
							? t('myCourses.tabInProgress')
							: t('myCourses.tabCompleted')
				return (
					<Pressable
						key={tab}
						onPress={() => onChange(tab)}
						style={[
							styles.chip,
							selected
								? { backgroundColor: theme.tabActiveBg }
								: {
										backgroundColor: theme.surface,
										borderColor: theme.tabInactiveBorder,
										borderWidth: 1,
									},
						]}
						accessibilityRole="button"
						accessibilityState={{ selected }}>
						<AppText
							variant="captionStrong"
							style={[
								styles.label,
								{ color: selected ? theme.tabActiveText : theme.tabInactiveText },
							]}>
							{label}
						</AppText>
					</Pressable>
				)
			})}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	/** Gorizontal ScrollView flex ustunda butun bo‘sh joyni egallamasin */
	scroll: {
		flexGrow: 0,
		flexShrink: 0,
	},
	rail: {
		paddingHorizontal: spacing.lg,
		gap: spacing.sm,
		paddingBottom: spacing.md,
		alignItems: 'center',
	},
	chip: {
		height: 33,
		paddingHorizontal: 12,
		borderRadius: 19,
		alignItems: 'center',
		justifyContent: 'center',
	},
	label: {
		fontSize: 11.35,
		fontWeight: '600',
		letterSpacing: 0.57,
	},
})
