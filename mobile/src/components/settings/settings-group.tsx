import { StyleSheet, View, type ViewProps } from 'react-native'

import { AppCard } from '@/components/ui/app-card'

export function SettingsGroup({ children, style, ...rest }: ViewProps) {
	return (
		<AppCard style={[styles.group, style]} padding={0} {...rest}>
			<View>{children}</View>
		</AppCard>
	)
}

const styles = StyleSheet.create({
	group: { overflow: 'hidden' },
})
