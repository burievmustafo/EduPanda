import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import type { AiMessage } from '@/types/ai'

type Props = {
	message: AiMessage
	isCodeMode?: boolean
}

export function AiMessageBubble({ message, isCodeMode }: Props) {
	const theme = useFigmaTheme()
	const outgoing = message.role === 'user'

	return (
		<View style={[styles.row, outgoing ? styles.rowOut : styles.rowIn]}>
			{!outgoing ? (
				<View style={[styles.avatar, { backgroundColor: theme.notificationCardBg }]}>
					<Ionicons name="sparkles" size={16} color={theme.accent} />
				</View>
			) : null}
			<View
				style={[
					styles.bubble,
					outgoing ? styles.bubbleOut : styles.bubbleIn,
					{ backgroundColor: outgoing ? theme.tabActiveBg : theme.notificationCardBg },
				]}>
				<AppText
					variant="body"
					style={[
						isCodeMode && !outgoing ? styles.codeText : styles.text,
						{ color: outgoing ? theme.buttonText : theme.heading },
					]}>
					{message.content}
				</AppText>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.sm,
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: spacing.sm,
	},
	rowOut: { justifyContent: 'flex-end' },
	rowIn: { justifyContent: 'flex-start' },
	avatar: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 2,
	},
	bubble: {
		maxWidth: '84%',
		borderRadius: 12,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
	},
	bubbleOut: { borderBottomRightRadius: 4 },
	bubbleIn: { borderBottomLeftRadius: 4 },
	text: { fontSize: 14, lineHeight: 20 },
	codeText: { fontSize: 13, lineHeight: 18, fontFamily: 'monospace' },
})
