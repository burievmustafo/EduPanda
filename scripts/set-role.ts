/**
 * Foydalanuvchi rolini o'zgartirish uchun script
 * 
 * Ishlatish:
 * npx ts-node scripts/set-role.ts <email> <role>
 * 
 * Misollar:
 * npx ts-node scripts/set-role.ts user@example.com admin
 * npx ts-node scripts/set-role.ts user@example.com instructor
 * npx ts-node scripts/set-role.ts user@example.com user
 */

import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

dotenv.config()

const MONGODB_URL = process.env.MONGODB_URL!

const UserSchema = new mongoose.Schema({
	fullName: String,
	clerkId: String,
	email: String,
	picture: String,
	role: { type: String, default: 'user' },
	isAdmin: { type: Boolean, default: false },
	approvedInstructor: { type: Boolean, default: false },
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function setRole(email: string, role: string) {
	try {
		await mongoose.connect(MONGODB_URL)
		console.log('MongoDB ga ulandi...')

		const user = await User.findOne({ email })

		if (!user) {
			console.log(`❌ Foydalanuvchi topilmadi: ${email}`)
			process.exit(1)
		}

		console.log(`✅ Foydalanuvchi topildi: ${user.fullName} (${user.email})`)

		switch (role) {
			case 'admin':
				await User.findByIdAndUpdate(user._id, {
					isAdmin: true,
				})
				console.log(`✅ ${email} endi ADMIN`)
				break

			case 'instructor':
				await User.findByIdAndUpdate(user._id, {
					role: 'instructor',
					approvedInstructor: true,
				})
				console.log(`✅ ${email} endi INSTRUCTOR`)
				break

			case 'user':
				await User.findByIdAndUpdate(user._id, {
					role: 'user',
					isAdmin: false,
					approvedInstructor: false,
				})
				console.log(`✅ ${email} endi oddiy USER`)
				break

			default:
				console.log('❌ Noto\'g\'ri rol. Foydalaning: admin, instructor, user')
		}

		process.exit(0)
	} catch (error) {
		console.error('Xato:', error)
		process.exit(1)
	}
}

const [, , email, role] = process.argv

if (!email || !role) {
	console.log('Ishlatish: npx ts-node scripts/set-role.ts <email> <role>')
	console.log('Rollar: admin, instructor, user')
	process.exit(1)
}

setRole(email, role)
