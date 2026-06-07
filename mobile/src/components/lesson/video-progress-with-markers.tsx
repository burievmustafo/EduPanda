import { StyleSheet, View } from 'react-native'

import { colors } from '@/design/tokens'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { getPalette } from '@/design/theme'
import type { TimedQuestionDTO } from '@/types/dto'

type VideoProgressWithMarkersProps = {
	durationSec: number
	currentTimeSec: number
	watchedPercent: number
	questions: TimedQuestionDTO[]
	answeredQuestionIds: string[]
}

export function VideoProgressWithMarkers({
	durationSec,
	currentTimeSec,
	watchedPercent,
	questions,
	answeredQuestionIds,
}: VideoProgressWithMarkersProps) {
	const scheme = useColorScheme()
	const palette = getPalette(scheme === 'dark' ? 'dark' : 'light')
	const watched = Math.min(100, Math.max(0, watchedPercent))
	const current =
		durationSec > 0 ? Math.min(100, Math.max(0, (currentTimeSec / durationSec) * 100)) : 0

	return (
		<View style={[styles.barBg, { backgroundColor: palette.surfaceMuted }]}>
			<View style={[styles.barFill, { width: `${watched}%` }]} />
			<View style={[styles.playhead, { left: `${current}%` }]} />
			{questions.map((question) => {
				const left =
					durationSec > 0
						? Math.min(100, Math.max(0, (question.triggerTimeSec / durationSec) * 100))
						: 0
				const answered = answeredQuestionIds.includes(question.id)
				return (
					<View
						key={question.id}
						style={[
							styles.marker,
							{ left: `${left}%`, backgroundColor: answered ? colors.success : colors.warning },
						]}
					/>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	barBg: { height: 10, borderRadius: 5, position: 'relative', overflow: 'visible' },
	barFill: { height: 10, borderRadius: 5, backgroundColor: colors.primary },
	playhead: {
		position: 'absolute',
		top: -3,
		width: 2,
		height: 16,
		backgroundColor: colors.white,
		marginLeft: -1,
	},
	marker: {
		position: 'absolute',
		top: -4,
		width: 10,
		height: 18,
		borderRadius: 5,
		borderWidth: 2,
		borderColor: colors.white,
		marginLeft: -5,
	},
})
