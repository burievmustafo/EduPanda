import { router } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { ContinueWatchingCard } from '@/components/home/continue-watching-card'
import { HomeSectionHeader } from '@/components/home/home-section-header'
import { AppText } from '@/components/ui/app-text'
import { spacing } from '@/design/tokens'
import type { CourseProgressItem } from '@/api/dashboards'
import { useLocale } from '@/hooks/use-locale'
import { tText } from '@/lib/localized'
import type { CourseDTO } from '@/types/dto'

type Props = {
	items: CourseProgressItem[]
	courses?: CourseDTO[]
	loading?: boolean
}

export function ContinueWatchingSection({ items, courses, loading }: Props) {
	const { t } = useTranslation()
	const locale = useLocale()

	const rows = useMemo(() => {
		const sorted = [...items].sort((a, b) => b.percent - a.percent)
		return sorted.slice(0, 5).map((row) => {
			const course = courses?.find((c) => c.id === row.courseId)
			return {
				...row,
				instructorName: course?.instructor.fullName ?? '',
				previewImage: course?.previewImage,
				category: course?.category,
			}
		})
	}, [items, courses])

	if (loading) {
		return (
			<View style={styles.wrap}>
				<HomeSectionHeader title={t('home.continueWatching')} />
				<ActivityIndicator style={styles.loader} />
			</View>
		)
	}

	if (rows.length === 0) {
		return (
			<View style={styles.wrap}>
				<HomeSectionHeader title={t('home.continueWatching')} />
				<AppText variant="caption" color="secondary" style={styles.empty}>
					{t('home.continueEmpty')}
				</AppText>
			</View>
		)
	}

	return (
		<View style={styles.wrap}>
			<HomeSectionHeader
				title={t('home.continueWatching')}
				actionLabel={t('home.seeAll')}
				onAction={() => router.push('/learning')}
			/>
			<View style={styles.list}>
				{rows.map((row) => (
					<ContinueWatchingCard
						key={row.courseId}
						courseId={row.courseId}
						title={tText(row.title, locale)}
						subtitle={row.instructorName}
						percent={row.percent}
						thumbnailUri={row.previewImage}
						category={row.category}
						completedLabel={t('home.percentCompleted', { percent: row.percent })}
						onPress={() =>
							router.push({
								pathname: '/course/[courseId]',
								params: { courseId: row.courseId },
							})
						}
					/>
				))}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		paddingHorizontal: spacing.lg,
		marginTop: spacing.sm,
	},
	list: {
		gap: spacing.md,
	},
	loader: {
		marginVertical: spacing.xl,
	},
	empty: {
		marginBottom: spacing.md,
	},
})
