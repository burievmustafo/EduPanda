import Constants from 'expo-constants'

/**
 * Mobil ilova konfiguratsiyasi.
 *
 * API_URL — Next.js backend (`/en/api/mobile`). Telefon MongoDB ga emas, shu API ga ulanadi.
 *
 * Dev: Metro qaysi LAN IP'da ishlayotgan bo'lsa, har so'rovda shu IP ishlatiladi (WiFi o'zgarsa reload kifoya).
 * Production: mobile/.env → EXPO_PUBLIC_API_URL=https://YOUR-APP.vercel.app/en/api/mobile
 */

const API_PORT = Number(process.env.EXPO_PUBLIC_API_PORT) || 3000
const API_PATH = '/en/api/mobile'

let lastLoggedApiUrl: string | null = null

/** Expo Metro dev-server LAN IP (masalan 10.69.34.119). */
export function getMetroLanHost(): string | null {
	const candidates: Array<string | undefined> = [
		Constants.expoConfig?.hostUri,
		(Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost,
		(Constants.expoGoConfig as { hostUri?: string } | undefined)?.hostUri,
		Constants.experienceUrl,
		(Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost,
		(Constants.manifest2 as { extra?: { expoClient?: { hostUri?: string } } } | null)
			?.extra?.expoClient?.hostUri,
	]

	for (const raw of candidates) {
		if (!raw) continue
		const host = String(raw)
			.replace(/^[a-z]+:\/\//i, '')
			.split('/')[0]
			.split('?')[0]
			.split(':')[0]
			?.trim()
		if (host && host !== 'localhost' && host !== '127.0.0.1') {
			return host
		}
	}
	return null
}

function isLanLikeUrl(url: string): boolean {
	return /^https?:\/\/(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(
		url
	)
}

function buildLanApiUrl(host: string): string {
	return `http://${host}:${API_PORT}${API_PATH}`
}

/**
 * Har chaqiruvda (dev) yangilangan API manzili — import vaqtida eski IP qotib qolmaydi.
 */
export function getApiUrl(): string {
	const envUrl = process.env.EXPO_PUBLIC_API_URL

	if (envUrl && !isLanLikeUrl(envUrl)) {
		return envUrl
	}

	if (__DEV__) {
		const host = getMetroLanHost()
		if (host) {
			const url = buildLanApiUrl(host)
			if (__DEV__ && url !== lastLoggedApiUrl) {
				lastLoggedApiUrl = url
				console.log(`[EduPanda] API_URL → ${url}`)
			}
			return url
		}
	}

	if (envUrl) {
		return envUrl
	}

	throw new Error(
		__DEV__
			? '[config] API_URL aniqlanmadi. Expo Metro host topilmadi — telefon va PC bir WiFi, yoki mobile/.env.local da EXPO_PUBLIC_API_URL yozing.'
			: '[config] EXPO_PUBLIC_API_URL belgilanmagan (production build).'
	)
}

/** @deprecated Dev'da getApiUrl() ishlating — bu import vaqtidagi snapshot. */
export const API_URL = getApiUrl()
