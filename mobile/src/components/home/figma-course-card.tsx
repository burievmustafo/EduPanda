import { Ionicons } from '@expo/vector-icons'

import { Image, Pressable, StyleSheet, View } from 'react-native'



import { AppText } from '@/components/ui/app-text'

import { useFigmaTheme } from '@/design/figma-theme'

import { spacing } from '@/design/tokens'

import { categoryColor } from '@/lib/category-colors'
import { getFigmaMockRating } from '@/lib/figma-mock-rating'

import { useLocale } from '@/hooks/use-locale'

import { tText } from '@/lib/localized'

import type { CourseDTO } from '@/types/dto'



type Props = {

	course: CourseDTO

	onPress: () => void

	onBookmarkPress?: () => void
	saved?: boolean
}



const CARD_WIDTH = 130



export function FigmaCourseCard({ course, onPress, onBookmarkPress, saved }: Props) {

	const locale = useLocale()
	const theme = useFigmaTheme()

	const rating = getFigmaMockRating(course.id)
	const thumbColor = categoryColor(course.category)

	return (

		<Pressable

			onPress={onPress}

			style={({ pressed }) => [styles.card, pressed && styles.pressed]}

			accessibilityRole="button">

			<View style={[styles.posterWrap, { backgroundColor: theme.progressTrack }]}>

				{course.previewImage ? (

					<Image

						source={{ uri: course.previewImage }}

						style={styles.poster}

						resizeMode="cover"

						accessibilityIgnoresInvertColors

					/>

				) : (

					<View style={[styles.posterPlaceholder, { backgroundColor: thumbColor }]} />

				)}

				<Pressable

					onPress={onBookmarkPress}

					style={styles.bookmark}

					hitSlop={8}

					accessibilityRole="button"

					accessibilityLabel="Save course">

					<Ionicons
						name={saved ? 'bookmark' : 'bookmark-outline'}
						size={18}
						color={theme.heading}
					/>

				</Pressable>

			</View>

			<AppText variant="captionStrong" style={[styles.title, { color: theme.heading }]} numberOfLines={2}>

				{tText(course.title, locale)}

			</AppText>

			<AppText variant="small" style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={1}>

				{course.instructor.fullName}

			</AppText>

			<View style={styles.ratingRow}>

				<Ionicons name="star" size={10} color={theme.accent} />

				<AppText variant="small" style={[styles.ratingText, { color: theme.heading }]}>

					{rating}

				</AppText>

			</View>

		</Pressable>

	)

}



const styles = StyleSheet.create({

	card: {

		width: CARD_WIDTH,

	},

	pressed: { opacity: 0.9 },

	posterWrap: {

		width: CARD_WIDTH,

		height: 92,

		borderRadius: 5,

		overflow: 'hidden',

	},

	poster: {

		width: '100%',

		height: '100%',

	},

	posterPlaceholder: {
		width: '100%',
		height: '100%',
		opacity: 0.92,
	},

	bookmark: {

		position: 'absolute',

		top: 6,

		right: 6,

	},

	title: {

		marginTop: spacing.xs,

		fontSize: 11,

		fontWeight: '600',

		letterSpacing: 0.22,

	},

	subtitle: {

		marginTop: 2,

		fontSize: 8,

		letterSpacing: 0.16,

	},

	ratingRow: {

		flexDirection: 'row',

		alignItems: 'center',

		gap: 2,

		marginTop: 2,

	},

	ratingText: {

		fontSize: 6,

		letterSpacing: 0.12,

	},

})


