'use client'

import {
	getCourseStudentResults,
	grantCourseAccess,
	revokeCourseAccess,
} from '@/actions/enrollment.action'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import useTranslate from '@/hooks/use-translate'
import {
	BarChart3,
	Eye,
	GraduationCap,
	Loader2,
	Trophy,
	UserPlus,
	Users,
	type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

export interface StudentRow {
	studentId: string
	fullName: string
	email: string
	picture: string
	source: string
	progressPercent: number
	completedLessons: number
	totalLessons: number
	quizzesTaken: number
	quizzesTotal: number
	passedCount: number
	avgScore: number | null
	lastAttemptAt?: string | null
}

interface StudentResultDetail {
	student: {
		studentId: string
		fullName: string
		email: string
		picture?: string
	}
	sections: Array<{
		sectionId: string
		title: string
		completedLessons: number
		totalLessons: number
		progressPercent: number
		lessons: Array<{
			lessonId: string
			title: string
			isCompleted: boolean
			watchedPercent: number
		}>
		quizzes: Array<{
			quizId: string
			title: string
			passScore: number
			attemptsCount: number
			bestScore: number | null
			bestPassed: boolean
			latestScore: number | null
			latestPassed: boolean
			latestSubmittedAt?: string | null
		}>
	}>
}

interface Props {
	courseId: string
	students: StudentRow[]
}

function StudentsManager({ courseId, students }: Props) {
	const [email, setEmail] = useState('')
	const [granting, setGranting] = useState(false)
	const [revokingId, setRevokingId] = useState('')
	const [detail, setDetail] = useState<StudentResultDetail | null>(null)
	const [detailLoadingId, setDetailLoadingId] = useState('')
	const path = usePathname()
	const t = useTranslate()

	const summary = useMemo(() => {
		const totalStudents = students.length
		const avgProgress = totalStudents
			? Math.round(
					students.reduce((sum, student) => sum + student.progressPercent, 0) /
						totalStudents
			  )
			: 0
		const scored = students.filter(student => student.avgScore != null)
		const avgScore = scored.length
			? Math.round(
					scored.reduce((sum, student) => sum + (student.avgScore || 0), 0) /
						scored.length
			  )
			: null
		const passed = students.reduce((sum, student) => sum + student.passedCount, 0)

		return { totalStudents, avgProgress, avgScore, passed }
	}, [students])

	const onGrant = async () => {
		if (!email.trim()) return
		setGranting(true)
		try {
			await grantCourseAccess({ courseId, email, path })
			toast.success(t('accessGranted'))
			setEmail('')
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('error'))
		} finally {
			setGranting(false)
		}
	}

	const onRevoke = async (studentId: string) => {
		if (!confirm(t('remove') + '?')) return
		setRevokingId(studentId)
		try {
			await revokeCourseAccess({ courseId, studentId, path })
			toast.success(t('accessRemoved'))
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('error'))
		} finally {
			setRevokingId('')
		}
	}

	const onViewResults = async (studentId: string) => {
		setDetailLoadingId(studentId)
		try {
			const data = await getCourseStudentResults(courseId, studentId)
			setDetail(data)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('error'))
		} finally {
			setDetailLoadingId('')
		}
	}

	const formatDate = (value?: string | null) => {
		if (!value) return '-'
		return new Intl.DateTimeFormat(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(new Date(value))
	}

	return (
		<div className='space-y-4'>
			<div className='grid gap-3 md:grid-cols-4'>
				<SummaryCard
					icon={Users}
					label={t('students')}
					value={summary.totalStudents}
				/>
				<SummaryCard
					icon={BarChart3}
					label={t('avgProgress')}
					value={`${summary.avgProgress}%`}
				/>
				<SummaryCard
					icon={Trophy}
					label={t('avgScore')}
					value={summary.avgScore == null ? '-' : `${summary.avgScore}%`}
				/>
				<SummaryCard
					icon={GraduationCap}
					label={t('passed')}
					value={summary.passed}
				/>
			</div>

			<Card>
				<CardContent className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center'>
					<div className='flex-1'>
						<p className='text-sm font-medium'>{t('giveStudentAccess')}</p>
						<p className='text-xs text-muted-foreground'>
							{t('giveStudentAccessDesc')}
						</p>
					</div>
					<div className='flex w-full gap-2 sm:w-auto'>
						<Input
							type='email'
							placeholder='student@email.com'
							value={email}
							onChange={event => setEmail(event.target.value)}
							className='sm:w-64'
							onKeyDown={event => event.key === 'Enter' && onGrant()}
						/>
						<Button onClick={onGrant} disabled={granting || !email.trim()}>
							{granting ? (
								<Loader2 className='size-4 animate-spin' />
							) : (
								<UserPlus className='size-4' />
							)}
							<span className='ml-2 max-sm:hidden'>{t('grant')}</span>
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className='p-0'>
					{students.length === 0 ? (
						<p className='p-6 text-sm text-muted-foreground'>
							{t('noStudentsYet')}
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('studentLabel')}</TableHead>
									<TableHead>{t('progress')}</TableHead>
									<TableHead>{t('quizzes')}</TableHead>
									<TableHead>{t('avgScore')}</TableHead>
									<TableHead>{t('lastActivity')}</TableHead>
									<TableHead>{t('access')}</TableHead>
									<TableHead className='text-right'>{t('action')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{students.map(student => (
									<TableRow key={student.studentId}>
										<TableCell>
											<StudentIdentity student={student} />
										</TableCell>
										<TableCell>
											<div className='flex w-32 items-center gap-2'>
												<Progress
													value={student.progressPercent}
													className='h-2'
												/>
												<span className='text-xs'>
													{student.progressPercent}%
												</span>
											</div>
											<span className='text-xs text-muted-foreground'>
												{student.completedLessons}/{student.totalLessons}{' '}
												{t('lessons')}
											</span>
										</TableCell>
										<TableCell>
											{student.quizzesTotal === 0 ? (
												<span className='text-xs text-muted-foreground'>-</span>
											) : (
												<span className='text-sm'>
													{student.passedCount}/{student.quizzesTotal}{' '}
													{t('passed')}
													<span className='block text-xs text-muted-foreground'>
														{student.quizzesTaken} {t('taken')}
													</span>
												</span>
											)}
										</TableCell>
										<TableCell>
											{student.avgScore == null ? (
												<span className='text-xs text-muted-foreground'>-</span>
											) : (
												<span
													className={
														student.avgScore >= 70
															? 'font-medium text-green-600'
															: 'font-medium text-red-600'
													}
												>
													{student.avgScore}%
												</span>
											)}
										</TableCell>
										<TableCell className='text-sm text-muted-foreground'>
											{formatDate(student.lastAttemptAt)}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													student.source === 'admin' ? 'secondary' : 'outline'
												}
											>
												{student.source === 'admin'
													? t('granted')
													: student.source === 'mock'
														? 'Mock'
														: t('purchased')}
											</Badge>
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end gap-2'>
												<Button
													size={'sm'}
													variant={'outline'}
													onClick={() => onViewResults(student.studentId)}
													disabled={detailLoadingId === student.studentId}
												>
													{detailLoadingId === student.studentId ? (
														<Loader2 className='size-4 animate-spin' />
													) : (
														<Eye className='size-4' />
													)}
													<span className='ml-2 max-lg:hidden'>
														{t('viewResults')}
													</span>
												</Button>
												<Button
													size={'sm'}
													variant={'destructive'}
													onClick={() => onRevoke(student.studentId)}
													disabled={revokingId === student.studentId}
												>
													{revokingId === student.studentId ? (
														<Loader2 className='size-4 animate-spin' />
													) : (
														t('remove')
													)}
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Dialog open={!!detail} onOpenChange={open => !open && setDetail(null)}>
				<DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
					{detail && (
						<>
							<DialogHeader>
								<DialogTitle>{detail.student.fullName}</DialogTitle>
								<DialogDescription>{detail.student.email}</DialogDescription>
							</DialogHeader>
							<div className='space-y-4'>
								{detail.sections.map(section => (
									<Card key={section.sectionId}>
										<CardContent className='space-y-4 p-4'>
											<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
												<div>
													<p className='font-semibold'>{section.title}</p>
													<p className='text-xs text-muted-foreground'>
														{section.completedLessons}/{section.totalLessons}{' '}
														{t('lessons')}
													</p>
												</div>
												<div className='flex min-w-40 items-center gap-2'>
													<Progress
														value={section.progressPercent}
														className='h-2'
													/>
													<span className='text-xs font-medium'>
														{section.progressPercent}%
													</span>
												</div>
											</div>

											<div className='grid gap-3 md:grid-cols-2'>
												<LessonBreakdown lessons={section.lessons} t={t} />
												<QuizBreakdown
													quizzes={section.quizzes}
													t={t}
													formatDate={formatDate}
												/>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default StudentsManager

function StudentIdentity({ student }: { student: StudentRow }) {
	return (
		<div className='flex items-center gap-2'>
			{student.picture ? (
				<Image
					src={student.picture}
					alt={student.fullName}
					width={32}
					height={32}
					className='size-8 rounded-full object-cover'
				/>
			) : (
				<div className='flex size-8 items-center justify-center rounded-full bg-secondary text-xs'>
					{student.fullName?.[0] ?? '?'}
				</div>
			)}
			<div>
				<p className='font-medium'>{student.fullName}</p>
				<p className='text-xs text-muted-foreground'>{student.email}</p>
			</div>
		</div>
	)
}

function LessonBreakdown({
	lessons,
	t,
}: {
	lessons: StudentResultDetail['sections'][number]['lessons']
	t: (key: string) => string
}) {
	return (
		<div className='rounded-md border p-3'>
			<p className='mb-2 text-sm font-medium'>{t('lessons')}</p>
			<div className='space-y-2'>
				{lessons.map(lesson => (
					<div
						key={lesson.lessonId}
						className='flex items-center justify-between gap-3 text-sm'
					>
						<span className='line-clamp-1'>{lesson.title}</span>
						<Badge variant={lesson.isCompleted ? 'secondary' : 'outline'}>
							{lesson.isCompleted ? t('completed') : `${lesson.watchedPercent}%`}
						</Badge>
					</div>
				))}
			</div>
		</div>
	)
}

function QuizBreakdown({
	quizzes,
	t,
	formatDate,
}: {
	quizzes: StudentResultDetail['sections'][number]['quizzes']
	t: (key: string) => string
	formatDate: (value?: string | null) => string
}) {
	return (
		<div className='rounded-md border p-3'>
			<p className='mb-2 text-sm font-medium'>{t('quizzes')}</p>
			{quizzes.length === 0 ? (
				<p className='text-sm text-muted-foreground'>-</p>
			) : (
				<div className='space-y-2'>
					{quizzes.map(quiz => (
						<div key={quiz.quizId} className='rounded-md bg-secondary p-3 text-sm'>
							<div className='flex items-start justify-between gap-3'>
								<div>
									<p className='font-medium'>{quiz.title}</p>
									<p className='text-xs text-muted-foreground'>
										{quiz.attemptsCount} {t('attempts')} · {t('lastActivity')}:{' '}
										{formatDate(quiz.latestSubmittedAt)}
									</p>
								</div>
								<Badge variant={quiz.bestPassed ? 'secondary' : 'destructive'}>
									{quiz.bestScore == null ? '-' : `${quiz.bestScore}%`}
								</Badge>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

function SummaryCard({
	icon: Icon,
	label,
	value,
}: {
	icon: LucideIcon
	label: string
	value: string | number
}) {
	return (
		<Card>
			<CardContent className='flex items-center justify-between p-4'>
				<div>
					<p className='text-xs text-muted-foreground'>{label}</p>
					<p className='mt-1 text-2xl font-bold'>{value}</p>
				</div>
				<div className='rounded-md bg-primary/10 p-2 text-primary'>
					<Icon className='size-5' />
				</div>
			</CardContent>
		</Card>
	)
}
