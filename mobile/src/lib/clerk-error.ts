/** Clerk xato obyektidan o'qiladigan xabar chiqaradi. */
export function clerkErrorMessage(
	err: unknown,
	fallback = 'Something went wrong. Please try again.'
): string {
	const e = err as {
		errors?: Array<{ message?: string; longMessage?: string }>
	}
	const message =
		e?.errors?.[0]?.longMessage ||
		e?.errors?.[0]?.message ||
		(err instanceof Error ? err.message : fallback)

	if (/verification strategy is not valid/i.test(message)) {
		return 'This account uses Google sign-in. Please use "Sign in with Google".'
	}
	if (/email_code does not match/i.test(message)) {
		return 'Email code sign-in is disabled in Clerk. Enable "Email verification code" in the dashboard.'
	}

	return message
}
