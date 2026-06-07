import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { useFigmaTheme } from '@/design/figma-theme'
import { spacing } from '@/design/tokens'
import { formatMessageTime, type ChatMessage } from '@/lib/inbox-chat'

type Props = {
	message: ChatMessage
}

export function ChatMessageBubble({ message }: Props) {
	const theme = useFigmaTheme()
	const outgoing = Boolean(message.isOutgoing)
	const text = message.text ?? ''

	return (
		<View style={[styles.row, outgoing ? styles.rowOut : styles.rowIn]}>
			<View
				style={[
					styles.bubble,
					outgoing ? styles.bubbleOut : styles.bubbleIn,
					{ backgroundColor: outgoing ? theme.tabActiveBg : theme.notificationCardBg },
				]}>
				<AppText
					variant="body"
					style={[
						styles.text,
						{ color: outgoing ? theme.buttonText : theme.heading },
					]}>
					{text}
				</AppText>
				<AppText
					variant="small"
					style={[
						styles.time,
						{ color: outgoing ? 'rgba(232, 251, 253, 0.78)' : theme.accent },
					]}>
					{formatMessageTime(message.createdAt)}
				</AppText>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.sm,
	},
	rowOut: { alignItems: 'flex-end' },
	rowIn: { alignItems: 'flex-start' },
	bubble: {
		maxWidth: '82%',
		borderRadius: 12,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
	},
	bubbleOut: {
		borderBottomRightRadius: 4,
	},
	bubbleIn: {
		borderBottomLeftRadius: 4,
	},
	text: { fontSize: 14, lineHeight: 20 },
	time: { marginTop: 4, fontSize: 9, alignSelf: 'flex-end' },
})
