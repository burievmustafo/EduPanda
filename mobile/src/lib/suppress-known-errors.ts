import { LogBox } from 'react-native'

/** Expo Go (Android) ba'zan keep-awake yoqolmaydi — ilovaga ta'sir qilmaydi. */
const KEEP_AWAKE_MSG = 'Unable to activate keep awake'

LogBox.ignoreLogs([KEEP_AWAKE_MSG])

function isKeepAwakeError(reason: unknown): boolean {
	const msg =
		reason instanceof Error
			? reason.message
			: typeof reason === 'string'
				? reason
				: ''
	return msg.includes(KEEP_AWAKE_MSG)
}

/** React Native promise rejection overlay'dan ushlab qolish. */
export function installKnownErrorHandlers() {
	const g = globalThis as typeof globalThis & {
		onunhandledrejection?: (event: { reason?: unknown; preventDefault?: () => void }) => void
	}

	const previous = g.onunhandledrejection
	g.onunhandledrejection = (event) => {
		if (isKeepAwakeError(event?.reason)) {
			event?.preventDefault?.()
			return
		}
		previous?.(event)
	}
}
