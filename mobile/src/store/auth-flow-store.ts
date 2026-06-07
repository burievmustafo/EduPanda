import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

import { queryClient } from '@/lib/query-client'
import { useSession } from '@/store/session-store'

const ONBOARDING_KEY = '@edupanda/onboarding_complete'
const SIGNED_IN_KEY = '@edupanda/signed_in'

type AuthFlowState = {
	hydrated: boolean
	hasCompletedOnboarding: boolean
	isSignedIn: boolean
	hydrate: () => Promise<void>
	completeOnboarding: () => Promise<void>
	signInAsStudent: () => Promise<void>
	signOut: () => Promise<void>
	/** Splash + onboarding 1–4 qayta ko‘rsatish (demo). */
	resetAuthExperience: () => Promise<void>
}

export const useAuthFlow = create<AuthFlowState>((set) => ({
	hydrated: false,
	hasCompletedOnboarding: false,
	isSignedIn: false,

	hydrate: async () => {
		try {
			const [onboarding, signedIn] = await Promise.all([
				AsyncStorage.getItem(ONBOARDING_KEY),
				AsyncStorage.getItem(SIGNED_IN_KEY),
			])
			set({
				hasCompletedOnboarding: onboarding === '1',
				isSignedIn: signedIn === '1',
				hydrated: true,
			})
		} catch {
			set({ hydrated: true })
		}
	},

	completeOnboarding: async () => {
		await AsyncStorage.setItem(ONBOARDING_KEY, '1')
		set({ hasCompletedOnboarding: true })
	},

	signInAsStudent: async () => {
		useSession.getState().setRole('student')
		await AsyncStorage.setItem(SIGNED_IN_KEY, '1')
		set({ isSignedIn: true })
	},

	signOut: async () => {
		await AsyncStorage.removeItem(SIGNED_IN_KEY)
		queryClient.clear()
		set({ isSignedIn: false })
	},

	resetAuthExperience: async () => {
		await AsyncStorage.multiRemove([SIGNED_IN_KEY, ONBOARDING_KEY])
		queryClient.clear()
		set({ hasCompletedOnboarding: false, isSignedIn: false })
	},
}))
