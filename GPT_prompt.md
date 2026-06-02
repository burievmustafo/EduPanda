
c868908a-2906-4f54-8c5b-ddde38ee839c.png
9657c8a4-ecc0-4543-9c15-9f4cadddd984.png
0fe99acc-aa56-4369-b6b0-0fad014ef330.png
8a348e2a-0ab1-4a18-9688-affee6a9e1bb.png
1578caae-1fd4-4420-9638-cc0c4cf4e15b.png
sen bilan biz courserani clone loyihasini boshqa nom bilan yaratishimiz kerak loyiha react nativeda bo'ladi app ko'rinishida localda ishlashi kerak loyihada user rollar bo'ladi 
Auth va role

student/user
teacher/instructor
parent
admin
Course/section/lesson

course list
section list
har sectionda 3-4 video
lesson detail
Video player

video ko‘rish
vaqtni kuzatish
belgilangan vaqtda savol chiqarish
Timed question

savol modal
variant tanlash
submit/skip
natijani saqlash
Section final test

15-20 savol
score hisoblash
attempt saqlash
Student dashboard

ko‘rilgan darslar
test natijalari
progress
Teacher dashboard

studentlar ro‘yxati
har student progressi
quiz natijalari
quiz yaratish video joylash
teacher har bir kursini o'zi nazorat qiladi

Parent dashboard

farzand natijalari
progress
oxirgi testlar
English/Japanese

UI tarjima
test savollarini til bo‘yicha chiqarish
Web deploy

Vercel
Mobile demo
Expo local


birinchi sen cousera platformasini to'liq o'rganib chiq ui ux qismlari qanday qurilgan dizayni senga rasmlarni ham yuboraman bu rasmlar faqat lerning page loyihada undan tashqari profile bo'ladi va boshqa narsalar 

Student
 Authentication system with signup,login,otp verification,resend otp,forgot password
 Google authentication (Oauth2) using react-google-login and google auth-library
 Stripe Payment gateway integrated with backend to buy courses
 Redux store to easily manage states
 Homepage with courses being fetched categorically
 Recommended Courses based on user's preferences
 Rating of Courses
 Bookmarked Courses where users can remove or add bookmark
 Download resourses (pdf - notes)
 Responsive React Video player for videos
 Progress bar
 CoursePage with all the content of the course
 Searching based on course and teacher
 Real Time Live Group classes
Teacher
 Proper Authentication system with signup,login,otp verification,resend otp,forgot password 
 Fully validated teacher uploading form with descriptition,title,Image and other details
 CkEditor for writing in textbox with abilities to add diffrent headings,paragraphs,bold,italics,link,tables,sizes etc
 Teacher can upload upto 5 videos with upload bar to show progress
 Teacher can see their uploaded courses
 Teacher can delete their course
 Teacher can edit their course


lekin birinchi o'zing Real coursera platformasini o'rganib chiq va menga har bir qismini UI UX qismlarini logikasini tushuntirib ber

Thought for 5m 34s
Ha, boshlashdan oldin real Coursera platformasini UI/UX va logika bo‘yicha tahlil qilib olamiz. Biz Coursera’ni 1:1 ko‘chirmaymiz: nom, ranglar, kontent, ikonlar, layout va brand original bo‘ladi. Lekin learning flow, course structure, video player, progress, quiz, dashboard logikasi Coursera’dan ilhomlangan professional LMS bo‘ladi.

1. Coursera umumiy mahsulot logikasi
Coursera oddiy “video ko‘rish” platformasi emas. U quyidagi katta bloklardan iborat:

Blok	Real Coursera’da vazifasi	Bizning loyihaga moslashtirish
Auth	User platformaga kiradi, kurslarga yoziladi, sertifikat/progress saqlanadi	Signup, login, OTP, forgot password, Google auth
Course catalog	Kurslarni qidirish, kategoriya, tavsiya, rating, provider/instructor ko‘rish	Course list, category, search, recommended courses
Course detail	Kurs haqida to‘liq ma’lumot, narx, reja, instructor, rating, enroll	Course detail screen + payment/enroll
Learning page	Video, transcript, notes, files, progress, next lesson	Bizning asosiy ekran: video + section + timed question
Assessment	Quiz, assignments, grades, attempts, final score	Timed question + section final test
Dashboard	Student progress, current courses, recent grades	Student / Teacher / Parent / Admin dashboard
Authoring	Instructor/course builder orqali course content yaratish	Teacher course CRUD, video upload, quiz builder
Localization	UI, subtitles, transcript, assessment translation	English / Japanese UI + question language
Coursera rasmiy support markazida auditoriyalar asosan Learner, Educator va Organization Admin sifatida ajratilgan; Parent role Coursera’da standart consumer flow sifatida ko‘rinmaydi, shuning uchun biz Parent dashboard’ni custom feature sifatida qo‘shamiz. 

2. Coursera learning page — yuborgan rasmlaringiz asosida UI/UX tahlil
Siz yuborgan screenshotlarda asosiy sahifa: “From Abacus to Analytical Engine” lesson page. Bu Coursera’ning eng muhim learning workspace qismi.

2.1 Desktop layout: 3 ustunli o‘quv muhiti
Sahifa uchta asosiy zonaga bo‘lingan:

Zona	UI	UX maqsadi
Chap sidebar	Module, section, lesson list	Student qayerda turganini biladi
Markaz	Video player, title, actions, next button	Asosiy learning focus
O‘ng panel	Notes, Transcript, Files	Qo‘shimcha materiallar tez ochiladi
Bu juda yaxshi UX, chunki student bir vaqtning o‘zida kurs strukturasi, video kontent va yordamchi materiallarni yo‘qotmaydi.

Biz React Native app’da buni shunday moslashtiramiz:

Desktop / Web:

[Course Sidebar] [Video + Lesson Content] [Transcript/Notes/Files]
Mobile / Expo:

[Video]
[Lesson title + progress]
[Tabs: Transcript | Notes | Files]
[Section accordion]
[Next lesson button]
Mobile’da uch ustun emas, balki tabs + bottom sheet + drawer ishlatamiz.

3. Chap sidebar — Course / Section / Lesson UX
Screenshotlarda chap tomonda:

Course title: Technical Support Fundamentals

Module: Module 1 — Introduction to IT

Section: History of Computing

Lesson item: From Abacus to Analytical Engine

Har item yonida circle status bor

Har lesson’da type va duration bor: Video • 5 min, Reading • 4 min, Practice Assignment • 8 min

UI logika
Har lesson item quyidagi ma’lumotlarni ko‘rsatadi:

{
  id: "lesson_1",
  title: "From Abacus to Analytical Engine",
  type: "video",
  duration: 300,
  status: "not_started | in_progress | completed",
  sectionId: "section_1"
}
UX logika
Student chap sidebar orqali:

kurs ichida qayerdaligini ko‘radi;

qaysi lesson tugaganini biladi;

keyingi lesson’ga tez o‘tadi;

module/section bo‘yicha mental map hosil qiladi.

Bizning app’da course hierarchy shunday bo‘ladi:

Course
 └── Section
      ├── Lesson 1: Video
      ├── Lesson 2: Video
      ├── Lesson 3: Video
      ├── Lesson 4: Video
      └── Section Final Test
Siz aytgan talabga mos: har section’da 3–4 video, oxirida 15–20 savolli final test.

4. Markaziy video player — eng muhim learning component
Screenshotlarda video player’da quyidagilar bor:

Play / pause

Volume

10 sekund orqaga / oldinga

Current time / duration: masalan 4:39 / 5:18

Speed: 1x

Settings

Mini player yoki picture-in-picture icon

Fullscreen

Progress timeline

Video tugashiga yaqin progress blue line

Coursera rasmiy help’da video’larni Coursera web yoki mobile app’da ko‘rish mumkinligi, ba’zi video’larni offline ko‘rish uchun download qilish mumkinligi aytilgan. 

Bizning video player logikamiz
React Native uchun video player state:

type VideoState = {
  lessonId: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: 1 | 1.25 | 1.5 | 2;
  watchedSeconds: number;
  completed: boolean;
};
Progress tracking
Oddiy currentTimeni saqlash yetarli emas. Chunki student video’ni oxiriga skip qilsa ham currentTime katta bo‘lib ketadi. Professional logika:

watchedRanges: [
  { start: 0, end: 45 },
  { start: 45, end: 120 },
  { start: 180, end: 240 }
]
Keyin real watched percent hisoblanadi:

watchedPercent = uniqueWatchedSeconds / videoDuration * 100
Lesson completed bo‘lishi uchun:

video ended OR watchedPercent >= 90%
Bu Teacher va Parent dashboard uchun muhim.

5. Timed question — video ichida savol chiqarish logikasi
Coursera’da in-video questions bor: ular video davomida tezkor savol yoki quiz sifatida chiqadi; rasmiy help’da bunday savollar optional va overall course grade’ga kirmasligi aytilgan. 

Bizda bu feature kuchliroq bo‘ladi:

belgilangan sekundda video pause bo‘ladi;

modal ochiladi;

student variant tanlaydi;

submit yoki skip qiladi;

natija saqlanadi;

video davom etadi.

Timed question data model
{
  id: "tq_1",
  lessonId: "lesson_1",
  triggerTimeSec: 75,
  type: "single_choice",
  question: {
    en: "Who developed the first algorithm for the Analytical Engine?",
    ja: "解析機関のための最初のアルゴリズムを開発したのは誰ですか？"
  },
  options: [
    { id: "a", en: "Ada Lovelace", ja: "エイダ・ラブレス" },
    { id: "b", en: "Charles Babbage", ja: "チャールズ・バベッジ" }
  ],
  correctOptionId: "a",
  required: false
}
Modal UX
Timed question modal’da:

Question title
Question text
Option A
Option B
Option C
Option D

[Submit] [Skip]
Submit bosilganda:

{
  userId,
  lessonId,
  questionId,
  selectedOptionId,
  isCorrect,
  skipped: false,
  answeredAt,
  videoTimeSec
}
Skip bosilganda:

{
  skipped: true,
  selectedOptionId: null
}
Teacher dashboard’da shu savollar bo‘yicha analytics chiqadi:

Student: Ali
Lesson: Analytical Engine
Timed Question: tq_1
Answer: correct
Time: 01:15
6. O‘ng panel — Notes, Transcript, Files
Screenshotlarda Coursera learning page’ning o‘ng tomonida uchta asosiy tab bor:

Transcript
Notes
Files
Bu juda kuchli UX: student video ko‘rayotganda parallel ravishda matn, eslatma va fayllarni ochadi.

6.1 Notes tab
Screenshotda note card ko‘rinadi:

Note 1

Timestamp: 4:38 - 4:45

Video thumbnail

Saved text

Edit icon

Delete icon

UX maqsadi: student muhim joyni vaqt bilan bog‘lab saqlaydi. Keyin note’ni bosganda video o‘sha timestamp’ga borishi kerak.

Bizda note model:

{
  id: "note_1",
  userId: "student_1",
  lessonId: "lesson_1",
  startTimeSec: 278,
  endTimeSec: 285,
  text: "Ada Lovelace realized the true potential of the analytical engine.",
  createdAt,
  updatedAt
}
Note bosilganda:

video.seek(note.startTimeSec)
6.2 Transcript tab
Screenshotda transcript scroll bo‘ladi va saqlangan text highlight qilingan. Transcript’da timestamp ham bor, masalan 5:01.

Bu UX juda foydali:

video eshitmasdan matndan o‘qish mumkin;

qidirish mumkin;

note uchun text highlight qilish mumkin;

language switch bilan tarjima ko‘rish mumkin.

Coursera’da video subtitles, transcripts, lectures va ko‘p assessment turlari tarjima qilinishi mumkin; lekin downloadable files, PDFs, slides yoki tashqi assignment’lar har doim tarjima qilinmasligi mumkin. 

Bizda transcript model:

{
  lessonId: "lesson_1",
  language: "en",
  segments: [
    {
      start: 278,
      end: 285,
      text: "It took the powerful insights of a mathematician named Ada Lovelace..."
    }
  ]
}
Transcript segment bosilganda:

video.seek(segment.start)
6.3 Files tab
Screenshotda files panel’da:

Lecture Video 240p

Lecture Video 720p

Subtitles English — WebVTT

Transcript English — txt

Coursera rasmiy help’da video download, subtitle WebVTT file va transcript download qilish flow’i ko‘rsatilgan. 

Bizda Files tab:

Resources
- Lecture video
- PDF notes
- Slides
- Subtitles
- Transcript
File model:

{
  id: "file_1",
  lessonId: "lesson_1",
  type: "pdf | video | subtitle | transcript",
  title: "Lesson Notes",
  language: "en",
  url: "/resources/lesson-1-notes.pdf",
  downloadable: true
}
Local demo uchun file’larni assets/ ichida saqlash mumkin.

7. “Dive deeper on this topic” — AI/helper UX
Screenshotda video ostida:

Give me practice questions

Explain this topic in simple terms

Give me a summary

Give me real-life examples

Bu qism studentga passiv video ko‘rishdan active learning’ga o‘tishga yordam beradi.

Biz MVP’da buni real AI’siz ham qilishimiz mumkin:

lesson.aiHelper = {
  summary: "...",
  simpleExplanation: "...",
  examples: ["...", "..."],
  practiceQuestions: [...]
}
Keyingi bosqichda buni backend + AI API bilan dinamik qilish mumkin.

8. Course detail page UX
Real Coursera’da user course’ni ochganda odatda quyidagilarni ko‘radi:

Course title

Provider / instructor

Rating

Level

Duration

Skills

Course modules

Certificate availability

Enroll / payment / preview CTA

Coursera’da preview mode orqali ko‘p kurslarda birinchi module’ni payment qilmasdan ko‘rish mumkin, keyingi module’lar paid upgrade bo‘lmaguncha locked bo‘lishi aytilgan. 

Bizda Course detail screen:

Course Hero
Title
Teacher
Rating
Price
Language
Duration
[Enroll / Buy Course]

What you'll learn
Sections
Reviews
Teacher profile
Resources
Payment logic:

Not enrolled → Preview / Buy
Enrolled unpaid → Limited access
Paid → Full access
Completed + passed tests → Certificate or completion badge
Coursera’da certificate olish uchun required assessments’dan o‘tish va course uchun payment yoki financial aid approval kerakligi aytilgan. 

9. Course list / homepage UX
Student app ochganda homepage quyidagilarni ko‘rsatishi kerak:

Search bar
Categories
Recommended courses
Continue learning
Popular courses
Bookmarked courses
New courses
Course card UX:

[Image]
Course title
Teacher
Rating
Duration
Level
Price / Free
Bookmark icon
Progress badge, agar enrolled bo‘lsa
Student course card’dan quyidagi action’larni qiladi:

course detail ochish;

bookmark qilish;

payment qilish;

continue learning qilish;

rating ko‘rish;

teacher bo‘yicha search qilish.

Bizda course list search logic:

searchQuery matches:
- course.title
- course.description
- teacher.name
- category.name
Recommended courses logic MVP’da oddiy bo‘ladi:

user selected preferences + category + rating + recent courses
10. Section final test UX
Coursera’da ko‘p kurslar progressni o‘lchash uchun assignments/quizzes ishlatadi; rasmiy help’da assignments ko‘pincha auto-graded bo‘lishi aytilgan. 

Bizda har section oxirida:

Section Final Test
15–20 questions
Score
Pass / Fail
Attempt history
Final test screen
Question 1 / 20
Question text
A
B
C
D

[Previous] [Next]
[Submit Test]
Submit bosilganda:

score = correctAnswers / totalQuestions * 100
passed = score >= passScore
Attempt model:

{
  id: "attempt_1",
  userId: "student_1",
  sectionId: "section_1",
  totalQuestions: 20,
  correctAnswers: 16,
  score: 80,
  passed: true,
  answers: [
    {
      questionId: "q_1",
      selectedOptionId: "a",
      isCorrect: true
    }
  ],
  startedAt,
  submittedAt
}
Teacher va Parent dashboard aynan shu attempt data’dan foydalanadi.

Coursera Grades tab’da assessment status, grade, weight, due date, locked state va final grade kabi ma’lumotlar ko‘rinishi rasmiy help’da tushuntirilgan. 

11. Student dashboard UX
Real Coursera Student Home’da current courses, recent grades va calendar/upcoming deadlines ko‘rinadi. 

Bizda Student dashboard:

Welcome, Ali
Continue learning
Overall progress
Courses in progress
Completed lessons
Test results
Recent activity
Bookmarked courses
Certificates / achievements
Student progress logic
courseProgress =
  completedLessons / totalLessons * 60
  + passedSectionTests / totalSectionTests * 40
Yoki soddaroq MVP:

courseProgress = completedItems / totalItems * 100
Dashboard card example:

Technical Support Fundamentals
Progress: 45%
Last lesson: From Abacus to Analytical Engine
Last test: History of Computing — 80%
[Continue]
12. Teacher dashboard UX
Coursera tarafida educator/admin uchun authoring tools va course builder mavjud; Course Builder custom courses yaratishga yordam beruvchi authoring tool sifatida tasvirlangan. 

Bizning teacher panel Coursera’dan ilhomlangan, lekin soddaroq va aniqroq bo‘ladi.

Teacher dashboard:

My courses
Create course
Upload video
Create section
Create lesson
Create quiz
Students
Progress analytics
Quiz results
Live classes
Teacher o‘z kursini nazorat qiladi
RBAC rule:

teacher can read/update/delete only courses where course.teacherId === teacher.id
Teacher analytics:

Course: Technical Support Fundamentals
Students: 120
Average progress: 64%
Average test score: 78%
Most difficult question: Question 7
Most skipped timed question: tq_3
Course creation UX
Teacher form:

Course title
Description
Category
Level
Language
Price
Cover image
Sections
Lessons
Videos
PDF resources
Final test
Teacher video upload UX:

Select video
Upload progress bar
Processing status
Preview video
Save lesson
13. Parent dashboard UX
Bu Coursera’dan farqli custom feature. Maqsad: ota-ona farzandining o‘qishini kuzatadi, lekin course content’ni o‘zgartirmaydi.

Parent dashboard:

Child selector
Overall progress
Watched lessons
Recent tests
Weak topics
Last activity
Weekly learning time
Parent ko‘radigan data:

{
  childId,
  courseProgress,
  watchedLessons,
  testScores,
  lastLoginAt,
  lastLessonAt,
  averageScore
}
Parent access rule:

parent can only view linked children
parent cannot edit course
parent cannot answer quiz
parent cannot change student progress
Farzandni ulash uchun:

Student app → Generate parent code
Parent app → Enter code
Backend → link parent_child
Local MVP’da buni mock code bilan qilamiz.

14. Admin dashboard UX
Admin butun platformani boshqaradi.

Admin screens:

Users
Roles
Courses
Categories
Payments
Reports
Languages
System settings
Admin permissions:

admin can manage all users
admin can approve/reject teachers
admin can remove courses
admin can view payment records
admin can manage categories/languages
Admin dashboard MVP’da oddiy bo‘lishi mumkin, lekin role system boshidan to‘g‘ri quriladi.

15. Authentication UX
Siz aytgan auth flow:

Signup
Login
OTP verification
Resend OTP
Forgot password
Google authentication
Role-based redirect
UX flow:

Open app
→ Welcome screen
→ Login / Signup
→ OTP verification
→ Select role or auto role
→ Dashboard
Role-based redirect:

if role === "student" → StudentDashboard
if role === "teacher" → TeacherDashboard
if role === "parent" → ParentDashboard
if role === "admin" → AdminDashboard
Teacher signup’da qo‘shimcha form bo‘ladi:

Full name
Email
Expertise
Bio
Profile image
Verification status
Admin teacher’ni approve qilishi mumkin.

16. English / Japanese localization UX
Real Coursera’da language dropdown bor, screenshotda English, Arabic, Deutsch, Español, Français, Japanese, Korean va boshqalar ko‘rinadi. Bizda hozircha:

English
Japanese
UI translation:

{
  "course.continue": {
    en: "Continue learning",
    ja: "学習を続ける"
  }
}
Question translation:

question.text.en
question.text.ja
option.text.en
option.text.ja
Fallback rule:

Agar Japanese question mavjud bo‘lmasa → English chiqadi
Transcript:

Transcript English
Transcript Japanese
Files:

PDF English
PDF Japanese
17. Payment UX
Student paid course sotib oladi:

Course detail
→ Buy course
→ Stripe checkout
→ Payment success
→ Enrollment activated
→ Course unlocked
Course access states:

free
preview
locked
paid
completed
Real Coursera’da paid learning content course certificate eligibility bilan bog‘langan; preview mode’da certificate eligibility bo‘lmasligi mumkin. 

Bizda:

enrollment.status = "preview | active | completed | expired"
payment.status = "pending | paid | failed | refunded"
18. Live group classes UX
Coursera’da community/discussion forumlar orqali learnerlar savol berishi, boshqa learnerlar javob yozishi, ayrim kurslarda mentors/staff javob berishi mumkin. 

Bizda live class feature alohida bo‘ladi:

Teacher creates live class
Student joins
Class has date/time/link/status
Recording optional
MVP’da:

Live class title
Date/time
Meeting link
Join button
Keyin Zoom/Jitsi/WebRTC qo‘shish mumkin.

19. Coursera dizayn uslubi — bizga kerak bo‘ladigan design system
Screenshotlar asosida Coursera learning UI quyidagicha qurilgan:

Dizayn elementi	Kuzatuv	Bizga mos variant
Background	Oq + juda och kulrang panellar	Clean LMS look
Primary color	Coursera blue	Biz original primary rang tanlaymiz
Cards	Rounded, light shadow, soft background	Course cards, note cards, file cards
Sidebar	Scrollable, grouped sections	Course structure drawer
Buttons	Outline blue, primary CTA	Enroll, Submit, Continue
Progress	Top progress bar + lesson circles	Course/section progress
Typography	Clear hierarchy	Title, subtitle, metadata
Icons	Minimal line icons	Native icon set
Panels	Right-side tabs	Mobile’da tabs/bottom sheet
Bizning design prinsiplar:

1. Student focus: video va next action har doim ko‘rinsin
2. Progress visible: user har doim qanchalik tugatganini bilsin
3. Learning support: transcript, notes, files tez ochilsin
4. Role-based UI: student/teacher/parent/admin chalkashmasin
5. Mobile-first: Expo local demo avval mobile’da yaxshi ishlasin
20. Bizning loyiha uchun asosiy screen map
Public/Auth
Splash
Welcome
Login
Signup
OTP Verification
Forgot Password
Role Selection
Student
Student Home
Course List
Course Detail
My Courses
Learning Page
Video Lesson
Timed Question Modal
Section Final Test
Test Result
Bookmarks
Notes
Profile
Payment
Teacher
Teacher Dashboard
My Courses
Create/Edit Course
Create/Edit Section
Create/Edit Lesson
Upload Video
Create Quiz
Students List
Student Progress Detail
Quiz Results
Live Classes
Teacher Profile
Parent
Parent Dashboard
Children List
Child Progress
Child Course Detail
Recent Tests
Activity Timeline
Admin
Admin Dashboard
Users
Courses
Teachers
Categories
Payments
Reports
Settings
21. Minimal data model
Core entities:

User
Role
Course
Section
Lesson
VideoProgress
TimedQuestion
TimedQuestionAnswer
Quiz
QuizQuestion
QuizAttempt
Enrollment
Payment
Note
Resource
ParentChildLink
LiveClass
Review
Bookmark
Relationship:

User(student) → Enrollment → Course
Course → Sections → Lessons
Lesson → TimedQuestions
Section → FinalQuiz
Student → VideoProgress
Student → QuizAttempts
Student → Notes
Teacher → Courses
Parent → ParentChildLink → Student
Admin → All
22. MVP uchun eng to‘g‘ri scope
Birinchi local demo uchun quyidagini qilish eng to‘g‘ri:

1. Auth mock/local
2. Role-based navigation
3. Student course list
4. Course detail
5. Learning page
6. Video player
7. Progress tracking
8. Timed question modal
9. Section final test
10. Student dashboard
11. Teacher dashboard basic
12. Parent dashboard basic
13. English/Japanese i18n
Keyingi bosqichda:

Stripe payment
Google auth
Real backend
Teacher video upload
Live classes
Admin approval
Vercel web deploy
23. Xulosa
Coursera’ning kuchli tomoni shunda: u video platforma emas, balki structured learning system. Har bir lesson course hierarchy ichida turadi, video player progress bilan bog‘langan, transcript/note/files learning’ni qo‘llab-quvvatlaydi, quiz/assignment esa natijani o‘lchaydi. Student dashboard progressni ko‘rsatadi, educator/admin taraf esa content va learner analytics’ni boshqaradi.

Bizning loyiha ham shu prinsipda bo‘ladi:

Course → Section → Lesson → Video → Timed Question → Final Test → Progress → Dashboard
Keyingi bosqich: shu tahlil asosida aniq PRD, screen-by-screen UI structure, database schema, va Expo React Native project architecture yozamiz.


davom ettir menga senior engineer sifatida to'liq hammasini rejasini yani loyihani to'liq rejasini yozib ber men uni md fayl qilib IDE lar orqali dasturlab yarataman 

Thought for 4m 37s
Quyidagi matnni PROJECT_PLAN.md qilib saqlab, loyihani shu blueprint bo‘yicha qurishingiz mumkin. Men buni senior engineer texnik reja sifatida yozdim: product scope, architecture, folder structure, data model, API, role permissions, UI screens, progress logic, video/timed question logic, test/quiz logic, deployment va development roadmap hammasi bor.

EduPath LMS — Coursera-like Learning Platform Project Plan
Codename: EduPath LMS
Platform: Expo React Native app + Web deploy
Goal: Coursera’dan ilhomlangan, lekin original nom, dizayn va brand bilan ishlaydigan mobile-first LMS platforma yaratish.
Main users: student, teacher/instructor, parent, admin.
Supported languages: English and Japanese.

1. Product Vision
EduPath LMS — video darslar, progress tracking, timed questions, section final tests, teacher course management, parent monitoring va admin control panelga ega ta’lim platformasi.

Platforma quyidagi asosiy flow atrofida quriladi:

Course → Section → Lesson → Video → Timed Question → Final Test → Progress → Dashboard
Asosiy maqsad oddiy video app emas, balki learning management system yaratish:

Student learns
Teacher creates and monitors
Parent tracks child progress
Admin controls platform
2. Main Feature Scope
2.1 Student Features
Student quyidagilarni qila oladi:

Authentication
- Signup
- Login
- OTP verification
- Resend OTP
- Forgot password
- Google authentication
- Logout

Course discovery
- Homepage
- Course list
- Category filter
- Search by course
- Search by teacher
- Recommended courses
- Rating view
- Bookmark add/remove

Course access
- Course detail
- Enroll course
- Buy paid course
- Continue learning
- View course sections
- View lessons

Learning
- Video player
- Watch progress tracking
- Timed question modal
- Submit/skip question
- Transcript
- Notes
- Download resources
- Section final test
- Attempt result
- Course progress

Student dashboard
- Enrolled courses
- Watched lessons
- Test results
- Progress
- Recent activity
- Bookmarked courses
2.2 Teacher Features
Teacher quyidagilarni qila oladi:

Authentication
- Signup
- Login
- OTP verification
- Resend OTP
- Forgot password
- Google authentication
- Logout

Course management
- Create course
- Edit own course
- Delete own course
- Upload course cover image
- Add course description
- Add category, level, price, language
- View own courses only

Section management
- Create section
- Edit section
- Delete section
- Reorder sections

Lesson management
- Create lesson
- Edit lesson
- Delete lesson
- Upload video
- Add transcript
- Add PDF/resources
- Add timed questions

Quiz management
- Create section final test
- Add 15–20 questions
- Add multilingual questions
- Set correct answers
- Set pass score
- Edit quiz
- Delete quiz

Analytics
- Student list per course
- Student progress
- Quiz results
- Timed question results
- Average score
- Weak questions
Teacher faqat o‘ziga tegishli kurslarni boshqaradi:

course.teacherId === currentUser.id
2.3 Parent Features
Parent quyidagilarni ko‘radi:

- Linked children
- Child course progress
- Watched lessons
- Recent tests
- Test scores
- Last activity
- Weekly learning time
- Weak sections
Parent hech narsani o‘zgartira olmaydi:

Parent can view only
Parent cannot answer quiz
Parent cannot edit progress
Parent cannot edit course
2.4 Admin Features
Admin butun platformani boshqaradi:

- Users
- Roles
- Teachers
- Courses
- Categories
- Payments
- Reports
- Platform settings
- Language settings
Admin permissions:

Admin can manage all users
Admin can approve/reject teacher
Admin can manage all courses
Admin can manage categories
Admin can view payments
Admin can view reports
3. Recommended Tech Stack
3.1 Frontend
Framework: Expo React Native
Language: TypeScript
Navigation: Expo Router
State management: Redux Toolkit + RTK Query
Persistence: redux-persist + AsyncStorage
Forms: React Hook Form + Zod
UI: Custom design system
Icons: lucide-react-native or @expo/vector-icons
Video: expo-video
i18n: i18next + react-i18next
Charts: react-native-svg + victory-native or custom lightweight charts
Expo Router file-based routing works for React Native and web, so it is a good fit for one codebase that runs as mobile app and web app. 

For video, use expo-video, not old expo-av Video. Expo documentation describes expo-video as the current cross-platform video playback API with Android, iOS, tvOS and Web support. 

Redux Toolkit is suitable because you specifically want a Redux store; RTK Query should be used for API fetching/caching instead of manually writing loading/error/cache logic everywhere. 

3.2 Backend
Recommended backend:

Runtime: Node.js
Framework: NestJS or Express/Fastify
Language: TypeScript
Database: PostgreSQL
ORM: Prisma
Auth: JWT access token + refresh token
File storage: Local for MVP, S3/R2 later
Payment: Stripe
Email/OTP: Nodemailer for local, SendGrid/Mailgun later
Validation: Zod or class-validator
API style: REST first, GraphQL optional later
For Stripe payments, use backend-created Payment Intents or Checkout sessions. Stripe provides official React Native SDK support for native Android/iOS payments. 
 Expo also documents support for @stripe/stripe-react-native. 

For Google auth, do not build around old react-google-login as a core dependency. Use Google Identity Services on web and verify tokens on backend. Google’s documentation recommends modern OAuth flows such as Authorization Code with PKCE for browser-based apps, and Google also provides official Node.js auth libraries. 

3.3 Deployment
Mobile local demo: Expo Go / development build
Web local: Expo web
Web deploy: Vercel
Backend deploy: Render / Railway / Fly.io / VPS
Database: Supabase Postgres / Neon / Railway Postgres
Storage later: Cloudflare R2 / AWS S3
Expo web projects can be exported into a dist directory using expo export -p web; Expo’s publishing docs also include Vercel configuration with buildCommand, outputDirectory, and SPA rewrites. 

4. Architecture Decision
Use a monorepo.

edupath-lms/
  apps/
    mobile/        # Expo React Native app
    api/           # Backend API
  packages/
    shared/        # Shared types, validation schemas, constants
    config/        # ESLint, TSConfig, Prettier
  docs/
    PROJECT_PLAN.md
    API.md
    DATABASE.md
    UI.md
Why monorepo:

- shared TypeScript types
- shared role constants
- shared API contracts
- easier refactoring
- mobile and backend evolve together
5. Project Phases
Phase 0 — Project Setup
Goal: repository, TypeScript, linting, folder structure.

Tasks:

- Create monorepo
- Setup Expo app
- Setup backend app
- Setup shared package
- Setup TypeScript
- Setup ESLint
- Setup Prettier
- Setup env files
- Setup git branches
- Setup README
Deliverable:

App runs locally
Backend health endpoint works
Shared types import works
Phase 1 — Local Mock MVP
Goal: app ishlasin, backend shart emas.

Tasks:

- Mock users
- Mock courses
- Mock sections
- Mock lessons
- Mock video assets
- Mock timed questions
- Mock quiz
- Local Redux state
- Role-based navigation
- Student learning flow
- Teacher dashboard basic
- Parent dashboard basic
Deliverable:

Expo local appda student video ko‘radi, timed question chiqadi, test topshiradi, progress saqlanadi.
Phase 2 — Real Auth + Backend
Goal: real user system.

Tasks:

- Backend auth module
- Signup
- Login
- OTP verification
- Resend OTP
- Forgot password
- Reset password
- JWT access token
- Refresh token
- Role-based middleware
- Current user endpoint
Deliverable:

Student/teacher/parent/admin real login qiladi va o‘z dashboardiga kiradi.
Phase 3 — Course Backend
Goal: real course CRUD.

Tasks:

- Course CRUD
- Section CRUD
- Lesson CRUD
- Teacher ownership rule
- Course list API
- Course detail API
- Search API
- Category API
- Bookmark API
- Rating API
Deliverable:

Teacher course yaratadi, student course listdan ko‘radi.
Phase 4 — Video + Progress Tracking
Goal: learning engine.

Tasks:

- Video player component
- Time tracking
- Watched ranges
- Lesson progress save
- Resume playback
- Completed lesson logic
- Timed question trigger
- Timed question answer save
- Notes
- Transcript
- Files/resources
Deliverable:

Student video ko‘radi, progress real hisoblanadi, savol belgilangan vaqtda chiqadi.
Phase 5 — Section Final Test
Goal: quiz engine.

Tasks:

- Quiz builder
- Question CRUD
- Multilingual questions
- Test screen
- Submit answers
- Score calculation
- Attempt history
- Pass/fail logic
- Teacher quiz analytics
Deliverable:

Section oxirida 15–20 savolli test ishlaydi va attempt saqlanadi.
Phase 6 — Payment
Goal: paid courses.

Tasks:

- Stripe customer
- Course price
- Payment intent/checkout
- Payment success webhook
- Enrollment activation
- Payment history
- Locked content logic
Deliverable:

Student course sotib oladi va paid content ochiladi.
Phase 7 — Live Classes
Goal: real-time group class.

MVP approach:

- Teacher creates live class
- Date/time
- Meeting link
- Student can join
- Status: scheduled/live/ended
Advanced later:

- Jitsi integration
- Zoom integration
- WebRTC
- Recording
- Attendance
Phase 8 — Web Deploy + Polish
Goal: production-like demo.

Tasks:

- Expo web export
- Vercel config
- Backend deployment
- Database migration
- Seed data
- Error handling
- Loading states
- Empty states
- Responsive layout
- QA testing
Deliverable:

Vercel web demo + Expo mobile local demo.
6. User Roles and Permissions
6.1 Role Types
export type UserRole = "student" | "teacher" | "parent" | "admin";
6.2 Permission Matrix
Feature	Student	Teacher	Parent	Admin
View course list	Yes	Yes	Yes	Yes
Enroll course	Yes	No	No	Yes
Watch lesson	Yes	Preview only	View child data only	Yes
Answer timed question	Yes	No	No	No
Take final test	Yes	No	No	No
View own progress	Yes	No	No	Yes
View student progress	No	Own courses only	Own children only	Yes
Create course	No	Yes	No	Yes
Edit course	No	Own courses only	No	Yes
Delete course	No	Own courses only	No	Yes
Create quiz	No	Own courses only	No	Yes
View payments	Own only	Course revenue later	No	Yes
Manage users	No	No	No	Yes
7. Core Data Model
7.1 User
type User = {
  id: string;
  role: "student" | "teacher" | "parent" | "admin";
  fullName: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  preferredLanguage: "en" | "ja";
  createdAt: string;
  updatedAt: string;
};
7.2 Teacher Profile
type TeacherProfile = {
  id: string;
  userId: string;
  bio: string;
  expertise: string[];
  headline?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
};
7.3 Parent Child Link
type ParentChildLink = {
  id: string;
  parentId: string;
  childId: string;
  status: "pending" | "active" | "revoked";
  code?: string;
  createdAt: string;
};
7.4 Course
type Course = {
  id: string;
  teacherId: string;
  categoryId: string;
  title: {
    en: string;
    ja?: string;
  };
  description: {
    en: string;
    ja?: string;
  };
  coverImageUrl: string;
  level: "beginner" | "intermediate" | "advanced";
  language: "en" | "ja" | "multi";
  price: number;
  currency: "USD" | "JPY";
  ratingAvg: number;
  ratingCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};
7.5 Section
type Section = {
  id: string;
  courseId: string;
  title: {
    en: string;
    ja?: string;
  };
  description?: {
    en: string;
    ja?: string;
  };
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};
7.6 Lesson
type Lesson = {
  id: string;
  sectionId: string;
  title: {
    en: string;
    ja?: string;
  };
  description?: {
    en: string;
    ja?: string;
  };
  type: "video" | "reading" | "quiz_intro";
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSec: number;
  orderIndex: number;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
};
7.7 Timed Question
type TimedQuestion = {
  id: string;
  lessonId: string;
  triggerTimeSec: number;
  question: {
    en: string;
    ja?: string;
  };
  options: Array<{
    id: string;
    text: {
      en: string;
      ja?: string;
    };
  }>;
  correctOptionId: string;
  explanation?: {
    en: string;
    ja?: string;
  };
  required: boolean;
  createdAt: string;
  updatedAt: string;
};
7.8 Timed Question Answer
type TimedQuestionAnswer = {
  id: string;
  userId: string;
  lessonId: string;
  timedQuestionId: string;
  selectedOptionId?: string;
  isCorrect?: boolean;
  skipped: boolean;
  answeredAtVideoSec: number;
  createdAt: string;
};
7.9 Video Progress
type VideoProgress = {
  id: string;
  userId: string;
  lessonId: string;
  currentTimeSec: number;
  durationSec: number;
  watchedPercent: number;
  completed: boolean;
  watchedRanges: Array<{
    start: number;
    end: number;
  }>;
  lastWatchedAt: string;
  createdAt: string;
  updatedAt: string;
};
7.10 Quiz
type Quiz = {
  id: string;
  sectionId: string;
  title: {
    en: string;
    ja?: string;
  };
  passScore: number;
  totalQuestions: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};
7.11 Quiz Question
type QuizQuestion = {
  id: string;
  quizId: string;
  question: {
    en: string;
    ja?: string;
  };
  options: Array<{
    id: string;
    text: {
      en: string;
      ja?: string;
    };
  }>;
  correctOptionId: string;
  explanation?: {
    en: string;
    ja?: string;
  };
  orderIndex: number;
};
7.12 Quiz Attempt
type QuizAttempt = {
  id: string;
  userId: string;
  quizId: string;
  sectionId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  answers: Array<{
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }>;
  startedAt: string;
  submittedAt: string;
};
7.13 Enrollment
type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: "preview" | "active" | "completed" | "expired";
  progressPercent: number;
  enrolledAt: string;
  completedAt?: string;
};
7.14 Payment
type Payment = {
  id: string;
  userId: string;
  courseId: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: "USD" | "JPY";
  status: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
};
7.15 Note
type Note = {
  id: string;
  userId: string;
  lessonId: string;
  startTimeSec: number;
  endTimeSec?: number;
  text: string;
  createdAt: string;
  updatedAt: string;
};
7.16 Resource
type Resource = {
  id: string;
  lessonId: string;
  title: {
    en: string;
    ja?: string;
  };
  type: "pdf" | "subtitle" | "transcript" | "slide" | "link";
  url: string;
  language: "en" | "ja";
  downloadable: boolean;
  createdAt: string;
};
7.17 Bookmark
type Bookmark = {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
};
7.18 Rating
type Rating = {
  id: string;
  userId: string;
  courseId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  review?: string;
  createdAt: string;
  updatedAt: string;
};
8. Database Schema Plan
Recommended tables:

users
teacher_profiles
parent_child_links
categories
courses
sections
lessons
timed_questions
timed_question_answers
video_progress
quizzes
quiz_questions
quiz_attempts
enrollments
payments
notes
resources
bookmarks
ratings
live_classes
otp_codes
refresh_tokens
Important indexes:

users.email unique
courses.teacher_id
courses.category_id
sections.course_id
lessons.section_id
timed_questions.lesson_id
video_progress.user_id + lesson_id unique
quiz_attempts.user_id + quiz_id
enrollments.user_id + course_id unique
bookmarks.user_id + course_id unique
parent_child_links.parent_id + child_id unique
9. API Design
Base URL:

/api/v1
9.1 Auth API
POST /auth/signup
POST /auth/login
POST /auth/verify-otp
POST /auth/resend-otp
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/google
POST /auth/refresh
POST /auth/logout
GET  /auth/me
Signup request:

{
  "fullName": "Ali Valiyev",
  "email": "ali@example.com",
  "password": "StrongPassword123",
  "role": "student",
  "preferredLanguage": "en"
}
Login response:

{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "user_1",
    "role": "student",
    "fullName": "Ali Valiyev",
    "email": "ali@example.com"
  }
}
9.2 Course API
GET    /courses
GET    /courses/recommended
GET    /courses/search?q=react
GET    /courses/:courseId
POST   /courses
PATCH  /courses/:courseId
DELETE /courses/:courseId
POST   /courses/:courseId/publish
POST   /courses/:courseId/unpublish
Rules:

GET courses → public/enrolled access
POST course → teacher/admin only
PATCH course → owner teacher/admin only
DELETE course → owner teacher/admin only
9.3 Section API
GET    /courses/:courseId/sections
POST   /courses/:courseId/sections
PATCH  /sections/:sectionId
DELETE /sections/:sectionId
POST   /courses/:courseId/sections/reorder
9.4 Lesson API
GET    /sections/:sectionId/lessons
GET    /lessons/:lessonId
POST   /sections/:sectionId/lessons
PATCH  /lessons/:lessonId
DELETE /lessons/:lessonId
POST   /sections/:sectionId/lessons/reorder
9.5 Video Progress API
GET   /lessons/:lessonId/progress
POST  /lessons/:lessonId/progress
PATCH /lessons/:lessonId/progress
POST  /lessons/:lessonId/complete
Progress update request:

{
  "currentTimeSec": 142,
  "durationSec": 300,
  "watchedRanges": [
    { "start": 0, "end": 60 },
    { "start": 60, "end": 142 }
  ]
}
9.6 Timed Question API
GET   /lessons/:lessonId/timed-questions
POST  /lessons/:lessonId/timed-questions
PATCH /timed-questions/:questionId
DELETE /timed-questions/:questionId
POST  /timed-questions/:questionId/answer
Answer request:

{
  "lessonId": "lesson_1",
  "selectedOptionId": "a",
  "skipped": false,
  "answeredAtVideoSec": 75
}
9.7 Quiz API
GET    /sections/:sectionId/quiz
POST   /sections/:sectionId/quiz
PATCH  /quizzes/:quizId
DELETE /quizzes/:quizId
POST   /quizzes/:quizId/questions
PATCH  /quiz-questions/:questionId
DELETE /quiz-questions/:questionId
POST   /quizzes/:quizId/start
POST   /quizzes/:quizId/submit
GET    /quizzes/:quizId/attempts
GET    /students/me/quiz-attempts
Submit request:

{
  "answers": [
    {
      "questionId": "q1",
      "selectedOptionId": "a"
    },
    {
      "questionId": "q2",
      "selectedOptionId": "c"
    }
  ]
}
Submit response:

{
  "attemptId": "attempt_1",
  "score": 85,
  "correctAnswers": 17,
  "totalQuestions": 20,
  "passed": true
}
9.8 Dashboard API
GET /students/me/dashboard
GET /teachers/me/dashboard
GET /teachers/me/courses/:courseId/students
GET /teachers/me/students/:studentId/progress
GET /parents/me/dashboard
GET /parents/me/children/:childId/progress
GET /admin/dashboard
9.9 Payment API
POST /payments/create-intent
POST /payments/stripe-webhook
GET  /payments/me
GET  /admin/payments
10. Frontend Folder Structure
Expo app:

apps/mobile/
  app/
    _layout.tsx
    index.tsx

    (auth)/
      _layout.tsx
      welcome.tsx
      login.tsx
      signup.tsx
      otp.tsx
      forgot-password.tsx
      reset-password.tsx

    (student)/
      _layout.tsx
      home.tsx
      courses.tsx
      course/[courseId].tsx
      learn/[courseId]/[lessonId].tsx
      quiz/[sectionId].tsx
      quiz-result/[attemptId].tsx
      bookmarks.tsx
      notes.tsx
      profile.tsx

    (teacher)/
      _layout.tsx
      dashboard.tsx
      courses.tsx
      course-create.tsx
      course/[courseId]/edit.tsx
      course/[courseId]/students.tsx
      lesson/[lessonId]/edit.tsx
      quiz/[sectionId]/edit.tsx
      analytics.tsx
      profile.tsx

    (parent)/
      _layout.tsx
      dashboard.tsx
      child/[childId].tsx
      child/[childId]/course/[courseId].tsx
      profile.tsx

    (admin)/
      _layout.tsx
      dashboard.tsx
      users.tsx
      courses.tsx
      teachers.tsx
      payments.tsx
      settings.tsx

  src/
    api/
      baseApi.ts
      authApi.ts
      coursesApi.ts
      lessonsApi.ts
      progressApi.ts
      quizApi.ts
      dashboardApi.ts
      paymentsApi.ts

    app/
      store.ts
      hooks.ts

    assets/
      images/
      videos/
      pdfs/

    components/
      common/
        AppButton.tsx
        AppInput.tsx
        AppCard.tsx
        AppText.tsx
        LoadingState.tsx
        EmptyState.tsx
        ErrorState.tsx
      course/
        CourseCard.tsx
        CourseList.tsx
        CourseHeader.tsx
        SectionAccordion.tsx
        LessonRow.tsx
      learning/
        VideoPlayer.tsx
        LessonSidebar.tsx
        TimedQuestionModal.tsx
        TranscriptPanel.tsx
        NotesPanel.tsx
        FilesPanel.tsx
        LearningTabs.tsx
      quiz/
        QuizQuestionCard.tsx
        QuizNavigator.tsx
        QuizResultCard.tsx
      dashboard/
        ProgressCard.tsx
        RecentActivity.tsx
        ScoreChart.tsx

    constants/
      roles.ts
      routes.ts
      colors.ts
      spacing.ts
      typography.ts

    features/
      auth/
        authSlice.ts
        authSelectors.ts
      courses/
        coursesSlice.ts
      learning/
        learningSlice.ts
        progressUtils.ts
      quiz/
        quizSlice.ts
      i18n/
        i18n.ts
        en.json
        ja.json

    hooks/
      useAuth.ts
      useRoleRedirect.ts
      useVideoProgress.ts
      useTimedQuestions.ts
      useAppLanguage.ts

    lib/
      storage.ts
      date.ts
      permissions.ts
      validators.ts

    theme/
      colors.ts
      spacing.ts
      shadows.ts
      radius.ts
      typography.ts

    types/
      models.ts
      api.ts
11. Backend Folder Structure
apps/api/
  src/
    main.ts
    app.module.ts

    config/
      env.ts
      database.ts
      jwt.ts
      stripe.ts

    common/
      guards/
        jwt.guard.ts
        roles.guard.ts
        ownership.guard.ts
      decorators/
        current-user.decorator.ts
        roles.decorator.ts
      filters/
        http-exception.filter.ts
      pipes/
        validation.pipe.ts
      utils/
        pagination.ts

    modules/
      auth/
        auth.controller.ts
        auth.service.ts
        auth.module.ts
        dto/
      users/
        users.controller.ts
        users.service.ts
        users.module.ts
      courses/
        courses.controller.ts
        courses.service.ts
        courses.module.ts
        dto/
      sections/
      lessons/
      progress/
      timed-questions/
      quizzes/
      dashboards/
      payments/
      bookmarks/
      ratings/
      resources/
      live-classes/
      admin/

  prisma/
    schema.prisma
    migrations/
    seed.ts

  test/
12. Navigation Flow
12.1 Initial App Flow
App starts
→ Check token
→ If no token: Auth stack
→ If token: GET /auth/me
→ Redirect by role
Role redirect:

function getHomeByRole(role: UserRole) {
  switch (role) {
    case "student":
      return "/(student)/home";
    case "teacher":
      return "/(teacher)/dashboard";
    case "parent":
      return "/(parent)/dashboard";
    case "admin":
      return "/(admin)/dashboard";
  }
}
12.2 Student Learning Flow
Student Home
→ Course Detail
→ Enroll / Buy
→ Learning Page
→ Watch Video
→ Timed Question appears
→ Submit/Skip
→ Continue Video
→ Complete Lesson
→ Next Lesson
→ Section Final Test
→ Result
→ Dashboard Progress Updated
12.3 Teacher Creation Flow
Teacher Dashboard
→ Create Course
→ Add Course Details
→ Add Section
→ Add Lessons
→ Upload Videos
→ Add Timed Questions
→ Add Final Test
→ Preview Course
→ Publish
12.4 Parent Flow
Parent Dashboard
→ Select Child
→ View Course Progress
→ View Recent Tests
→ View Weak Topics
13. UI/UX Plan
13.1 Design Principles
- Mobile-first
- Clean learning workspace
- Video focused
- Progress always visible
- Role-based simplicity
- Japanese/English friendly layout
- Accessible colors and font sizes
13.2 Color System
Use original colors, not Coursera blue.

Example:

export const colors = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  secondary: "#7C3AED",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F5F9",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0"
};
13.3 Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32
};
13.4 Radius
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999
};
14. Screen-by-Screen Plan
14.1 Welcome Screen
Purpose:

- Brand intro
- Login CTA
- Signup CTA
- Language switch
Components:

Logo
Hero text
Primary button: Login
Secondary button: Create account
Language selector
14.2 Login Screen
Fields:

Email
Password
Remember me
Forgot password
Google login
Validation:

Email required
Valid email
Password required
Actions:

Login
Google login
Navigate to signup
Navigate to forgot password
14.3 Signup Screen
Fields:

Full name
Email
Password
Confirm password
Role
Preferred language
Teacher extra fields:

Expertise
Bio
Validation:

Password min length
Confirm password match
Role required
14.4 OTP Screen
Purpose:

Verify email
UI:

6-digit OTP input
Countdown timer
Resend OTP button
Verify button
14.5 Student Home
Sections:

Header
Search bar
Continue learning
Recommended courses
Categories
Popular courses
Bookmarked courses
Course card:

Cover image
Title
Teacher
Rating
Duration
Level
Price
Bookmark icon
Progress if enrolled
14.6 Course Detail
Sections:

Course hero
Title
Teacher
Rating
Price
Language
Level
Duration
Enroll/Buy button
What you will learn
Sections accordion
Reviews
Teacher profile
Access states:

Not enrolled → Enroll/Buy
Preview → Preview lesson only
Active → Continue learning
Completed → View certificate/progress
14.7 Learning Page
Desktop/web layout:

[Course Sidebar] [Video + Lesson Content] [Right Panel]
Mobile layout:

Video Player
Lesson title
Progress
Tabs: Transcript | Notes | Files
Section accordion
Next button
Main components:

VideoPlayer
TimedQuestionModal
TranscriptPanel
NotesPanel
FilesPanel
LessonSidebar
NextLessonButton
14.8 Timed Question Modal
Trigger:

When video currentTime >= triggerTimeSec
Behavior:

Pause video
Show modal
Student selects option
Submit or skip
Save answer
Resume video
UI:

Question text
Options
Submit button
Skip button
Explanation after submit
14.9 Section Final Test
UI:

Quiz title
Question counter
Question text
Options
Previous
Next
Submit
Rules:

15–20 questions
Single choice MVP
Score calculated after submit
Attempt saved
Pass score configurable
14.10 Quiz Result
UI:

Score
Passed/Failed
Correct answers
Total questions
Review answers
Retry if allowed
Back to course
14.11 Student Dashboard
Cards:

Overall progress
Courses in progress
Completed lessons
Recent test results
Learning streak
Bookmarks
Recent notes
14.12 Teacher Dashboard
Cards:

My courses
Total students
Average progress
Average quiz score
Recent activity
Create course CTA
Tables:

Course list
Student list
Quiz results
14.13 Course Builder
Steps:

Step 1: Course details
Step 2: Sections
Step 3: Lessons
Step 4: Videos/resources
Step 5: Timed questions
Step 6: Final test
Step 7: Preview/publish
14.14 Parent Dashboard
Cards:

Child selector
Overall progress
Current courses
Recent test results
Last activity
Weak topics
14.15 Admin Dashboard
Cards:

Total users
Total courses
Pending teachers
Revenue
Active students
Reports
15. Video Player Logic
15.1 State
type VideoPlayerState = {
  lessonId: string;
  isPlaying: boolean;
  currentTimeSec: number;
  durationSec: number;
  playbackRate: number;
  watchedRanges: Array<{ start: number; end: number }>;
  watchedPercent: number;
  completed: boolean;
};
15.2 Progress Tracking Rule
Do not trust only currentTimeSec, because student can skip.

Correct method:

Track watched ranges
Merge overlapping ranges
Calculate unique watched seconds
watchedPercent = uniqueWatchedSeconds / durationSec * 100
Completed rule:

Lesson completed if watchedPercent >= 90%
OR video ended
15.3 Watched Range Merge Utility
type Range = { start: number; end: number };

export function mergeRanges(ranges: Range[]): Range[] {
  if (!ranges.length) return [];

  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: Range[] = [sorted[0]];

  for (const range of sorted.slice(1)) {
    const last = merged[merged.length - 1];

    if (range.start <= last.end + 1) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push(range);
    }
  }

  return merged;
}

export function getWatchedSeconds(ranges: Range[]): number {
  return mergeRanges(ranges).reduce((sum, range) => {
    return sum + Math.max(0, range.end - range.start);
  }, 0);
}

export function getWatchedPercent(ranges: Range[], durationSec: number): number {
  if (!durationSec) return 0;
  return Math.min(100, Math.round((getWatchedSeconds(ranges) / durationSec) * 100));
}
15.4 Save Frequency
Progressni har sekund backendga yubormang.

Recommended:

Local state updates: every 1 second
Backend sync: every 10–15 seconds
Force sync:
- video pause
- screen leave
- app background
- video ended
16. Timed Question Logic
16.1 Trigger Algorithm
function shouldTriggerQuestion(params: {
  currentTimeSec: number;
  triggerTimeSec: number;
  alreadyAnswered: boolean;
  alreadyShownInSession: boolean;
}) {
  return (
    params.currentTimeSec >= params.triggerTimeSec &&
    !params.alreadyAnswered &&
    !params.alreadyShownInSession
  );
}
16.2 Rules
- One question should not appear multiple times in same session
- If answered before, do not show again
- If skipped and required=false, continue
- If skipped and required=true, teacher can decide:
  - allow continue
  - or force answer
MVP rule:

required=false for timed questions
Student can skip
Answer still saved
17. Quiz Scoring Logic
type QuizAnswerInput = {
  questionId: string;
  selectedOptionId: string;
};

type QuizQuestion = {
  id: string;
  correctOptionId: string;
};

export function calculateQuizScore(
  questions: QuizQuestion[],
  answers: QuizAnswerInput[],
  passScore: number
) {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedOptionId]));

  let correctAnswers = 0;

  for (const question of questions) {
    if (answerMap.get(question.id) === question.correctOptionId) {
      correctAnswers++;
    }
  }

  const totalQuestions = questions.length;
  const score = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);

  return {
    score,
    correctAnswers,
    totalQuestions,
    passed: score >= passScore
  };
}
18. Course Progress Logic
Simple MVP:

courseProgress = completedItems / totalItems * 100
Where:

completedItems = completedLessons + passedSectionTests
totalItems = totalLessons + totalSectionTests
Advanced weighted version:

Video lessons = 70%
Section tests = 30%
Formula:

courseProgress = videoProgressAvg * 0.7 + quizProgressAvg * 0.3;
19. Localization Plan
Supported languages:

English: en
Japanese: ja
UI translation files:

src/features/i18n/en.json
src/features/i18n/ja.json
Example:

{
  "auth.login": "Login",
  "auth.signup": "Create account",
  "course.continueLearning": "Continue learning",
  "lesson.transcript": "Transcript",
  "lesson.notes": "Notes",
  "lesson.files": "Files",
  "quiz.submit": "Submit test"
}
Japanese:

{
  "auth.login": "ログイン",
  "auth.signup": "アカウント作成",
  "course.continueLearning": "学習を続ける",
  "lesson.transcript": "文字起こし",
  "lesson.notes": "ノート",
  "lesson.files": "ファイル",
  "quiz.submit": "テストを提出"
}
Data localization helper:

type LocalizedText = {
  en: string;
  ja?: string;
};

export function tData(value: LocalizedText, lang: "en" | "ja") {
  return value[lang] || value.en;
}
Fallback rule:

If Japanese content missing, show English.
20. Auth and Security Plan
20.1 Password Auth
Rules:

- Hash passwords with bcrypt or argon2
- Never store plain password
- Access token short-lived
- Refresh token stored securely
- OTP expires after 5–10 minutes
- Rate limit OTP resend
20.2 Token Storage
Mobile:

Access token: memory or secure storage
Refresh token: SecureStore
Web:

Prefer httpOnly cookie for production
MVP can use local storage only for demo
20.3 RBAC
Backend guard:

1. Validate JWT
2. Load user
3. Check role
4. Check resource ownership
Example:

function canEditCourse(user: User, course: Course) {
  if (user.role === "admin") return true;
  if (user.role === "teacher" && course.teacherId === user.id) return true;
  return false;
}
21. Payment Logic
Payment states:

pending
paid
failed
refunded
Course access:

Free course → active enrollment immediately
Paid course unpaid → locked
Paid course paid → active enrollment
Payment flow:

Student clicks Buy
→ Backend creates payment intent
→ App opens Stripe payment sheet
→ Payment success
→ Stripe webhook confirms payment
→ Enrollment becomes active
→ Course unlocked
Never trust only frontend payment success. Backend webhook must confirm payment.

22. Teacher Ownership Rules
Every teacher endpoint must check ownership.

Examples:

Teacher can update course only if course.teacherId === teacher.id
Teacher can add section only to own course
Teacher can add lesson only to own course section
Teacher can view students only in own courses
Teacher can view quiz results only for own courses
23. Parent Access Rules
Parent can view child only through active link:

parent_child_links.status === "active"
Parent linking flow:

Student generates parent code
Parent enters code
Backend creates parent_child_link
Student or parent confirms
Status becomes active
MVP simplified:

Admin/mock data links parent and student directly
24. Mock Data Plan for Local MVP
Create:

4 users:
- student@example.com
- teacher@example.com
- parent@example.com
- admin@example.com

2 courses
2 sections per course
3–4 lessons per section
2 timed questions per lesson
1 final test per section
15 quiz questions
1 parent-child link
Mock video assets:

apps/mobile/src/assets/videos/sample-lesson-1.mp4
apps/mobile/src/assets/videos/sample-lesson-2.mp4
Mock resources:

apps/mobile/src/assets/pdfs/lesson-notes.pdf
Mock course example:

export const mockCourses = [
  {
    id: "course_it_001",
    teacherId: "teacher_001",
    title: {
      en: "Technical Support Fundamentals",
      ja: "テクニカルサポート基礎"
    },
    description: {
      en: "Learn the foundations of IT support.",
      ja: "ITサポートの基礎を学びます。"
    },
    level: "beginner",
    language: "multi",
    price: 29,
    currency: "USD",
    ratingAvg: 4.8,
    ratingCount: 120,
    isPublished: true
  }
];
25. Component Architecture
25.1 Smart vs Dumb Components
Use this rule:

Screen = data fetching + navigation
Feature component = business logic
Common component = UI only
Example:

learn/[courseId]/[lessonId].tsx
  uses:
    useLesson()
    useVideoProgress()
    useTimedQuestions()
    VideoPlayer
    TimedQuestionModal
    TranscriptPanel
25.2 Component Naming
AppButton
AppInput
CourseCard
SectionAccordion
LessonRow
VideoPlayer
TimedQuestionModal
QuizQuestionCard
ProgressCard
26. Redux Store Plan
Slices:

authSlice
settingsSlice
learningSlice
quizSlice
uiSlice
RTK Query APIs:

authApi
coursesApi
lessonsApi
progressApi
quizApi
dashboardApi
paymentsApi
Store:

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    learning: learningReducer,
    quiz: quizReducer,
    [baseApi.reducerPath]: baseApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware)
});
27. Error Handling Plan
Use consistent states:

loading
success
empty
error
unauthorized
forbidden
notFound
Example UI components:

LoadingState
EmptyState
ErrorState
PermissionDenied
NotFoundState
API error shape:

type ApiError = {
  statusCode: number;
  message: string;
  code: string;
  details?: unknown;
};
28. Validation Plan
Use shared validation schemas.

Example signup schema:

import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student", "teacher", "parent"]),
  preferredLanguage: z.enum(["en", "ja"])
});
Teacher course schema:

export const courseCreateSchema = z.object({
  title: z.object({
    en: z.string().min(3),
    ja: z.string().optional()
  }),
  description: z.object({
    en: z.string().min(20),
    ja: z.string().optional()
  }),
  categoryId: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  price: z.number().min(0),
  currency: z.enum(["USD", "JPY"])
});
29. Testing Plan
29.1 Unit Tests
Test these:

mergeRanges
getWatchedPercent
calculateQuizScore
role permission helpers
localized text fallback
course progress calculation
29.2 Integration Tests
Test these:

Auth signup/login
Course create/edit
Lesson progress save
Timed question answer
Quiz submit
Payment webhook
Parent child progress
29.3 Manual QA
Student:

- Signup
- Login
- Enroll course
- Watch lesson
- Timed question appears
- Submit answer
- Complete lesson
- Take test
- View dashboard
Teacher:

- Login
- Create course
- Add section
- Add lesson
- Add timed question
- Add quiz
- View student progress
Parent:

- Login
- View child progress
- View recent tests
Admin:

- Login
- View users
- View courses
- View payments
30. Environment Variables
Mobile
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_GOOGLE_CLIENT_ID=
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
API
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/edupath
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
31. Vercel Config for Expo Web
Create apps/mobile/vercel.json:

{
  "buildCommand": "npx expo export -p web",
  "outputDirectory": "dist",
  "devCommand": "npx expo start --web",
  "cleanUrls": true,
  "framework": null,
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/"
    }
  ]
}
32. App Config
apps/mobile/app.json:

{
  "expo": {
    "name": "EduPath LMS",
    "slug": "edupath-lms",
    "scheme": "edupath",
    "web": {
      "output": "single"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
For later production SEO, you can change web output to static and configure static rendering where needed.

33. Development Commands
Root:

pnpm install
pnpm dev
Mobile:

cd apps/mobile
pnpm start
pnpm web
pnpm android
pnpm ios
API:

cd apps/api
pnpm dev
Database:

cd apps/api
pnpm prisma migrate dev
pnpm prisma db seed
Web build:

cd apps/mobile
npx expo export -p web
34. Git Branch Strategy
main        → stable
develop     → active integration
feature/*   → new feature
fix/*       → bug fix
release/*   → release preparation
Example:

feature/auth
feature/student-learning-page
feature/video-progress
feature/teacher-course-builder
feature/quiz-engine
feature/stripe-payment
35. Commit Convention
feat: add student dashboard
fix: correct video progress calculation
refactor: move quiz utils to shared package
style: update course card spacing
docs: add api documentation
test: add quiz scoring tests
chore: update dependencies
36. MVP Acceptance Criteria
Project MVP tayyor hisoblanadi, agar:

- User login/signup qila olsa
- Role-based navigation ishlasa
- Student course list ko‘rsa
- Student course detail ko‘rsa
- Student lesson video ko‘rsa
- Video progress saqlansa
- Timed question belgilangan vaqtda chiqsa
- Student submit/skip qila olsa
- Section final test ishlasa
- Score hisoblanib attempt saqlansa
- Student dashboard progress ko‘rsatsa
- Teacher o‘z kurslarini ko‘rsa
- Teacher course/section/lesson yaratish flowiga ega bo‘lsa
- Teacher student progressini ko‘rsa
- Parent child progressini ko‘rsa
- English/Japanese UI switch ishlasa
- Expo local mobile demo ishlasa
- Expo web Vercelga deploy bo‘lsa
37. Recommended Implementation Order
Eng to‘g‘ri coding tartibi:

1. Monorepo setup
2. Expo Router setup
3. Theme/design system
4. Mock data
5. Auth screens mock
6. Role-based navigation
7. Student homepage
8. Course list
9. Course detail
10. Learning page layout
11. Video player
12. Video progress utilities
13. Timed question modal
14. Quiz screen
15. Quiz score logic
16. Student dashboard
17. Teacher dashboard
18. Teacher course builder
19. Parent dashboard
20. i18n English/Japanese
21. Backend auth
22. Backend courses
23. Backend progress
24. Backend quiz
25. Payment
26. Web deploy
38. Main Engineering Risks
Risk 1: Video progress inaccurate
Solution:

Use watched ranges, not only currentTime.
Risk 2: Teacher can edit another teacher’s course
Solution:

Always check ownership on backend.
Risk 3: Parent sees wrong student
Solution:

Use parent_child_links table and active status.
Risk 4: Payment unlocks course without real confirmation
Solution:

Use Stripe webhook as source of truth.
Risk 5: Translation missing
Solution:

Fallback to English.
Risk 6: Web and mobile UI conflicts
Solution:

Use responsive layout utilities and platform checks.
39. Future Features
After MVP:

- Certificate generation
- AI lesson summary
- AI quiz generation
- Discussion forum
- Live class attendance
- Push notifications
- Offline video download
- Course coupons
- Teacher revenue dashboard
- Admin moderation
- Organization accounts
- Advanced analytics
- Learning streak
- Calendar/deadlines
40. Final Architecture Summary
EduPath LMS
├── Student app
│   ├── Course discovery
│   ├── Video learning
│   ├── Timed questions
│   ├── Section tests
│   └── Progress dashboard
│
├── Teacher app
│   ├── Course builder
│   ├── Video upload
│   ├── Quiz builder
│   └── Student analytics
│
├── Parent app
│   ├── Child progress
│   ├── Test results
│   └── Activity monitoring
│
├── Admin app
│   ├── User management
│   ├── Course management
│   ├── Teacher approval
│   └── Payments/reports
│
└── Backend
    ├── Auth
    ├── RBAC
    ├── Courses
    ├── Lessons
    ├── Progress
    ├── Quizzes
    ├── Payments
    └── Dashboards
41. First Coding Milestone
Birinchi amaliy milestone:

Goal:
Expo local appda role-based mock LMS ishlashi.

Build:
- Welcome/Login mock
- Role selection
- Student home
- Course list
- Course detail
- Learning page
- Video player
- Timed question modal
- Final test
- Student dashboard
Bu milestone tugasa, loyiha demo qilishga tayyor bo‘ladi. Keyin backend, auth, payment va teacher upload qismlarini bosqichma-bosqich real qilasiz.


