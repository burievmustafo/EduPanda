/**
 * Foydalanuvchi rolini o'zgartirish uchun script
 * 
 * Ishlatish:
 * npx --yes tsx scripts/set-role.ts <email> <role>
 * 
 * Misollar:
 * npx --yes tsx scripts/set-role.ts user@example.com admin
 * npx --yes tsx scripts/set-role.ts user@example.com instructor
 * npx --yes tsx scripts/set-role.ts user@example.com student
 */

import mongoose from 'mongoose'
import { loadEnvConfig } from '@next/env'
import dns from 'dns'

loadEnvConfig(process.cwd())
dns.setServers(['8.8.8.8', '1.1.1.1'])

const MONGODB_URL = process.env.MONGODB_URL || process.env.MONGODB_URI

const UserSchema = new mongoose.Schema({
	fullName: String,
	clerkId: String,
	email: String,
	picture: String,
	role: { type: String, default: 'student' },
	isAdmin: { type: Boolean, default: false },
	approvedInstructor: { type: Boolean, default: false },
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function setRole(email: string, role: string) {
	try {
		if (!MONGODB_URL) {
			console.log('❌ MONGODB_URL yoki MONGODB_URI topilmadi')
			process.exit(1)
		}

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
					role: 'admin',
					isAdmin: true,
					approvedInstructor: false,
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

			case 'student':
				await User.findByIdAndUpdate(user._id, {
					role: 'student',
					isAdmin: false,
					approvedInstructor: false,
				})
				console.log(`✅ ${email} endi STUDENT`)
				break

			default:
				console.log('❌ Noto\'g\'ri rol. Foydalaning: admin, instructor, student')
		}

		process.exit(0)
	} catch (error) {
		console.error('Xato:', error)
		process.exit(1)
	}
}

const [, , email, role] = process.argv

if (!email || !role) {
	console.log('Ishlatish: npx --yes tsx scripts/set-role.ts <email> <role>')
	console.log('Rollar: admin, instructor, student')
	process.exit(1)
}

setRole(email, role)
