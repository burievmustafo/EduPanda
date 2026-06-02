# Database & API Plan

> Bu hujjat `MOBILE_IMPLEMENTATION_PLAN.md` ning davomi. Unda umumiy reja bo'lsa, bu yerda
> **aniq database modellari, shared TypeScript contractlar (DTO), API endpointlar va auth qatlami**
> qat'iy belgilanadi. Kodga shu hujjatdan keyin o'tiladi.

---

## 0. Tasdiqlangan Qarorlar (Decision Log)

Quyidagi 7 qaror muhokama qilinib tasdiqlangan. Butun hujjat shularga asoslanadi.

| # | Qaror | Tafsilot |
| --- | --- | --- |
| 1 | **Progress modeli `ObjectId(User)` ref** | Yangi `LessonProgress` modeli. Clerk→User aylantirish API kirishida bir marta. |
| 2 | **To'liq en/ja localization** | `LocalizedText = { en: string; ja?: string }`. `en` majburiy, `ja` ixtiyoriy + fallback. Web `uz/ru/tr` UI arxivlanadi. |
| 3 | **Role enum, DB canonical + Clerk cache** | `role: 'student'|'teacher'|'parent'|'admin'`. `approvedInstructor` saqlanadi, `isAdmin` deprecated. |
| 4 | **Enrollment = `Purchase` + `source`** | Yangi model yo'q. `source: 'purchase'|'mock'|'admin'`. MVP'da mock enroll. |
| 5 | **REST faqat mobile uchun** | Web hozircha server actions'da qoladi. `/api/mobile/*` faqat Expo uchun. |
| 6 | **`correctOptionId` mijozga yuborilmaydi** | Baholash serverda. Submit'dan keyingina `isCorrect` + `explanation` qaytadi. |
| 7 | **Mock video: Big Buck Bunny** | Aniq davomiylikli ochiq namuna. Timed questionlar qat'iy soniyalarga. |

---

## 1. Localization Standarti

Barcha yangi va migratsiya qilinadigan kontent maydonlari shu tipga bo'ysunadi:

```ts
type LocalizedText = {
  en: string   // majburiy
  ja?: string  // ixtiyoriy
}
```

**Fallback qoidasi (markazlashgan helper):**

```ts
function tText(value: LocalizedText, lng: 'en' | 'ja'): string {
  if (lng === 'ja' && value.ja && value.ja.trim().length > 0) return value.ja
  return value.en
}
```

Qoidalar:
- DB'da har doim ikkala til ham saqlanadi (mavjud bo'lsa).
- `ja` bo'sh bo'lsa, mijozga `en` qaytadi (server tomonda hal qilinadi, mijoz fallback logikasini bilmaydi).
- UI label/tugma matnlari — `mobile/src/i18n/en.json` va `ja.json` da (kontentdan alohida).
- Web `locales/uz.json`, `ru.json`, `tr.json` — `locales/_archive/` ga ko'chiriladi (o'chirilmaydi, kelajak uchun saqlanadi).

---

## 2. Role Tizimi

### 2.1 Yangi `role` enum

```ts
type UserRole = 'student' | 'teacher' | 'parent' | 'admin'
```

### 2.2 Haqiqat manbai (source of truth)

- **MongoDB `User.role`** = yagona asosiy haqiqat (canonical).
- **Clerk `publicMetadata.role`** = nusxa (cache). Middleware va navigatsiya DB'ga bormay shundan o'qiydi.
- Role o'zgarganda: avval DB yangilanadi, keyin Clerk metadata sync qilinadi (`syncRoleToClerk(userId)`).

### 2.3 Migratsiya (mavjud datadan)

| Eski holat | Yangi `role` |
| --- | --- |
| `role: 'user'` | `'student'` |
| `role: 'instructor'` | `'teacher'` |
| `isAdmin: true` | `'admin'` |

- `approvedInstructor` (boolean) **saqlanadi** — "teacher ariza berdi, admin tasdig'i kutilmoqda" ma'nosi.
- `isAdmin` — **deprecated** (eski kod buzilmasligi uchun vaqtincha qoldiriladi, yangi kod `role === 'admin'` ishlatadi).

---

## 3. Database Modellari

### 3.1 Mavjud modellarga o'zgartirishlar

#### User (yangilanadi)

```ts
User {
  fullName: string
  clerkId: string
  email: string
  picture?: string
  bio?: string
  phone?: string
  // ... mavjud profil maydonlari (job, website, linkedin, github, youtube) ...
  customerId?: string

  role: 'student' | 'teacher' | 'parent' | 'admin'   // default: 'student'
  approvedInstructor: boolean                          // default: false
  isAdmin?: boolean                                    // DEPRECATED

  favouriteCourses: ObjectId[]   // ref Course
  archiveCourses: ObjectId[]
  wishlistCourses: ObjectId[]
}
```

#### Course (localized)

```ts
Course {
  title: LocalizedText          // String -> LocalizedText
  description: LocalizedText
  learning: LocalizedText
  requirements: LocalizedText
  level: string
  category: string
  language: string              // kurs asosiy tili (metadata)
  oldPrice?: number
  currentPrice?: number
  previewImage?: string
  published: boolean            // default: false
  instructor: ObjectId          // ref User (role=teacher)
  slug: string
  tags?: string
  purchases: ObjectId[]         // ref Purchase
}
```

#### Section (localized)

```ts
Section {
  title: LocalizedText
  position: number
  course: ObjectId              // ref Course
  lessons: ObjectId[]           // ref Lesson
}
```

#### Lesson (localized + video metadata)

```ts
Lesson {
  title: LocalizedText
  position: number
  content: LocalizedText        // dars matni/transcript
  videoUrl: string
  durationSec: number           // YANGI: yagona soniya (hours/minutes/seconds o'rniga ham hisoblanadi)
  duration: { hours, minutes, seconds }   // mavjud — saqlanadi, durationSec'ni hisoblaydi
  section: ObjectId             // ref Section
  free: boolean                 // default: false
}
```

> Eslatma: `Lesson.userProgress[]` massivi olib tashlanadi. Progress endi alohida
> `LessonProgress` kolleksiyasida `student + lesson` bo'yicha so'raladi (tozaroq, kengayadigan).

#### Purchase (= Enrollment)

```ts
Purchase {
  user: ObjectId                // ref User
  course: ObjectId              // ref Course
  source: 'purchase' | 'mock' | 'admin'   // YANGI, default: 'purchase'
  createdAt, updatedAt
}
```

**Access tekshiruvi (markazlashgan helper):**

```ts
async function hasCourseAccess(user, course): boolean {
  if (user.role === 'admin') return true
  if (String(course.instructor) === String(user._id)) return true
  return await Purchase.exists({ user: user._id, course: course._id })
}
// lesson.free === true bo'lsa, kurs access'isiz ham shu lesson ochiq.
```

---

### 3.2 Yangi modellar

#### LessonProgress (YANGI — UserProgress o'rniga)

```ts
LessonProgress {
  student: ObjectId             // ref User
  lesson: ObjectId              // ref Lesson
  course: ObjectId              // ref Course (denormalizatsiya — dashboard tez ishlashi uchun)

  watchedRanges: Array<{ start: number; end: number }>   // soniyalarda
  watchedSeconds: number        // overlap merge qilingan unique soniyalar
  watchedPercent: number        // 0..100
  lastPositionSec: number       // "davom ettirish" uchun
  isCompleted: boolean          // watchedPercent >= 90 yoki video ended

  createdAt, updatedAt
}
// Index: { student: 1, lesson: 1 } unique
// Index: { student: 1, course: 1 }  (dashboard uchun)
```

**Watched ranges merge logikasi (server tomonda):**
1. Mijozdan kelgan yangi range qo'shiladi.
2. Barcha range'lar `start` bo'yicha saralanadi va overlap bo'lganlari birlashtiriladi.
3. `watchedSeconds = Σ(end - start)`.
4. `watchedPercent = round(watchedSeconds / lesson.durationSec * 100)`.
5. `isCompleted = watchedPercent >= 90`.

#### TimedQuestion (video ichidagi savol)

```ts
TimedQuestion {
  lesson: ObjectId
  triggerTimeSec: number        // teacher belgilaydi
  type: 'single_choice'
  question: LocalizedText
  options: Array<{ id: string; text: LocalizedText }>
  correctOptionId: string       // ⚠️ HECH QACHON client DTO'ga chiqmaydi
  explanation?: LocalizedText
  required: boolean             // MVP: false
  isPublished: boolean
  order: number
}
```

#### TimedQuestionAnswer (student javobi)

```ts
TimedQuestionAnswer {
  student: ObjectId
  lesson: ObjectId
  question: ObjectId            // ref TimedQuestion
  selectedOptionId?: string
  isCorrect: boolean            // server hisoblaydi
  skipped: boolean
  videoTimeSec: number
  answeredAt: Date
}
// Index: { student: 1, question: 1 } unique  (bir savolga bir javob)
```

#### SectionQuiz (section oxiridagi test)

```ts
SectionQuiz {
  section: ObjectId
  title: LocalizedText
  passScore: number             // default: 70
  timeLimitMin?: number
  isPublished: boolean
}
```

#### QuizQuestion (test savoli)

```ts
QuizQuestion {
  quiz: ObjectId                // ref SectionQuiz
  question: LocalizedText
  options: Array<{ id: string; text: LocalizedText }>
  correctOptionId: string       // ⚠️ client DTO'ga chiqmaydi
  explanation?: LocalizedText
  order: number
}
```

#### QuizAttempt (test natijasi)

```ts
QuizAttempt {
  student: ObjectId
  quiz: ObjectId
  section: ObjectId
  answers: Array<{
    question: ObjectId
    selectedOptionId: string
    isCorrect: boolean          // server hisoblaydi
  }>
  totalQuestions: number
  correctAnswers: number
  score: number                 // foizda
  passed: boolean               // score >= passScore
  startedAt: Date
  submittedAt: Date
}
// Index: { student: 1, quiz: 1 }
```

#### ParentStudentLink (ota-ona ↔ farzand)

```ts
ParentStudentLink {
  parent: ObjectId              // ref User (role=parent)
  student: ObjectId             // ref User (role=student)
  status: 'pending' | 'active' | 'revoked'
  code?: string                 // keyingi bosqich: invite code
  createdAt: Date
  activatedAt?: Date
}
// Index: { parent: 1, student: 1 } unique
// MVP: admin yoki seed orqali status='active' yaratiladi.
```

---

## 4. Shared Contracts (DTO)

> DTO = mijozga yuboriladigan **toza** shakl. DB modeldan farqi: Mongo ichki maydonlari yo'q,
> `LocalizedText` server tomonda tanlangan tilga "yassilanmaydi" — ikkala til ham yuboriladi
> (mijoz tilni o'zi tanlaydi), **lekin maxfiy maydonlar (correctOptionId) olib tashlanadi**.

### 4.1 Asosiy printsiplar

1. **Hech qachon `correctOptionId` yuborilmaydi** (test yechilmagunча).
2. Baholash **faqat serverda** (`isCorrect`ni mijoz hisoblamaydi).
3. DTO'lar `mobile/src/types/` va backend o'rtasida **bitta manba**dan (shared types).
4. Mock data ham aynan shu DTO shaklida bo'ladi → mock→API o'tish faqat manba almashtirish.

### 4.2 DTO tiplar

```ts
type LocalizedText = { en: string; ja?: string }

type CourseDTO = {
  id: string
  title: LocalizedText
  description: LocalizedText
  previewImage?: string
  level: string
  category: string
  instructor: { id: string; fullName: string; picture?: string }
  sectionsCount: number
  lessonsCount: number
  isEnrolled: boolean
}

type SectionDTO = {
  id: string
  title: LocalizedText
  position: number
  lessons: LessonListItemDTO[]
  hasQuiz: boolean
}

type LessonListItemDTO = {
  id: string
  title: LocalizedText
  position: number
  durationSec: number
  free: boolean
  progress?: { watchedPercent: number; isCompleted: boolean }
}

type LessonDetailDTO = {
  id: string
  title: LocalizedText
  content: LocalizedText
  videoUrl: string
  durationSec: number
  free: boolean
  timedQuestions: TimedQuestionDTO[]   // correctOptionId YO'Q
  progress?: { lastPositionSec: number; watchedPercent: number; isCompleted: boolean }
}

// ⚠️ correctOptionId va explanation YO'Q (javob berilmaguncha)
type TimedQuestionDTO = {
  id: string
  triggerTimeSec: number
  type: 'single_choice'
  question: LocalizedText
  options: Array<{ id: string; text: LocalizedText }>
  required: boolean
}

// javob yuborilgandan keyin server qaytaradigan natija
type TimedAnswerResultDTO = {
  questionId: string
  isCorrect: boolean
  correctOptionId: string       // endi ko'rsatish mumkin
  explanation?: LocalizedText
}

type QuizDTO = {
  id: string
  title: LocalizedText
  passScore: number
  timeLimitMin?: number
  questions: QuizQuestionDTO[]   // correctOptionId YO'Q
}

type QuizQuestionDTO = {
  id: string
  question: LocalizedText
  options: Array<{ id: string; text: LocalizedText }>
  order: number
}

type QuizAttemptResultDTO = {
  attemptId: string
  totalQuestions: number
  correctAnswers: number
  score: number
  passed: boolean
  review: Array<{
    questionId: string
    selectedOptionId: string
    correctOptionId: string
    isCorrect: boolean
    explanation?: LocalizedText
  }>
}
```

---

## 5. API Endpointlar

Barchasi `/api/mobile/*` ostida (Next.js route handlers). Auth: `Authorization: Bearer <clerk_token>`.

### 5.1 Auth / User

```text
GET   /api/mobile/me                       -> { user, role }
PATCH /api/mobile/users/:id                -> profil yangilash (faqat o'zi)
```

### 5.2 Courses

```text
GET   /api/mobile/courses                  -> CourseDTO[]   (published only)
GET   /api/mobile/courses/:courseId        -> CourseDTO (to'liq)
GET   /api/mobile/courses/:courseId/sections -> SectionDTO[]
POST  /api/mobile/courses/:courseId/enroll -> Purchase yaratadi (source='mock')
```

### 5.3 Lessons

```text
GET   /api/mobile/lessons/:lessonId        -> LessonDetailDTO  (access check)
POST  /api/mobile/lessons/:lessonId/progress
       body: { watchedRanges, lastPositionSec }
       -> { watchedPercent, isCompleted }
```

### 5.4 Timed Questions

```text
POST  /api/mobile/timed-questions/:questionId/answer
       body: { selectedOptionId?, skipped, videoTimeSec }
       -> TimedAnswerResultDTO   (server isCorrect hisoblaydi)
GET   /api/mobile/lessons/:lessonId/answers -> student'ning javoblari
```

### 5.5 Section Quiz

```text
GET   /api/mobile/sections/:sectionId/quiz -> QuizDTO  (correctOptionId YO'Q)
POST  /api/mobile/quizzes/:quizId/start    -> { attemptId, startedAt }
POST  /api/mobile/quizzes/:quizId/submit
       body: { attemptId, answers: [{ questionId, selectedOptionId }] }
       -> QuizAttemptResultDTO   (server baholaydi)
GET   /api/mobile/quizzes/:quizId/attempts -> QuizAttempt[]
```

### 5.6 Dashboards

```text
GET   /api/mobile/student/dashboard        -> davom etayotgan kurslar, progress, oxirgi testlar
GET   /api/mobile/teacher/dashboard        -> o'z kurslari, student soni, o'rtacha ball
GET   /api/mobile/teacher/courses/:courseId/students -> student natijalari (ownership check)
GET   /api/mobile/parent/dashboard         -> bog'langan farzandlar ro'yxati
GET   /api/mobile/parent/children/:studentId/progress -> farzand progressi (link check)
```

---

## 6. Auth & Ownership Qatlami

### 6.1 Markaziy helper

```ts
// har bir /api/mobile/* handler boshida
async function requireUser(req): Promise<{ user: UserDoc; role: UserRole }> {
  const { userId: clerkId } = getAuth(req)        // Clerk
  if (!clerkId) throw new ApiError(401, 'Unauthorized')
  const user = await User.findOne({ clerkId })
  if (!user) throw new ApiError(401, 'User not found')
  return { user, role: user.role }
}
```

### 6.2 Ownership qoidalari (har endpointda majburiy)

| Holat | Tekshiruv |
| --- | --- |
| Teacher kurs/section/lesson/quiz tahrirlaydi | `course.instructor === user._id` |
| Teacher student natijasini ko'radi | student shu teacher kursiga enrolled |
| Parent farzand natijasini ko'radi | `ParentStudentLink{ parent, student, status:'active' }` mavjud |
| Student progress/javob ko'radi | faqat `student === user._id` |
| Admin | hamma narsa |

### 6.3 Xato formati (yagona)

```ts
type ApiError = { status: number; code: string; message: string }
// 401 unauthorized, 403 forbidden, 404 not_found, 422 validation, 500 server
```

---

## 7. Mock Data Rejasi (Milestone 1)

Backend ulanmasdan oldin `mobile/src/mock/` da DTO shaklidagi data:

- **1 ta demo kurs** (en/ja), 1 section, 2-3 lesson.
- **Mock video:** Big Buck Bunny —
  `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4` (~596s).
- **Timed questions:** 0:30, 1:15, 2:00 soniyalarda (qat'iy, demo uchun).
- **Section quiz:** 5 savol (MVP demo; real 15-20).
- Mock helper'lar DTO interfeyslarига bo'ysunadi → keyin `fetch`ga almashtiriladi.

---

## 8. Migration & Seed Rejasi

Kodga o'tgach bajariladigan ketma-ketlik:

1. **Schema yangilash:** `User.role` enum, `Course/Section/Lesson` → `LocalizedText`, `Lesson.durationSec`, `Purchase.source`.
2. **Migration script:**
   - `role` mapping (`user→student`, `instructor→teacher`, `isAdmin→admin`).
   - Mavjud `title` (string) → `{ en: <eski>, ja: '' }`.
   - `duration{h,m,s}` → `durationSec`.
3. **Yangi kolleksiyalar:** `LessonProgress`, `TimedQuestion`, `TimedQuestionAnswer`, `SectionQuiz`, `QuizQuestion`, `QuizAttempt`, `ParentStudentLink`.
4. **Seed data:** 1 teacher, 1 student, 1 parent, `ParentStudentLink(active)`, demo kurs + timed questions + quiz.

---

## 9. Bu Hujjatdan Keyin

Keyingi hujjat: **`MVP_TASK_BREAKDOWN.md`** — yuqoridagi reja asosida aniq, kichik, bajariladigan
tasklarga bo'lish (Phase 1 Expo skeleton → mock student flow → backend integratsiya).

Undan keyin coding: **Expo app skeleton + mock student learning flow** (Milestone 1).
