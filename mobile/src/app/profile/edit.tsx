import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { router, Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Alert,
	Image,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native'

import { updateMe, uploadProfileAvatar } from '@/api/me'
import {
	ProfileActionButton,
	ProfileSubpage,
} from '@/components/profile/profile-subpage'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { layout, spacing } from '@/design/tokens'
import { useMe } from '@/hooks/queries'
import { pickProfileImageFromLibrary } from '@/lib/pick-profile-image'
import { resolveProfilePictureUri } from '@/lib/profile-picture'
import { queryClient } from '@/lib/query-client'

export default function EditProfileScreen() {
	const { t } = useTranslation()
	const theme = useFigmaTheme()
	const { data: me, isLoading } = useMe()
	const { user: clerkUser } = useUser()

	const [fullName, setFullName] = useState('')
	const [email, setEmail] = useState('')
	const [localPreview, setLocalPreview] = useState<string | null>(null)
	const [pendingBase64, setPendingBase64] = useState<string | null>(null)
	const [saving, setSaving] = useState(false)
	const [pickingPhoto, setPickingPhoto] = useState(false)

	useEffect(() => {
		if (!me) return
		setFullName(me.fullName ?? '')
		setEmail(me.email ?? '')
	}, [me])

	const avatarUri = resolveProfilePictureUri(
		me?.picture,
		clerkUser?.imageUrl,
		localPreview,
	)

	const onPickPhoto = async () => {
		setPickingPhoto(true)
		try {
			const picked = await pickProfileImageFromLibrary()
			if (picked === 'permission_denied') {
				Alert.alert(t('profile.editProfile'), t('profile.photoPermissionDenied'))
				return
			}
			if (!picked) return
			setLocalPreview(picked.uri)
			setPendingBase64(picked.base64)
		} finally {
			setPickingPhoto(false)
		}
	}

	const onSave = async () => {
		const name = fullName.trim()
		const mail = email.trim()
		if (!name || !mail) {
			Alert.alert(t('profile.editProfile'), t('profile.editRequired'))
			return
		}

		setSaving(true)
		try {
			if (pendingBase64) {
				await uploadProfileAvatar(pendingBase64)
			}
			await updateMe({ fullName: name, email: mail })
			await queryClient.invalidateQueries({ queryKey: ['me'] })
			await clerkUser?.reload()
			setPendingBase64(null)
			setLocalPreview(null)
			router.back()
		} catch (error) {
			Alert.alert(
				t('profile.editProfile'),
				error instanceof Error ? error.message : t('common.retry'),
			)
		} finally {
			setSaving(false)
		}
	}

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<ProfileSubpage title={t('profile.editProfile')}>
				{isLoading ? (
					<View style={styles.loading}>
						<ActivityIndicator size="large" color={theme.accent} />
					</View>
				) : (
					<KeyboardAvoidingView
						style={styles.flex}
						behavior={Platform.OS === 'ios' ? 'padding' : undefined}
						keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
						<ScrollView
							contentContainerStyle={styles.scroll}
							keyboardShouldPersistTaps="handled"
							showsVerticalScrollIndicator={false}>
							<AppText variant="body" style={{ color: theme.textMuted, lineHeight: 22 }}>
								{t('profile.editProfileDesc')}
							</AppText>

							<View style={styles.photoSection}>
								<Pressable
									onPress={() => void onPickPhoto()}
									disabled={pickingPhoto || saving}
									style={({ pressed }) => [
										styles.avatarWrap,
										{ backgroundColor: theme.notificationCardBg },
										pressed && styles.pressed,
									]}
									accessibilityRole="button"
									accessibilityLabel={t('profile.changePhoto')}>
									{avatarUri ? (
										<Image source={{ uri: avatarUri }} style={styles.avatarImage} />
									) : (
										<View style={[styles.avatarPlaceholder, { backgroundColor: theme.accent }]}>
											<AppText variant="h2" style={{ color: theme.buttonText, fontWeight: '800' }}>
												{getInitials(fullName || me?.fullName)}
											</AppText>
										</View>
									)}
									<View style={[styles.cameraBadge, { backgroundColor: theme.buttonBg }]}>
										{pickingPhoto ? (
											<ActivityIndicator size="small" color={theme.buttonText} />
										) : (
											<Ionicons name="camera" size={18} color={theme.buttonText} />
										)}
									</View>
								</Pressable>
								<Pressable onPress={() => void onPickPhoto()} disabled={pickingPhoto || saving}>
									<AppText variant="bodyStrong" style={{ color: theme.accent, textAlign: 'center' }}>
										{t('profile.changePhoto')}
									</AppText>
								</Pressable>
							</View>

							<View
								style={[
									styles.formCard,
									{
										backgroundColor: theme.surface,
										borderColor: theme.notificationCardBg,
										shadowColor: theme.cardShadow,
									},
								]}>
								<Field
									label={t('profile.fullName')}
									value={fullName}
									onChangeText={setFullName}
									placeholder="Sidra Idrees"
									theme={theme}
								/>
								<Field
									label={t('profile.email')}
									value={email}
									onChangeText={setEmail}
									placeholder="youremail@gmail.com"
									keyboardType="email-address"
									autoCapitalize="none"
									theme={theme}
								/>
							</View>

							{saving ? (
								<View style={styles.savingRow}>
									<ActivityIndicator color={theme.accent} />
									<AppText variant="body" style={{ color: theme.textMuted }}>
										{t('common.loading')}
									</AppText>
								</View>
							) : (
								<ProfileActionButton title={t('common.save')} onPress={() => void onSave()} />
							)}
						</ScrollView>
					</KeyboardAvoidingView>
				)}
			</ProfileSubpage>
		</>
	)
}

function Field({
	label,
	theme,
	...props
}: {
	label: string
	theme: ReturnType<typeof useFigmaTheme>
	value: string
	onChangeText: (v: string) => void
	placeholder: string
	keyboardType?: 'default' | 'email-address'
	autoCapitalize?: 'none' | 'sentences'
}) {
	return (
		<View style={styles.field}>
			<AppText variant="small" style={{ color: theme.heading, fontWeight: '700' }}>
				{label}
			</AppText>
			<TextInput
				{...props}
				placeholderTextColor={theme.textMuted}
				style={[
					styles.input,
					{
						borderColor: theme.progressTrack,
						color: theme.heading,
						backgroundColor: theme.background,
					},
				]}
			/>
		</View>
	)
}

function getInitials(name?: string | null): string {
	if (!name) return '?'
	const parts = name.trim().split(/\s+/)
	if (parts.length >= 2) {
		return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
	}
	return (parts[0]?.[0] ?? '?').toUpperCase()
}

const styles = StyleSheet.create({
	flex: { flex: 1 },
	scroll: {
		flexGrow: 1,
		gap: spacing.lg,
		paddingBottom: spacing['4xl'],
	},
	loading: {
		paddingVertical: spacing['5xl'],
		alignItems: 'center',
	},
	photoSection: {
		alignItems: 'center',
		gap: spacing.md,
		paddingVertical: spacing.md,
	},
	avatarWrap: {
		width: 120,
		height: 120,
		borderRadius: 60,
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarImage: {
		width: '100%',
		height: '100%',
	},
	avatarPlaceholder: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cameraBadge: {
		position: 'absolute',
		right: 4,
		bottom: 4,
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
	},
	formCard: {
		borderRadius: 12,
		borderWidth: 1,
		padding: spacing.lg,
		gap: spacing.lg,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	field: { gap: spacing.xs },
	input: {
		minHeight: layout.settingsRowHeight * 0.6,
		borderRadius: 10,
		borderWidth: 1,
		paddingHorizontal: spacing.md,
		fontSize: 16,
	},
	pressed: { opacity: 0.88 },
	savingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.md,
		minHeight: 46,
	},
})
