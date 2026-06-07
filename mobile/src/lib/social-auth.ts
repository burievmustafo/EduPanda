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

/** Clerk Dashboard → Redirect URLs ga shu manzilni qo'shing. */
export function getOAuthRedirectUrl() {
	return AuthSession.makeRedirectUri({
		scheme: 'edupanda',
		path: 'sso-callback',
	})
}

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
			const redirectUrl = getOAuthRedirectUrl()
			const { createdSessionId, setActive, authSessionResult } = await startSSOFlow({
				strategy,
				redirectUrl,
			})

			if (createdSessionId && setActive) {
				await setActive({ session: createdSessionId })
				return true
			}

			if (authSessionResult?.type === 'cancel' || authSessionResult?.type === 'dismiss') {
				return false
			}

			throw new Error(
				`OAuth did not complete. Add this redirect URL in Clerk Dashboard: ${redirectUrl}`,
			)
		},
		[startSSOFlow]
	)
}
