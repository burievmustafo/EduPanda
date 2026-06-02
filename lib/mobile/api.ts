import { auth, currentUser } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import User from '@/database/user.model'
import { connectToDatabase } from '@/lib/mongoose'

// Mobil API uchun markaziy auth, rollar va javob formatlari.
// Manba: DATABASE_AND_API_PLAN.md §6.

export type Role = 'student' | 'teacher' | 'parent' | 'admin'

export class ApiError extends Error {
	status: number
	code: string
	constructor(status: number, code: string, message: string) {
		super(message)
		this.status = status
		this.code = code
	}
}

// Eski role qiymatlarini yangi enumga moslaydi (DATABASE_AND_API_PLAN.md §2.3).
export function mapRole(user: any): Role {
	if (user?.role === 'admin' || user?.isAdmin) return 'admin'
	if (user?.role === 'teacher' || user?.role === 'instructor') return 'teacher'
	if (user?.role === 'parent') return 'parent'
	return 'student'
}

/**
 * So'rovni autentifikatsiya qiladi va User hujjatini qaytaradi.
 * - Real: Clerk Bearer token (auth().userId).
 * - Dev test: `x-dev-clerk-id` header (faqat NODE_ENV !== 'production').
 */
export async function requireUser(req: Request) {
	await connectToDatabase()

	let clerkId: string | null = null
	try {
		clerkId = auth().userId
	} catch {
		clerkId = null
	}
	const isRealAuth = Boolean(clerkId)

	if (!clerkId && process.env.NODE_ENV !== 'production') {
		clerkId = req.headers.get('x-dev-clerk-id')
	}
	if (!clerkId) {
		throw new ApiError(401, 'unauthorized', 'Authentication required')
	}

	let user = await User.findOne({ clerkId })

	// Create-on-first-request: real Clerk user birinchi marta kirsa, DB'da yaratamiz.
	if (!user && isRealAuth) {
		const cu = await currentUser()
		if (cu) {
			user = await User.create({
				clerkId,
				email: cu.emailAddresses?.[0]?.emailAddress,
				fullName:
					[cu.firstName, cu.lastName].filter(Boolean).join(' ').trim() || 'User',
				picture: cu.imageUrl,
				role: (cu.publicMetadata?.role as string) || 'student',
			})
		}
	}

	if (!user) {
		throw new ApiError(401, 'user_not_found', 'User not found')
	}
	return { user, role: mapRole(user) }
}

export function ok(data: unknown) {
	return NextResponse.json(data)
}

export function handleError(err: unknown) {
	if (err instanceof ApiError) {
		return NextResponse.json(
			{ code: err.code, message: err.message },
			{ status: err.status }
		)
	}
	console.error('Mobile API error:', err)
	return NextResponse.json(
		{ code: 'server_error', message: 'Internal error' },
		{ status: 500 }
	)
}
