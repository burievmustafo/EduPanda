import { auth, clerkClient } from '@clerk/nextjs'
import { verifyToken } from '@clerk/backend'
import { NextResponse } from 'next/server'
import User from '@/database/user.model'
import { connectToDatabase } from '@/lib/mongoose'

// Mobil API uchun markaziy auth, rollar va javob formatlari.
// Manba: DATABASE_AND_API_PLAN.md §6.

export type Role = 'student' | 'instructor' | 'admin'

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
	if (user?.role === 'teacher' || user?.role === 'instructor') return 'instructor'
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
	let devEmail: string | null = null
	let bearerVerified = false

	// 1) Mobil: Authorization: Bearer <Clerk session token>.
	//    Token Clerk JWKS orqali tekshiriladi, `sub` = User.clerkId.
	const authHeader =
		req.headers.get('authorization') || req.headers.get('Authorization')
	if (authHeader?.startsWith('Bearer ')) {
		const token = authHeader.slice(7).trim()
		if (token) {
			try {
				const verifyOpts = {
					secretKey: process.env.CLERK_SECRET_KEY as string,
					clockSkewInMs: 60_000,
				} as Parameters<typeof verifyToken>[1]
				if (process.env.CLERK_JWT_KEY) {
					verifyOpts.jwtKey = process.env.CLERK_JWT_KEY
				}
				const payload = await verifyToken(token, verifyOpts)
				clerkId = payload.sub ?? null
				bearerVerified = Boolean(clerkId)
			} catch (err) {
				if (process.env.NODE_ENV !== 'production') {
					console.warn('[mobile/api] Bearer verifyToken failed:', err)
				}
				clerkId = null
			}
		}
	}

	// 2) Web: Clerk cookie (auth()) — mobil API ignoredRoute, odatda null qaytaradi.
	if (!clerkId) {
		try {
			clerkId = auth().userId
		} catch {
			clerkId = null
		}
	}

	// 3) Dev fallback (faqat non-production): x-dev-* headerlar (Expo Go demo).
	if (!clerkId && process.env.NODE_ENV !== 'production') {
		clerkId = req.headers.get('x-dev-clerk-id')
		devEmail = req.headers.get('x-dev-email')
	}

	if (!clerkId && !devEmail) {
		throw new ApiError(401, 'unauthorized', 'Authentication required')
	}

	let user = devEmail
		? await User.findOne({
				email: {
					$regex: `^${devEmail.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
					$options: 'i',
				},
		  })
		: await User.findOne({ clerkId })

	// Create-on-first-request: token tasdiqlangan, lekin Mongo User yo'q bo'lsa
	// (yangi mobil sign-up, webhook hali ulgurmagan) — Clerk profilidan yaratamiz.
	if (!user && bearerVerified && clerkId) {
		user = await createUserFromClerk(clerkId)
	}

	if (!user) {
		throw new ApiError(401, 'user_not_found', 'User not found')
	}
	return { user, role: mapRole(user) }
}

// Clerk profilidan yangi Mongo User yaratadi (webhook fallback).
async function createUserFromClerk(clerkId: string) {
	try {
		const cu = await clerkClient.users.getUser(clerkId)
		const email =
			cu.emailAddresses?.find((e) => e.id === cu.primaryEmailAddressId)
				?.emailAddress ??
			cu.emailAddresses?.[0]?.emailAddress ??
			''
		const fullName =
			[cu.firstName, cu.lastName].filter(Boolean).join(' ').trim() ||
			(email ? email.split('@')[0] : 'User')

		// Email bo'yicha eski user bo'lsa, clerkId'ni bog'laymiz (web account migratsiyasi).
		if (email) {
			const existing = await User.findOne({
				email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
			})
			if (existing) {
				if (!existing.clerkId) {
					existing.clerkId = clerkId
					await existing.save()
				}
				return existing
			}
		}

		return await User.create({
			clerkId,
			email,
			fullName,
			picture: cu.imageUrl,
			role: 'student',
		})
	} catch {
		return null
	}
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
