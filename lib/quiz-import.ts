// Section quiz savollarini tashqi AI (ChatGPT) bergan jadvaldan import qilish uchun
// parser + validator. Hech qanday 'use server'/'use client' yo'q — ham client (live
// preview), ham server (action) ishlatadi. Format: CSV / TSV / Markdown-jadval.
// Ustunlar: question, option_a, option_b, option_c, option_d, correct, explanation

export interface ParsedQuestion {
	question: string
	options: string[] // doim 4 ta
	correctIndex: number // 0..3
	explanation?: string
}

export interface ImportIssue {
	row: number // odam o'qiydigan ma'lumot qatori (1-based), 0 = umumiy
	code:
		| 'noRows'
		| 'badHeader'
		| 'emptyQuestion'
		| 'missingOption'
		| 'badCorrect'
	value?: string
}

export interface ParseResult {
	questions: ParsedQuestion[] // faqat to'g'ri (yaroqli) savollar
	issues: ImportIssue[] // import'ni bloklaydi
}

/* -------------------------------------------------------------------------- */
/*                              Past darajadagi parse                          */
/* -------------------------------------------------------------------------- */

// Qo'shtirnoqni hisobga oladigan delimiter-parser (CSV/TSV uchun).
// Qo'shtirnoq ichida delimiter va yangi qator matn deb qabul qilinadi, "" = ".
function parseDelimited(text: string, delim: string): string[][] {
	const rows: string[][] = []
	let field = ''
	let row: string[] = []
	let inQuotes = false

	for (let i = 0; i < text.length; i++) {
		const c = text[i]
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					field += '"'
					i++
				} else {
					inQuotes = false
				}
			} else {
				field += c
			}
		} else if (c === '"') {
			inQuotes = true
		} else if (c === delim) {
			row.push(field)
			field = ''
		} else if (c === '\n') {
			row.push(field)
			rows.push(row)
			row = []
			field = ''
		} else if (c !== '\r') {
			field += c
		}
	}
	row.push(field)
	rows.push(row)

	// Butunlay bo'sh qatorlarni tashlaymiz
	return rows.filter(r => !(r.length === 1 && r[0].trim() === ''))
}

// Markdown jadval: | a | b | qatorlari, |---|---| ajratuvchi qatori tashlanadi.
function parseMarkdown(text: string): string[][] {
	const rows: string[][] = []
	for (const raw of text.split('\n')) {
		const line = raw.trim()
		if (!line.includes('|')) continue
		const cells = line
			.replace(/^\|/, '')
			.replace(/\|$/, '')
			.split('|')
			.map(c => c.trim())
		// Ajratuvchi qator (---, :--:) — tashlaymiz
		if (cells.every(c => /^:?-{2,}:?$/.test(c) || /^-+$/.test(c))) continue
		rows.push(cells)
	}
	return rows
}

// Formatni aniqlab, qatorlar massiviga aylantiradi.
function toRows(text: string): string[][] {
	const trimmed = text.trim()
	if (!trimmed) return []
	const firstLine = trimmed.split('\n')[0]

	if (firstLine.includes('|')) return parseMarkdown(trimmed)
	if (firstLine.includes('\t')) return parseDelimited(trimmed, '\t')
	return parseDelimited(trimmed, ',')
}

/* -------------------------------------------------------------------------- */
/*                            Ustun va qiymat xaritasi                         */
/* -------------------------------------------------------------------------- */

type Field = 'question' | 'a' | 'b' | 'c' | 'd' | 'correct' | 'explanation'

const HEADER_ALIASES: Record<Field, string[]> = {
	question: ['question', 'savol', 'q', 'questiontext'],
	a: ['optiona', 'a', 'option1', '1'],
	b: ['optionb', 'b', 'option2', '2'],
	c: ['optionc', 'c', 'option3', '3'],
	d: ['optiond', 'd', 'option4', '4'],
	correct: ['correct', 'answer', 'correctanswer', 'togri', 'javob'],
	explanation: ['explanation', 'explain', 'izoh', 'reason', 'why'],
}

// "Option A" -> "optiona", "option_a" -> "optiona"
const normKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

// Sarlavha qatoridan har bir field uchun ustun indeksini topadi.
function mapHeader(header: string[]): Partial<Record<Field, number>> {
	const map: Partial<Record<Field, number>> = {}
	header.forEach((cell, idx) => {
		const key = normKey(cell)
		for (const field of Object.keys(HEADER_ALIASES) as Field[]) {
			if (map[field] === undefined && HEADER_ALIASES[field].includes(key)) {
				map[field] = idx
			}
		}
	})
	return map
}

// "A)" / "option b" / "C" / "3" -> 0..3, aks holda null
function toCorrectIndex(raw: string): number | null {
	const s = raw
		.toLowerCase()
		.replace(/option/g, '')
		.replace(/[^a-z0-9]/g, '')
	if (!s) return null
	const ch = s[0]
	if (ch >= 'a' && ch <= 'd') return ch.charCodeAt(0) - 97
	if (ch >= '1' && ch <= '4') return Number(ch) - 1
	return null
}

/* -------------------------------------------------------------------------- */
/*                                  Asosiy API                                 */
/* -------------------------------------------------------------------------- */

const POSITIONAL: Record<Field, number> = {
	question: 0,
	a: 1,
	b: 2,
	c: 3,
	d: 4,
	correct: 5,
	explanation: 6,
}

export function parseQuizText(text: string): ParseResult {
	const rows = toRows(text)
	const issues: ImportIssue[] = []
	const questions: ParsedQuestion[] = []

	if (rows.length === 0) {
		return { questions, issues: [{ row: 0, code: 'noRows' }] }
	}

	// Sarlavha bormi? (birinchi qatorda "question"/"savol" bo'lsa)
	const firstNorm = rows[0].map(normKey)
	const hasHeader = firstNorm.some(k =>
		HEADER_ALIASES.question.includes(k)
	)

	let cols: Partial<Record<Field, number>>
	let dataRows: string[][]

	if (hasHeader) {
		cols = mapHeader(rows[0])
		dataRows = rows.slice(1)
		if (cols.question === undefined) {
			return { questions, issues: [{ row: 0, code: 'badHeader' }] }
		}
	} else {
		cols = POSITIONAL
		dataRows = rows
	}

	const at = (row: string[], field: Field): string => {
		const idx = cols[field]
		if (idx === undefined) return ''
		return (row[idx] ?? '').trim()
	}

	if (dataRows.length === 0) {
		return { questions, issues: [{ row: 0, code: 'noRows' }] }
	}

	dataRows.forEach((row, i) => {
		const human = i + 1
		const question = at(row, 'question')
		const options = [
			at(row, 'a'),
			at(row, 'b'),
			at(row, 'c'),
			at(row, 'd'),
		]
		const correctRaw = at(row, 'correct')
		const explanation = at(row, 'explanation')

		// Bo'sh savol (ehtimol ortiqcha qator) — agar hammasi bo'sh bo'lsa, jim tashlaymiz
		const allEmpty =
			!question && options.every(o => !o) && !correctRaw && !explanation
		if (allEmpty) return

		let ok = true

		if (!question) {
			issues.push({ row: human, code: 'emptyQuestion' })
			ok = false
		}

		const filled = options.filter(Boolean).length
		if (filled < 4) {
			issues.push({ row: human, code: 'missingOption', value: `${filled}` })
			ok = false
		}

		const correctIndex = toCorrectIndex(correctRaw)
		if (correctIndex === null || !options[correctIndex]) {
			issues.push({
				row: human,
				code: 'badCorrect',
				value: correctRaw || '—',
			})
			ok = false
		}

		if (ok) {
			questions.push({
				question,
				options,
				correctIndex: correctIndex as number,
				explanation: explanation || undefined,
			})
		}
	})

	if (questions.length === 0 && issues.length === 0) {
		issues.push({ row: 0, code: 'noRows' })
	}

	return { questions, issues }
}

// Server tomonда qayta tekshirish uchun — faqat shaklan to'g'ri savollarni qaytaradi.
export function sanitizeQuestions(input: ParsedQuestion[]): ParsedQuestion[] {
	return input.filter(
		q =>
			typeof q.question === 'string' &&
			q.question.trim().length > 0 &&
			Array.isArray(q.options) &&
			q.options.length === 4 &&
			q.options.every(o => typeof o === 'string' && o.trim().length > 0) &&
			Number.isInteger(q.correctIndex) &&
			q.correctIndex >= 0 &&
			q.correctIndex <= 3
	)
}
