import { clerkSignOut } from '@/lib/clerk-token'
import { useAuthFlow } from '@/store/auth-flow-store'

type AuthRouter = {
	replace: (href: '/(auth)/splash') => void
}

export async function logOutToSplash(router: AuthRouter) {
	await clerkSignOut() // Clerk sessiyani tozalaydi (token cache ham)
	await useAuthFlow.getState().signOut() // legacy demo flag
	router.replace('/(auth)/splash')
}

export async function resetAuthToSplash(router: AuthRouter) {
	await clerkSignOut()
	await useAuthFlow.getState().resetAuthExperience()
	router.replace('/(auth)/splash')
}
