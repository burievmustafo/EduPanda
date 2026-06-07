import mongoose from 'mongoose'
import fs from 'fs'
import dns from 'dns'
dns.setServers(['8.8.8.8', '1.1.1.1'])
const env = fs.readFileSync('.env', 'utf8')
const m = env.match(/^(?:MONGODB_URL|MONGODB_URI)\s*=\s*(.+)$/m)
const uri = m ? m[1].trim().replace(/^["']|["']$/g, '') : null
await mongoose.connect(uri)
const db = mongoose.connection.db
const courses = db.collection('courses')
const total = await courses.countDocuments({})
const published = await courses.countDocuments({ published: true })
console.log('courses: total=%d published=%d', total, published)
const sample = await courses
	.find({}, { projection: { title: 1, published: 1 } })
	.limit(6)
	.toArray()
for (const c of sample)
	console.log('  -', c.published ? 'PUB  ' : 'draft', JSON.stringify(c.title)?.slice(0, 70))
const users = db.collection('users')
const u = await users.findOne(
	{ email: { $regex: '^mustafoburiev1107@gmail.com$', $options: 'i' } },
	{ projection: { email: 1, role: 1, clerkId: 1, isAdmin: 1, fullName: 1 } }
)
console.log('USER mustafoburiev1107:', u ? JSON.stringify(u) : 'NOT FOUND')
console.log('users total=%d', await users.countDocuments({}))
await mongoose.disconnect()
