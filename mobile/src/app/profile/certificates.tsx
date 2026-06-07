import { Ionicons } from '@expo/vector-icons'
import { Share, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import {
	ProfileEmptyBlock,
	ProfileInfoCard,
	ProfileSubpage,
} from '@/components/profile/profile-subpage'
import { AppText } from '@/components/ui/app-text'
import { figmaLight, useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { useStudentDashboard } from '@/hooks/queries'
import { useLocale } from '@/hooks/use-locale'
import { tText } from '@/lib/localized'

export default function CertificatesScreen() {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const locale = useLocale()
	const { data } = useStudentDashboard()
	const completed = (data?.inProgress ?? []).filter((course) => course.percent >= 100)

	return (
		<ProfileSubpage title={t('profile.myCertificates')}>
			{completed.length === 0 ? (
				<ProfileEmptyBlock
					icon="ribbon-outline"
					title={t('profile.emptyAchievementsTitle')}
					description={t('profile.emptyAchievementsDesc')}
				/>
			) : (
				completed.map((course) => {
					const title = tText(course.title, locale)
					return (
						<ProfileInfoCard key={course.courseId}>
							<View style={styles.row}>
								<View style={styles.certIcon}>
									<Ionicons name="ribbon" size={26} color={theme.buttonText} />
								</View>
								<View style={styles.body}>
									<AppText variant="bodyStrong" style={[styles.title, { color: theme.heading }]} numberOfLines={2}>
										{title}
									</AppText>
									<AppText variant="small" style={[styles.meta, { color: theme.textMuted }]}>
										{t('profile.certificateIssuer')} · {course.percent}%
									</AppText>
								</View>
								<Ionicons
									name="share-social-outline"
									size={20}
									color={theme.accent}
									onPress={() =>
										void Share.share({
											message: t('profile.shareCertificateMessage', { title }),
										})
									}
								/>
							</View>
						</ProfileInfoCard>
					)
				})
			)}
		</ProfileSubpage>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	certIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: figmaLight.accent,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.md,
	},
	body: { flex: 1 },
	title: { color: figmaLight.heading },
	meta: { color: figmaLight.textMuted, marginTop: 3 },
})
