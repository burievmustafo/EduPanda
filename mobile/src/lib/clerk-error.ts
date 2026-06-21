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
		return 'Email/password sign-in is not enabled for this account. Use Google sign-in or add a password in Clerk.'
	}
	if (/password/i.test(message) && /incorrect|invalid|wrong/i.test(message)) {
		return 'Email or password is incorrect.'
	}

	return message
}
