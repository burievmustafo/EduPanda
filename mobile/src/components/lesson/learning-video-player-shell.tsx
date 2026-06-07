import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { LessonVideo, VideoFrame } from '@/components/lesson-video'
import { AppText } from '@/components/ui/app-text'
import { colors, spacing } from '@/design/tokens'

type LearningVideoPlayerShellProps = {
	url: string
	paused?: boolean
	enableTimeTracking?: boolean
	seekToSec?: number
	playbackRate?: number
	onTimeUpdate?: (currentTime: number) => void
	onPause?: () => void
}

export function LearningVideoPlayerShell({
	url,
	paused,
	enableTimeTracking,
	seekToSec,
	playbackRate,
	onTimeUpdate,
	onPause,
}: LearningVideoPlayerShellProps) {
	const { t } = useTranslation()
	const hasVideo = Boolean(url?.trim())

	return (
		<View style={styles.wrap}>
			{hasVideo ? (
				<VideoFrame>
					<LessonVideo
						key={url}
						url={url}
						paused={paused}
						enableTimeTracking={enableTimeTracking}
						seekToSec={seekToSec}
						playbackRate={playbackRate}
						onTimeUpdate={onTimeUpdate}
						onPause={onPause}
					/>
				</VideoFrame>
			) : (
				<View style={styles.empty}>
					<Ionicons name="videocam-off-outline" size={48} color={colors.textTertiary} />
					<AppText variant="bodyStrong" style={styles.emptyTitle}>
						{t('lessonPlayer.noVideo')}
					</AppText>
					<AppText variant="caption" color="secondary" style={styles.emptyHint}>
						{t('lessonPlayer.noVideoHint')}
					</AppText>
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
	empty: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: spacing['2xl'],
		gap: spacing.sm,
	},
	emptyTitle: { color: colors.white, textAlign: 'center' },
	emptyHint: { color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
})
