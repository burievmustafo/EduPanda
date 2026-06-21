import AsyncStorage from '@react-native-async-storage/async-storage'

import type { QuizAttemptResultDTO } from '@/types/dto'

const key = (quizId: string) => `@edupanda/quiz_latest/${quizId}`

export async function cacheQuizAttempt(quizId: string, attempt: QuizAttemptResultDTO) {
	await AsyncStorage.setItem(key(quizId), JSON.stringify(attempt))
}

export async function getCachedQuizAttempt(
	quizId: string
): Promise<QuizAttemptResultDTO | null> {
	const raw = await AsyncStorage.getItem(key(quizId))
	if (!raw) return null
	try {
		return JSON.parse(raw) as QuizAttemptResultDTO
	} catch {
		return null
	}
}
