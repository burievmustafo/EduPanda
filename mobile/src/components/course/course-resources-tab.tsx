import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, StyleSheet, View } from 'react-native'

import { AppCard } from '@/components/ui/app-card'
import { AppEmptyState } from '@/components/ui/app-empty-state'
import { AppText } from '@/components/ui/app-text'
import { ListSkeleton } from '@/components/skeleton'
import { spacing } from '@/design/tokens'
import { useFigmaTheme } from '@/design/figma-theme'
import { useCourseResources } from '@/hooks/queries'

type Props = { courseId: string }

export function CourseResourcesTab({ courseId }: Props) {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const { data, isLoading } = useCourseResources(courseId)

	if (isLoading) return <ListSkeleton count={2} />

	const resources = data?.resources ?? []
	if (!resources.length) {
		return (
			<AppEmptyState
				title={t('courseDashboard.resources.empty')}
				description={t('courseDashboard.resources.emptyHint')}
			/>
		)
	}

	const openUrl = async (url: string) => {
		try {
			await WebBrowser.openBrowserAsync(url)
		} catch {
			await Linking.openURL(url)
		}
	}

	return (
		<View style={styles.wrap}>
			{resources.map((item) => (
				<Pressable key={item.id} onPress={() => void openUrl(item.url)}>
					<AppCard
						style={[
							styles.card,
							{
								backgroundColor: theme.surface,
								borderColor: theme.cardBorder,
							},
						]}>
						<View style={styles.row}>
							<View
								style={[
									styles.iconWrap,
									{ backgroundColor: theme.notificationCardBg },
								]}>
								<Ionicons
									name={item.type === 'file' ? 'document-text-outline' : 'link-outline'}
									size={22}
									color={theme.accent}
								/>
							</View>
							<View style={styles.textCol}>
								<AppText variant="bodyStrong" style={{ color: theme.heading }}>
									{item.title}
								</AppText>
								<AppText variant="caption" color="secondary" numberOfLines={1}>
									{item.url}
								</AppText>
							</View>
							<Ionicons name="open-outline" size={20} color={theme.accent} />
						</View>
					</AppCard>
				</Pressable>
			))}
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: { marginTop: spacing.lg, gap: spacing.md },
	card: { padding: spacing.lg },
	row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	iconWrap: {
		width: 40,
		height: 40,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textCol: { flex: 1, gap: 2 },
})
