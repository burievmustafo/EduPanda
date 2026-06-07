import * as SecureStore from 'expo-secure-store'

/**
 * Clerk token cache — sessiya tokenini xavfsiz saqlash (expo-secure-store).
 * ClerkProvider'ga beriladi. App reloaddan keyin ham login saqlanadi.
 */
export const tokenCache = {
	async getToken(key: string) {
		try {
			return await SecureStore.getItemAsync(key)
		} catch {
			return null
		}
	},
	async saveToken(key: string, value: string) {
		try {
			await SecureStore.setItemAsync(key, value)
		} catch {
			// jim
		}
	},
	async clearToken(key: string) {
		try {
			await SecureStore.deleteItemAsync(key)
		} catch {
			// jim
		}
	},
}
