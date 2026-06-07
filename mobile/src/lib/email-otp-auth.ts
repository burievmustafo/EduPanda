import type { SignInResource, SignUpResource } from '@clerk/types'

export type EmailOtpMode = 'signIn' | 'signUp'

type ClerkErrorShape = {
	errors?: Array<{ code?: string; message?: string; longMessage?: string }>
}

function clerkErrorCode(err: unknown): string | undefined {
	return (err as ClerkErrorShape).errors?.[0]?.code
}

function randomPassword() {
	return `Ep_${Date.now()}_${Math.random().toString(36).slice(2, 10)}!Aa1`
}

function displayNameFromEmail(email: string, name?: string) {
	const trimmed = name?.trim()
	if (trimmed) return trimmed
	return email.split('@')[0] || 'Student'
}

/** Mavjud user — email_code yuborish. */
async function startSignInOtp(signIn: SignInResource, email: string) {
	await signIn.create({ identifier: email })

	const emailFactor = signIn.supportedFirstFactors?.find(
		(factor) => factor.strategy === 'email_code',
	)

	if (!emailFactor || !('emailAddressId' in emailFactor)) {
		throw new Error('GOOGLE_ONLY')
	}

	await signIn.prepareFirstFactor({
		strategy: 'email_code',
		emailAddressId: emailFactor.emailAddressId,
	})
}

/** Yangi user — parolsiz ro'yxat (ichki random parol) + email_code. */
async function startSignUpOtp(signUp: SignUpResource, email: string, name?: string) {
	await signUp.create({
		emailAddress: email,
		password: randomPassword(),
		firstName: displayNameFromEmail(email, name),
	})
	await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
}

/**
 * Emailga 6 xonali kod yuboradi.
 * User bor bo'lsa — sign-in, yo'q bo'lsa — avtomatik sign-up.
 */
export async function requestEmailOtp(
	email: string,
	signIn: SignInResource,
	signUp: SignUpResource,
	name?: string,
): Promise<EmailOtpMode> {
	const normalized = email.trim().toLowerCase()

	try {
		await startSignInOtp(signIn, normalized)
		return 'signIn'
	} catch (err) {
		const code = clerkErrorCode(err)
		if (code === 'form_identifier_not_found') {
			await startSignUpOtp(signUp, normalized, name)
			return 'signUp'
		}
		if (err instanceof Error && err.message === 'GOOGLE_ONLY') {
			throw err
		}
		throw err
	}
}

export async function verifyEmailOtp(
	mode: EmailOtpMode,
	code: string,
	signIn: SignInResource,
	signUp: SignUpResource,
) {
	const trimmedCode = code.trim()

	if (mode === 'signIn') {
		const attempt = await signIn.attemptFirstFactor({
			strategy: 'email_code',
			code: trimmedCode,
		})
		return { status: attempt.status, sessionId: attempt.createdSessionId }
	}

	const attempt = await signUp.attemptEmailAddressVerification({ code: trimmedCode })
	return { status: attempt.status, sessionId: attempt.createdSessionId }
}
