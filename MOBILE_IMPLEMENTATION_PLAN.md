# Mobile Implementation Plan

## 1. Maqsad

Bu hujjat hozirgi `startup.sammi.ac` Next.js loyihasi fundamentidan foydalanib, unga mos React Native / Expo mobile versiyani bosqichma-bosqich qurish rejasini beradi.

Asosiy maqsad:

- Web versiya hozirgi Next.js loyiha asosida qoladi va Vercel'da deploy qilinadi.
- Mobile versiya Expo React Native orqali alohida app sifatida qilinadi.
- Mobile versiya production deploy qilinmaydi, local Expo demo sifatida ko'rsatiladi.
- Web va mobile uchun bitta kod bo'lishi shart emas.
- Backend, database va biznes logika imkon qadar umumiy bo'ladi.

Platforma Coursera uslubidagi learning experience beradi:

- Student video dars ko'radi.
- Video belgilangan daqiqaga yetganda avtomatik savol chiqadi.
- Student savolga javob beradi yoki skip qiladi.
- Javob natijasi saqlanadi.
- Har bir section ichida 3-4 ta video bo'ladi.
- Har bir section oxirida 15-20 ta savoldan iborat final test bo'ladi.
- Teacher student progress va test natijalarini ko'radi.
- Parent o'z farzandi natijalarini ko'radi.
- UI English va Japanese tillarida bo'ladi.

## 2. Hozirgi Loyiha Asosida Qabul Qilingan Qaror

Hozirgi loyiha Next.js 14, MongoDB, Mongoose, Clerk, Stripe, i18n, shadcn/ui va server actions asosida qurilgan. Bu loyiha web/admin/backend fundament sifatida foydali.

Hozirgi loyihadan saqlab qolinadigan qismlar:

- Course, Section, Lesson struktura poydevori.
- User role tizimi.
- Clerk auth integratsiyasi.
- MongoDB/Mongoose database qatlam.
- Instructor/admin dashboard poydevori.
- Video lesson strukturasi.
- Localization poydevori.
- Vercel deployga mos Next.js web app.

Yangi qo'shiladigan yoki qayta ishlanadigan qismlar:

- `parent` role.
- Student = hozirgi `user` role sifatida ishlaydi.
- Timed video question tizimi.
- Section final quiz tizimi.
- Student answer va quiz attempt natijalarini saqlash.
- Parent-child link tizimi.
- Teacher analytics.
- Mobile Expo app.
- Mobile uchun aniq API endpointlar.

Muhim qaror:

Mobile app Next.js server actions'ni to'g'ridan-to'g'ri ishlatmaydi. Shuning uchun mobile va web bir xil backenddan foydalanishi uchun Next.js API route handlers yoki alohida API qatlam kerak bo'ladi.

## 3. Role Tizimi

Hozirgi role'lar:

- `user`
- `instructor`
- `admin`

Yangi loyiha uchun mapping:

- `user` = student
- `instructor` = teacher
- `admin` = admin
- `parent` = parent

Role vazifalari:

| Role | Vazifa |
| --- | --- |
| user/student | Kurslarni ko'radi, video dars o'tadi, timed question javoblaydi, section final test yechadi, progressini ko'radi |
| instructor/teacher | O'z kurslarini yaratadi, section/lesson/video/test/savol qo'shadi, student natijalarini ko'radi |
| parent | O'z farzandi progressi, test natijalari va oxirgi activitylarini ko'radi |
| admin | Userlar, teacherlar, kurslar, role va umumiy platformani boshqaradi |

Backend ownership qoidasi:

- Teacher faqat o'z kursini tahrirlay oladi.
- Parent faqat o'ziga bog'langan student natijasini ko'ra oladi.
- Student faqat o'z progress va javoblarini ko'ra oladi.
- Admin hamma narsani boshqara oladi.

## 4. Tavsiya Qilingan Arxitektura

Tavsiya qilingan tuzilma:

```text
startup.sammi.ac/
  app/                         # Hozirgi Next.js web app
  actions/                     # Hozirgi server actions
  database/                    # Mongoose models
  lib/                         # Shared server utils
  mobile/                      # Yangi Expo React Native app
  docs/                        # Rejalar va texnik hujjatlar
```

Mobile app uchun alohida papka:

```text
mobile/
  app/
    (auth)/
    (student)/
    (teacher)/
    (parent)/
    (admin)/
  src/
    api/
    components/
    features/
    hooks/
    i18n/
    navigation/
    screens/
    store/
    types/
    utils/
```

Backend/API yo'nalishi:

```text
app/api/
  mobile/
    auth/
    courses/
    lessons/
    progress/
    timed-questions/
    quizzes/
    dashboard/
    parent/
    teacher/
```

Mobile Expo local demo shu API bilan ishlaydi:

```text
EXPO_PUBLIC_API_URL=http://localhost:3000/api/mobile
```

## 5. Data Model Rejasi

Hozirgi mavjud modellar:

- `User`
- `Course`
- `Section`
- `Lesson`
- `Purchase`
- `Review`
- `Notification`
- `UserProgress`

Qo'shilishi kerak bo'lgan modellar:

### 5.1 TimedQuestion

Video ichida belgilangan vaqtda chiqadigan savol.

```ts
TimedQuestion {
  lesson: ObjectId;
  triggerTimeSec: number;
  type: "single_choice";
  question: {
    en: string;
    ja?: string;
  };
  options: Array<{
    id: string;
    en: string;
    ja?: string;
  }>;
  correctOptionId: string;
  explanation?: {
    en: string;
    ja?: string;
  };
  required: boolean;
  isPublished: boolean;
}
```

MVP qoidasi:

- `required = false`
- Student skip qila oladi.
- Javob yoki skip natijasi saqlanadi.

### 5.2 TimedQuestionAnswer

Student video ichidagi savolga bergan javobi.

```ts
TimedQuestionAnswer {
  student: ObjectId;
  lesson: ObjectId;
  question: ObjectId;
  selectedOptionId?: string;
  isCorrect: boolean;
  skipped: boolean;
  videoTimeSec: number;
  answeredAt: Date;
}
```

### 5.3 SectionQuiz

Section oxiridagi katta test.

```ts
SectionQuiz {
  section: ObjectId;
  title: {
    en: string;
    ja?: string;
  };
  passScore: number;
  timeLimitMin?: number;
  isPublished: boolean;
}
```

### 5.4 QuizQuestion

Section final test ichidagi savol.

```ts
QuizQuestion {
  quiz: ObjectId;
  question: {
    en: string;
    ja?: string;
  };
  options: Array<{
    id: string;
    en: string;
    ja?: string;
  }>;
  correctOptionId: string;
  explanation?: {
    en: string;
    ja?: string;
  };
  order: number;
}
```

### 5.5 QuizAttempt

Student section final testni topshirgan natijasi.

```ts
QuizAttempt {
  student: ObjectId;
  quiz: ObjectId;
  section: ObjectId;
  answers: Array<{
    question: ObjectId;
    selectedOptionId: string;
    isCorrect: boolean;
  }>;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  startedAt: Date;
  submittedAt: Date;
}
```

### 5.6 ParentStudentLink

Parent va student bog'lanishi.

```ts
ParentStudentLink {
  parent: ObjectId;
  student: ObjectId;
  status: "pending" | "active" | "revoked";
  code?: string;
  createdAt: Date;
  activatedAt?: Date;
}
```

MVP uchun soddalashtirilgan variant:

- Admin yoki seed data orqali parent-student bog'lanadi.
- Keyingi bosqichda student invite code yaratadi, parent code orqali ulanadi.

## 6. Video Learning Logikasi

### 6.1 Video Player State

Mobile app video player quyidagi state'larni kuzatadi:

```ts
VideoPlayerState {
  lessonId: string;
  isPlaying: boolean;
  currentTimeSec: number;
  durationSec: number;
  playbackRate: number;
  watchedRanges: Array<{ start: number; end: number }>;
  watchedPercent: number;
  completed: boolean;
}
```

### 6.2 Progress Tracking

Faqat `currentTimeSec`ga ishonish noto'g'ri, chunki student videoni skip qilib oxiriga o'tishi mumkin.

To'g'riroq usul:

- Student real ko'rgan vaqt range'lari saqlanadi.
- Overlap range'lar merge qilinadi.
- Unique watched seconds hisoblanadi.
- Lesson completed bo'lishi uchun `watchedPercent >= 90` yoki video ended bo'lishi kerak.

Progress sync:

- Local state har 1 sekund yangilanadi.
- Backendga har 10-15 sekundda sync qilinadi.
- Video pause bo'lganda sync qilinadi.
- Screen leave bo'lganda sync qilinadi.
- Video ended bo'lganda sync qilinadi.

### 6.3 Timed Question Trigger

Savol chiqish algoritmi:

```text
if currentTimeSec >= triggerTimeSec
and question was not answered before
and question was not shown in this session
then pause video and show question modal
```

Qoidalar:

- Bir savol bitta session ichida qayta-qayta chiqmasligi kerak.
- Oldin javob berilgan savol qayta chiqmaydi.
- Skip qilingan savol natijasi saqlanadi.
- Submitdan keyin explanation ko'rsatish mumkin.
- Modal yopilgandan keyin video davom etadi.

## 7. Section Final Test Logikasi

Har bir section oxirida bitta final test bo'ladi.

MVP:

- 15-20 savol.
- Single choice.
- Har savolda 4 variant.
- Score foizda hisoblanadi.
- `passScore` default 70%.
- Attempt saqlanadi.

Scoring:

```text
score = correctAnswers / totalQuestions * 100
passed = score >= passScore
```

Test screen:

- Question counter: `1 / 20`
- Question text
- Options
- Previous
- Next
- Submit Test

Result screen:

- Score
- Correct answers
- Total questions
- Passed/Failed
- Review answers
- Back to course

## 8. Mobile App Screen Rejasi

### 8.1 Auth Screens

- Welcome
- Login
- Signup
- OTP verification
- Resend OTP
- Forgot password
- Google login

Hozirgi loyiha Clerk ishlatgani uchun tavsiya:

- Web va mobile uchun Clerk'ni saqlash.
- Agar custom OTP flow majburiy bo'lsa, keyinchalik alohida auth service ko'rib chiqiladi.
- MVP uchun Clerk auth bilan role-based navigation yetarli.

### 8.2 Student Screens

- Student Home
- Course List
- Course Detail
- Learning Page
- Timed Question Modal
- Section Final Test
- Quiz Result
- Student Dashboard
- Bookmarks
- Notes
- Profile

Student home:

- Continue learning
- Recommended courses
- Categories
- Current progress
- Recent tests

Learning page mobile layout:

```text
[Video Player]
[Lesson title]
[Progress / current item]
[Tabs: Transcript | Notes | Files]
[Section accordion]
[Next lesson button]
```

### 8.3 Teacher Screens

- Teacher Dashboard
- My Courses
- Create Course
- Edit Course
- Section Builder
- Lesson Builder
- Video Upload
- Timed Question Builder
- Section Quiz Builder
- Student Progress
- Quiz Analytics

Teacher ownership:

- Teacher faqat o'z kurslarini ko'radi.
- Teacher faqat o'z kurslarida section, lesson, question va quiz yaratadi.
- Teacher o'z kursiga yozilgan student natijalarini ko'radi.

### 8.4 Parent Screens

- Parent Dashboard
- Child Selector
- Child Course Progress
- Recent Quiz Results
- Weak Topics
- Last Activity

Parent cheklovi:

- Parent course edit qila olmaydi.
- Parent quiz yecha olmaydi.
- Parent faqat linked child natijalarini ko'radi.

### 8.5 Admin Screens

Mobile app ichida admin to'liq bo'lishi shart emas. Admin uchun web qulayroq.

Mobile MVP uchun:

- Admin dashboard minimal ko'rinish.
- Users list.
- Courses list.
- Pending teachers.

Asosiy admin boshqaruv web versiyada qoladi.

## 9. API Rejasi

Mobile uchun kerak bo'ladigan endpointlar:

### 9.1 Auth/User

```text
GET  /api/mobile/me
GET  /api/mobile/users/:id
PATCH /api/mobile/users/:id
```

### 9.2 Courses

```text
GET /api/mobile/courses
GET /api/mobile/courses/:courseId
GET /api/mobile/courses/:courseId/sections
```

### 9.3 Lessons

```text
GET /api/mobile/lessons/:lessonId
GET /api/mobile/lessons/:lessonId/timed-questions
POST /api/mobile/lessons/:lessonId/progress
```

### 9.4 Timed Questions

```text
POST /api/mobile/timed-questions/:questionId/answer
GET  /api/mobile/lessons/:lessonId/answers
```

### 9.5 Section Quiz

```text
GET  /api/mobile/sections/:sectionId/quiz
POST /api/mobile/quizzes/:quizId/start
POST /api/mobile/quizzes/:quizId/submit
GET  /api/mobile/quizzes/:quizId/attempts
```

### 9.6 Dashboards

```text
GET /api/mobile/student/dashboard
GET /api/mobile/teacher/dashboard
GET /api/mobile/teacher/courses/:courseId/students
GET /api/mobile/parent/dashboard
GET /api/mobile/parent/children/:studentId/progress
```

## 10. Localization Rejasi

Supported languages:

- `en`
- `ja`

UI translation:

```text
mobile/src/i18n/en.json
mobile/src/i18n/ja.json
```

Localized database content:

```ts
type LocalizedText = {
  en: string;
  ja?: string;
};
```

Fallback rule:

- Agar Japanese content bo'lmasa, English content ko'rsatiladi.
- UI textlari boshidan `en` va `ja` bilan yoziladi.

Hozirgi web loyihadagi `uz`, `ru`, `tr` keyingi bosqichda olib tashlanadi yoki web uchun alohida saqlanadi. Yangi product talabi bo'yicha asosiy til `en` va `ja`.

## 11. AI Funksiyasi Uchun Joy

AI logikasi hozircha yakuniy emas, keyin batafsil beriladi. Shuning uchun arxitekturada AI uchun joy qoldiriladi.

Learning page ostida Coursera uslubida AI helper bo'lishi mumkin:

- Give me practice questions
- Explain this topic simply
- Give me a summary
- Give me real-life examples

MVP uchun AI real bo'lishi shart emas:

- Static lesson summary.
- Static examples.
- Static practice questions.

Keyingi bosqichda:

- Lesson transcriptdan summary chiqarish.
- Video bo'yicha practice questions generate qilish.
- Student xatolariga qarab explanation berish.
- Teacher uchun quiz generation.

## 12. Payment Qismi Uchun Joy

Payment logikasi keyin batafsil aniqlanadi.

Hozirgi loyihada Stripe bor. Agar payment saqlansa:

- Web checkout hozirgi Stripe asosida qoladi.
- Mobile uchun Stripe payment sheet keyingi bosqichda ko'riladi.
- Payment success frontendga ishonib ochilmaydi.
- Stripe webhook backendda course access/enrollment ochadi.

MVP uchun payment vaqtincha off bo'lishi mumkin:

- Course enrollment mock bo'ladi.
- Student course'ga access oladi.
- Payment integration keyingi milestone.

## 13. Mobile Texnologiyalar

Tavsiya qilingan stack:

- Expo
- React Native
- Expo Router
- TypeScript
- React Query yoki Redux Toolkit Query
- Zustand yoki Redux Toolkit
- React Hook Form
- Zod
- expo-av yoki expo-video
- expo-secure-store
- i18next/react-i18next
- Clerk Expo SDK

State management qarori:

- Agar API data ko'p bo'lsa: React Query yoki RTK Query.
- Agar global UI/auth/settings kerak bo'lsa: Zustand yoki Redux Toolkit.
- MVP uchun React Query + Zustand soddaroq.

## 14. Implementation Bosqichlari

### Phase 1: Planning va Foundation

- Mobile folder yaratish.
- Expo app setup.
- TypeScript setup.
- App theme/design tokens.
- Navigation structure.
- English/Japanese i18n setup.
- Mock data.

Natija:

- Expo local app ochiladi.
- Role-based navigation mock ishlaydi.

### Phase 2: Student Learning MVP

- Student home.
- Course list.
- Course detail.
- Section/lesson list.
- Learning page.
- Video player.
- Video progress local tracking.
- Timed question modal.
- Section final test.
- Quiz result.

Natija:

- Student local mobile appda video ko'radi.
- 4:42 kabi belgilangan vaqtda savol chiqadi.
- Section final test ishlaydi.

### Phase 3: Backend API Integration

- Mobile API route handlers.
- Course/section/lesson API.
- Timed question API.
- Progress API.
- Quiz submit API.
- User role API.

Natija:

- Mobile mock datadan real backend APIga o'tadi.
- MongoDB'da progress, answer va attempt saqlanadi.

### Phase 4: Teacher Features

- Teacher dashboard.
- My courses.
- Course builder.
- Section builder.
- Lesson builder.
- Timed question builder.
- Section final quiz builder.
- Student progress view.

Natija:

- Teacher o'z kursini boshqaradi.
- Student natijalarini ko'radi.

### Phase 5: Parent Features

- Parent role support.
- Parent-child link.
- Parent dashboard.
- Child progress.
- Recent test results.
- Last activity.

Natija:

- Parent faqat o'z farzandi natijalarini ko'radi.

### Phase 6: Web Alignment

- Next.js webda role va yangi data modellarga moslash.
- Student learning page webda Coursera-style holatga keltirish.
- Teacher/admin web panellarni yangilash.
- English/Japanese localization.
- Vercel deploy.

Natija:

- Web productionga tayyor bo'ladi.
- Mobile local demo bilan bir xil backenddan foydalanadi.

### Phase 7: AI va Payment

- AI feature talablari aniqlangandan keyin qo'shiladi.
- Payment talablari aniqlangandan keyin Stripe flow moslashtiriladi.

## 15. MVP Acceptance Criteria

MVP tayyor hisoblanadi, agar:

- Student login qila olsa.
- Role-based navigation ishlasa.
- Student course list ko'rsa.
- Student course detail ko'rsa.
- Student lesson video ko'rsa.
- Video progress kuzatilsa.
- Timed question belgilangan vaqtda chiqsa.
- Student submit/skip qila olsa.
- Javob backendda saqlansa.
- Section final test ishlasa.
- Score hisoblanib attempt saqlansa.
- Student dashboard progress ko'rsatsa.
- Teacher o'z kurslarini ko'rsa.
- Teacher course/section/lesson/question/quiz boshqara olsa.
- Teacher student natijalarini ko'rsa.
- Parent child progressini ko'rsa.
- English/Japanese UI switch ishlasa.
- Mobile Expo localda ko'rsatilsa.
- Web Vercel'da deploy bo'lsa.

## 16. Asosiy Risklar

### Risk 1: Video progress noto'g'ri hisoblanishi

Yechim:

- Faqat `currentTime`ga ishonmaslik.
- Watched ranges ishlatish.

### Risk 2: Timed question qayta-qayta chiqib qolishi

Yechim:

- `alreadyShownInSession` local state.
- `alreadyAnswered` backend state.

### Risk 3: Teacher boshqa teacher kursini edit qilishi

Yechim:

- Har API endpointda ownership check.

### Risk 4: Parent boshqa student natijasini ko'rishi

Yechim:

- ParentStudentLink orqali access check.

### Risk 5: Mobile server actions bilan ishlay olmasligi

Yechim:

- Mobile uchun REST API route handlers.

### Risk 6: Japanese translation yetishmasligi

Yechim:

- Localized text fallback: Japanese yo'q bo'lsa English.

## 17. Tavsiya Qilingan Birinchi Milestone

Birinchi amaliy milestone:

```text
Expo local appda student learning flow mock data bilan ishlashi.
```

Ichida:

- Welcome/Login mock.
- Role selection.
- Student home.
- Course list.
- Course detail.
- Learning page.
- Video player.
- 4:42 kabi belgilangan vaqtda timed question modal.
- Submit/Skip.
- Section final test.
- Quiz result.
- Student dashboard.

Bu milestone tugasa, loyiha konsepti ko'rsatishga tayyor bo'ladi. Keyin backend, teacher, parent, AI va payment bosqichma-bosqich real qilinadi.

## 18. Yakuniy Tavsiya

Hozirgi loyiha web va backend fundament sifatida yaxshi. Uni butunlay tashlab yuborish kerak emas. Lekin mobile appni shu Next.js codebase ichiga majburan aralashtirmaslik kerak.

Eng to'g'ri yo'l:

- Web/admin: hozirgi Next.js loyihani davom ettirish.
- Backend/database: hozirgi MongoDB/Mongoose asosida kengaytirish.
- Mobile: alohida Expo React Native app.
- Shared logic: API, database models, validation va business rules orqali birlashtirish.
- Deploy: web Vercel, mobile Expo local demo.

Shunday qilinsa, loyiha vazifa talablariga mos, tushunarli, himoya qilishga qulay va keyinchalik kengaytirishga tayyor bo'ladi.
