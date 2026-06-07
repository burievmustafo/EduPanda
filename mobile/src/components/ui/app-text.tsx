import { Text, type TextProps, type TextStyle } from 'react-native'

import { typography, type TypographyVariant } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'

type AppTextProps = TextProps & {
	variant?: TypographyVariant
	color?: 'primary' | 'secondary' | 'tertiary' | 'brand' | 'danger' | 'success'
}

export function AppText({
	variant = 'body',
	color = 'primary',
	style,
	...rest
}: AppTextProps) {
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')
	const t = typography[variant]

	const colorMap = {
		primary: palette.textPrimary,
		secondary: palette.textSecondary,
		tertiary: palette.textTertiary,
		brand: palette.primary,
		danger: palette.danger,
		success: palette.success,
	}

	return (
		<Text
			style={[
				{
					fontSize: t.fontSize,
					lineHeight: t.lineHeight,
					fontWeight: t.fontWeight,
					color: colorMap[color],
				},
				style as TextStyle,
			]}
			{...rest}
		/>
	)
}
