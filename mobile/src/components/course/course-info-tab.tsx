import { Ionicons } from '@expo/vector-icons'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { AppCard } from '@/components/ui/app-card'
import { AppText } from '@/components/ui/app-text'
import { spacing } from '@/design/tokens'
import { useFigmaTheme } from '@/design/figma-theme'
import { useLocale } from '@/hooks/use-locale'
import { getCourseDurationLabel } from '@/lib/course-meta'
import { tText } from '@/lib/localized'
import type { CourseDTO, SectionDTO } from '@/types/dto'

type Props = {
	course: CourseDTO
	sections: SectionDTO[]
}

function splitList(text?: string): string[] {
	if (!text?.trim()) return []
	return text
		.split(/,\s*|\n/)
		.map((s) => s.trim())
		.filter(Boolean)
}

function InfoSection({
	title,
	children,
}: {
	title: string
	children: ReactNode
}) {
	const theme = useFigmaTheme()
	return (
		<AppCard
			style={[
				styles.section,
				{
					backgroundColor: theme.surface,
					borderColor: theme.cardBorder,
				},
			]}>
			<AppText variant="h3" style={{ color: theme.heading, marginBottom: spacing.md }}>
				{title}
			</AppText>
			{children}
		</AppCard>
	)
}

function BulletRow({ text }: { text: string }) {
	const theme = useFigmaTheme()
	return (
		<View style={styles.bulletRow}>
			<Ionicons name="checkmark-circle" size={18} color={theme.accent} />
			<AppText variant="body" style={[styles.bulletText, { color: theme.textMuted }]}>
				{text}
			</AppText>
		</View>
	)
}

function StatBlock({
	icon,
	label,
	value,
}: {
	icon: keyof typeof Ionicons.glyphMap
	label: string
	value: string
}) {
	const theme = useFigmaTheme()
	return (
		<View style={styles.statBlock}>
			<Ionicons name={icon} size={22} color={theme.accent} />
			<AppText variant="caption" color="secondary">
				{label}
			</AppText>
			<AppText variant="bodyStrong" style={{ color: theme.heading }}>
				{value}
			</AppText>
		</View>
	)
}

export function CourseInfoTab({ course, sections }: Props) {
	const { t } = useTranslation()
	const locale = useLocale()
	const theme = useFigmaTheme()

	const description = tText(course.description, locale)
	const learning = splitList(tText(course.learning, locale))
	const requirements = splitList(tText(course.requirements, locale))
	const durationLabel = getCourseDurationLabel(sections)

	return (
		<View style={styles.wrap}>
			{description ? (
				<InfoSection title={t('courseDashboard.info.about')}>
					<AppText variant="body" style={{ color: theme.textMuted, lineHeight: 22 }}>
						{description}
					</AppText>
				</InfoSection>
			) : null}

			{learning.length > 0 ? (
				<InfoSection title={t('courseDashboard.info.whatYouLearn')}>
					{learning.map((item) => (
						<BulletRow key={item} text={item} />
					))}
				</InfoSection>
			) : null}

			<InfoSection title={t('courseDashboard.info.courseContent')}>
				<View style={styles.statsRow}>
					<StatBlock
						icon="layers-outline"
						label={t('courseDashboard.info.modules')}
						value={String(course.sectionsCount || sections.length)}
					/>
					<StatBlock
						icon="play-circle-outline"
						label={t('courseDashboard.info.lessons')}
						value={String(
							course.lessonsCount ||
								sections.reduce((n, s) => n + s.lessons.length, 0)
						)}
					/>
					<StatBlock
						icon="time-outline"
						label={t('courseDashboard.info.duration')}
						value={durationLabel}
					/>
				</View>
				<View style={styles.metaRow}>
					{course.category ? (
						<MetaPill label={t('courseDashboard.info.category')} value={course.category} />
					) : null}
					{course.level ? (
						<MetaPill label={t('courseDashboard.info.level')} value={course.level} />
					) : null}
					{course.language ? (
						<MetaPill label={t('courseDashboard.info.language')} value={course.language} />
					) : null}
				</View>
			</InfoSection>

			{requirements.length > 0 ? (
				<InfoSection title={t('courseDashboard.info.requirements')}>
					{requirements.map((item) => (
						<BulletRow key={item} text={item} />
					))}
				</InfoSection>
			) : null}

			<InfoSection title={t('courseDashboard.info.instructor')}>
				<AppText variant="bodyStrong" style={{ color: theme.heading }}>
					{course.instructor.fullName}
				</AppText>
			</InfoSection>
		</View>
	)
}

function MetaPill({ label, value }: { label: string; value: string }) {
	const theme = useFigmaTheme()
	return (
		<View style={[styles.pill, { backgroundColor: theme.notificationCardBg }]}>
			<AppText variant="small" color="secondary">
				{label}
			</AppText>
			<AppText variant="captionStrong" style={{ color: theme.heading }}>
				{value}
			</AppText>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: { marginTop: spacing.lg, gap: spacing.md, paddingBottom: spacing['2xl'] },
	section: { padding: spacing.lg },
	bulletRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: spacing.sm,
		marginBottom: spacing.sm,
	},
	bulletText: { flex: 1, lineHeight: 22 },
	statsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.lg,
		marginBottom: spacing.md,
	},
	statBlock: { minWidth: 90, gap: 4 },
	metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
	pill: {
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		borderRadius: 10,
		gap: 2,
	},
})
