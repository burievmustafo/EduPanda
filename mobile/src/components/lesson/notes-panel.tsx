import { Pressable, StyleSheet, View } from 'react-native'

import { AppCard } from '@/components/ui/app-card'
import { AppEmptyState } from '@/components/ui/app-empty-state'
import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { formatTime } from '@/lib/localized'

export type LessonNote = { id: string; timeSec: number; text: string }

type NotesPanelProps = {
	notes: LessonNote[]
	emptyTitle: string
	emptyDescription: string
	onSeekNote: (timeSec: number) => void
}

export function NotesPanel({
	notes,
	emptyTitle,
	emptyDescription,
	onSeekNote,
}: NotesPanelProps) {
	const theme = useFigmaTheme()

	if (notes.length === 0) {
		return (
			<AppCard
				style={[
					styles.emptyCard,
					{ backgroundColor: theme.surface, borderColor: theme.notificationCardBg },
				]}>
				<AppEmptyState
					title={emptyTitle}
					description={emptyDescription}
				/>
			</AppCard>
		)
	}

	return (
		<AppCard
			style={[
				styles.card,
				{ backgroundColor: theme.surface, borderColor: theme.notificationCardBg },
			]}>
			{notes.map((note, i) => (
				<Pressable
					key={note.id}
					onPress={() => onSeekNote(note.timeSec)}
					style={[
						styles.noteRow,
						i > 0 && styles.noteBorder,
					]}>
					<AppText variant="captionStrong" color="brand">
						{formatTime(note.timeSec)}
					</AppText>
					<AppText variant="body" style={{ color: theme.heading }}>
						{note.text}
					</AppText>
				</Pressable>
			))}
		</AppCard>
	)
}

const styles = StyleSheet.create({
	card: { gap: 0, padding: 0, overflow: 'hidden' },
	emptyCard: { paddingVertical: spacing.lg },
	noteRow: { padding: spacing.lg, gap: spacing.xs },
	noteBorder: {
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: 'rgba(128,128,128,0.2)',
	},
})
