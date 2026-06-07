'use client'

import { grantCourseAccess, revokeCourseAccess } from '@/actions/enrollment.action'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Loader2, UserPlus } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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
}

interface Props {
	courseId: string
	students: StudentRow[]
}

function StudentsManager({ courseId, students }: Props) {
	const [email, setEmail] = useState('')
	const [granting, setGranting] = useState(false)
	const [revokingId, setRevokingId] = useState('')
	const path = usePathname()

	const onGrant = async () => {
		if (!email.trim()) return
		setGranting(true)
		try {
			await grantCourseAccess({ courseId, email, path })
			toast.success('Access granted')
			setEmail('')
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Something went wrong!')
		} finally {
			setGranting(false)
		}
	}

	const onRevoke = async (studentId: string) => {
		if (!confirm('Remove this student from the course?')) return
		setRevokingId(studentId)
		try {
			await revokeCourseAccess({ courseId, studentId, path })
			toast.success('Access removed')
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Something went wrong!')
		} finally {
			setRevokingId('')
		}
	}

	return (
		<div className='space-y-4'>
			{/* Grant access */}
			<Card>
				<CardContent className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center'>
					<div className='flex-1'>
						<p className='text-sm font-medium'>Give a student access</p>
						<p className='text-xs text-muted-foreground'>
							Enter the student&apos;s email to open this course for free.
						</p>
					</div>
					<div className='flex w-full gap-2 sm:w-auto'>
						<Input
							type='email'
							placeholder='student@email.com'
							value={email}
							onChange={e => setEmail(e.target.value)}
							className='sm:w-64'
							onKeyDown={e => e.key === 'Enter' && onGrant()}
						/>
						<Button onClick={onGrant} disabled={granting || !email.trim()}>
							{granting ? (
								<Loader2 className='size-4 animate-spin' />
							) : (
								<UserPlus className='size-4' />
							)}
							<span className='ml-2 max-sm:hidden'>Grant</span>
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Students table */}
			<Card>
				<CardContent className='p-0'>
					{students.length === 0 ? (
						<p className='p-6 text-sm text-muted-foreground'>
							No students enrolled yet.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Student</TableHead>
									<TableHead>Progress</TableHead>
									<TableHead>Quizzes</TableHead>
									<TableHead>Avg score</TableHead>
									<TableHead>Access</TableHead>
									<TableHead className='text-right'>Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{students.map(s => (
									<TableRow key={s.studentId}>
										<TableCell>
											<div className='flex items-center gap-2'>
												{s.picture ? (
													<Image
														src={s.picture}
														alt={s.fullName}
														width={32}
														height={32}
														className='size-8 rounded-full object-cover'
													/>
												) : (
													<div className='flex size-8 items-center justify-center rounded-full bg-secondary text-xs'>
														{s.fullName?.[0] ?? '?'}
													</div>
												)}
												<div>
													<p className='font-medium'>{s.fullName}</p>
													<p className='text-xs text-muted-foreground'>
														{s.email}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className='flex w-32 items-center gap-2'>
												<Progress value={s.progressPercent} className='h-2' />
												<span className='text-xs'>{s.progressPercent}%</span>
											</div>
											<span className='text-xs text-muted-foreground'>
												{s.completedLessons}/{s.totalLessons} lessons
											</span>
										</TableCell>
										<TableCell>
											{s.quizzesTotal === 0 ? (
												<span className='text-xs text-muted-foreground'>—</span>
											) : (
												<span className='text-sm'>
													{s.passedCount}/{s.quizzesTotal} passed
													<span className='block text-xs text-muted-foreground'>
														{s.quizzesTaken} taken
													</span>
												</span>
											)}
										</TableCell>
										<TableCell>
											{s.avgScore == null ? (
												<span className='text-xs text-muted-foreground'>—</span>
											) : (
												<span
													className={
														s.avgScore >= 70
															? 'font-medium text-green-600'
															: 'font-medium text-red-600'
													}
												>
													{s.avgScore}%
												</span>
											)}
										</TableCell>
										<TableCell>
											<Badge
												variant={s.source === 'admin' ? 'secondary' : 'outline'}
											>
												{s.source === 'admin'
													? 'Granted'
													: s.source === 'mock'
														? 'Mock'
														: 'Purchased'}
											</Badge>
										</TableCell>
										<TableCell className='text-right'>
											<Button
												size={'sm'}
												variant={'destructive'}
												onClick={() => onRevoke(s.studentId)}
												disabled={revokingId === s.studentId}
											>
												{revokingId === s.studentId ? (
													<Loader2 className='size-4 animate-spin' />
												) : (
													'Remove'
												)}
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

export default StudentsManager
