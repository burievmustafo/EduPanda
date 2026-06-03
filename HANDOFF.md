# EduPanda — Developer Handoff (Codex uchun)

> Bu hujjat loyihani **noldan kontekstsiz** davom ettirish uchun. O'qib chiqsang,
> butun arxitektura, konvensiyalar, gotcha'lar va qolgan vazifalar tushunarli bo'ladi.
>
> Qo'shimcha rejalar: `MOBILE_IMPLEMENTATION_PLAN.md`, `DATABASE_AND_API_PLAN.md`,
> `MVP_TASK_BREAKDOWN.md`, `CODE_NEXT_STEPS.md`.

---

## 1. Loyiha nima

EduPanda — **o'quv platformasi** (Japan Digital University topshirig'i). Talablar:
- Student video dars ko'radi → video ichida belgilangan vaqtda savol chiqadi → section oxirida test yechadi → baholanadi.
- **O'qituvchi va ota-ona** o'quvchi natijasini ko'radi.
- **Ikki til:** English + Japanese (en/ja).
- **Web + Mobil** ikkalasi.
- Oxirida **Vercel deploy**.

Holat: mobil deyarli to'liq ishlaydi. Web va deploy qolgan.

---

## 2. Arxitektura (bir repo, ikki ilova)

```
startup.sammi.ac/                  # ILDIZ = Next.js 14 web + backend (MongoDB)
├── app/[lng]/                     # Web sahifalar (locale prefix: /en, /uz, /ru, /tr)
│   └── api/mobile/                # 🔌 Mobil REST API (eng muhim — pastda batafsil)
├── database/                      # Mongoose modellar
├── lib/mobile/                    # API helperlar (auth, dto, access, ownership, ranges)
├── lib/mongoose.ts                # DB ulanish (+ DNS fix — pastga qara)
├── scripts/seed-edupanda.ts       # Demo seed
├── .env                           # Sirlar (gitignore'da, commit QILINMAYDI)
│
└── mobile/                        # 📱 Expo React Native app (SDK 54)
    └── src/
        ├── app/                   # expo-router ekranlar
        ├── api/                   # backend client (client, learning, dashboards, teacher, me)
        ├── hooks/queries.ts       # React Query hooks
        ├── components/, i18n/, store/, lib/, types/
```

**Backend va mobil bitta MongoDB + bitta API'ni ulashadi.**

---

## 3. Git branchlar

- **`eduPanda`** — ASOSIY ish. Expo Go'da ishlaydi. Dev-header auth (pastga qara). Shu yerда ishlaymiz.
- **`clerk-auth`** — Clerk integratsiyasi (WIP). Expo Go'da ISHLAMAYDI (native modul). Deploy paytida dev build bilan merge qilinadi.

Remote: `origin` = `https://github.com/burievmustafo/EduPanda.git` (foydalanuvchiniki),
`upstream` = asl loyiha (tegmaymiz).

---

## 4. Qanday ishga tushirish va test qilish

### Backend (web + API)
```bash
# ildizda
npx next dev -H 0.0.0.0     # 0.0.0.0 — telefon LAN orqali ulanishi uchun
# http://localhost:3000
```
`.env` da `MONGODB_URL`, `MONGODB_DB=edupanda`, Clerk keylari bor (ular allaqachon to'g'ri).

### Seed (demo data)
```bash
npx ts-node --transpile-only scripts/seed-edupanda.ts
```
Yaratadi: 1 kurs (HTML/CSS, en/ja), teacher/student/parent userlar, parent-student link.

### Mobil
```bash
cd mobile
npx expo start          # yangi paket qo'shsang: npx expo start -c
```
Expo Go bilan QR skanерla. **`mobile/src/config.ts` dagi `API_URL` ni kompyuter LAN IP'siga
moslang** (masalan `http://192.168.x.x:3000/en/api/mobile`). Hozir `10.20.15.165` qo'yilgan.

### API'ni to'g'ridan-to'g'ri test (curl)
```bash
curl -s -H "x-dev-clerk-id: seed_student_edupanda" http://localhost:3000/en/api/mobile/me
```

---

## 5. ⚠️ AUTH MODELI (eng muhim tushuncha)

Hozir **ikki rejim**:

1. **Dev-header (hozirgi, Expo Go uchun):** mobil har so'rovда `x-dev-clerk-id: <clerkId>`
   header yuboradi. Backend `requireUser` (`lib/mobile/api.ts`) buni **faqat `NODE_ENV !== 'production'`**
   da qabul qiladi. Mobil `src/store/session-store.ts` da role tanlanganда tegishli seed clerkId
   ishlatiladi (student→`seed_student_edupanda`, teacher→`seed_teacher_edupanda`, parent→`seed_parent_edupanda`).

2. **Clerk (real, `clerk-auth` branch'da):** `Authorization: Bearer <token>`. `requireUser` Clerk
   `auth()` ni o'qiydi va yangi userни avtomatik yaratadi (create-on-first-request).

**Nega Clerk hozir yo'q:** Clerk Expo `ExpoCryptoAES` native modulini talab qiladi, **Expo Go uни
qo'llab-quvvatlamaydi** → development build kerak. Shuning uchun Clerk `clerk-auth` branch'да saqlangan,
deploy paytida (dev build bilan) yoqiladi. **Web esa Clerk'ни to'g'ridan-to'g'ri ishlatadi** (web'da
muammo yo'q).

Seed userlar (clerkId lar — bular soxta, demo uchun):
- `seed_student_edupanda` — Yuki Tanaka (student)
- `seed_teacher_edupanda` — Sato Sensei (teacher)
- `seed_parent_edupanda` — Kenji Tanaka (parent, studentга linked)

---

## 6. Backend API (hammasi `app/[lng]/api/mobile/`, `/en/...` orqali chaqiriladi)

**Read:**
- `GET  me` · `PATCH me` (role onboarding: `{role}`)
- `GET  courses` · `GET courses/[id]` · `GET courses/[id]/sections`
- `POST courses/[id]/enroll`
- `GET  lessons/[id]` (⚠️ access-gated: pulli dars enroll/owner/admin kerak)
- `POST lessons/[id]/progress` (watched-ranges merge)
- `POST timed-questions/[id]/answer` (server baholaydi)
- `GET  sections/[id]/quiz` · `POST quizzes/[id]/submit` (server baholaydi)
- `GET  student/dashboard` · `teacher/dashboard` · `parent/dashboard` · `parent/children/[id]/progress`

**Teacher WRITE (ownership check bilan):**
- `POST teacher/courses` · `PATCH teacher/courses/[id]` (publish)
- `POST teacher/courses/[id]/sections`
- `POST teacher/sections/[id]/lessons`
- `POST teacher/lessons/[id]/timed-questions`
- `POST teacher/sections/[id]/quiz` · `POST teacher/quizzes/[id]/questions`

**Helperlar (`lib/mobile/`):**
- `api.ts` — `requireUser(req)`, `ApiError`, `ok()`, `handleError()`, `mapRole()`
- `dto.ts` — Mongoose→DTO mapperlar, `li18n()` (i18n fallback)
- `access.ts` — `hasCourseAccess`, `hasLessonAccess`
- `ownership.ts` — `requireTeacher`, `assert{Course,Section,Lesson,Quiz}Owner`, `slugify`
- `ranges.ts` — `mergeRanges`, `watchedSeconds`

---

## 7. Database modellar (`database/*.model.ts`)

Mavjud (web'dan, **additive** i18n maydonlar qo'shilgan — eski `title` String saqlanadi):
- `User` (role: student|teacher|parent|admin), `Course` (+titleI18n,descriptionI18n...),
  `Section` (+titleI18n), `Lesson` (+titleI18n,contentI18n,durationSec), `Purchase` (+source)

Yangi:
- `LessonProgress` (watchedRanges, percent), `TimedQuestion`, `TimedQuestionAnswer`,
  `SectionQuiz`, `QuizQuestion`, `QuizAttempt`, `ParentStudentLink`

⚠️ **Localization qoidasi:** yangi kontent `{en, ja}` (en majburiy, ja ixtiyoriy). Mavjud
`title`/`description` String → API mapper `li18n(titleI18n, title)` orqali wrap qiladi
(web buzilmasligi uchun additive yondashuv).

---

## 8. Mobil arxitektura (`mobile/src/`)

- **Routing:** expo-router. `app/index.tsx` (role-select) → `app/(tabs)/` (student: home/learning/profile),
  `app/teacher/*`, `app/parent/*`, `app/course/[courseId]`, `app/learn/[lessonId]`, `app/quiz/[sectionId]`.
- **API client:** `api/client.ts` (fetch + auth header), `api/learning.ts`, `api/dashboards.ts`,
  `api/teacher.ts`, `api/me.ts`. Hammasi `src/types/dto.ts` contractlariga bo'ysunadi.
- **Data:** React Query (`hooks/queries.ts`). Eski `useAsync` ham bor (ba'zi detail ekranlarда).
- **State:** Zustand — `store/session-store.ts` (role + devClerkId), `store/language-store.ts` (en/ja).
- **i18n:** `i18n/locales/{en,ja}.ts`. UI matnlari shu yerда. Kontent `tText(localizedText, locale)`.
- **Theme:** `constants/theme.ts` + `ThemedText`/`ThemedView`. Brend rang `BRAND = #208AEF`.

### Mobil gotcha'lar (MUHIM)
- **typedRoutes O'CHIRILGAN** (`app.json` `experiments.typedRoutes: false`) — SDK 54 typegen
  noto'g'ri ishlagani uchun. `router.push('/path')` string sifatida ishlaydi.
- **Clerk Expo Go'da yo'q** (yuqorida). Clerk import qiladigan kod Expo Go'ni crash qiladi.
- Bundle/typecheck tekshirish: `cd mobile && npx tsc --noEmit` va
  `npx expo export --platform android --output-dir dist-tc` (keyin dist-tc o'chir).

---

## 9. ⚠️ DNS fix (MongoDB Atlas)

`lib/mongoose.ts` da `dns.setServers(['8.8.8.8','1.1.1.1'])` + `dns.promises.setServers(...)` bor.
Sababi: ba'zi tarmoqlarda Node `mongodb+srv://` SRV so'rovini rad etadi (`ECONNREFUSED`).
**O'chirma.** (Production/Vercel'da ham zarar qilmaydi.)

---

## 10. QOLGAN VAZIFALAR (batafsil)

### 🟡 Phase 3 — Parent ↔ Student invite-code (mobil + backend)
Hozir parent-student faqat seed orqali bog'langan. Yangi parent o'z farzandiga ulansin.

**Backend (yangi endpointlar `app/[lng]/api/mobile/`):**
- `POST student/invite-code` — student kod yaratadi. `ParentStudentLink` o'rniga, yoki
  alohida `code` saqla (masalan 6 xonali). Qaytaradi: `{ code }`.
  - Soddaroq: student'ning `_id` ni qisqartirib kod qilish yoki random kod + `code`ni
    pending `ParentStudentLink`да saqlash.
- `POST parent/link` — body `{ code }`. Kodга mos studentни topadi, `ParentStudentLink{ parent, student, status:'active' }` yaratadi (upsert). Ownership: faqat parent role.

**Mobil:**
- Student: profil yoki yangi ekranда "Invite code" ko'rsatish (`api/me.ts` ga `getInviteCode` qo'sh).
- Parent: dashboard'да "+ Add child" → kod kiritish formasi → `linkChild(code)`.
  - `mobile/src/app/parent/index.tsx` ga tugma, yangi `parent/add-child.tsx` ekran.
- i18n: `en.ts`/`ja.ts` ga `parentLink` kalitlar.

**Acceptance:** yangi parent kod kiritib farzandига ulansin, dashboard'да ko'rsin.

---

### 🟢 Phase 4 — WEB moslash (TOPSHIRIQ TALABI, eng muhim)
Hozirgi web = eski Udemy klon (`app/[lng]/(root)/...`). Uни EduPanda o'quv modeliга moslash kerak.

**Yondashuv (tavsiya):** mavjud `/api/mobile/*` endpointlarini **web'dan ham** ishlat (yoki server
actions yoz). Web Clerk'ни **to'g'ridan-to'g'ri** ishlatadi (web'da Clerk muammosi yo'q — bu afzallik!).
Mobil DTO'lar va backend allaqachon tayyor — web faqat UI.

**Web sahifalar (Next.js app router, `app/[lng]/edupanda/` yoki mavjudни qayta ishlat):**
1. **Course list** — `GET /api/mobile/courses` (web Clerk cookie bilan auth bo'ladi).
2. **Course detail** — sections/lessons, enroll tugma, qulflar.
3. **Learning page** — video player (`<video>` yoki react-player) + timed savol modal + progress.
   - Mobil mantig'i `mobile/src/app/learn/[lessonId].tsx` da — web uchun shu logikani ko'chir.
4. **Quiz page** — savollar + submit + natija.
5. **Dashboards** — student/teacher/parent (mobil dashboard ekranlariga mos).
6. **Teacher builder** — kurs/dars/savol/test yaratish (mobil teacher ekranlariga mos).
7. **en/ja** — web allaqachon `next-intl` ishlatadi. Yangi kontent uchun `titleI18n` ni `lng` bo'yicha ko'rsat.

**Muhim nuans:** web Clerk session'i `/api/mobile/*` ga cookie orqali yuboriladi. `requireUser`
allaqachon Clerk `auth()` ni o'qiydi — web'dan kelgan so'rovда ishlaydi. Ya'ni **backend tayyor**,
faqat web UI yozish kerak. (Dev-header faqat mobil/dev uchun.)

**Soddalashtirish:** butun eski Udemy UI'ни qayta yozmaslik kerak. EduPanda uchun **bir nechta
fokuslangan sahifa** (yuqoridagi 1-6) yetarli. Eski `(root)` sahifalarни qoldirib, yangi
`edupanda` route group qo'shish mumkin.

**Acceptance:** web'da Clerk bilan login → kurs ko'rish → video+test → teacher/parent natija ko'rish, en/ja.

---

### ⚫ Phase 5 — Deploy (oxirida)

**Web + API → Vercel:**
1. Vercel'ga repo ulash, root = ildiz (Next.js).
2. Env'lar (Vercel dashboard): `MONGODB_URL`, `MONGODB_DB`, barcha `NEXT_PUBLIC_CLERK_*`,
   `CLERK_SECRET_KEY`, `NEXT_CLERK_WEBHOOK_SECRET`, `NEXT_PUBLIC_BASE_URL` (production domen).
   (Clerk production keylari kerak bo'lishi mumkin — hozir `pk_test`/`sk_test`.)
3. Build: Next.js default. Deploy.
4. ⚠️ Xavfsizlik: production'да `x-dev-clerk-id` avtomatik o'chadi (`NODE_ENV==='production'` guard) — tekshir.

**Mobil → EAS development build + Clerk:**
1. `clerk-auth` branch'ни `eduPanda`ga merge qil (Clerk kodi qaytadi).
2. `npm i -g eas-cli` → `eas login` (bepul Expo akkaunt) → `eas build:configure`.
3. `eas build -p android --profile development` → APK o'rnat (Expo Go o'rniga). Endi Clerk ishlaydi.
4. `mobile/src/config.ts` `API_URL` ni Vercel URL'ga o'zgartir: `https://<app>.vercel.app/en/api/mobile`.
5. Production: `eas build -p android --profile production` → APK/Play Store.

**Mobil app ikonka:** `mobile/assets/images/icon.png` ni 1024×1024 EduPanda PNG bilan almashtir
(hozir Expo default). Splash foni allaqachon brend ko'k (#208AEF).

---

## 11. Kichik polish / cleanup (ixtiyoriy)
- Detail ekranlar (`course/[courseId]`, `learn`, `quiz`, teacher builder, profile, create-course)
  hali `useAsync` ishlatadi — istasang React Query'ga ko'chir (`hooks/queries.ts` ga hook qo'sh).
- `course/[courseId]/route.ts` va boshqa read'larга ham access/published filtrlar kerak bo'lishi mumkin.
- Test orqali yaratilgan ortiqcha "Japanese for Beginners" kursi DB'да qolgan bo'lishi mumkin (zarar yo'q).
- Error holatlar uchun retry tugmasi qo'shish.
- Lint: `cd mobile && npx expo lint`.

---

## 12. Tezkor "qayerdan boshlash" (Codex uchun)

1. `eduPanda` branch'da ekanligingni tekshir: `git branch --show-current`.
2. Backend: `npx next dev -H 0.0.0.0`. Seed: `npx ts-node --transpile-only scripts/seed-edupanda.ts`.
3. Mobil: `cd mobile && npx expo start` (config.ts `API_URL` ni LAN IP'ga moslab).
4. Eng muhim keyingi ish: **Phase 4 (web)** — topshiriq web+mobil talab qiladi.
5. Har o'zgarishdan keyin: mobil `npx tsc --noEmit` + `npx expo export --platform android`.
6. Commit kichik-kichik, `.env` ni HECH QACHON commit qilma (gitignore'da).

Omad! Kod toza, modular va testlangan. Backend tayyor — ko'p ish UI (web) tomonда.
