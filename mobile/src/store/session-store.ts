import { create } from 'zustand'

import { queryClient } from '@/lib/query-client'
import type { UserRole } from '@/types/dto'

/**
 * Demo session. In dev mode the mobile API receives either x-dev-email
 * or x-dev-clerk-id, so web-granted course access can match mobile login.
 */
type SessionState = {
	role: UserRole
	devClerkId: string
	devEmail: string | null
	setRole: (role: UserRole) => void
	setDevEmail: (email: string | null) => void
}

const DEV_IDS: Record<UserRole, string> = {
	student: 'seed_student_edupanda',
	instructor: 'seed_teacher_edupanda',
	admin: 'seed_student_edupanda',
}

export const useSession = create<SessionState>((set) => ({
	role: 'student',
	devClerkId: DEV_IDS.student,
	devEmail: null,
	setRole: (role) => {
		set({ role, devClerkId: DEV_IDS[role] })
		queryClient.clear()
	},
	setDevEmail: (email) => {
		set({ devEmail: email?.trim().toLowerCase() || null })
		queryClient.clear()
	},
}))
