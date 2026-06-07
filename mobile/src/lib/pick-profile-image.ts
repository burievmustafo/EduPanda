import * as ImagePicker from 'expo-image-picker'

export type PickedProfileImage = {
	uri: string
	base64: string
}

export type PickProfileImageResult = PickedProfileImage | 'permission_denied' | null

/** Galereyadan profil rasmini tanlaydi (base64 bilan). */
export async function pickProfileImageFromLibrary(): Promise<PickProfileImageResult> {
	const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
	if (!permission.granted) {
		return 'permission_denied'
	}

	const result = await ImagePicker.launchImageLibraryAsync({
		mediaTypes: ['images'],
		allowsEditing: true,
		aspect: [1, 1],
		quality: 0.85,
		base64: true,
	})

	if (result.canceled || !result.assets[0]?.uri) {
		return null
	}

	const asset = result.assets[0]
	if (!asset.base64) {
		return null
	}

	const mime = asset.mimeType?.includes('png') ? 'image/png' : 'image/jpeg'
	const dataUrl = `data:${mime};base64,${asset.base64}`

	return {
		uri: asset.uri,
		base64: dataUrl,
	}
}
