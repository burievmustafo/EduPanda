import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { figmaAuth } from '@/constants/figma-auth-theme'
import { spacing } from '@/design/tokens'

type Props = {
	labelKey?: 'auth.orSignInWith' | 'auth.orSignUpWith'
}

export function AuthDivider({ labelKey = 'auth.orSignInWith' }: Props) {
	const { t } = useTranslation()

	return (
		<View style={styles.row}>
			<View style={styles.line} />
			<AppText variant="captionStrong" style={styles.label}>
				{t(labelKey)}
			</AppText>
			<View style={styles.line} />
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		marginVertical: spacing.lg,
	},
	line: {
		flex: 1,
		height: 1,
		backgroundColor: '#C4C4C4',
	},
	label: {
		color: figmaAuth.heading,
	},
})
