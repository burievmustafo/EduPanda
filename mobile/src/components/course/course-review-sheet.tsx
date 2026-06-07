import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native'

import { getCourseReview, submitCourseReview } from '@/api/learning'
import { AppButton } from '@/components/ui/app-button'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { colors, radius, spacing } from '@/design/tokens'

type Props = {
	visible: boolean
	courseId: string
	onClose: () => void
}

function StarRow({
	rating,
	onChange,
}: {
	rating: number
	onChange: (n: number) => void
}) {
	return (
		<View style={styles.stars}>
			{[1, 2, 3, 4, 5].map((n) => (
				<Pressable key={n} onPress={() => onChange(n)} hitSlop={8}>
					<Ionicons
						name={n <= rating ? 'star' : 'star-outline'}
						size={32}
						color="#E59819"
					/>
				</Pressable>
			))}
		</View>
	)
}

export function CourseReviewSheet({ visible, courseId, onClose }: Props) {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const [rating, setRating] = useState(0)
	const [text, setText] = useState('')
	const [loading, setLoading] = useState(false)
	const [saving, setSaving] = useState(false)
	const [isEdit, setIsEdit] = useState(false)

	useEffect(() => {
		if (!visible || !courseId) return
		let cancelled = false
		setLoading(true)
		void getCourseReview(courseId)
			.then((res) => {
				if (cancelled) return
				if (res.review) {
					setRating(res.review.rating)
					setText(res.review.data)
					setIsEdit(true)
				} else {
					setRating(0)
					setText('')
					setIsEdit(false)
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [visible, courseId])

	const handleSubmit = async () => {
		if (rating < 1) return
		if (text.trim().length < 3) return
		setSaving(true)
		try {
			await submitCourseReview(courseId, { rating, data: text.trim() })
			onClose()
		} finally {
			setSaving(false)
		}
	}

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<Pressable style={styles.backdrop} onPress={onClose}>
				<Pressable
					style={[styles.sheet, { backgroundColor: theme.surface }]}
					onPress={(e) => e.stopPropagation()}>
					<AppText variant="h3" style={[styles.title, { color: theme.heading }]}>
						{isEdit
							? t('courseDashboard.review.editTitle')
							: t('courseDashboard.review.title')}
					</AppText>
					<AppText variant="caption" style={[styles.subtitle, { color: theme.textMuted }]}>
						{t('courseDashboard.review.subtitle')}
					</AppText>

					<StarRow rating={rating} onChange={setRating} />

					{rating > 0 ? (
						<TextInput
							value={text}
							onChangeText={setText}
							placeholder={t('courseDashboard.review.placeholder')}
							placeholderTextColor={theme.textMuted}
							multiline
							style={[
								styles.input,
								{
									backgroundColor: theme.notificationCardBg,
									color: theme.heading,
									borderColor: theme.cardBorder,
								},
							]}
						/>
					) : (
						<AppText variant="caption" style={{ color: theme.textMuted }}>
							{t('courseDashboard.review.pickStars')}
						</AppText>
					)}

					<AppButton
						title={
							saving
								? t('common.loading')
								: isEdit
									? t('courseDashboard.review.update')
									: t('courseDashboard.review.submit')
						}
						onPress={() => void handleSubmit()}
						disabled={loading || saving || rating < 1 || text.trim().length < 3}
						style={styles.submit}
					/>
					<AppButton
						title={t('courseDashboard.options.close')}
						variant="outline"
						onPress={onClose}
					/>
				</Pressable>
			</Pressable>
		</Modal>
	)
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: colors.overlayDark,
		justifyContent: 'flex-end',
	},
	sheet: {
		borderTopLeftRadius: radius['2xl'],
		borderTopRightRadius: radius['2xl'],
		paddingTop: spacing['3xl'],
		paddingHorizontal: spacing['2xl'],
		paddingBottom: spacing['4xl'],
	},
	title: { textAlign: 'center' },
	subtitle: { textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
	stars: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	input: {
		minHeight: 120,
		borderRadius: radius.lg,
		borderWidth: 1,
		padding: spacing.md,
		textAlignVertical: 'top',
		marginBottom: spacing.lg,
	},
	submit: { marginBottom: spacing.sm },
})
