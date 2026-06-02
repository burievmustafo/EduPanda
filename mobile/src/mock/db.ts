/**
 * Mock "database" — ichki ko'rinish (to'g'ri javoblar bilan).
 *
 * Bu fayl SERVER tomonini simulyatsiya qiladi: correctOptionId va explanation
 * shu yerda turadi va `@/api/learning` orqali faqat kerakli payti (javobdan keyin)
 * ochib beriladi. Mijozga (screen'larga) hech qachon to'g'ridan-to'g'ri berilmaydi.
 *
 * Video: Big Buck Bunny (~596s) — DATABASE_AND_API_PLAN.md §7.
 */

import type { LocalizedText, Option } from '@/types/dto';

export type InternalTimedQuestion = {
  id: string;
  triggerTimeSec: number;
  type: 'single_choice';
  question: LocalizedText;
  options: Option[];
  correctOptionId: string;
  explanation?: LocalizedText;
  required: boolean;
};

export type InternalLesson = {
  id: string;
  sectionId: string;
  courseId: string;
  title: LocalizedText;
  content: LocalizedText;
  videoUrl: string;
  durationSec: number;
  free: boolean;
  position: number;
  timedQuestions: InternalTimedQuestion[];
};

export type InternalQuizQuestion = {
  id: string;
  question: LocalizedText;
  options: Option[];
  correctOptionId: string;
  explanation?: LocalizedText;
  order: number;
};

export type InternalQuiz = {
  id: string;
  sectionId: string;
  title: LocalizedText;
  passScore: number;
  timeLimitMin?: number;
  questions: InternalQuizQuestion[];
};

export type InternalSection = {
  id: string;
  courseId: string;
  title: LocalizedText;
  position: number;
  lessonIds: string[];
  quizId?: string;
};

export type InternalCourse = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  previewImage?: string;
  level: string;
  category: string;
  instructor: { id: string; fullName: string; picture?: string };
  sectionIds: string[];
};

const BIG_BUCK_BUNNY =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

/* --------------------------------- Course ---------------------------------- */

export const courses: InternalCourse[] = [
  {
    id: 'course_1',
    title: { en: 'Web Development Basics', ja: 'ウェブ開発の基礎' },
    description: {
      en: 'Learn the fundamentals of building websites: HTML structure and CSS styling.',
      ja: 'ウェブサイト構築の基礎を学びます：HTMLの構造とCSSのスタイリング。',
    },
    previewImage: undefined,
    level: 'Beginner',
    category: 'Programming',
    instructor: { id: 'teacher_1', fullName: 'Sato Sensei' },
    sectionIds: ['section_1'],
  },
];

/* -------------------------------- Sections --------------------------------- */

export const sections: InternalSection[] = [
  {
    id: 'section_1',
    courseId: 'course_1',
    title: { en: 'Getting Started with HTML & CSS', ja: 'HTMLとCSSのはじめ方' },
    position: 1,
    lessonIds: ['lesson_1', 'lesson_2'],
    quizId: 'quiz_1',
  },
];

/* --------------------------------- Lessons --------------------------------- */

export const lessons: InternalLesson[] = [
  {
    id: 'lesson_1',
    sectionId: 'section_1',
    courseId: 'course_1',
    title: { en: 'Introduction to HTML', ja: 'HTML入門' },
    content: {
      en: 'HTML is the language used to structure content on the web.',
      ja: 'HTMLはウェブ上のコンテンツを構造化するための言語です。',
    },
    videoUrl: BIG_BUCK_BUNNY,
    durationSec: 596,
    free: true,
    position: 1,
    timedQuestions: [
      {
        id: 'tq_1',
        triggerTimeSec: 30,
        type: 'single_choice',
        question: { en: 'What does HTML stand for?', ja: 'HTMLとは何の略ですか？' },
        options: [
          { id: 'a', text: { en: 'HyperText Markup Language', ja: 'ハイパーテキスト・マークアップ・ランゲージ' } },
          { id: 'b', text: { en: 'High Tech Modern Language', ja: 'ハイテク・モダン・ランゲージ' } },
          { id: 'c', text: { en: 'Home Tool Markup Language', ja: 'ホーム・ツール・マークアップ・ランゲージ' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'HTML = HyperText Markup Language, the standard for web pages.',
          ja: 'HTML＝ハイパーテキスト・マークアップ・ランゲージ。ウェブページの標準です。',
        },
        required: false,
      },
      {
        id: 'tq_2',
        triggerTimeSec: 75,
        type: 'single_choice',
        question: { en: 'Which tag creates a paragraph?', ja: '段落を作るタグはどれですか？' },
        options: [
          { id: 'a', text: { en: '<div>', ja: '<div>' } },
          { id: 'b', text: { en: '<p>', ja: '<p>' } },
          { id: 'c', text: { en: '<span>', ja: '<span>' } },
        ],
        correctOptionId: 'b',
        explanation: {
          en: 'The <p> tag defines a paragraph.',
          ja: '<p>タグは段落を定義します。',
        },
        required: false,
      },
      {
        id: 'tq_3',
        triggerTimeSec: 120,
        type: 'single_choice',
        question: { en: 'Which tag creates a hyperlink?', ja: 'ハイパーリンクを作るタグはどれですか？' },
        options: [
          { id: 'a', text: { en: '<link>', ja: '<link>' } },
          { id: 'b', text: { en: '<href>', ja: '<href>' } },
          { id: 'c', text: { en: '<a>', ja: '<a>' } },
        ],
        correctOptionId: 'c',
        explanation: {
          en: 'The <a> (anchor) tag creates hyperlinks.',
          ja: '<a>（アンカー）タグはハイパーリンクを作成します。',
        },
        required: false,
      },
    ],
  },
  {
    id: 'lesson_2',
    sectionId: 'section_1',
    courseId: 'course_1',
    title: { en: 'Styling with CSS', ja: 'CSSでスタイリング' },
    content: {
      en: 'CSS is used to style and lay out web pages.',
      ja: 'CSSはウェブページのスタイルとレイアウトに使われます。',
    },
    videoUrl: BIG_BUCK_BUNNY,
    durationSec: 596,
    free: false,
    position: 2,
    timedQuestions: [
      {
        id: 'tq_4',
        triggerTimeSec: 45,
        type: 'single_choice',
        question: { en: 'What does CSS stand for?', ja: 'CSSとは何の略ですか？' },
        options: [
          { id: 'a', text: { en: 'Cascading Style Sheets', ja: 'カスケーディング・スタイル・シート' } },
          { id: 'b', text: { en: 'Computer Style System', ja: 'コンピュータ・スタイル・システム' } },
          { id: 'c', text: { en: 'Creative Style Sheets', ja: 'クリエイティブ・スタイル・シート' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'CSS = Cascading Style Sheets.',
          ja: 'CSS＝カスケーディング・スタイル・シート。',
        },
        required: false,
      },
    ],
  },
];

/* ---------------------------------- Quiz ----------------------------------- */

export const quizzes: InternalQuiz[] = [
  {
    id: 'quiz_1',
    sectionId: 'section_1',
    title: { en: 'HTML & CSS Final Quiz', ja: 'HTML・CSS 最終テスト' },
    passScore: 70,
    questions: [
      {
        id: 'qq_1',
        order: 1,
        question: { en: 'HTML is used to ___ web content.', ja: 'HTMLはウェブコンテンツを___するために使います。' },
        options: [
          { id: 'a', text: { en: 'structure', ja: '構造化' } },
          { id: 'b', text: { en: 'animate', ja: 'アニメーション化' } },
          { id: 'c', text: { en: 'compile', ja: 'コンパイル' } },
          { id: 'd', text: { en: 'encrypt', ja: '暗号化' } },
        ],
        correctOptionId: 'a',
        explanation: { en: 'HTML structures content.', ja: 'HTMLはコンテンツを構造化します。' },
      },
      {
        id: 'qq_2',
        order: 2,
        question: { en: 'Which tag is the largest heading?', ja: '最も大きい見出しのタグはどれですか？' },
        options: [
          { id: 'a', text: { en: '<h6>', ja: '<h6>' } },
          { id: 'b', text: { en: '<h1>', ja: '<h1>' } },
          { id: 'c', text: { en: '<head>', ja: '<head>' } },
          { id: 'd', text: { en: '<title>', ja: '<title>' } },
        ],
        correctOptionId: 'b',
        explanation: { en: '<h1> is the largest heading.', ja: '<h1>が最も大きい見出しです。' },
      },
      {
        id: 'qq_3',
        order: 3,
        question: { en: 'CSS property to change text color?', ja: '文字色を変えるCSSプロパティは？' },
        options: [
          { id: 'a', text: { en: 'font-color', ja: 'font-color' } },
          { id: 'b', text: { en: 'text-style', ja: 'text-style' } },
          { id: 'c', text: { en: 'color', ja: 'color' } },
          { id: 'd', text: { en: 'background', ja: 'background' } },
        ],
        correctOptionId: 'c',
        explanation: { en: 'The `color` property sets text color.', ja: '`color`プロパティが文字色を設定します。' },
      },
      {
        id: 'qq_4',
        order: 4,
        question: { en: 'How do you add a comment in HTML?', ja: 'HTMLでコメントを書く方法は？' },
        options: [
          { id: 'a', text: { en: '// comment', ja: '// コメント' } },
          { id: 'b', text: { en: '/* comment */', ja: '/* コメント */' } },
          { id: 'c', text: { en: '<!-- comment -->', ja: '<!-- コメント -->' } },
          { id: 'd', text: { en: '# comment', ja: '# コメント' } },
        ],
        correctOptionId: 'c',
        explanation: { en: 'HTML comments use <!-- -->.', ja: 'HTMLのコメントは<!-- -->を使います。' },
      },
      {
        id: 'qq_5',
        order: 5,
        question: { en: 'Which CSS sets space inside an element?', ja: '要素の内側の余白を設定するCSSは？' },
        options: [
          { id: 'a', text: { en: 'margin', ja: 'margin' } },
          { id: 'b', text: { en: 'padding', ja: 'padding' } },
          { id: 'c', text: { en: 'border', ja: 'border' } },
          { id: 'd', text: { en: 'gap', ja: 'gap' } },
        ],
        correctOptionId: 'b',
        explanation: { en: '`padding` is the inner space.', ja: '`padding`は内側の余白です。' },
      },
    ],
  },
];

/* ------------------------------- Enrollment -------------------------------- */
// MVP: mock enrollment (DATABASE_AND_API_PLAN.md §3.1). Student "enroll" bosganda set'ga qo'shiladi.
export const enrolledCourseIds = new Set<string>(['course_1']);

/* ------------------------------- Lookup util ------------------------------- */

export const findCourse = (id: string) => courses.find((c) => c.id === id);
export const findSection = (id: string) => sections.find((s) => s.id === id);
export const findLesson = (id: string) => lessons.find((l) => l.id === id);
export const findQuiz = (id: string) => quizzes.find((q) => q.id === id);
export const sectionsOfCourse = (courseId: string) =>
  sections.filter((s) => s.courseId === courseId).sort((a, b) => a.position - b.position);
export const lessonsOfSection = (sectionId: string) =>
  lessons.filter((l) => l.sectionId === sectionId).sort((a, b) => a.position - b.position);
