export type InboxThread = {
	id: string
	name: string
	preview: string
	timeAgo: string
	unreadCount?: number
	avatarColor: string
}

/** Figma W13 — chat API yo‘q, demo ro‘yxat. */
export const FIGMA_INBOX_THREADS: InboxThread[] = [
	{
		id: '1',
		name: 'Michael Chen',
		preview: 'Thanks for the feedback on my assignment!',
		timeAgo: '2m',
		unreadCount: 2,
		avatarColor: '#2563EB',
	},
	{
		id: '2',
		name: 'Daniel Smith',
		preview: 'Can we schedule a review session?',
		timeAgo: '15m',
		unreadCount: 1,
		avatarColor: '#1E3A8A',
	},
	{
		id: '3',
		name: 'Visual Communication College',
		preview: 'Your course materials are now available.',
		timeAgo: '1h',
		avatarColor: '#2563EB',
	},
	{
		id: '4',
		name: 'Sato Sensei',
		preview: 'Great progress on the typography module.',
		timeAgo: '3h',
		avatarColor: '#6B4C9A',
	},
	{
		id: '5',
		name: 'Course Support',
		preview: 'Lorem ipsum dolor sit amet, consectetur…',
		timeAgo: 'Yesterday',
		avatarColor: '#2563EB',
	},
	{
		id: '6',
		name: 'Emily Watson',
		preview: 'See you in the next live session!',
		timeAgo: 'Mon',
		avatarColor: '#C45B28',
	},
]
