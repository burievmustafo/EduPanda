import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Share, StyleSheet, View } from 'react-native'

import {
	ProfileActionButton,
	ProfileInfoCard,
	ProfileSubpage,
} from '@/components/profile/profile-subpage'
import { AppText } from '@/components/ui/app-text'
import { figmaLight, useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'

export default function InviteFriendsScreen() {
	const { t } = useTranslation()
	const theme = useFigmaTheme()

	return (
		<ProfileSubpage title={t('profile.inviteFriends')}>
			<ProfileInfoCard>
				<View style={styles.heroIcon}>
					<Ionicons name="paper-plane" size={38} color={theme.accent} />
				</View>
				<AppText variant="title" style={[styles.title, { color: theme.heading }]}>
					{t('profile.inviteFriendsTitle')}
				</AppText>
				<AppText variant="body" style={[styles.desc, { color: theme.textMuted }]}>
					{t('profile.inviteFriendsDesc')}
				</AppText>

				<ProfileActionButton
					title={t('profile.shareInvite')}
					onPress={() =>
						void Share.share({
							message: t('profile.shareInviteMessage'),
						})
					}
				/>
			</ProfileInfoCard>
		</ProfileSubpage>
	)
}

const styles = StyleSheet.create({
	heroIcon: {
		width: 86,
		height: 86,
		borderRadius: 43,
		backgroundColor: figmaLight.notificationCardBg,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
		marginBottom: spacing.lg,
	},
	title: {
		color: figmaLight.heading,
		textAlign: 'center',
		fontWeight: '800',
	},
	desc: {
		color: figmaLight.textMuted,
		textAlign: 'center',
		marginTop: spacing.sm,
		lineHeight: 22,
	},
})
