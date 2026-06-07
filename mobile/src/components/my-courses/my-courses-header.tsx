import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

type Props = {
	onNotificationsPress: () => void
}

export function MyCoursesHeader({ onNotificationsPress }: Props) {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()

	return (
		<View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
			<View style={styles.row}>
				<AppText variant="title" style={[styles.title, { color: theme.heading }]} numberOfLines={1}>
					{t('myCourses.title')}
				</AppText>
				<Pressable
					onPress={onNotificationsPress}
					hitSlop={12}
					style={styles.bell}
					accessibilityRole="button"
					accessibilityLabel={t('myCourses.notifications')}>
					<Ionicons name="notifications" size={20} color={theme.heading} />
				</Pressable>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.md,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		minHeight: 36,
	},
	title: {
		flex: 1,
		fontSize: 21,
		fontWeight: '700',
		letterSpacing: 1.05,
	},
	bell: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
})
