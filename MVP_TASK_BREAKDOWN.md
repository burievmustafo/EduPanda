# MVP Task Breakdown

> Bu hujjat `MOBILE_IMPLEMENTATION_PLAN.md` va `DATABASE_AND_API_PLAN.md` ni
> **aniq, kichik, bajariladigan tasklarga** bo'ladi. Har task: maqsad, qadamlar va
> "Definition of Done" (DoD) bilan. Tartib bilan yuriladi, chalg'imaslik uchun.

**Belgilar:** `[ ]` qilinmagan · `[~]` jarayonda · `[x]` tugagan
**Hajm:** S = kichik (≤0.5 kun) · M = o'rta (0.5–1 kun) · L = katta (1–2 kun)

---

## ✅ Holat (oxirgi yangilanish)

- **Milestone 0 — Foundation:** ✅ tugadi (Expo SDK 54 app, EduPanda nomi, M1 paketlar).
- **Milestone 1 — Mock Student Learning Flow:** ✅ tugadi va `tsc` + Metro bundle (android) o'tdi.
  - Role tanlash → Home → Course → Learning (video + timed savol) → Section test → Natija.
  - EN/JA real-time almashtirish, watched-ranges progress, server-side baholash.
  - Demo: `cd mobile && npx expo start`.
- **Keyingi:** Milestone 2 — Backend schema + `/api/mobile/*` (real DB).

> Eslatma: styling — Expo template theme + StyleSheet (NativeWind emas, SDK 54 mosligi sababli).
> Clerk va React Query M3'ga qoldirildi (mock demoga kerak emas).

---

## MVP Scope (muzlatildi)

Faqat shular MVP'ga kiradi:
- Student video ko'radi (progress watched-ranges bilan)
- Video ichida belgilangan vaqtda savol chiqadi (submit/skip)
- Section oxirida 15-20 savolli test (server baholaydi)
- Student progress dashboard
- Teacher student natijalarini ko'radi
- Parent farzand natijasini ko'radi
- en/ja UI + kontent
- Web Vercel deploy
- Mobile Expo local demo

**MVP'dan TASHQARI (keyingi bosqich):** AI, real payment, push notification, invite-code parent link, offline mode.

---

## Milestone 0 — Repo & Tartib (Foundation)

> Maqsad: ishchi muhit va papka strukturasi tayyor.

- [ ] **M0.1 (S)** `mobile/` papkasini yaratish, Expo app init qilish
  - `npx create-expo-app@latest mobile --template` (TypeScript, Expo Router)
  - DoD: `npx expo start` ishlaydi, bo'sh app ochiladi.
- [ ] **M0.2 (S)** Asosiy paketlarni o'rnatish
  - `expo-router`, `nativewind` + `tailwindcss`, `@clerk/clerk-expo`, `expo-secure-store`,
    `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `i18next` + `react-i18next`,
    `expo-video` (yoki `expo-av`)
  - DoD: `npm i` xatosiz, NativeWind konfiguratsiya tayyor.
- [ ] **M0.3 (S)** Papka skeletoni (`MOBILE_IMPLEMENTATION_PLAN.md` §4 bo'yicha)
  - `src/{api,components,features,hooks,i18n,navigation,screens,store,types,utils,mock}`
  - DoD: papkalar va `index` placeholderlar mavjud.
- [ ] **M0.4 (S)** `.env` va konfiguratsiya
  - `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - DoD: env o'qiladi, `app.config.ts` sozlangan.

---

## Milestone 1 — Mock Student Learning Flow (BIRINCHI DEMO 🎯)

> Maqsad: backendsiz, mock data bilan to'liq student oqimi ishlaydi. Ko'rsatsa bo'ladigan natija.
> Asos: `DATABASE_AND_API_PLAN.md` §4 (DTO) va §7 (mock data).

### 1A. Shared types + mock data
- [ ] **M1.1 (M)** DTO tiplarini `src/types/` ga ko'chirish (DATABASE_AND_API_PLAN §4.2 dan aynan)
  - DoD: `CourseDTO`, `LessonDetailDTO`, `TimedQuestionDTO`, `QuizDTO` va h.k. mavjud.
- [ ] **M1.2 (M)** `src/mock/` da demo data (DTO shaklida)
  - 1 kurs (en/ja), 1 section, 2-3 lesson, Big Buck Bunny video
  - Timed questions: 0:30, 1:15, 2:00 · Quiz: 5 savol
  - DoD: mock funksiyalar DTO interfeysiga bo'ysunadi (`getMockCourse()` va h.k.).

### 1B. i18n + theme
- [ ] **M1.3 (S)** i18n setup (`en.json`, `ja.json`) + til almashtirish toggle
  - DoD: tugma bosilganda UI en↔ja almashadi.
- [ ] **M1.4 (S)** Design tokens / theme (ranglar, spacing, typography) + asosiy UI komponentlar
  - `Button`, `Card`, `Screen`, `Text`, `ProgressBar`, `Modal`
  - DoD: komponentlar NativeWind bilan ishlaydi.

### 1C. Navigatsiya + role
- [ ] **M1.5 (M)** Expo Router struktura: `(auth)`, `(student)`, `(teacher)`, `(parent)`
  - MVP: mock "role selection" ekrani (haqiqiy auth M2'da)
  - DoD: role tanlanganda tegishli stackka o'tadi.

### 1D. Student ekranlari (mock)
- [ ] **M1.6 (M)** Student Home — continue learning, recommended, progress
- [ ] **M1.7 (S)** Course List + Course Detail (section/lesson accordion)
- [ ] **M1.8 (L)** Learning Page + Video Player
  - `expo-video`, play/pause, `currentTimeSec`, `durationSec` kuzatuvi
  - watched-ranges local tracking (DATABASE_AND_API_PLAN §3.2 logikasi)
  - DoD: video o'ynaydi, watchedPercent local hisoblanadi.
- [ ] **M1.9 (L)** Timed Question Modal
  - `currentTime >= triggerTime` && `!shownInSession` && `!answered` → pauza + modal
  - Submit/Skip → mock natija saqlanadi, explanation ko'rsatiladi, video davom etadi
  - DoD: 0:30 da savol chiqadi, qayta chiqmaydi, skip ishlaydi.
- [ ] **M1.10 (M)** Section Final Test ekrani
  - counter `1/5`, options, Previous/Next, Submit
  - DoD: barcha savol javoblanadi, submit bosiladi.
- [ ] **M1.11 (M)** Quiz Result ekrani — score, correct/total, passed/failed, review
  - DoD: mock baho ko'rsatiladi (client-side, faqat mock uchun).
- [ ] **M1.12 (S)** Student Dashboard — progress, oxirgi test natijalari (mock)

**🎯 Milestone 1 DoD:** Expo local appda student → home → course → video → timed question →
section test → result → dashboard oqimi mock data bilan to'liq ishlaydi. **Demo tayyor.**

---

## Milestone 2 — Backend Schema & API

> Maqsad: real backend. Web Next.js loyihasida modellar + `/api/mobile/*` route handlers.
> Asos: `DATABASE_AND_API_PLAN.md` §3, §5, §6.

### 2A. Database
- [ ] **M2.1 (M)** Modellarni yangilash: `User.role` enum, `Course/Section/Lesson` → `LocalizedText`,
      `Lesson.durationSec`, `Purchase.source`
- [ ] **M2.2 (M)** Yangi modellar: `LessonProgress`, `TimedQuestion`, `TimedQuestionAnswer`,
      `SectionQuiz`, `QuizQuestion`, `QuizAttempt`, `ParentStudentLink` (+ indexlar)
- [ ] **M2.3 (M)** Migration script (role mapping, title→LocalizedText, duration→durationSec)
- [ ] **M2.4 (S)** Seed script: 1 teacher, 1 student, 1 parent, active link, demo kurs+questions+quiz

### 2B. Auth qatlami
- [ ] **M2.5 (M)** `requireUser(req)` helper + Clerk Bearer token tekshiruvi
- [ ] **M2.6 (S)** Ownership helperlar (`hasCourseAccess`, parent-link check) + xato formati

### 2C. API endpointlar (DTO mapper bilan)
- [ ] **M2.7 (M)** Course/Section endpointlar (`courses`, `:id`, `sections`, `enroll`)
- [ ] **M2.8 (M)** Lesson + progress (`lessons/:id`, `progress` — watched-ranges merge serverda)
- [ ] **M2.9 (M)** Timed question answer (`answer` — server `isCorrect` hisoblaydi, `correctOptionId` faqat javobdan keyin)
- [ ] **M2.10 (L)** Quiz: `quiz`, `start`, `submit` (server baholaydi), `attempts`
- [ ] **M2.11 (M)** Dashboard endpointlar (student/teacher/parent)
  - DoD: Postman/Thunder bilan har endpoint to'g'ri DTO qaytaradi, `correctOptionId` sizmaydi.

---

## Milestone 3 — Mobile ↔ Backend Integratsiya

> Maqsad: mobile mock'dan real API'ga o'tadi.

- [ ] **M3.1 (M)** API client (`src/api/`) + React Query setup + auth header (Clerk token)
- [ ] **M3.2 (S)** Clerk Expo auth real ulanishi (mock role selection o'rniga)
- [ ] **M3.3 (M)** Course/lesson ekranlari mock→API almashtirish
- [ ] **M3.4 (M)** Progress sync (10-15s, pause, leave, ended) → `POST progress`
- [ ] **M3.5 (M)** Timed question + quiz submit real API'ga ulanadi
  - DoD: MongoDB'da progress/answer/attempt yoziladi, dashboard real data ko'rsatadi.

---

## Milestone 4 — Teacher Features

- [ ] **M4.1 (M)** Teacher Dashboard + My Courses (ownership)
- [ ] **M4.2 (L)** Course/Section/Lesson builder (en/ja kontent formalari, `react-hook-form`+`zod`)
- [ ] **M4.3 (M)** Timed Question builder (triggerTimeSec belgilash)
- [ ] **M4.4 (M)** Section Quiz builder (15-20 savol)
- [ ] **M4.5 (M)** Student Progress / Quiz Analytics ko'rinishi
  - DoD: teacher o'z kursini to'liq boshqaradi, student natijasini ko'radi.

---

## Milestone 5 — Parent Features

- [ ] **M5.1 (S)** Parent Dashboard + Child Selector (linked children)
- [ ] **M5.2 (M)** Child Course Progress + Recent Quiz Results + Last Activity
  - DoD: parent faqat bog'langan farzand natijasini ko'radi (link check ishlaydi).

---

## Milestone 6 — Web Alignment & Deploy

> Maqsad: hozirgi Next.js web yangi modelga moslashadi va Vercel'ga chiqadi.

- [ ] **M6.1 (M)** Web: `role` (parent qo'shildi) + yangi modellarga moslash
- [ ] **M6.2 (L)** Web student learning page (Coursera-style: video + timed question + quiz)
- [ ] **M6.3 (M)** Web teacher analytics + parent ko'rinishi
- [ ] **M6.4 (M)** Web en/ja localization (uz/ru/tr arxivlash)
- [ ] **M6.5 (S)** Vercel deploy (env, build, domen)
  - DoD: web productionda, mobile bilan bir xil backenddan ishlaydi.

---

## Bog'liqliklar (Dependency tartibi)

```text
M0 → M1 (mock demo)
        ↓
M2 (backend) → M3 (mobile integratsiya)
                    ↓
              M4 (teacher) → M5 (parent)
                                  ↓
                              M6 (web + deploy)
```

Tavsiya: **M0 → M1 ni to'liq tugatib, demo ko'rsatib oling.** Keyin M2'ga o'tamiz.
AI va payment — barcha milestonelardan keyin, alohida bosqich.

---

## Birinchi Sprint (bugun boshlanadigan)

1. **M0.1–M0.4** — Expo skeleton (yarim kun)
2. **M1.1–M1.2** — DTO tiplar + mock data (yarim kun)
3. **M1.3–M1.5** — i18n, theme, navigatsiya

Shu uchtasi tugasa, M1.6+ (ekranlar) ga o'tamiz va birinchi ko'rinadigan demo paydo bo'ladi.
