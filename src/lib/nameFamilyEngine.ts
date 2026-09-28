// ── اسم‌فامیل — Authoritative Game Engine ───────────────────────────────────
// Single source of truth for validation, normalization, scoring, and CPU logic.
// Used by BOTH CPU mode and Online mode — never duplicated.

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type NfMode = 'SINGLE_PLAYER_CPU' | 'ONLINE_MULTIPLAYER'
export type NfDifficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type NfPhase = 'lobby' | 'round_playing' | 'round_locked' | 'score_breakdown' | 'game_over'
export type NfSubmitState = 'NOT_STARTED' | 'ANSWERING' | 'SUBMITTED' | 'TIME_EXPIRED'

export interface NfCategory {
  id: string
  label: string
  emoji: string
}

export interface NfValidationResult {
  valid: boolean
  normalizedValue: string
  rawValue: string
  reason: 'ok' | 'empty' | 'invalid_chars' | 'latin' | 'numbers' | 'wrong_letter' | 'too_short'
}

export interface NfAnswerResult {
  categoryId: string
  categoryLabel: string
  rawAnswer: string
  normalizedAnswer: string
  validation: NfValidationResult
  isUnique: boolean
  duplicateWith: string[]  // playerIds who gave same answer
  score: number
  scoreReason: string
  scoreDetails: string[]
}

export interface NfPlayerRoundResult {
  playerId: string
  playerName: string
  answers: Record<string, NfAnswerResult>  // categoryId -> result
  roundTotal: number
  cumulativeTotal: number
}

export interface NfRoundResult {
  round: number
  letter: string
  players: NfPlayerRoundResult[]
  winner: string | null  // playerId, null = tie
  isTie: boolean
}

export interface NfPublicState {
  phase: NfPhase
  round: number
  totalRounds: number
  letter: string
  roundDeadline: number  // epoch ms (authoritative)
  categories: NfCategory[]
  submitStates: Record<string, NfSubmitState>  // playerId -> state
  cumulativeScores: Record<string, number>     // playerId -> total score across rounds
  roundResults: NfRoundResult[]
  gameWinner: string | null
  isGameTie: boolean
  seq: number
}

// ─── SCORE RULES ─────────────────────────────────────────────────────────────

export const SCORE_RULES = {
  uniqueAnswer: 150,
  duplicateAnswer: 50,
  invalidAnswer: 0,
  emptyAnswer: 0,
  wrongLetter: 0,
  timeout: 0,
} as const

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export const NF_CATEGORIES: NfCategory[] = [
  { id: 'name', label: 'اسم', emoji: '👤' },
  { id: 'family', label: 'فامیلی', emoji: '👨‍👩‍👧' },
  { id: 'city', label: 'شهر', emoji: '🏙️' },
  { id: 'country', label: 'کشور', emoji: '🌍' },
  { id: 'food', label: 'غذا', emoji: '🍽️' },
  { id: 'animal', label: 'حیوان', emoji: '🐾' },
  { id: 'job', label: 'شغل', emoji: '💼' },
  { id: 'fruit', label: 'میوه', emoji: '🍎' },
]

// ─── PERSIAN LETTERS (playable) ───────────────────────────────────────────────

export const PERSIAN_GAME_LETTERS = [
  'آ', 'ب', 'پ', 'ت', 'ج', 'چ', 'خ', 'د', 'ر', 'ز',
  'س', 'ش', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'
]

// ─── INPUT VALIDATION ─────────────────────────────────────────────────────────

const PERSIAN_LETTER_RANGE = /[؀-ۿ‌ﭐ-﷿ﹰ-﻿]/
const INVALID_CHAR_RE = /[A-Za-z0-9۰-۹@#$%^&*()\-_=+\[\]{}|;':",./<>?\\`~!]/

export function normalizePersian(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')      // collapse spaces
    .replace(/ي/g, 'ی')        // Arabic ya → Persian ya
    .replace(/ك/g, 'ک')        // Arabic kaf → Persian kaf
    .replace(/ة/g, 'ه')        // Arabic ta marbuta → ha
    .replace(/​/g, '')    // zero-width space
    .replace(/‍/g, '')    // zero-width joiner (keep ZWJ but strip ZWS)
}

export function validateAnswer(raw: string, requiredLetter: string): NfValidationResult {
  const normalized = normalizePersian(raw)

  if (!normalized || normalized === '‌') {
    return { valid: false, normalizedValue: normalized, rawValue: raw, reason: 'empty' }
  }

  // Reject Latin characters
  if (/[A-Za-z]/.test(raw)) {
    return { valid: false, normalizedValue: normalized, rawValue: raw, reason: 'latin' }
  }

  // Reject digits (both ASCII and Persian/Arabic-Indic)
  if (/[0-9۰-۹٠-٩]/.test(raw)) {
    return { valid: false, normalizedValue: normalized, rawValue: raw, reason: 'numbers' }
  }

  // Reject special characters
  if (INVALID_CHAR_RE.test(raw)) {
    return { valid: false, normalizedValue: normalized, rawValue: raw, reason: 'invalid_chars' }
  }

  // Must contain at least one Persian letter
  if (!PERSIAN_LETTER_RANGE.test(normalized)) {
    return { valid: false, normalizedValue: normalized, rawValue: raw, reason: 'invalid_chars' }
  }

  // Must start with required letter (after normalization)
  const firstChar = normalized[0]
  const normalizedRequired = normalizePersian(requiredLetter)
  if (firstChar !== normalizedRequired) {
    return { valid: false, normalizedValue: normalized, rawValue: raw, reason: 'wrong_letter' }
  }

  if (normalized.length < 2) {
    return { valid: false, normalizedValue: normalized, rawValue: raw, reason: 'too_short' }
  }

  return { valid: true, normalizedValue: normalized, rawValue: raw, reason: 'ok' }
}

export function getValidationMessage(result: NfValidationResult): string {
  switch (result.reason) {
    case 'empty': return 'پاسخ خالی است'
    case 'latin': return 'لطفاً پاسخ را با حروف فارسی وارد کنید'
    case 'numbers': return 'فقط حروف فارسی وارد کنید. اعداد مجاز نیستند'
    case 'invalid_chars': return 'فقط حروف فارسی مجاز هستند'
    case 'wrong_letter': return `پاسخ باید با حرف مورد نظر شروع شود`
    case 'too_short': return 'پاسخ بسیار کوتاه است'
    case 'ok': return 'پاسخ معتبر'
  }
}

// ─── SCORE ENGINE (authoritative) ────────────────────────────────────────────

export function scoreRound(
  letter: string,
  categories: NfCategory[],
  playerAnswers: Record<string, Record<string, string>>,  // playerId -> categoryId -> raw answer
  playerNames: Record<string, string>,
): NfRoundResult {
  const playerIds = Object.keys(playerAnswers)

  // Step 1: Validate all answers
  const validated: Record<string, Record<string, NfValidationResult>> = {}
  for (const pid of playerIds) {
    validated[pid] = {}
    for (const cat of categories) {
      const raw = playerAnswers[pid]?.[cat.id] ?? ''
      validated[pid][cat.id] = validateAnswer(raw, letter)
    }
  }

  // Step 2: Normalize valid answers per category and detect duplicates
  const catDuplicates: Record<string, Record<string, string[]>> = {}  // catId -> normalizedAns -> [playerIds]
  for (const cat of categories) {
    catDuplicates[cat.id] = {}
    for (const pid of playerIds) {
      const v = validated[pid][cat.id]
      if (!v.valid) continue
      const norm = v.normalizedValue
      if (!catDuplicates[cat.id][norm]) catDuplicates[cat.id][norm] = []
      catDuplicates[cat.id][norm].push(pid)
    }
  }

  // Step 3: Calculate scores per player per category
  const playerResults: NfPlayerRoundResult[] = playerIds.map(pid => {
    const answers: Record<string, NfAnswerResult> = {}
    let roundTotal = 0

    for (const cat of categories) {
      const v = validated[pid][cat.id]
      const raw = playerAnswers[pid]?.[cat.id] ?? ''

      if (!v.valid) {
        const details: string[] = []
        if (!raw.trim()) {
          details.push('× پاسخ خالی')
        } else {
          details.push(`× ${getValidationMessage(v)}`)
          if (raw.trim()) details.push(`پاسخ وارد شده: "${raw.trim()}"`)
        }
        answers[cat.id] = {
          categoryId: cat.id,
          categoryLabel: cat.label,
          rawAnswer: raw,
          normalizedAnswer: v.normalizedValue,
          validation: v,
          isUnique: false,
          duplicateWith: [],
          score: 0,
          scoreReason: raw.trim() ? 'پاسخ نامعتبر' : 'پاسخ خالی',
          scoreDetails: details,
        }
        continue
      }

      // Valid answer
      const norm = v.normalizedValue
      const dupGroup = catDuplicates[cat.id][norm] ?? []
      const others = dupGroup.filter(p => p !== pid)
      const isUnique = others.length === 0
      const score = isUnique ? SCORE_RULES.uniqueAnswer : SCORE_RULES.duplicateAnswer
      roundTotal += score

      const details: string[] = [
        `✓ پاسخ معتبر: "${norm}"`,
        `✓ با حرف «${letter}» شروع می‌شود`,
        isUnique ? '✓ پاسخ یکتا' : `✕ با ${others.length} بازیکن دیگر یکسان است`,
      ]

      answers[cat.id] = {
        categoryId: cat.id,
        categoryLabel: cat.label,
        rawAnswer: raw,
        normalizedAnswer: norm,
        validation: v,
        isUnique,
        duplicateWith: others,
        score,
        scoreReason: isUnique ? `یکتا — ${SCORE_RULES.uniqueAnswer} امتیاز` : `تکراری — ${SCORE_RULES.duplicateAnswer} امتیاز`,
        scoreDetails: details,
      }
    }

    return {
      playerId: pid,
      playerName: playerNames[pid] ?? pid,
      answers,
      roundTotal,
      cumulativeTotal: 0,  // filled in below
    }
  })

  return {
    round: 0,  // set by caller
    letter,
    players: playerResults,
    winner: null,  // set by caller after cumulative
    isTie: false,
  }
}

// ─── CPU ANSWER DATABASE ──────────────────────────────────────────────────────

type CpuAnswerMap = Record<string, Record<string, string[]>>  // letter -> categoryId -> [answers]

export const CPU_ANSWERS: CpuAnswerMap = {
  'آ': {
    name: ['آرش', 'آرمان', 'آرزو', 'آیدا', 'آناهیتا', 'آتنا'],
    family: ['آذری', 'آریایی', 'آزادی', 'آقایی'],
    city: ['آمل', 'آبادان', 'آستارا', 'آران'],
    country: ['آلمان', 'آمریکا', 'آرژانتین', 'آفریقای جنوبی', 'آذربایجان'],
    food: ['آبگوشت', 'آلو اسفناج', 'آش رشته', 'آش شله‌قلمکار', 'آبدوغ خیار'],
    animal: ['آهو', 'آب‌پستان', 'آنتیلوپ', 'آرادیل'],
    job: ['آموزگار', 'آشپز', 'آرایشگر', 'آهنگر', 'آهنگساز'],
    fruit: ['آلبالو', 'آلو', 'آناناس', 'آووکادو'],
  },
  'ب': {
    name: ['بهزاد', 'بهناز', 'بیتا', 'بابک', 'باران', 'بنیامین', 'برنا'],
    family: ['بهبودی', 'بهرامی', 'بهزادی', 'باقری', 'برزگر', 'بهادری'],
    city: ['بابل', 'بوشهر', 'بیرجند', 'بندرعباس', 'برازجان', 'بافق', 'بیله‌سوار'],
    country: ['برزیل', 'بلژیک', 'بلغارستان', 'بحرین', 'بنگلادش', 'بولیوی', 'بلاروس'],
    food: ['باقالی‌پلو', 'بریانی', 'بورانی', 'بادمجان کبابی', 'برنج کته', 'بستنی'],
    animal: ['ببر', 'بز', 'بوف', 'بره', 'بوقلمون', 'بلدرچین', 'بابون'],
    job: ['برق‌کار', 'بنا', 'باغبان', 'بازیگر', 'بهداشتکار', 'برنامه‌نویس'],
    fruit: ['بلوبری', 'به', 'بادام', 'بلوط'],
  },
  'پ': {
    name: ['پریسا', 'پدرام', 'پگاه', 'پرویز', 'پویا', 'پریناز'],
    family: ['پورصادق', 'پناهی', 'پهلوانی', 'پاک‌نژاد', 'پرهیزکار'],
    city: ['پیشوا', 'پاکدشت', 'پردیس', 'پارس‌آباد', 'پلدختر'],
    country: ['پاکستان', 'پرتغال', 'پرو', 'پاناما', 'پاراگوئه', 'پولند'],
    food: ['پلو', 'پیتزا', 'پنیر', 'پلو مرغ', 'پاستا', 'پلو لوبیا'],
    animal: ['پلنگ', 'پرنده', 'پاندا', 'پشم‌الو', 'پرستو', 'پوما'],
    job: ['پزشک', 'پرستار', 'پلیس', 'پاسبان', 'پیک', 'پرفسور'],
    fruit: ['پرتقال', 'پاپایا', 'پسته', 'پلم'],
  },
  'ت': {
    name: ['تارا', 'تهمینه', 'توکا', 'تیام', 'تانیا'],
    family: ['توکلی', 'تبریزی', 'توسلی', 'ترابی', 'تاج‌بخش'],
    city: ['تهران', 'تبریز', 'تربت حیدریه', 'تویسرکان', 'تنکابن'],
    country: ['ترکیه', 'تایلند', 'تونس', 'تانزانیا', 'تایوان'],
    food: ['تاس کباب', 'تخم‌مرغ', 'توفو', 'تبریزی‌پلو', 'تنوری کباب'],
    animal: ['تمساح', 'توکا', 'ترپ‌مارماهی', 'تاپیر'],
    job: ['تکنسین', 'تاجر', 'ترجمه‌کار', 'تنظیم‌کار'],
    fruit: ['توت', 'توت‌فرنگی', 'تمر', 'توت‌وحشی'],
  },
  'ج': {
    name: ['جواد', 'جاوید', 'جمشید', 'جلیل', 'جهان‌بانو'],
    family: ['جعفری', 'جوادی', 'جلیلی', 'جهانگیری'],
    city: ['جیرفت', 'جاجرم', 'جوانرود', 'جهرم', 'جلفا'],
    country: ['ژاپن', 'جمهوری چک', 'جیبوتی', 'جامائیکا'],
    food: ['جوجه کباب', 'جغور بغور', 'جو', 'جگر'],
    animal: ['جغد', 'جوجه', 'جیرجیرک', 'جبیر'],
    job: ['جراح', 'جنگلبان', 'جواهرساز'],
    fruit: ['جو', 'جامبوی'],
  },
  'چ': {
    name: ['چاوش', 'چکامه', 'چیستا'],
    family: ['چاوشی', 'چهره‌آزاد', 'چراغی'],
    city: ['چابهار', 'چالوس', 'چناران', 'چرام'],
    country: ['چین', 'چاد', 'چیله'],
    food: ['چلوکباب', 'چرب کباب', 'چای', 'چلو'],
    animal: ['چیتا', 'چرمه', 'چاووش‌ماهی', 'چرخه'],
    job: ['چوپان', 'چرمساز', 'چاپچی'],
    fruit: ['چغندر'],
  },
  'خ': {
    name: ['خسرو', 'خاطره', 'خدیجه', 'خداداد'],
    family: ['خلیلی', 'خداداد', 'خاکپور', 'خرمی'],
    city: ['خرم‌آباد', 'خوی', 'خاش', 'خمام', 'خمین'],
    country: ['خاور میانه'],
    food: ['خوراک مرغ', 'خورش قیمه', 'خورش قورمه', 'خورش فسنجان', 'خاگینه'],
    animal: ['خرس', 'خرگوش', 'خروس', 'خفاش', 'خوک'],
    job: ['خلبان', 'خیاط', 'خبرنگار', 'خدمتکار'],
    fruit: ['خرما', 'خیار', 'خربوزه'],
  },
  'د': {
    name: ['داریوش', 'دانا', 'دلارام', 'دلنوش'],
    family: ['داوودی', 'درخشان', 'دارایی', 'دهقانی'],
    city: ['دزفول', 'دماوند', 'دره‌شهر', 'درگز', 'دیواندره'],
    country: ['دانمارک', 'دومینیکن', 'دومینیکا'],
    food: ['دلمه', 'دیزی', 'دوغ', 'دمی گوجه'],
    animal: ['داس‌ماهی', 'دلفین', 'دینگو'],
    job: ['دکتر', 'دامپزشک', 'دیپلمات', 'دندانپزشک'],
    fruit: ['دانه انار'],
  },
  'ر': {
    name: ['رضا', 'ریحانه', 'رویا', 'رامین', 'رها'],
    family: ['رضایی', 'رحیمی', 'رستمی', 'رحمانی', 'روحانی'],
    city: ['رشت', 'رامسر', 'رفسنجان', 'رودبار', 'رودهن'],
    country: ['روسیه', 'رومانی', 'رواندا', 'رپوبلیک'],
    food: ['رشته‌پلو', 'روغنی', 'رب‌گوجه', 'رولت مرغ'],
    animal: ['روباه', 'روس‌ماهی', 'رنگارنگ'],
    job: ['راننده', 'رادیولوژیست', 'ربات‌ساز'],
    fruit: ['رازیانه'],
  },
  'ز': {
    name: ['زهرا', 'زینب', 'زانا', 'زربانو'],
    family: ['زارعی', 'زاهدی', 'زمانی', 'زندی'],
    city: ['زاهدان', 'زنجان', 'زابل', 'زرند'],
    country: ['زیمبابوه', 'زامبیا'],
    food: ['زرشک‌پلو', 'زیتون', 'زولبیا', 'زردآلو کبابی'],
    animal: ['زرافه', 'زنبور', 'زبرا'],
    job: ['زراعتکار', 'زرگر', 'زیست‌شناس'],
    fruit: ['زردآلو', 'زیتون', 'زغال‌اخته'],
  },
  'س': {
    name: ['سارا', 'سامان', 'سانا', 'سپهر', 'سیمین'],
    family: ['سعیدی', 'سلطانی', 'سیفی', 'سلیمانی', 'سرداری'],
    city: ['سنندج', 'سمنان', 'ساری', 'سبزوار', 'سروستان'],
    country: ['سوئد', 'سوئیس', 'سنگاپور', 'سودان', 'سومالی'],
    food: ['سبزی‌پلو', 'سوپ', 'سوشی', 'سرخ‌پلو', 'ساندویچ'],
    animal: ['سگ', 'سنجاب', 'سمور', 'سلمانی‌ماهی'],
    job: ['سرآشپز', 'سرهنگ', 'سفیر', 'ستاره‌شناس'],
    fruit: ['سیب', 'سیب‌زمینی', 'سنجد', 'سیب ترش'],
  },
  'ش': {
    name: ['شیما', 'شهاب', 'شادی', 'شایان', 'شهرزاد'],
    family: ['شیرزادی', 'شاه‌حسینی', 'شکوهی', 'شیخی', 'شادمانی'],
    city: ['شیراز', 'شاهرود', 'شهرکرد', 'شهریار', 'شبستر'],
    country: ['شیلی', 'شرق‌آفریقا'],
    food: ['شوربا', 'شاه‌ماهی', 'شنیتسل', 'شیر برنج', 'شله‌زرد'],
    animal: ['شیر', 'شتر', 'شغال', 'شاهین', 'شیردریایی'],
    job: ['شاعر', 'شیمیدان', 'شهردار', 'شغل‌آموز'],
    fruit: ['شاه‌توت', 'شلیل', 'شاه‌دانه'],
  },
  'ف': {
    name: ['فاطمه', 'فرهاد', 'فریده', 'فائزه', 'فریبا'],
    family: ['فاطمی', 'فرهادی', 'فروزنده', 'فیروزی', 'فلاح'],
    city: ['فریدونکنار', 'فیروزآباد', 'فسا', 'فردوس'],
    country: ['فرانسه', 'فنلاند', 'فیلیپین', 'فیجی'],
    food: ['فسنجان', 'فالوده', 'فرنی', 'فتیر'],
    animal: ['فیل', 'فلامینگو', 'فوک', 'فنچ'],
    job: ['فیزیکدان', 'فیلسوف', 'فروشنده', 'فضانورد'],
    fruit: ['فندق', 'فیگ'],
  },
  'ق': {
    name: ['قاسم', 'قدر'],
    family: ['قاسمی', 'قربانی', 'قنبری'],
    city: ['قزوین', 'قم', 'قوچان', 'قائمشهر'],
    country: ['قطر', 'قبرس', 'قزاقستان'],
    food: ['قورمه‌سبزی', 'قیمه', 'قلیه‌ماهی'],
    animal: ['قوچ', 'قناری', 'قاب‌قاب', 'قرقاول'],
    job: ['قاضی', 'قهرمان'],
    fruit: ['قیسی'],
  },
  'ک': {
    name: ['کاوه', 'کبری', 'کیانا', 'کامران', 'کیارش'],
    family: ['کریمی', 'کاظمی', 'کیانی', 'کمالی', 'کهنسال'],
    city: ['کرمان', 'کرمانشاه', 'کرج', 'کاشمر', 'کاشان'],
    country: ['کانادا', 'کره', 'کنیا', 'کلمبیا', 'کوبا'],
    food: ['کباب', 'کوکو', 'کاهوسالاد', 'کتلت', 'کنجد‌پلو'],
    animal: ['کبوتر', 'کروکودیل', 'کنگرو', 'کفتار'],
    job: ['کارآگاه', 'کارگردان', 'کتابدار', 'کشاورز'],
    fruit: ['کیوی', 'کنار', 'کشمش', 'کدو'],
  },
  'گ': {
    name: ['گلاره', 'گوهر', 'گلشن'],
    family: ['گودرزی', 'گلستانی', 'گلزار'],
    city: ['گرگان', 'گناوه', 'گلپایگان', 'گرمسار'],
    country: ['گرجستان', 'گینه', 'گانا'],
    food: ['گوجه‌فرنگی', 'گوشت', 'گاودانه', 'گرده'],
    animal: ['گرگ', 'گاو', 'گربه', 'گوزن', 'گنجشک'],
    job: ['گزارشگر', 'گرافیست', 'گچکار'],
    fruit: ['گلابی', 'گیلاس', 'گریپ‌فروت'],
  },
  'ل': {
    name: ['لیلا', 'لادن', 'لیلی', 'لاله'],
    family: ['لطفی', 'لاهوتی', 'لقمانی'],
    city: ['لاهیجان', 'لار', 'لردگان', 'لنگرود'],
    country: ['لبنان', 'لیبی', 'لاتویا', 'لوکزامبورگ'],
    food: ['لوبیاپلو', 'لازانیا', 'لواش'],
    animal: ['لاک‌پشت', 'لک‌لک', 'لمور', 'لاله‌ماهی'],
    job: ['لوله‌کش', 'لباس‌طراح', 'لیفت‌راننده'],
    fruit: ['لیمو', 'لیموترش', 'لوبیا'],
  },
  'م': {
    name: ['مریم', 'محمد', 'مهسا', 'مهران', 'مینا', 'مانی'],
    family: ['محمدی', 'مرادی', 'منصوری', 'محمودی', 'مظفری'],
    city: ['مشهد', 'مازندران', 'مراغه', 'میانه', 'مریوان'],
    country: ['مکزیک', 'مراکش', 'مالزی', 'مصر', 'مجارستان'],
    food: ['ماهی', 'مرغ', 'ماکارونی', 'مرغ بریان', 'میرزا قاسمی'],
    animal: ['میمون', 'مار', 'موش', 'مرغ‌دریایی', 'موج‌سوار'],
    job: ['مهندس', 'معلم', 'معمار', 'مدیر', 'مشاور'],
    fruit: ['موز', 'موسیر', 'مزینه'],
  },
  'ن': {
    name: ['نازنین', 'نیلوفر', 'نیما', 'نادر', 'ناهید'],
    family: ['نجفی', 'نوروزی', 'نادری', 'نظری', 'نیکخواه'],
    city: ['نیشابور', 'نجف‌آباد', 'نور', 'نهاوند', 'نورآباد'],
    country: ['نروژ', 'نیجریه', 'نیوزیلند', 'نپال', 'نامیبیا'],
    food: ['نان', 'نودل', 'نارنج‌پلو', 'نخودچی'],
    animal: ['نهنگ', 'نسر', 'نقره‌ماهی', 'نرپای'],
    job: ['نویسنده', 'نقشه‌کش', 'نمایشگر', 'نجار'],
    fruit: ['نارگیل', 'نارنج', 'نارنگی'],
  },
  'و': {
    name: ['وحید', 'ویدا', 'ولی'],
    family: ['وکیلی', 'ورزگانی', 'وثوقی'],
    city: ['ورامین', 'ورزقان'],
    country: ['ونزوئلا', 'ویتنام'],
    food: ['وردنه', 'وجبی', 'ولگردی'],
    animal: ['وال', 'ورزا'],
    job: ['وکیل', 'وزیر', 'ورزشکار'],
    fruit: ['ولیک'],
  },
  'ه': {
    name: ['هانیه', 'هادی', 'هلیا', 'هاله'],
    family: ['هاشمی', 'همتی', 'هدایتی', 'هدایی'],
    city: ['همدان', 'هرمزگان', 'هشت‌پر'],
    country: ['هلند', 'هند', 'هندوراس', 'هائیتی'],
    food: ['هویج‌پلو', 'هندوانه', 'هل‌پلو'],
    animal: ['هدهد', 'هشت‌پا', 'هیپوپوتام'],
    job: ['هنرپیشه', 'هواشناس', 'هواپیماساز'],
    fruit: ['هلو', 'هندوانه'],
  },
  'ی': {
    name: ['یاسمن', 'یاسر', 'یلدا', 'یسنا'],
    family: ['یوسفی', 'یحیوی', 'یزدانی'],
    city: ['یزد', 'یاسوج'],
    country: ['یونان', 'یمن'],
    food: ['یخنی', 'یخمک'],
    animal: ['یوزپلنگ', 'یاکو'],
    job: ['یاری‌گر', 'یک‌خانه'],
    fruit: ['یاس'],
  },
}

// ─── CPU ENGINE ───────────────────────────────────────────────────────────────

export interface CpuPlayerConfig {
  id: string
  name: string
  difficulty: NfDifficulty
}

// Probability of having a valid answer per difficulty
const ANSWER_RATE: Record<NfDifficulty, number> = { EASY: 0.55, MEDIUM: 0.75, HARD: 0.92 }
// Response timing (ms after round start)
const RESPONSE_TIME: Record<NfDifficulty, { min: number; max: number }> = {
  EASY:   { min: 20000, max: 35000 },
  MEDIUM: { min: 12000, max: 25000 },
  HARD:   { min: 6000,  max: 15000 },
}

export function generateCpuAnswers(
  letter: string,
  categories: NfCategory[],
  difficulty: NfDifficulty,
  existingAnswers: Record<string, string>,  // other player's answers to potentially duplicate
): Record<string, string> {
  const letterAnswers = CPU_ANSWERS[letter] ?? {}
  const rate = ANSWER_RATE[difficulty]
  const result: Record<string, string> = {}

  for (const cat of categories) {
    // Roll to decide if CPU answers this category
    if (Math.random() > rate) continue

    const pool = letterAnswers[cat.id] ?? []
    if (!pool.length) continue

    // Hard difficulty tries to pick unique answers; easy might duplicate
    let answer: string
    if (difficulty === 'HARD') {
      const unique = pool.filter(a => !Object.values(existingAnswers).includes(a))
      answer = (unique.length > 0 ? unique : pool)[Math.floor(Math.random() * (unique.length || pool.length))]
    } else {
      answer = pool[Math.floor(Math.random() * pool.length)]
    }

    result[cat.id] = answer
  }

  return result
}

export function getCpuResponseDelay(difficulty: NfDifficulty): number {
  const { min, max } = RESPONSE_TIME[difficulty]
  return min + Math.random() * (max - min)
}

// ─── LETTER SELECTION ─────────────────────────────────────────────────────────

export function selectRandomLetter(usedLetters: string[] = []): string {
  const available = PERSIAN_GAME_LETTERS.filter(l => !usedLetters.includes(l))
  const pool = available.length > 0 ? available : PERSIAN_GAME_LETTERS
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── WINNER CALCULATION ───────────────────────────────────────────────────────

export function determineWinner(
  cumulativeScores: Record<string, number>
): { winner: string | null; isTie: boolean; tiedPlayers: string[] } {
  const entries = Object.entries(cumulativeScores)
  if (!entries.length) return { winner: null, isTie: false, tiedPlayers: [] }

  const maxScore = Math.max(...entries.map(([, s]) => s))
  const leaders = entries.filter(([, s]) => s === maxScore).map(([pid]) => pid)

  if (leaders.length === 1) return { winner: leaders[0], isTie: false, tiedPlayers: [] }
  return { winner: null, isTie: true, tiedPlayers: leaders }
}

// ─── ROUND DURATION ───────────────────────────────────────────────────────────

export const ROUND_DURATION_MS = 60_000  // 60 seconds
export const DEFAULT_TOTAL_ROUNDS = 3
