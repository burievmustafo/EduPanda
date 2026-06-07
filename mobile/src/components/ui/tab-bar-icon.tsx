import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, View } from 'react-native'

import { colors, layout, radius } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'

type IoniconName = keyof typeof Ionicons.glyphMap

type TabBarIconProps = {
	name: IoniconName
	focused: boolean
}

/** Coursera-style active pill + EduPanda brand colors */
export function TabBarIcon({ name, focused }: TabBarIconProps) {
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')
	const activeName = name.replace('-outline', '') as IoniconName

	return (
		<View style={[styles.wrap, focused && styles.wrapActive]}>
			<Ionicons
				name={focused ? activeName : name}
				size={26}
				color={focused ? colors.primary : palette.tabInactive}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		width: layout.tabActivePillWidth,
		height: layout.tabActivePillHeight,
		borderRadius: radius.full,
		alignItems: 'center',
		justifyContent: 'center',
	},
	wrapActive: {
		backgroundColor: colors.accentPurpleSoft,
	},
})
