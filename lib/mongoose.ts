import mongoose, { ConnectOptions } from 'mongoose'
import dns from 'dns'

// Node'ning ba'zi tarmoqlarda SRV (mongodb+srv://) resolveri ishlamaydi (ECONNREFUSED).
// MongoDB driver `dns.promises.resolveSrv` ishlatadi — shuning uchun IKKALA resolverni
// ham ishonchli public DNS'ga o'tkazamiz.
const DNS_SERVERS = ['8.8.8.8', '1.1.1.1']
try {
	dns.setServers(DNS_SERVERS)
} catch {}
try {
	dns.promises.setServers(DNS_SERVERS)
} catch {}

let isConnected: boolean = false

export const connectToDatabase = async () => {
	mongoose.set('strictQuery', true)

	if (!process.env.MONGODB_URL) {
		throw new Error('MISSING MONGODB_URL')
	}

	if (isConnected || mongoose.connection.readyState === 1) {
		isConnected = true
		return
	}

	try {
		if (mongoose.connection.readyState !== 0) {
			await mongoose.disconnect()
		}

		const options: ConnectOptions = {
			dbName: process.env.MONGODB_DB,
			autoCreate: true,
		}

		await mongoose.connect(process.env.MONGODB_URL, options)
		isConnected = true
	} catch (error) {
		console.error('MongoDB connection failed:', error)
		isConnected = false
		throw error
	}
}
