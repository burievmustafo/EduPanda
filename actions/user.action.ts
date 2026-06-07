'use server'

import { connectToDatabase } from '@/lib/mongoose'
import { GetPaginationParams, ICreateUser, IUpdateUser } from './types'
import User from '@/database/user.model'
import { revalidatePath } from 'next/cache'
import Review from '@/database/review.model'
import Course from '@/database/course.model'
import { cache } from 'react'
import { clerkClient } from '@clerk/nextjs'
import { syncPictureFromClerk } from '@/lib/mobile/profile-picture'

export const createUser = async (data: ICreateUser) => {
	try {
		await connectToDatabase()
		const { clerkId, email, fullName, picture } = data
		const isExist = await User.findOne({ clerkId })

		if (isExist) {
			const updatedUser = await User.findOneAndUpdate(
				{ email },
				{ fullName, picture, clerkId },
				{ new: true }
			)

			return updatedUser
		}

		const newUser = await User.create(data)

		return newUser
	} catch (error) {
		throw new Error('Error creating user. Please try again.')
	}
}

export const updateUser = async (data: IUpdateUser) => {
	try {
		await connectToDatabase()
		const { clerkId, updatedData, path } = data

		let user = await User.findOne({ clerkId })

		if (!user) {
			const clerkUser = await clerkClient.users.getUser(clerkId)
			const email =
				clerkUser.emailAddresses?.find(
					emailAddress => emailAddress.id === clerkUser.primaryEmailAddressId
				)?.emailAddress ||
				clerkUser.emailAddresses?.[0]?.emailAddress ||
				''
			const fullName =
				[clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
				email.split('@')[0] ||
				'User'

			user = email ? await User.findOne({ email }) : null

			if (user) {
				user.clerkId = clerkId
				Object.assign(user, updatedData)
				await user.save()
			} else {
				user = await User.create({
					clerkId,
					email,
					fullName,
					picture: clerkUser.imageUrl,
					role: 'student',
					isAdmin: false,
					approvedInstructor: false,
					...updatedData,
				})
			}
		} else {
			user = await User.findOneAndUpdate({ clerkId }, updatedData, {
				new: true,
			})

			if (!user) {
				const clerkUser = await clerkClient.users.getUser(clerkId)
				const email =
					clerkUser.emailAddresses?.find(
						emailAddress =>
							emailAddress.id === clerkUser.primaryEmailAddressId
					)?.emailAddress ||
					clerkUser.emailAddresses?.[0]?.emailAddress ||
					''
				const fullName =
					[clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
					email.split('@')[0] ||
					'User'

				user = await User.create({
					clerkId,
					email,
					fullName,
					picture: clerkUser.imageUrl,
					role: 'student',
					isAdmin: false,
					approvedInstructor: false,
					...updatedData,
				})
			}
		}

		if (updatedData.approvedInstructor === true) {
			revalidatePath('/en/admin/instructors')
			revalidatePath('/uz/admin/instructors')
			revalidatePath('/ru/admin/instructors')
			revalidatePath('/tr/admin/instructors')
			revalidatePath('/ja/admin/instructors')
		}

		if (path) revalidatePath(path)
		return user
	} catch (error) {
		throw new Error('Error updating user. Please try again.')
	}
}

export const getUserById = cache(async (clerkId: string) => {
	try {
		await connectToDatabase()
		return await User.findOne({ clerkId })
	} catch (error) {
		throw new Error('Error fetching user. Please try again.')
	}
})

export const getUser = async (clerkId: string, clerkUserData?: { fullName?: string; email?: string; picture?: string }) => {
	try {
		await connectToDatabase()
		let user = await User.findOne({ clerkId }).select(
			'fullName picture clerkId email role isAdmin approvedInstructor'
		)
		
		// User topilmasa va Clerk ma'lumotlari berilgan bo'lsa, avtomatik yaratamiz
		if (!user && clerkUserData) {
			user = await User.create({
				clerkId,
				fullName: clerkUserData.fullName || 'User',
				email: clerkUserData.email || '',
				picture: clerkUserData.picture || '',
				role: 'student',
				isAdmin: false,
				approvedInstructor: false,
			})
		} else if (user && clerkUserData?.picture) {
			const picture = clerkUserData.picture.trim()
			if (picture && picture !== user.picture) {
				user.picture = picture
				await User.updateOne({ clerkId }, { picture })
			}
		}

		if (!user) return 'notFound'
		return JSON.parse(JSON.stringify(user))
	} catch (error) {
		throw new Error('Error fetching user. Please try again.')
	}
}

export const getUserReviews = async (clerkId: string) => {
	try {
		await connectToDatabase()
		const user = await User.findOne({ clerkId }).select('_id')

		const reviews = await Review.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({ path: 'user', model: User, select: 'fullName picture' })
			.populate({ path: 'course', model: Course, select: 'title' })

		return reviews
	} catch (error) {
		throw new Error('Error getting user reviews')
	}
}

export const getAdminInstructors = async (params: GetPaginationParams) => {
	try {
		await connectToDatabase()
		const { page = 1, pageSize = 3 } = params

		const skipAmount = (page - 1) * pageSize

		const instructors = await User.find({ role: 'instructor' })
			.skip(skipAmount)
			.limit(pageSize)
			.sort({ createdAt: -1 })

		for (const instructor of instructors) {
			if (!instructor.clerkId) continue
			const picture = await syncPictureFromClerk(
				instructor.clerkId,
				instructor.picture
			)
			if (picture && picture !== instructor.picture) {
				instructor.picture = picture
				await User.updateOne(
					{ clerkId: instructor.clerkId },
					{ picture }
				)
			} else if (picture) {
				instructor.picture = picture
			}
		}

		const totalInstructors = await User.countDocuments({ role: 'instructor' })
		const isNext = totalInstructors > skipAmount + instructors.length

		return { instructors, isNext, totalInstructors }
	} catch (error) {
		throw new Error('Error getting instructors')
	}
}

export const getInstructors = async () => {
	try {
		await connectToDatabase()
		return await User.find({ approvedInstructor: true }).select(
			'isAdmin role email website youtube github job clerkId'
		)
	} catch (error) {
		throw new Error('Error getting instructors')
	}
}

export const getRole = async (clerkId: string) => {
	try {
		await connectToDatabase()
		const user = await User.findOne({ clerkId }).select('role isAdmin email')
		return user
	} catch (error) {
		throw new Error('Error getting role')
	}
}
