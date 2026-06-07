/**
 * Clerk'ni hook'lardan tashqarida (API client, logout helper) ishlatish uchun ko'prik.
 * ClerkBridge komponenti `useAuth().getToken` va `signOut`ni shu yerga o'rnatadi.
 */
type TokenGetter = ((opts?: GetTokenOptions) => Promise<string | null>) | null

export type GetTokenOptions = { skipCache?: boolean }
type SignOut = (() => Promise<void>) | null

let getter: TokenGetter = null
let signOutFn: SignOut = null

export function setClerkTokenGetter(fn: TokenGetter) {
	getter = fn
}

export async function getClerkToken(
	opts?: GetTokenOptions
): Promise<string | null> {
	if (!getter) return null
	try {
		return await getter(opts)
	} catch {
		return null
	}
}

export function setClerkSignOut(fn: SignOut) {
	signOutFn = fn
}

export async function clerkSignOut(): Promise<void> {
	if (!signOutFn) return
	try {
		await signOutFn()
	} catch {
		// jim
	}
}
