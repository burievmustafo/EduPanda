const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value: string) {
	return EMAIL_RE.test(value.trim())
}
