import { API_URL } from '@/config'
import { useSession } from '@/store/session-store'

/**
 * Backend bilan ishlovchi HTTP client.
 *
 * Auth: hozircha `x-dev-clerk-id` header (M3 bosqich 1).
 * TODO M3 bosqich 2: Clerk token → `Authorization: Bearer <token>`.
 */
async function request<T>(
	path: string,
	options?: { method?: string; body?: unknown }
): Promise<T> {
	const res = await fetch(`${API_URL}${path}`, {
		method: options?.method ?? 'GET',
		headers: {
			'Content-Type': 'application/json',
			// Tanlangan role'ga mos seed user (M3 bosqich 1).
			'x-dev-clerk-id': useSession.getState().devClerkId,
		},
		body: options?.body ? JSON.stringify(options.body) : undefined,
	})

	if (!res.ok) {
		let message = `HTTP ${res.status}`
		try {
			const err = await res.json()
			message = err?.message || message
		} catch {}
		throw new Error(message)
	}
	return (await res.json()) as T
}

export const apiGet = <T>(path: string) => request<T>(path)
export const apiPost = <T>(path: string, body?: unknown) =>
	request<T>(path, { method: 'POST', body })
export const apiPatch = <T>(path: string, body?: unknown) =>
	request<T>(path, { method: 'PATCH', body })
