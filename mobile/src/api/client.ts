import { getApiUrl } from '@/config'
import { isClerkSignedIn } from '@/lib/clerk-auth-state'
import { getClerkToken } from '@/lib/clerk-token'
import { useSession } from '@/store/session-store'

/**
 * Backend bilan ishlovchi HTTP client.
 *
 * Auth:
 *  - Clerk sessiyasi bo'lsa: `Authorization: Bearer <Clerk session token>`.
 *  - Aks holda (dev / login qilinmagan): `x-dev-clerk-id` fallback (Expo Go demo).
 */
async function request<T>(
	path: string,
	options?: { method?: string; body?: unknown }
): Promise<T> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	}

	let token = await getClerkToken()
	if (!token && isClerkSignedIn()) {
		// Token getter layout effect'dan keyin — qisqa kutish (dev user emas).
		await new Promise((r) => setTimeout(r, 80))
		token = await getClerkToken({ skipCache: true })
	}

	if (token) {
		headers.Authorization = `Bearer ${token}`
	} else if (!isClerkSignedIn()) {
		// Dev fallback — faqat login qilinmagan holatda.
		const session = useSession.getState()
		headers['x-dev-clerk-id'] = session.devClerkId
		if (session.devEmail) headers['x-dev-email'] = session.devEmail
	} else {
		throw new Error('Session token not ready')
	}

	const doFetch = async (authHeaders: Record<string, string>) =>
		fetch(`${getApiUrl()}${path}`, {
			method: options?.method ?? 'GET',
			headers: authHeaders,
			body: options?.body ? JSON.stringify(options.body) : undefined,
		})

	let res = await doFetch(headers)

	// Eskirgan JWT — bir marta yangi token bilan qayta urinamiz.
	if (res.status === 401 && token) {
		const fresh = await getClerkToken({ skipCache: true })
		if (fresh && fresh !== token) {
			res = await doFetch({
				...headers,
				Authorization: `Bearer ${fresh}`,
			})
		}
	}

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
export const apiDelete = <T>(path: string) =>
	request<T>(path, { method: 'DELETE' })
