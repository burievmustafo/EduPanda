import { Ionicons } from '@expo/vector-icons'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useEffect, useState } from 'react'
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { figmaTabBar } from '@/constants/figma-tab-bar-theme'
import { useFigmaTheme } from '@/design/figma-theme'

type IoniconName = keyof typeof Ionicons.glyphMap

const TAB_ICONS: Record<string, { outline: IoniconName; filled: IoniconName }> = {
	home: { outline: 'home-outline', filled: 'home' },
	learning: { outline: 'library-outline', filled: 'library' },
	inbox: { outline: 'chatbubbles-outline', filled: 'chatbubbles' },
	profile: { outline: 'person-circle-outline', filled: 'person-circle' },
}

const TAB_LABELS: Record<string, string> = {
	home: 'Home',
	learning: 'My Courses',
	inbox: 'AI',
	profile: 'Profile',
}

export function FigmaBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()
	const bottomPad = Platform.OS === 'ios' ? insets.bottom : 0

	const [keyboardVisible, setKeyboardVisible] = useState(false)
	useEffect(() => {
		if (Platform.OS !== 'android') return
		const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true))
		const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false))
		return () => {
			show.remove()
			hide.remove()
		}
	}, [])

	if (Platform.OS === 'android' && keyboardVisible) return null

	return (
		<View
			style={[
				styles.bar,
				{
					paddingBottom: bottomPad,
					backgroundColor: theme.tabBarBg,
					borderTopColor: theme.tabBarBg,
				},
			]}>
			{state.routes.map((route, index) => {
				const focused = state.index === index
				const icons = TAB_ICONS[route.name] ?? TAB_ICONS.home
				const a11yLabel =
					typeof descriptors[route.key].options.tabBarAccessibilityLabel === 'string'
						? descriptors[route.key].options.tabBarAccessibilityLabel
						: TAB_LABELS[route.name] ?? route.name

				const onPress = () => {
					const event = navigation.emit({
						type: 'tabPress',
						target: route.key,
						canPreventDefault: true,
					})
					if (!focused && !event.defaultPrevented) {
						navigation.navigate(route.name, route.params)
					}
				}

				return (
					<Pressable
						key={route.key}
						onPress={onPress}
						style={styles.item}
						accessibilityRole="button"
						accessibilityState={focused ? { selected: true } : {}}
						accessibilityLabel={a11yLabel}>
						<View style={styles.iconTile}>
							<Ionicons
								name={focused ? icons.filled : icons.outline}
								size={focused ? 29 : 27}
								color={focused ? theme.tabBarIcon : theme.tabBarInactiveIcon}
							/>
						</View>
					</Pressable>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	bar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
		borderTopWidth: StyleSheet.hairlineWidth,
		minHeight: figmaTabBar.height,
		paddingTop: 10,
		paddingHorizontal: 8,
	},
	item: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 44,
	},
	iconTile: {
		width: 42,
		height: 42,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
})
