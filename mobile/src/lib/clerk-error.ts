/** Clerk xato obyektidan o'qiladigan xabar chiqaradi. */
export function clerkErrorMessage(
	err: unknown,
	fallback = 'Something went wrong. Please try again.'
): string {
	const e = err as {
		errors?: Array<{ message?: string; longMessage?: string }>
	}
	return (
		e?.errors?.[0]?.longMessage ||
		e?.errors?.[0]?.message ||
		(err instanceof Error ? err.message : fallback)
	)
}
