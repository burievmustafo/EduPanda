import { create } from 'zustand'

import { queryClient } from '@/lib/query-client'
import type { UserRole } from '@/types/dto'

/**
 * Demo sessiya (M3 bosqich 1).
 * Role tanlanganда tegishli seed foydalanuvchi sifatida ishlaymiz
 * (dev `x-dev-clerk-id` header orqali). M3 bosqich 2 da Clerk real token bilan almashadi.
 */
type SessionState = {
	role: UserRole
	devClerkId: string
	setRole: (role: UserRole) => void
}

const DEV_IDS: Record<UserRole, string> = {
	student: 'seed_student_edupanda',
	teacher: 'seed_teacher_edupanda',
	parent: 'seed_parent_edupanda',
	admin: 'seed_student_edupanda',
}

export const useSession = create<SessionState>((set) => ({
	role: 'student',
	devClerkId: DEV_IDS.student,
	setRole: (role) => {
		set({ role, devClerkId: DEV_IDS[role] })
		// Yangi identity — eski keshni tozalaymiz.
		queryClient.clear()
	},
}))
