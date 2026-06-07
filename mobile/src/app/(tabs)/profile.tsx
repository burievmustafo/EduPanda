import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Alert,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme, type FigmaTheme } from '@/design/figma-theme'
import { colors, spacing } from '@/design/tokens'
import { useMe } from '@/hooks/queries'
import { logOutToSplash } from '@/lib/auth-logout'
import { resolveProfilePictureUri } from '@/lib/profile-picture'

type ProfileMenuItem = {
	icon: keyof typeof Ionicons.glyphMap
	title: string
	onPress: () => void
	danger?: boolean
}

export default function ProfileTab() {
	const { t } = useTranslation()
	const insets = useSafeAreaInsets()
	const theme = useFigmaTheme()
	const { data: me, isLoading } = useMe()
	const { user: clerkUser } = useUser()

	const avatarUri = resolveProfilePictureUri(me?.picture, clerkUser?.imageUrl)

	const items: ProfileMenuItem[] = [
		{
			icon: 'card',
			title: t('profile.paymentMethod'),
			onPress: () => router.push('/profile/payment-method'),
		},
		{
			icon: 'desktop',
			title: t('profile.myCertificates'),
			onPress: () => router.push('/profile/certificates'),
		},
		{
			icon: 'settings-outline',
			title: t('settings.title'),
			onPress: () => router.push('/profile/help-center'),
		},
		{
			icon: 'paper-plane',
			title: t('profile.inviteFriends'),
			onPress: () => router.push('/profile/invite-friends'),
		},
		{
			icon: 'log-out',
			title: t('settings.logOut'),
			danger: true,
			onPress: () => {
				Alert.alert(t('settings.logOut'), t('settings.logOutConfirm'), [
					{ text: t('common.back'), style: 'cancel' },
					{
						text: t('settings.logOut'),
						style: 'destructive',
						onPress: () => void logOutToSplash(router),
					},
				])
			},
		},
	]

	return (
		<View style={[styles.screen, { paddingTop: insets.top, backgroundColor: theme.background }]}>
			<ScrollView
				contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
				showsVerticalScrollIndicator={false}>
				<AppText variant="title" style={[styles.title, { color: theme.heading }]}>
					{t('profile.myProfile')}
				</AppText>

				{isLoading ? (
					<View style={styles.loading}>
						<ActivityIndicator color={theme.accent} />
					</View>
				) : (
					<>
						<View style={styles.identityBlock}>
							<Pressable
								onPress={() => router.push('/profile/edit')}
								style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
								accessibilityRole="button">
								{avatarUri ? (
									<Image source={{ uri: avatarUri }} style={styles.avatarImage} />
								) : (
									<AppText variant="h2" style={styles.avatarLetter}>
										{getInitials(me?.fullName)}
									</AppText>
								)}
							</Pressable>

							<View style={styles.identityText}>
								<AppText variant="title" style={[styles.name, { color: theme.heading }]} numberOfLines={1}>
									{me?.fullName || '—'}
								</AppText>
								<AppText variant="caption" style={[styles.email, { color: theme.textMuted }]} numberOfLines={1}>
									{me?.email || ''}
								</AppText>
							</View>

							<Pressable
								onPress={() => router.push('/profile/edit')}
								hitSlop={12}
								style={styles.editButton}
								accessibilityRole="button"
								accessibilityLabel={t('profile.editProfile')}>
								<Ionicons name="pencil" size={24} color={theme.accent} />
							</Pressable>
						</View>

						<View style={[styles.divider, { backgroundColor: theme.progressTrack }]} />

						<View style={styles.menu}>
							{items.map((item) => (
								<MenuRow key={item.title} item={item} theme={theme} />
							))}
						</View>
					</>
				)}

				<View style={styles.footer}>
					<AppText variant="small" style={[styles.footerText, { color: theme.textMuted }]}>
						{t('profile.privacyPolicy')} · {t('profile.terms')}
					</AppText>
				</View>
			</ScrollView>
		</View>
	)
}

function MenuRow({ item, theme }: { item: ProfileMenuItem; theme: FigmaTheme }) {
	const color = item.danger ? theme.danger : theme.heading

	return (
		<Pressable
			onPress={item.onPress}
			style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
			accessibilityRole="button">
			<Ionicons name={item.icon} size={21} color={theme.accent} style={styles.menuIcon} />
			<AppText variant="bodyStrong" style={[styles.menuTitle, { color }]}>
				{item.title}
			</AppText>
			<Ionicons name="chevron-forward" size={24} color={theme.accent} />
		</Pressable>
	)
}

function getInitials(name?: string | null): string {
	if (!name) return '?'
	const parts = name.trim().split(/\s+/)
	if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
	return (parts[0]?.[0] ?? '?').toUpperCase()
}

const styles = StyleSheet.create({
	screen: { flex: 1 },
	content: {
		flexGrow: 1,
		paddingHorizontal: 28,
		paddingTop: spacing.lg,
	},
	title: {
		fontSize: 24,
		lineHeight: 32,
		fontWeight: '800',
		marginBottom: 42,
	},
	loading: { paddingVertical: spacing['4xl'] },
	identityBlock: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 28,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	avatarImage: { width: '100%', height: '100%' },
	avatarLetter: { color: colors.white, fontWeight: '800' },
	identityText: { flex: 1, marginLeft: spacing.md },
	name: { fontSize: 18, lineHeight: 24, fontWeight: '800' },
	email: { fontSize: 14, marginTop: 2 },
	editButton: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	divider: { height: StyleSheet.hairlineWidth, marginBottom: 26 },
	menu: { gap: 28 },
	menuRow: {
		minHeight: 32,
		flexDirection: 'row',
		alignItems: 'center',
	},
	menuIcon: { width: 30, marginRight: spacing.lg },
	menuTitle: {
		flex: 1,
		fontSize: 16,
		lineHeight: 22,
		fontWeight: '800',
		letterSpacing: 0.15,
	},
	footer: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
		paddingTop: spacing['5xl'],
	},
	footerText: { fontSize: 12 },
	pressed: { opacity: 0.86 },
})
