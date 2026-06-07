/**
 * ClerkBridge `useAuth` holatini API client uchun (hook'siz) eksport qiladi.
 * Signed-in bo'lganda dev header fallback ishlatilmasin.
 */
type AuthSnapshot = {
	isLoaded: boolean
	isSignedIn: boolean
}

let snapshot: AuthSnapshot = { isLoaded: false, isSignedIn: false }

export function setClerkAuthSnapshot(next: AuthSnapshot) {
	snapshot = next
}

export function getClerkAuthSnapshot(): AuthSnapshot {
	return snapshot
}

export function isClerkSignedIn(): boolean {
	return snapshot.isSignedIn
}
