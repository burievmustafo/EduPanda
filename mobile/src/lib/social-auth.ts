import { useSSO } from '@clerk/clerk-expo'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { useCallback, useEffect } from 'react'

/**
 * Clerk OAuth (Google/Facebook) — web bilan AYNAN bir xil Clerk instance.
 *
 * Oqim: Clerk hosted OAuth brauzerda ochiladi → foydalanuvchi Google/Facebook
 * akkaunti bilan tasdiqlaydi → ilovaga `redirectUrl` orqali qaytadi → Clerk
 * sessiya yaratadi. O'sha Google akkaunti har doim o'sha Clerk user'ga
 * (bir xil clerkId) ulanadi, demak backend o'sha Mongo user va rolni qaytaradi.
 *
 * `makeRedirectUri()` muhitga avtomatik moslashadi:
 *  - Expo Go  → exp://<host>/--/...
 *  - dev build / APK → edupanda:// (app.json'dagi scheme)
 */

// OAuth'dan qaytganda ochiq brauzer sessiyasini yopadi — bo'lmasa ilova osilib qoladi.
WebBrowser.maybeCompleteAuthSession()

export type SocialStrategy = 'oauth_google' | 'oauth_facebook'

/** Android'da OAuth brauzerini oldindan isitadi (tezroq ochiladi). */
function useWarmUpBrowser() {
	useEffect(() => {
		void WebBrowser.warmUpAsync()
		return () => {
			void WebBrowser.coolDownAsync()
		}
	}, [])
}

/**
 * Social login hook'i. Muvaffaqiyatda Clerk sessiyasini faollashtiradi va
 * `true` qaytaradi (chaqiruvchi shundan keyin /(tabs)/home ga o'tkazadi).
 * Tugallanmagan holatda (qo'shimcha tekshiruv kerak) `false` qaytaradi.
 */
export function useSocialAuth() {
	useWarmUpBrowser()
	const { startSSOFlow } = useSSO()

	return useCallback(
		async (strategy: SocialStrategy): Promise<boolean> => {
			const { createdSessionId, setActive } = await startSSOFlow({
				strategy,
				redirectUrl: AuthSession.makeRedirectUri(),
			})

			if (createdSessionId && setActive) {
				await setActive({ session: createdSessionId })
				return true
			}

			// createdSessionId yo'q — masalan MFA yoki profil to'ldirish kerak.
			return false
		},
		[startSSOFlow]
	)
}
