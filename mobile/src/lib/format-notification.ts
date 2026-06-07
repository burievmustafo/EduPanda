import type { TFunction } from 'i18next'

/** Web `notification.card` — `message` tokenlarini i18n orqali birlashtiradi. */
export function formatNotificationMessage(message: string, t: TFunction): string {
	return message
		.split(' ')
		.filter(Boolean)
		.map((token) => {
			const key = `notifications.${token}`
			const translated = t(key)
			return translated === key ? token : translated
		})
		.join(' ')
}

export function formatNotificationDate(iso: string, locale: string): string {
	try {
		const tag = locale === 'ja' ? 'ja-JP' : 'en-US'
		return new Intl.DateTimeFormat(tag, {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		}).format(new Date(iso))
	} catch {
		return iso
	}
}

/** Mobil ro‘yxat uchun qisqa vaqt (masalan “8 min ago”). */
export function formatNotificationTimeAgo(iso: string, locale: string): string {
	try {
		const tag = locale === 'ja' ? 'ja-JP' : 'en-US'
		const diffSec = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
		if (diffSec < 60) {
			return new Intl.RelativeTimeFormat(tag, { numeric: 'auto' }).format(0, 'second')
		}
		const diffMin = Math.round(diffSec / 60)
		if (diffMin < 60) {
			return new Intl.RelativeTimeFormat(tag, { numeric: 'auto' }).format(-diffMin, 'minute')
		}
		const diffHour = Math.round(diffMin / 60)
		if (diffHour < 24) {
			return new Intl.RelativeTimeFormat(tag, { numeric: 'auto' }).format(-diffHour, 'hour')
		}
		const diffDay = Math.round(diffHour / 24)
		if (diffDay < 7) {
			return new Intl.RelativeTimeFormat(tag, { numeric: 'auto' }).format(-diffDay, 'day')
		}
		return formatNotificationDate(iso, locale)
	} catch {
		return formatNotificationDate(iso, locale)
	}
}

export function notificationIconName(
	message: string,
): 'notifications-outline' | 'school-outline' | 'card-outline' | 'person-outline' | 'shield-outline' {
	const m = message.toLowerCase()
	if (m.includes('course') || m.includes('lesson') || m.includes('instructor')) {
		return 'school-outline'
	}
	if (m.includes('purchased') || m.includes('sold')) {
		return 'card-outline'
	}
	if (m.includes('profile')) {
		return 'person-outline'
	}
	if (m.includes('role') || m.includes('admin')) {
		return 'shield-outline'
	}
	return 'notifications-outline'
}
