/**
 * Mobil ilova konfiguratsiyasi.
 *
 * API_URL — backend manzili. Telefon LAN orqali ulanadi, shuning uchun
 * `localhost` EMAS, kompyuterning LAN IP'si bo'lishi kerak.
 *
 * O'zgartirish: kompyuter IP'si o'zgarsa (boshqa WiFi) shu yerni yangilang,
 * yoki mobile/.env da EXPO_PUBLIC_API_URL bering.
 */
export const API_URL =
	process.env.EXPO_PUBLIC_API_URL ?? 'http://10.20.15.165:3000/en/api/mobile'

/**
 * Vaqtinchalik dev autentifikatsiya (M3 bosqich 1).
 * M3 bosqich 2 da Clerk real token bilan almashtiriladi.
 * Backend buni faqat NODE_ENV !== 'production' da qabul qiladi.
 */
export const DEV_CLERK_ID =
	process.env.EXPO_PUBLIC_DEV_CLERK_ID ?? 'seed_student_edupanda'
