/** Login qilgan foydalanuvchi ismi (Figma "Welcome Sidra" o‘rniga). */
export function getDisplayFirstName(fullName?: string | null): string {
	if (!fullName?.trim()) return ''
	const first = fullName.trim().split(/\s+/)[0]
	return first ?? ''
}
