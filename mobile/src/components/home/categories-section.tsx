import { router } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'

import { CategoryPill } from '@/components/home/category-pill'
import { HomeSectionHeader } from '@/components/home/home-section-header'
import { AppText } from '@/components/ui/app-text'
import { spacing } from '@/design/tokens'
import { useLocale } from '@/hooks/use-locale'
import { getCategoryLabel, getCourseCategories } from '@/lib/home-categories'
import { homeListHref } from '@/lib/home-list-routes'
import type { CourseDTO } from '@/types/dto'

type Props = {
	courses?: CourseDTO[]
	selectedCategory: string | null
	onSelectCategory: (category: string | null) => void
}

export function CategoriesSection({
	courses,
	selectedCategory,
	onSelectCategory,
}: Props) {
	const { t } = useTranslation()
	const locale = useLocale()

	const categories = useMemo(() => getCourseCategories(courses), [courses])

	if (categories.length === 0) {
		return null
	}

	const onToggle = (category: string) => {
		onSelectCategory(selectedCategory === category ? null : category)
	}

	return (
		<View style={styles.wrap}>
			<HomeSectionHeader
				title={t('home.categories')}
				actionLabel={t('home.seeAll')}
				onAction={() =>
					router.push(
						selectedCategory
							? homeListHref({ list: 'category', category: selectedCategory })
							: homeListHref({ list: 'categories' }),
					)
				}
			/>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.rail}>
				{categories.map((cat) => (
					<CategoryPill
						key={cat}
						label={getCategoryLabel(cat, locale)}
						selected={selectedCategory === cat}
						onPress={() => onToggle(cat)}
					/>
				))}
			</ScrollView>
			{selectedCategory ? (
				<AppText variant="small" color="secondary" style={styles.filterHint}>
					{t('home.filterActive', {
						category: getCategoryLabel(selectedCategory, locale),
					})}
				</AppText>
			) : null}
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		paddingHorizontal: spacing.lg,
		marginTop: spacing.xl,
	},
	rail: {
		gap: spacing.sm,
		paddingRight: spacing.lg,
	},
	filterHint: {
		marginTop: spacing.sm,
	},
})
