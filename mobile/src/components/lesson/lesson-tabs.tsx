import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

export type LessonPanelTab = 'overview' | 'notes'

type TabDef = { key: LessonPanelTab; label: string }

type LessonTabsProps = {
	tabs: TabDef[]
	active: LessonPanelTab
	onChange: (tab: LessonPanelTab) => void
}

export function LessonTabs({ tabs, active, onChange }: LessonTabsProps) {
	const theme = useFigmaTheme()

	return (
		<View style={[styles.wrap, { borderColor: theme.cardBorder }]}>
			{tabs.map((tab) => {
				const isActive = tab.key === active
				return (
					<Pressable
						key={tab.key}
						onPress={() => onChange(tab.key)}
						style={styles.tab}>
						<AppText
							variant="bodyStrong"
							style={{ color: isActive ? theme.buttonText : theme.heading }}>
							{tab.label}
						</AppText>
						{isActive ? (
							<View style={[styles.activeFill, { backgroundColor: theme.tabActiveBg }]} />
						) : null}
					</Pressable>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		flexDirection: 'row',
		borderWidth: 1,
		borderRadius: 18,
		minHeight: 54,
		overflow: 'hidden',
	},
	tab: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: spacing.md,
	},
	activeFill: {
		...StyleSheet.absoluteFillObject,
		zIndex: -1,
	},
})
