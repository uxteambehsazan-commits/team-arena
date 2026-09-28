import type { MissionConfig, LogicQuestion } from './types'

export interface OneWordQuestion { answer: string; clues: string[] }
export interface NameFamilyCategory { id: string; label: string }

export const GAME_NAME = 'میدان هم‌تیمی‌ها'
export const GAME_NAME_EN = 'TEAMMATES ARENA'
export const GAME_TAGLINE = 'چند دقیقه دورهمی، کلی رقابت'

export const MISSIONS: MissionConfig[] = [
  {
    id: 'SPEED',
    name: 'حمله سرعت',
    emoji: '⚡',
    fullName: 'مأموریت ۰۱ — حمله سرعت',
    type: 'turn',
    timer: 15,
    desc: 'سریع‌ترین هدف را بزن!',
    scoring: 'درست: +۱۰۰ | اشتباه: ۲۵- | بونوس سرعت: تا +۱۰۰',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'MEMORY',
    name: 'استاد حافظه',
    emoji: '🧠',
    fullName: 'مأموریت ۰۲ — استاد حافظه',
    type: 'turn',
    timer: 20,
    desc: 'جفت‌های یکسان را پیدا کن!',
    scoring: 'جفت درست: +۱۰۰ | جفت اشتباه: ۲۰-',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'LOGIC',
    name: 'شکست منطق',
    emoji: '🧩',
    fullName: 'مأموریت ۰۳ — شکست منطق',
    type: 'turn',
    timer: 15,
    desc: 'الگو را کامل کن!',
    scoring: 'درست: +۱۵۰ | اشتباه: ۰ | تایم‌اوت: ۰',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'FASTEST',
    name: 'سریع‌ترین انگشت',
    emoji: '🎯',
    fullName: 'مأموریت ۰۴ — سریع‌ترین انگشت',
    type: 'simultaneous',
    timer: 10,
    desc: 'اول دکمه را بزن!',
    scoring: '🥇 +۳۰۰ | 🥈 +۲۰۰ | 🥉 +۱۰۰ | بقیه +۵۰ | استارت زود: ۵۰-',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'TEAM',
    name: 'چالش تیمی',
    emoji: '🤝',
    fullName: 'مأموریت ۰۵ — چالش تیمی',
    type: 'cooperative',
    timer: 15,
    desc: 'با هم ماشین را در ترتیب درست روشن کنید!',
    scoring: 'موفقیت تیم: هر بازیکن +۳۰۰ | شکست: ۰',
    minPlayers: 4,
    maxPlayers: 8,
  },
  {
    id: 'FINAL',
    name: 'دوز',
    emoji: '♟️',
    fullName: 'دوز — نبرد قلمرو',
    type: 'simultaneous',
    timer: 120,
    desc: 'سه‌تایی بچین و حریف رو شکست بده — اول به ۲ برد برسی می‌بری!',
    scoring: 'هر برد: +۴۰۰ | مساوی: +۱۰۰',
    minPlayers: 2,
    maxPlayers: 2,
  },
  {
    id: 'NAME_FAMILY',
    name: 'اسم‌فامیل',
    emoji: '🔤',
    fullName: 'اسم‌فامیل سرعتی',
    type: 'simultaneous',
    timer: 45,
    desc: 'با حرف داده‌شده، جاهای خالی رو پر کن!',
    scoring: 'منحصربه‌فرد: +۱۵۰ | مشترک: +۵۰ | خالی: ۰',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'ONE_WORD',
    name: 'یک کلمه',
    emoji: '💡',
    fullName: 'یک کلمه، چند سرنخ',
    type: 'simultaneous',
    timer: 60,
    desc: 'با هر سرنخ بیشتر حدس بزن — هر چه زودتر بیشتر امتیاز!',
    scoring: 'سرنخ ۱: +۳۰۰ | سرنخ ۲: +۲۰۰ | سرنخ ۳: +۱۰۰ | سرنخ ۴+: +۵۰',
    minPlayers: 2,
    maxPlayers: 8,
  },
]

export const DEFAULT_ENABLED_MISSIONS = ['SPEED', 'MEMORY', 'LOGIC', 'FASTEST', 'TEAM', 'FINAL', 'NAME_FAMILY', 'ONE_WORD']

export const NAME_FAMILY_CATEGORIES: NameFamilyCategory[] = [
  { id: 'name', label: 'اسم' },
  { id: 'family', label: 'فامیلی' },
  { id: 'city', label: 'شهر' },
  { id: 'food', label: 'غذا' },
  { id: 'animal', label: 'حیوان' },
  { id: 'job', label: 'شغل' },
]

export const PERSIAN_LETTERS = ['آ','ب','پ','ت','ج','چ','خ','د','ر','ز','س','ش','ف','ق','ک','گ','ل','م','ن','و','ه','ی']

export const ONE_WORD_QUESTIONS: OneWordQuestion[] = [
  // مکان‌ها
  { answer: 'بانک', clues: ['پول', 'حساب', 'وام', 'صندوق'] },
  { answer: 'هواپیما', clues: ['آسمان', 'سفر', 'فرودگاه', 'بال'] },
  { answer: 'کتابخانه', clues: ['کتاب', 'سکوت', 'قفسه', 'امانت'] },
  { answer: 'رستوران', clues: ['غذا', 'منو', 'آشپز', 'سفارش'] },
  { answer: 'بیمارستان', clues: ['دکتر', 'سلامت', 'پرستار', 'دارو'] },
  { answer: 'مدرسه', clues: ['درس', 'تخته', 'معلم', 'دانش‌آموز'] },
  { answer: 'فرودگاه', clues: ['پرواز', 'پاسپورت', 'ترمینال', 'چمدان'] },
  { answer: 'موزه', clues: ['تاریخ', 'نقاشی', 'نمایشگاه', 'قدیمی'] },
  { answer: 'ورزشگاه', clues: ['تماشاگر', 'مسابقه', 'چمن', 'سکو'] },
  { answer: 'بازار', clues: ['خرید', 'دکان', 'چانه', 'ازدحام'] },
  { answer: 'پارک', clues: ['درخت', 'بازی', 'چمن', 'هوای تازه'] },
  { answer: 'آشپزخانه', clues: ['اجاق', 'پخت', 'قابلمه', 'بو'] },
  { answer: 'دانشگاه', clues: ['استاد', 'کلاس', 'مدرک', 'دانشجو'] },
  { answer: 'زندان', clues: ['نگهبان', 'سلول', 'مجرم', 'در آهنی'] },
  { answer: 'کارخانه', clues: ['تولید', 'ماشین‌آلات', 'کارگر', 'دود'] },
  // حیوانات
  { answer: 'ماهی', clues: ['آب', 'شنا', 'آبزی', 'باله'] },
  { answer: 'فیل', clues: ['خرطوم', 'بزرگ', 'آفریقا', 'عاج'] },
  { answer: 'شیر', clues: ['جنگل', 'شاه', 'یال', 'شکار'] },
  { answer: 'عقاب', clues: ['آسمان', 'پرنده', 'تیزبین', 'بال گسترده'] },
  { answer: 'اختاپوس', clues: ['دریا', 'هشت پا', 'جوهر', 'نرم‌تن'] },
  { answer: 'زرافه', clues: ['گردن', 'آفریقا', 'بلند', 'لکه‌دار'] },
  { answer: 'دلفین', clues: ['دریا', 'باهوش', 'بازیگوش', 'پستاندار'] },
  { answer: 'عنکبوت', clues: ['تار', 'هشت پا', 'حشره', 'تله'] },
  { answer: 'خفاش', clues: ['شب', 'غار', 'اکوبسنجی', 'بال'] },
  { answer: 'کانگارو', clues: ['استرالیا', 'جهش', 'کیسه', 'دم'] },
  // ورزش و سرگرمی
  { answer: 'فوتبال', clues: ['توپ', 'گل', 'زمین', 'داور'] },
  { answer: 'شطرنج', clues: ['مهره', 'تاکتیک', 'کیش', 'صفحه'] },
  { answer: 'شنا', clues: ['استخر', 'آب', 'سرعت', 'دریا'] },
  { answer: 'کوه‌نوردی', clues: ['ارتفاع', 'طناب', 'قله', 'سخت'] },
  { answer: 'بسکتبال', clues: ['توپ', 'حلقه', 'سبد', 'ارتفاع'] },
  { answer: 'تنیس', clues: ['راکت', 'توپ زرد', 'زمین', 'خط'] },
  { answer: 'دوچرخه‌سواری', clues: ['پدال', 'چرخ', 'زین', 'ترمز'] },
  { answer: 'موسیقی', clues: ['صدا', 'ریتم', 'ساز', 'آهنگ'] },
  { answer: 'نقاشی', clues: ['رنگ', 'قلم‌مو', 'بوم', 'هنرمند'] },
  { answer: 'سینما', clues: ['فیلم', 'پرده', 'تاریکی', 'بلیط'] },
  // طبیعت و جغرافیا
  { answer: 'آفتاب', clues: ['گرما', 'نور', 'روز', 'ستاره'] },
  { answer: 'رعد و برق', clues: ['آذرخش', 'طوفان', 'صدای بلند', 'ابر'] },
  { answer: 'آتشفشان', clues: ['گدازه', 'انفجار', 'دود', 'کوه'] },
  { answer: 'اقیانوس', clues: ['بزرگ', 'نمک', 'عمیق', 'موج'] },
  { answer: 'صحرا', clues: ['گرما', 'شن', 'کاکتوس', 'خشک'] },
  { answer: 'قطب شمال', clues: ['یخ', 'سرد', 'خرس قطبی', 'شفق'] },
  { answer: 'جزیره', clues: ['آب', 'تنها', 'خاک', 'ساحل'] },
  { answer: 'رنگین‌کمان', clues: ['باران', 'رنگ', 'کمان', 'آفتاب'] },
  { answer: 'زلزله', clues: ['لرزش', 'ریشتر', 'زمین', 'ویران'] },
  { answer: 'طوفان', clues: ['باد', 'باران', 'خطر', 'ابر تیره'] },
  // فناوری و روزمره
  { answer: 'تلفن همراه', clues: ['صفحه', 'اپ', 'شارژ', 'پیام'] },
  { answer: 'اینترنت', clues: ['شبکه', 'جستجو', 'سایت', 'اتصال'] },
  { answer: 'ربات', clues: ['ماشین', 'برنامه', 'هوش مصنوعی', 'فلزی'] },
  { answer: 'ماهواره', clues: ['فضا', 'مدار', 'سیگنال', 'ارتباط'] },
  { answer: 'برق', clues: ['کلید', 'لامپ', 'جریان', 'شوک'] },
  { answer: 'آینه', clues: ['بازتاب', 'شیشه', 'خود', 'تصویر'] },
  { answer: 'ساعت', clues: ['وقت', 'عقربه', 'ثانیه', 'زنگ'] },
  { answer: 'قایق', clues: ['آب', 'پارو', 'دریا', 'شناور'] },
  { answer: 'چراغ‌قوه', clues: ['تاریکی', 'نور', 'باتری', 'دست'] },
  { answer: 'دوربین', clues: ['عکس', 'لنز', 'خاطره', 'فلاش'] },
  // غذا و خوردنی
  { answer: 'پیتزا', clues: ['پنیر', 'خمیر', 'ایتالیا', 'فر'] },
  { answer: 'شکلات', clues: ['شیرین', 'کاکائو', 'قهوه‌ای', 'لذیذ'] },
  { answer: 'قهوه', clues: ['کافئین', 'صبح', 'تلخ', 'فنجان'] },
  { answer: 'عسل', clues: ['زنبور', 'شیرین', 'طبیعی', 'زرد'] },
  { answer: 'نان', clues: ['گندم', 'فر', 'صبحانه', 'آرد'] },
  { answer: 'هندوانه', clues: ['تابستان', 'قرمز', 'شیرین', 'تخمه'] },
  // انسان و جامعه
  { answer: 'قهرمان', clues: ['شجاعت', 'نجات', 'مبارزه', 'افتخار'] },
  { answer: 'معلم', clues: ['درس', 'دانش', 'کلاس', 'تخته'] },
  { answer: 'پزشک', clues: ['بیمار', 'دارو', 'درمان', 'گوشی'] },
  { answer: 'کشاورز', clues: ['زمین', 'بذر', 'برداشت', 'کشت'] },
  { answer: 'هنرمند', clues: ['خلق', 'اثر', 'احساس', 'بیان'] },
  { answer: 'دانشمند', clues: ['آزمایش', 'کشف', 'علم', 'آزمایشگاه'] },
]

/* Behsazan Mellat–compatible player palette:
   warm/neutral tones that coexist with the red + gray brand */
export const PLAYER_COLORS = [
  { bg: '#CC2229', light: '#f47a7e', label: 'قرمز' },       // brand red
  { bg: '#6D6E71', light: '#b0b1b4', label: 'خاکستری' },    // brand gray
  { bg: '#c0392b', light: '#e88080', label: 'تیره‌قرمز' },
  { bg: '#e67e22', light: '#f4a65a', label: 'نارنجی' },
  { bg: '#8e44ad', light: '#c39bd3', label: 'بنفش' },
  { bg: '#16a085', light: '#76d7c4', label: 'سبز' },
  { bg: '#2980b9', light: '#85c1e9', label: 'آبی' },
  { bg: '#d4ac0d', light: '#f7dc6f', label: 'طلایی' },
]

export const AVATARS = ['0', '1', '2', '3', '4', '5', '6']

export const LOGIC_PUZZLES: LogicQuestion[] = [
  { sequence: ['🟦', '🟨', '🟦', '🟨', '?'], options: ['🟦', '🟨', '🟥', '🟩'], answer: 0, hint: 'الگوی تکرار' },
  { sequence: ['1', '2', '4', '8', '?'], options: ['10', '16', '12', '14'], answer: 1, hint: 'هر عدد دو برابر می‌شود' },
  { sequence: ['🔴', '🔴', '🔵', '🔴', '🔴', '🔵', '?'], options: ['🔴', '🔵', '🟢', '🟡'], answer: 0, hint: 'الگوی ۲+۱' },
  { sequence: ['3', '6', '9', '12', '?'], options: ['14', '15', '16', '18'], answer: 1, hint: 'جدول ضرب ۳' },
  { sequence: ['⬛', '⬜', '⬛', '⬜', '⬛', '?'], options: ['⬛', '⬜', '🟥', '🟦'], answer: 1, hint: 'الگوی متناوب' },
  { sequence: ['1', '1', '2', '3', '5', '?'], options: ['6', '7', '8', '10'], answer: 2, hint: 'دنباله فیبوناچی' },
  { sequence: ['🌙', '⭐', '🌙', '⭐', '⭐', '?'], options: ['🌙', '⭐', '☀️', '🌟'], answer: 0, hint: 'الگوی ۱+۲' },
  { sequence: ['100', '90', '80', '70', '?'], options: ['65', '55', '60', '50'], answer: 2, hint: 'هر بار ۱۰ کم می‌شود' },
]

export const MEMORY_EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍒', '🫐', '🍍']

export const SPEED_EMOJIS = [
  ['⭐', '🌙', '☀️', '🌟', '💫', '✨', '🔥', '💧', '🍃'],
  ['🎯', '⚽', '🏀', '🎾', '🏈', '🎱', '🏐', '🏉', '🎳'],
  ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨'],
  ['🚀', '✈️', '🚂', '🚁', '⛵', '🏎️', '🛸', '🛩️', '🚤'],
]

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    if (i === 2) code += '-'
    else code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function formatNumber(n: number): string {
  return n.toLocaleString('fa-IR')
}
