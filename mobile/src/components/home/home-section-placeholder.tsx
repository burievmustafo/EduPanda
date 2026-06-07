import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

/** Bosqich 2–4 da almashtiriladi — hozircha scroll tuzilmasini ko‘rsatish uchun. */
export function HomeSectionPlaceholder({ title }: { title: string }) {
	const theme = useFigmaTheme()

	return (
		<View style={styles.wrap}>
			<AppText variant="bodyStrong" style={[styles.title, { color: theme.heading }]}>
				{title}
			</AppText>
			<View style={[styles.box, { backgroundColor: theme.notificationCardBg }]} />
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		paddingHorizontal: spacing.lg,
		marginTop: spacing.xl,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
		letterSpacing: 0.9,
		marginBottom: spacing.md,
	},
	box: {
		height: 72,
		borderRadius: 5,
		opacity: 0.6,
	},
})
