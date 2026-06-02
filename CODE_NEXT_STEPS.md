# EduPanda — Keyingi Kod Qadamlari

> Holat: ✅ M0 Foundation · ✅ M1 Mock mobil · ✅ M2 Backend (DB+API) · 🔄 M3 ulash (bosqich 1 tayyor)
> Bu hujjat qolgan kod ishlarini ustuvorlik bo'yicha beradi.

---

## 🔴 1-ustuvor: M3 bosqich 2 — Clerk real login (mobil)

Hozir auth vaqtinchalik `x-dev-clerk-id` header bilan (hamma "student"). Real bo'lishi uchun:

1. **Paket:** `cd mobile && npx expo install @clerk/clerk-expo expo-secure-store`
2. **Provider:** `src/app/_layout.tsx` ni `<ClerkProvider publishableKey=...>` bilan o'rash
   - Key: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (web `.env` dagi `pk_test_...` bilan bir xil)
   - Token cache: `expo-secure-store`
3. **Login ekranlari:** `src/app/(auth)/sign-in.tsx`, `sign-up.tsx` (Clerk `useSignIn`/`useSignUp`)
4. **Token:** `src/api/client.ts` da `x-dev-clerk-id` o'rniga:
   ```ts
   const token = await getToken()
   headers: { Authorization: `Bearer ${token}` }
   ```
5. **Role-select** ekranini real auth bilan bog'lash (login bo'lgach role'ga qarab yo'naltirish)

**Backend tarafi tayyor:** `requireUser` allaqachon Clerk `auth()` ni o'qiydi (Bearer token avtomatik ishlaydi, chunki route public). Faqat mobil token yuborishni boshlasa bo'ldi.

> ⚠️ Yangi user birinchi marta kirganда `User` hujjati yaratilishi kerak — Clerk webhook
> (`app/[lng]/api/webhook`) buni qiladi, lekin mobil uchun "create-on-first-request"
> ni `requireUser` ga qo'shish kerak bo'lishi mumkin.

---

## 🟠 2-ustuvor: M4 — Teacher ekranlari (mobil) + WRITE API

Topshiriq talabi: o'qituvchi kurs/test yaratadi va natijalarni ko'radi.

### 2a. Teacher ko'rish ekranlari (API tayyor, faqat UI)
- `src/app/(teacher)/dashboard.tsx` → `GET /teacher/dashboard` (kurslar, student soni, o'rtacha ball)
- `src/app/(teacher)/course/[courseId]/students.tsx` → student natijalari

### 2b. WRITE endpointlar (YANGI — hozir faqat read bor)
`app/[lng]/api/mobile/` ga qo'shish kerak:
```
POST   /teacher/courses                      (kurs yaratish)
PATCH  /teacher/courses/:id                  (tahrirlash, ownership check)
POST   /teacher/sections                     (section)
POST   /teacher/lessons                      (lesson + video)
POST   /teacher/timed-questions              (video savol)
POST   /teacher/quizzes  +  /quiz-questions  (test savollari)
```
Har birida **ownership check** (`course.instructor === user._id`).

### 2c. Teacher yaratish ekranlari (mobil)
- Course builder, section/lesson builder, timed-question builder, quiz builder
- `react-hook-form` + `zod`, en/ja kontent formalari

---

## 🟡 3-ustuvor: M5 — Parent ekranlari (mobil)

API tayyor — faqat UI:
- `src/app/(parent)/dashboard.tsx` → `GET /parent/dashboard` (farzandlar ro'yxati)
- `src/app/(parent)/child/[studentId].tsx` → `GET /parent/children/:id/progress`
- **Parent-student bog'lash:** hozir faqat seed orqali. Invite-code oqimi qo'shish:
  - `POST /parent/link` (kod bilan) + `POST /student/invite-code` (kod yaratish)

---

## 🟢 4-ustuvor: M6 — Web moslash + Vercel deploy

1. **Web buzilmasligini tekshirish:** yangi modellar additive, lekin `next build` bilan tekshirish
2. **Web learning sahifasi** (ixtiyoriy): student video+test webда ham (Coursera uslubi)
3. **Vercel deploy:**
   - Env: MongoDB Atlas (bor), Clerk production keys, hammasi Vercel dashboard'ga
   - `NEXT_PUBLIC_BASE_URL` ni production domenга
   - Mobil `EXPO_PUBLIC_API_URL` ni production URL'ga (`https://...vercel.app/en/api/mobile`)

> ⚠️ **Xavfsizlik (deploy'dan oldin majburiy):** `lib/mobile/api.ts` dagi `x-dev-clerk-id`
> fallback faqat `NODE_ENV !== 'production'` da ishlaydi — production'da o'chadi (yaxshi).
> Lekin tekshirib qo'ying: production'da faqat Clerk Bearer ishlasin.

---

## ⚪ 5-ustuvor: Polish / production tayyorlik

- Mobil: loading/error holatlar, pull-to-refresh, bo'sh holatlar
- App ikonka + splash (hozir Expo'niki) → EduPanda brendi
- React Query (`useAsync` o'rniga) — cache, retry, refetch
- Kurs rasmi (previewImage) — home/course kartalarда
- `mongoose.ts` DNS fix'ni production'da ehtiyotkorlik bilan ko'rib chiqish

---

## Tavsiya etilgan tartib

```
M3b (Clerk login)  →  M4 (teacher: dashboard + write API)  →  M5 (parent)  →  M6 (deploy)  →  polish
```

**Eng tez "wow" effekt:** M4a + M5 ko'rish ekranlari (API tayyor, faqat UI) — telefonда
teacher/parent haqiqiy natijalarni ko'radi. Bu topshiriqning asosiy talabini to'liq yopadi.
