import { Dimensions, type KeyboardEvent } from 'react-native'

/**
 * Klaviatura qancha joy egallaganini hisoblaydi (ekran pastidan).
 * Android `resize` rejimida oyna allaqachon qisqaradi → ~0 (qo‘shimcha margin kerak emas).
 */
export function getKeyboardBottomInset(event: KeyboardEvent): number {
	const { screenY } = event.endCoordinates
	const windowHeight = Dimensions.get('window').height
	const overlap = Math.max(0, windowHeight - screenY)
	// Juda kichik qiymat — resize allaqachon hisobga olingan
	if (overlap < 8) return 0
	return Math.ceil(overlap)
}
