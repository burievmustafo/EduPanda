import { Ionicons } from '@expo/vector-icons'
import { Image, StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { getCoursePreviewImageUri } from '@/lib/course-preview-image'

type CoursePreviewImageProps = {
	uri?: string | null
	style?: StyleProp<ImageStyle>
	containerStyle?: StyleProp<ViewStyle>
	label?: string
	iconSize?: number
	labelSize?: number
}

export function CoursePreviewImage({
	uri,
	style,
	containerStyle,
	label = 'No Image',
	iconSize = 24,
	labelSize = 7,
}: CoursePreviewImageProps) {
	const theme = useFigmaTheme()
	const resolved = getCoursePreviewImageUri(uri)

	if (resolved) {
		return (
			<Image
				source={{ uri: resolved }}
				style={style}
				resizeMode="cover"
				accessibilityIgnoresInvertColors
			/>
		)
	}

	return (
		<View
			style={[
				styles.placeholder,
				{ backgroundColor: theme.progressTrack },
				containerStyle,
				style as ViewStyle,
			]}>
			<Ionicons name="image-outline" size={iconSize} color={theme.textMuted} />
			<AppText variant="small" style={{ color: theme.textMuted, fontSize: labelSize }}>
				{label}
			</AppText>
		</View>
	)
}

const styles = StyleSheet.create({
	placeholder: {
		alignItems: 'center',
		justifyContent: 'center',
		gap: 2,
	},
})
