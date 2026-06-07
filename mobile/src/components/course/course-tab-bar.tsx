import { Pressable, ScrollView, StyleSheet } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

export type CourseTabKey = 'home' | 'grades' | 'resources' | 'info'

type TabDef = { key: CourseTabKey; label: string }

type CourseTabBarProps = {
	tabs: TabDef[]
	active: CourseTabKey
	onChange: (key: CourseTabKey) => void
}

export function CourseTabBar({ tabs, active, onChange }: CourseTabBarProps) {
	const theme = useFigmaTheme()

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.wrap}
			contentContainerStyle={[
				styles.content,
				{ borderBottomColor: theme.progressTrack },
			]}>
			{tabs.map((tab) => {
				const isActive = tab.key === active
				return (
					<Pressable
						key={tab.key}
						onPress={() => onChange(tab.key)}
						style={[
							styles.tab,
							isActive && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
						]}>
						<AppText
							variant="bodyStrong"
							style={{ color: isActive ? theme.accent : theme.textMuted }}>
							{tab.label}
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
		gap: spacing['2xl'],
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	tab: {
		paddingVertical: spacing.md,
		paddingBottom: spacing.lg,
	},
})
