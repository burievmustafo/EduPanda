import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { AppCard } from '@/components/ui/app-card'
import { AppEmptyState } from '@/components/ui/app-empty-state'
import { AppText } from '@/components/ui/app-text'
import { ListSkeleton } from '@/components/skeleton'
import { spacing } from '@/design/tokens'
import { useFigmaTheme } from '@/design/figma-theme'
import { useCourseGrades } from '@/hooks/queries'
import { useLocale } from '@/hooks/use-locale'
import { tText } from '@/lib/localized'

type Props = { courseId: string }

export function CourseGradesTab({ courseId }: Props) {
	const { t } = useTranslation()
	const locale = useLocale()
	const theme = useFigmaTheme()
	const { data, isLoading } = useCourseGrades(courseId)

	if (isLoading) return <ListSkeleton count={2} />

	const grades = data?.grades ?? []
	if (!grades.length) {
		return (
			<AppEmptyState
				title={t('courseDashboard.grades.empty')}
				description={t('courseDashboard.grades.emptyHint')}
			/>
		)
	}

	return (
		<View style={styles.wrap}>
			{grades.map((grade) => (
				<AppCard
					key={grade.attemptId}
					style={[
						styles.card,
						{
							backgroundColor: theme.surface,
							borderColor: theme.cardBorder,
						},
					]}>
					<View style={styles.row}>
						<View style={styles.textCol}>
							<AppText variant="bodyStrong" style={{ color: theme.heading }}>
								{tText(grade.quizTitle, locale)}
							</AppText>
							<AppText variant="caption" color="secondary">
								{tText(grade.sectionTitle, locale)}
							</AppText>
						</View>
						<View style={styles.scoreCol}>
							<AppText variant="h3" style={{ color: theme.accent }}>
								{grade.score}%
							</AppText>
							<Ionicons
								name={grade.passed ? 'checkmark-circle' : 'close-circle'}
								size={18}
								color={grade.passed ? '#22c55e' : theme.danger}
							/>
						</View>
					</View>
					<AppText variant="small" color="secondary">
						{grade.passed
							? t('courseDashboard.grades.passed')
							: t('courseDashboard.grades.failed')}
					</AppText>
				</AppCard>
			))}
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: { marginTop: spacing.lg, gap: spacing.md },
	card: { padding: spacing.lg },
	row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
	textCol: { flex: 1, gap: 2 },
	scoreCol: { alignItems: 'flex-end', gap: 4 },
})
