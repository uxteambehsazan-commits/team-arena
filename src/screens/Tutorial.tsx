import { useState, useEffect } from 'react'
import { MISSION_ART } from '../lib/missionArt'
import artBDesigner   from '../imports/art-b-designer.png'
import artBCouncil    from '../imports/art-b-council.png'
import artBCodebreak  from '../imports/art-b-codebreak.png'
import artBBigrace    from '../imports/art-b-bigrace.png'
import artBMafia      from '../imports/art-b-mafia.png'
import artBSecretcode from '../imports/art-b-secretcode.png'
import artBSpy        from '../imports/art-b-spy.png'
import artBOneword    from '../imports/art-b-oneword.png'
import MobileHeader from '../components/MobileHeader'

const BEHSAZAN_ART: Record<string, string> = {
  'b-designer':   artBDesigner,
  'b-council':    artBCouncil,
  'b-codebreak':  artBCodebreak,
  'b-bigrace':    artBBigrace,
  'b-mafia':      artBMafia,
  'b-secretcode': artBSecretcode,
  'b-spy':        artBSpy,
  'b-oneword':    artBOneword,
}

interface Props { onClose: () => void }

// ── Types ────────────────────────────────────────────────────────────────────
interface GameInfo {
  id: string
  emoji: string
  name: string
  desc: string
  color: string
  artKey?: string        // key into MISSION_ART (public games)
  behsazanKey?: string   // key into BEHSAZAN_ART (behsazan games)
  players: string
  minPlayers: number
  maxPlayers: number
  rules: string[]
  howTo: string[]
  scoring: string
}

// ── Public online games (8) ──────────────────────────────────────────────────
const PUBLIC_GAMES: GameInfo[] = [
  {
    id: 'guess',
    artKey: 'SPEED',
    emoji: '🕵️',
    name: 'حدس بزن',
    desc: 'تصویر رو ببین، سرنخ‌ها رو دنبال کن و قبل از بقیه حدس بزن.',
    color: '#f97316',
    players: '۲ تا ۸ نفر',
    minPlayers: 2,
    maxPlayers: 8,
    rules: [
      'همه بازیکن‌ها هم‌زمان وارد راند می‌شن.',
      'یک تصویر یا موضوع به همه نمایش داده می‌شه.',
      'هر بازیکن باید سریع‌ترین حدس صحیح رو بزنه.',
      'پاسخ بعد از پایان زمان ثبت نمی‌شه.',
      'نتیجه راند بعد از پایان زمان نمایش داده می‌شه.',
    ],
    howTo: [
      'تصویر یا موضوع راند رو مشاهده کن.',
      'سرنخ‌ها رو دنبال کن و حدست رو بزن.',
      'پاسخت رو در کادر مربوطه وارد کن.',
      'قبل از پایان زمان دکمه ثبت رو بزن.',
      'نتیجه راند رو ببین.',
    ],
    scoring: 'پاسخ صحیح قبل از پایان زمان امتیاز می‌آره. هرچه زودتر پاسخ بدی امتیاز بالاتری می‌گیری.',
  },
  {
    id: 'namefamily',
    artKey: 'NAME_FAMILY',
    emoji: '⚡',
    name: 'اسم‌فامیل سرعتی',
    desc: 'سریع فکر کن، برای هر دسته یک جواب با حرف مشخص بنویس.',
    color: '#06b6d4',
    players: '۲ تا ۸ نفر',
    minPlayers: 2,
    maxPlayers: 8,
    rules: [
      'یک حرف الفبا به همه بازیکن‌ها نمایش داده می‌شه.',
      'چند دسته مثل «شهر»، «حیوان»، «غذا» وجود داره.',
      'همه بازیکن‌ها باید برای هر دسته یک کلمه با همان حرف بنویسن.',
      'جواب باید دقیقاً با حرف مشخص‌شده شروع بشه.',
      'جواب‌های تکراری امتیاز کمتری دارن.',
    ],
    howTo: [
      'حرف راند رو مشاهده کن.',
      'برای هر دسته یک کلمه با اون حرف بنویس.',
      'سعی کن جواب‌های منحصربه‌فرد بنویسی.',
      'قبل از تموم شدن وقت همه دسته‌ها رو پر کن.',
      'دکمه ثبت رو بزن.',
    ],
    scoring: 'جواب صحیح با حرف درست امتیاز می‌آره. جواب منحصربه‌فرد (که کس دیگه‌ای ننوشته) امتیاز بیشتری می‌گیره.',
  },
  {
    id: 'memory',
    artKey: 'MEMORY',
    emoji: '🫣',
    name: 'قایم‌باشک',
    desc: 'خوب نگاه کن، سرنخ‌ها رو به خاطر بسپار و مکان درست رو پیدا کن.',
    color: '#a855f7',
    players: '۲ تا ۸ نفر',
    minPlayers: 2,
    maxPlayers: 8,
    rules: [
      'یک محیط یا صفحه به بازیکن‌ها نمایش داده می‌شه.',
      'یک موضوع یا شیء در یکی از مکان‌ها مخفی شده.',
      'سرنخ‌هایی برای پیدا کردن مخفیگاه وجود داره.',
      'هر بازیکن باید مکان درست رو انتخاب کنه.',
      'انتخاب اشتباه یا دیر هنگام امتیاز کمتری داره.',
    ],
    howTo: [
      'صفحه یا محیط بازی رو با دقت نگاه کن.',
      'سرنخ‌ها رو دنبال کن.',
      'گزینه یا مکان موردنظرت رو انتخاب کن.',
      'انتخابت رو ثبت کن.',
      'نتیجه راند رو ببین.',
    ],
    scoring: 'انتخاب درست امتیاز می‌آره. هرچه سریع‌تر انتخاب کنی امتیاز بیشتری می‌گیری.',
  },
  {
    id: 'logic',
    artKey: 'LOGIC',
    emoji: '🚫',
    name: 'کلمه ممنوعه',
    desc: 'کلمه رو توضیح بده بدون اینکه از کلمه‌های ممنوعه استفاده کنی.',
    color: '#3b82f6',
    players: '۳ تا ۸ نفر',
    minPlayers: 3,
    maxPlayers: 8,
    rules: [
      'یک کلمه اصلی برای توضیح دادن داری.',
      'چند کلمه ممنوعه وجود داره که نباید بگی.',
      'بازیکنان دیگه باید کلمه اصلی رو حدس بزنن.',
      'استفاده از کلمات ممنوعه جریمه داره.',
      'هرچه زودتر کلمه حدس زده بشه امتیاز بیشتره.',
    ],
    howTo: [
      'کلمه اصلی و کلمه‌های ممنوعه رو ببین.',
      'کلمه اصلی رو برای بقیه توصیف کن.',
      'از کلمه‌های ممنوعه استفاده نکن.',
      'منتظر حدس هم‌تیمی‌هات باش.',
      'نتیجه راند رو ببین.',
    ],
    scoring: 'حدس درست هم‌تیمی‌ها امتیاز می‌آره. استفاده از کلمه ممنوعه ممکنه امتیاز منفی داشته باشه.',
  },
  {
    id: 'final',
    artKey: 'FINAL',
    emoji: '♟️',
    name: 'دوز — نبرد قلمرو',
    desc: 'با هوش مصنوعی یا رقیب انسانی دوز بازی کن و قهرمان شو.',
    color: '#CC2229',
    players: '۱ تا ۲ نفر',
    minPlayers: 1,
    maxPlayers: 2,
    rules: [
      'صفحه ۳×۳ دوز بین بازیکنان وجود داره.',
      'هر نفر به نوبت یک خانه انتخاب می‌کنه.',
      'بازیکنی که سه خانه مستقیم (افقی، عمودی، قطری) داشته باشه برنده‌ست.',
      'اگر همه خانه‌ها پر بشن و کسی نبرده، مساوی‌ست.',
      'در حالت تک‌نفره با هوش مصنوعی بازی می‌کنی.',
    ],
    howTo: [
      'نوبت خودت رو مشاهده کن.',
      'یک خانه خالی از صفحه انتخاب کن.',
      'حرکتت رو ثبت کن.',
      'منتظر حرکت رقیب باش.',
      'بازی تا پیروزی یک طرف یا مساوی ادامه داره.',
    ],
    scoring: 'بردن بازی امتیاز کامل می‌آره. مساوی امتیاز نصف و باخت امتیازی ندارد.',
  },
  {
    id: 'oneword',
    artKey: 'ONE_WORD',
    emoji: '🔎',
    name: 'یک کلمه، چند سرنخ',
    desc: 'هرچه زودتر با سرنخ‌های کمتر جواب بدی، امتیاز بیشتری می‌گیری.',
    color: '#ffd60a',
    players: '۲ تا ۸ نفر',
    minPlayers: 2,
    maxPlayers: 8,
    rules: [
      'یک کلمه یا مفهوم مخفی وجود داره.',
      'سرنخ‌ها یکی یکی نمایش داده می‌شن.',
      'هر بازیکن می‌تونه بعد از هر سرنخ جواب بده.',
      'هرچه زودتر (با سرنخ‌های کمتر) جواب بدی امتیاز بیشتری می‌گیری.',
      'جواب اشتباه امتیازی نداره.',
    ],
    howTo: [
      'اولین سرنخ رو مشاهده کن.',
      'اگر جواب رو می‌دونی همین الان وارد کن.',
      'اگر نمی‌دونی منتظر سرنخ بعدی بمون.',
      'جوابت رو ثبت کن.',
      'نتیجه رو ببین.',
    ],
    scoring: 'جواب با سرنخ اول بیشترین امتیاز رو داره. هر سرنخ اضافه از امتیاز کم می‌کنه.',
  },
  {
    id: 'team',
    artKey: 'TEAM',
    emoji: '😉',
    name: 'چشمک',
    desc: 'یکی از بازیکن‌ها نقش مخفی داره — آیا می‌تونی پیداش کنی؟',
    color: '#22c55e',
    players: '۴ تا ۸ نفر',
    minPlayers: 4,
    maxPlayers: 8,
    rules: [
      'بازی به صورت مخفیانه نقش‌ها رو تعیین می‌کنه.',
      'یک بازیکن «چشمک‌زن» (یا نقش خاص) داره.',
      'بازیکنان باید رفتار بقیه رو زیر نظر بگیرن.',
      'در زمان مشخص باید نقش مخفی رو شناسایی کنن.',
      'نقش هر بازیکن فقط برای خودش نمایش داده می‌شه.',
    ],
    howTo: [
      'نقش مخفیت رو ببین — کسی نباید بفهمه.',
      'اگر نقش خاص داری، وظیفه‌ات رو انجام بده.',
      'رفتار بقیه رو زیر نظر بگیر.',
      'در زمان رأی‌گیری، فرد موردنظرت رو انتخاب کن.',
      'نتیجه بر اساس عملکرد تعیین می‌شه.',
    ],
    scoring: 'نتیجه بر اساس نقش و عملکرد بازیکنان محاسبه می‌شه. شناسایی درست یا مخفی ماندن موفق امتیاز می‌آره.',
  },
  {
    id: 'fastest',
    artKey: 'FASTEST',
    emoji: '🏁',
    name: 'بازی سرعتی نهایی',
    desc: 'آخرین چالش — سرعتت رو نشون بده و امتیاز بگیر!',
    color: '#ef4444',
    players: '۲ تا ۸ نفر',
    minPlayers: 2,
    maxPlayers: 8,
    rules: [
      'یک چالش سرعتی به همه نمایش داده می‌شه.',
      'همه بازیکن‌ها هم‌زمان شروع می‌کنن.',
      'اولین کسی که پاسخ درست بده برنده‌ست.',
      'پاسخ اشتباه ممکنه جریمه داشته باشه.',
      'زمان خیلی کوتاهه — تمرکز کن!',
    ],
    howTo: [
      'منتظر نمایش چالش باش.',
      'به محض نمایش چالش، سریع عمل کن.',
      'پاسخت رو ثبت کن.',
      'نتیجه و امتیاز نمایش داده می‌شه.',
    ],
    scoring: 'سرعت و دقت هر دو مهمن. اولین نفری که درست پاسخ بده امتیاز کامل می‌گیره.',
  },
]

// ── Behsazan online games (8) ────────────────────────────────────────────────
const BEHSAZAN_GAMES: GameInfo[] = [
  {
    id: 'b-designer',
    behsazanKey: 'b-designer',
    emoji: '😉',
    name: 'طراح ناشناس',
    desc: 'کدوم یکی طراح ناشناسه؟ با تیمت کشف کن!',
    color: '#a855f7',
    players: '۴ تا ۸ نفر',
    minPlayers: 4,
    maxPlayers: 8,
    rules: [
      'یک نفر نقش «طراح ناشناس» رو دارد.',
      'بقیه بازیکنان باید این شخص رو شناسایی کنن.',
      'طراح ناشناس باید تا آخر بازی مخفی بمونه.',
      'در زمان رأی‌گیری هر بازیکن مظنونش رو انتخاب می‌کنه.',
      'تیمی که درست تشخیص بده برنده‌ست.',
    ],
    howTo: [
      'نقشت رو مشاهده کن — کسی نباید بفهمه.',
      'اگر طراح ناشناسی، وانمود کن عادی هستی.',
      'رفتار بقیه رو زیر نظر بگیر.',
      'در مرحله رأی‌گیری فرد موردنظرت رو انتخاب کن.',
      'نتیجه رو ببین.',
    ],
    scoring: 'شناسایی درست طراح ناشناس امتیاز می‌آره. اگر طراحی و لو نرفتی امتیاز می‌گیری.',
  },
  {
    id: 'b-council',
    behsazanKey: 'b-council',
    emoji: '♟️',
    name: 'شورای پروژه',
    desc: 'استراتژی بچین و پروژه رو به نتیجه برسون!',
    color: '#CC2229',
    players: '۲ نفر',
    minPlayers: 2,
    maxPlayers: 2,
    rules: [
      'صفحه ۳×۳ دوز بین دو بازیکن وجود داره.',
      'هر نفر به نوبت یک خانه انتخاب می‌کنه.',
      'سه خانه متوالی (افقی، عمودی یا قطری) = برنده.',
      'اگه همه خانه‌ها پر بشن بدون برنده، مساوی‌ست.',
      'اولین بازیکنی که دو راند ببره، قهرمان می‌شه.',
    ],
    howTo: [
      'نوبتت رو مشاهده کن.',
      'یک خانه خالی از صفحه انتخاب کن.',
      'منتظر حرکت رقیب باش.',
      'سه‌تایی رو تکمیل کن تا ببری.',
      'دو برد = قهرمان!',
    ],
    scoring: 'هر راند برنده: ۱۰ امتیاز. مساوی: ۵ امتیاز. اولین بازیکن با ۲ برد کل امتیاز می‌گیره.',
  },
  {
    id: 'b-codebreak',
    behsazanKey: 'b-codebreak',
    emoji: '🚫',
    name: 'رمزگشایان بهسازان',
    desc: 'رمزها رو کشف کن و پیام مخفی رو بیاب!',
    color: '#3b82f6',
    players: '۳ تا ۸ نفر',
    minPlayers: 3,
    maxPlayers: 8,
    rules: [
      'یک کلمه بهسازانی برای توضیح دادن داری.',
      'چند کلمه ممنوعه وجود داره که نباید بگی.',
      'بازیکنان دیگه باید کلمه اصلی رو حدس بزنن.',
      'استفاده از کلمات ممنوعه جریمه داره.',
      'هرچه زودتر حدس زده بشه امتیاز بیشتره.',
    ],
    howTo: [
      'کلمه اصلی و ممنوعه‌ها رو ببین.',
      'کلمه اصلی رو برای بقیه توصیف کن.',
      'از کلمه‌های ممنوعه استفاده نکن.',
      'منتظر حدس هم‌تیمی‌هات باش.',
      'نتیجه راند رو ببین.',
    ],
    scoring: 'حدس درست امتیاز می‌آره. استفاده از کلمه ممنوعه ممکنه امتیاز منفی داشته باشه.',
  },
  {
    id: 'b-bigrace',
    behsazanKey: 'b-bigrace',
    emoji: '⚡',
    name: 'مسابقه بزرگ',
    desc: 'رقابت بزرگ بهسازانی‌ها شروع شد. آماده‌ای؟',
    color: '#06b6d4',
    players: '۲ تا ۸ نفر',
    minPlayers: 2,
    maxPlayers: 8,
    rules: [
      'یک حرف الفبا به همه بازیکن‌ها نمایش داده می‌شه.',
      'دسته‌هایی از فرهنگ بهسازان (اسم، فامیل، پروژه...) وجود داره.',
      'باید برای هر دسته یک کلمه با همان حرف بنویسی.',
      'جواب باید دقیقاً با حرف مشخص‌شده شروع بشه.',
      'جواب‌های منحصربه‌فرد امتیاز بیشتری دارن.',
    ],
    howTo: [
      'حرف راند رو مشاهده کن.',
      'برای هر دسته یک کلمه بهسازانی بنویس.',
      'سعی کن جواب‌های منحصربه‌فرد بنویسی.',
      'قبل از تموم شدن وقت همه دسته‌ها رو پر کن.',
      'دکمه ثبت رو بزن.',
    ],
    scoring: 'جواب صحیح امتیاز می‌آره. جواب منحصربه‌فرد (که کس دیگه‌ای ننوشته) امتیاز بیشتری می‌گیره.',
  },
  {
    id: 'b-mafia',
    behsazanKey: 'b-mafia',
    emoji: '🫣',
    name: 'مافیای بهسازان',
    desc: 'مافیا رو پیدا کن قبل از اینکه دیر بشه!',
    color: '#ef4444',
    players: '۲ تا ۸ نفر',
    minPlayers: 2,
    maxPlayers: 8,
    rules: [
      'کارت‌های مخفی بین بازیکنان توزیع می‌شه.',
      'برخی کارت‌ها نقش مافیا دارن.',
      'باید مکان کارت‌های مافیا رو به خاطر بسپاری.',
      'هر بازیکن باید مکان درست رو انتخاب کنه.',
      'انتخاب اشتباه یا دیرهنگام امتیاز کمتری داره.',
    ],
    howTo: [
      'کارت‌ها رو با دقت نگاه کن.',
      'موقعیت کارت‌های مافیا رو به خاطر بسپار.',
      'کارت‌ها برگردانده می‌شن.',
      'مکان مافیا رو انتخاب کن.',
      'نتیجه رو ببین.',
    ],
    scoring: 'شناسایی درست کارت مافیا امتیاز می‌آره. هرچه سریع‌تر انتخاب کنی امتیاز بیشتری می‌گیری.',
  },
  {
    id: 'b-secretcode',
    behsazanKey: 'b-secretcode',
    emoji: '🔎',
    name: 'کد مخفی پروژه',
    desc: 'با سرنخ‌های پنهان، کد مخفی رو پیدا کن!',
    color: '#ffd60a',
    players: '۲ تا ۸ نفر',
    minPlayers: 2,
    maxPlayers: 8,
    rules: [
      'یک کد مخفی بهسازانی وجود داره.',
      'سرنخ‌ها یکی یکی نمایش داده می‌شن.',
      'هر بازیکن می‌تونه بعد از هر سرنخ جواب بده.',
      'هرچه زودتر (با سرنخ‌های کمتر) جواب بدی امتیاز بیشتری می‌گیری.',
      'جواب اشتباه امتیازی نداره.',
    ],
    howTo: [
      'اولین سرنخ رو مشاهده کن.',
      'اگر کد رو می‌شناسی همین الان وارد کن.',
      'اگر نمی‌دونی منتظر سرنخ بعدی بمون.',
      'پاسخت رو ثبت کن.',
      'نتیجه رو ببین.',
    ],
    scoring: 'جواب با سرنخ اول بیشترین امتیاز رو داره. هر سرنخ اضافه از امتیاز کم می‌کنه.',
  },
  {
    id: 'b-spy',
    behsazanKey: 'b-spy',
    emoji: '🕵️',
    name: 'جاسوس بهسازان',
    desc: 'جاسوس کیه؟ سریع فکر کن، سریع جواب بده!',
    color: '#f97316',
    players: '۲ تا ۸ نفر',
    minPlayers: 2,
    maxPlayers: 8,
    rules: [
      'یک تصویر یا موضوع بهسازانی به همه نمایش داده می‌شه.',
      'هر بازیکن باید سریع‌ترین حدس صحیح رو بزنه.',
      'پاسخ بعد از پایان زمان ثبت نمی‌شه.',
      'سرعت در امتیاز تأثیر مستقیم داره.',
      'نتیجه راند بعد از پایان زمان نمایش داده می‌شه.',
    ],
    howTo: [
      'موضوع یا تصویر راند رو مشاهده کن.',
      'سرنخ‌ها رو دنبال کن.',
      'پاسخت رو در کادر وارد کن.',
      'قبل از پایان زمان دکمه ثبت رو بزن.',
      'نتیجه راند رو ببین.',
    ],
    scoring: 'پاسخ صحیح زودهنگام امتیاز بیشتری می‌آره. دیرتر = امتیاز کمتر.',
  },
  {
    id: 'b-oneword',
    behsazanKey: 'b-oneword',
    emoji: '🏁',
    name: 'یک کلمه',
    desc: 'فقط یک کلمه! بقیه باید حدس بزنن.',
    color: '#22c55e',
    players: '۲ تا ۸ نفر',
    minPlayers: 2,
    maxPlayers: 8,
    rules: [
      'یک چالش سرعتی بهسازانی به همه نمایش داده می‌شه.',
      'همه بازیکن‌ها هم‌زمان شروع می‌کنن.',
      'اولین کسی که پاسخ درست بده برنده‌ست.',
      'پاسخ اشتباه ممکنه جریمه داشته باشه.',
      'زمان خیلی کوتاهه — تمرکز کن!',
    ],
    howTo: [
      'منتظر نمایش چالش باش.',
      'به محض نمایش، سریع عمل کن.',
      'پاسخت رو ثبت کن.',
      'نتیجه و امتیاز نمایش داده می‌شه.',
    ],
    scoring: 'سرعت و دقت هر دو مهمن. اولین نفری که درست پاسخ بده امتیاز کامل می‌گیره.',
  },
]

// ── Single-player offline games (6) ─────────────────────────────────────────
const OFFLINE_GAMES: GameInfo[] = [
  PUBLIC_GAMES.find(g => g.id === 'guess')!,
  PUBLIC_GAMES.find(g => g.id === 'memory')!,
  PUBLIC_GAMES.find(g => g.id === 'logic')!,
  PUBLIC_GAMES.find(g => g.id === 'final')!,
  PUBLIC_GAMES.find(g => g.id === 'oneword')!,
  PUBLIC_GAMES.find(g => g.id === 'fastest')!,
]

// ── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'public',   label: 'آنلاین عمومی',    emoji: '', games: PUBLIC_GAMES },
  { id: 'behsazan', label: 'آنلاین بهسازانی', emoji: '', games: BEHSAZAN_GAMES },
  { id: 'offline',  label: 'تک‌نفره آفلاین',  emoji: '', games: OFFLINE_GAMES },
]

const DETAIL_TABS = [
  { id: 'rules',   label: 'قوانین',         emoji: '📋' },
  { id: 'howto',   label: 'چگونگی',         emoji: '▶️' },
  { id: 'players', label: 'شرکت‌کنندگان',  emoji: '👥' },
  { id: 'scoring', label: 'امتیاز',         emoji: '🏆' },
]

// ── Sub-components ───────────────────────────────────────────────────────────
function GameRow({ game, onClick }: { game: GameInfo; onClick: () => void }) {
  const art = game.behsazanKey ? BEHSAZAN_ART[game.behsazanKey] : game.artKey ? MISSION_ART[game.artKey] : undefined
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-right transition-all active:scale-[0.98]"
      style={{ background: '#141416', border: `1px solid ${game.color}22` }}
    >
      <div
        className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center overflow-hidden"
        style={{ background: `${game.color}18`, border: `1px solid ${game.color}33` }}
      >
        {art ? (
          <img src={art} alt={game.name} className="w-10 h-10 object-contain" />
        ) : (
          <span className="text-2xl">{game.emoji}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-black text-white text-sm truncate">{game.name}</div>
        <div className="text-xs mt-0.5 leading-4 line-clamp-2" style={{ color: '#7a7a82' }}>{game.desc}</div>
      </div>
      <div className="flex-shrink-0 text-lg" style={{ color: '#3a3a42' }}>‹</div>
    </button>
  )
}

function BottomSheet({ game, onClose }: { game: GameInfo; onClose: () => void }) {
  const [detailTab, setDetailTab] = useState('rules')
  const art = game.behsazanKey ? BEHSAZAN_ART[game.behsazanKey] : game.artKey ? MISSION_ART[game.artKey] : undefined

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl flex flex-col max-h-[80vh]"
        style={{ background: '#141416', border: '1px solid #2a2a2e', borderBottom: 'none' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: '#3a3a42' }} />
        </div>

        {/* Game header */}
        <div className="px-5 pb-4 pt-2 flex items-center gap-4 flex-shrink-0" dir="rtl">
          <div
            className="w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center overflow-hidden"
            style={{ background: `${game.color}18`, border: `1.5px solid ${game.color}44` }}
          >
            {art ? (
              <img src={art} alt={game.name} className="w-12 h-12 object-contain" />
            ) : (
              <span className="text-3xl">{game.emoji}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-black text-white text-lg leading-tight">{game.name}</div>
            <div className="text-xs mt-1" style={{ color: '#7a7a82' }}>{game.desc}</div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: '#1e1e22', color: '#6a6a72', border: '1px solid #2e2e32' }}
          >
            ✕
          </button>
        </div>

        {/* Detail tabs */}
        <div
          className="flex gap-1 px-4 pb-3 flex-shrink-0 overflow-x-auto"
          dir="rtl"
          style={{ scrollbarWidth: 'none' }}
        >
          {DETAIL_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setDetailTab(t.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={detailTab === t.id
                ? { background: `${game.color}20`, border: `1.5px solid ${game.color}66`, color: game.color }
                : { background: '#1a1a1c', border: '1.5px solid #2a2a2e', color: '#6a6a72' }}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Detail content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8" dir="rtl">
          {detailTab === 'rules' && (
            <div className="flex flex-col gap-2.5">
              {game.rules.map((rule, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl px-4 py-3"
                  style={{ background: '#1a1a1c', border: '1px solid #2a2a2e' }}
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black mt-0.5"
                    style={{ background: `${game.color}20`, color: game.color }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm leading-6" style={{ color: '#c0c0c8' }}>{rule}</span>
                </div>
              ))}
            </div>
          )}

          {detailTab === 'howto' && (
            <div className="flex flex-col gap-2">
              {game.howTo.map((step, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="flex items-start gap-3 rounded-xl px-4 py-3 w-full"
                    style={{ background: '#1a1a1c', border: '1px solid #2a2a2e' }}
                  >
                    <span
                      className="flex-shrink-0 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: `${game.color}20`, color: game.color }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm leading-6" style={{ color: '#c0c0c8' }}>{step}</span>
                  </div>
                  {i < game.howTo.length - 1 && (
                    <div className="text-xs py-0.5" style={{ color: '#3a3a42' }}>↓</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {detailTab === 'players' && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-2xl px-5 py-5 flex flex-col items-center gap-3"
                style={{ background: `${game.color}12`, border: `1.5px solid ${game.color}33` }}
              >
                <div className="text-4xl">👥</div>
                <div className="font-display font-black text-white text-2xl">{game.players}</div>
                <div className="text-sm" style={{ color: '#a0a0a8' }}>تعداد بازیکنان</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-2xl px-4 py-4 flex flex-col items-center gap-2"
                  style={{ background: '#1a1a1c', border: '1px solid #2a2a2e' }}
                >
                  <div className="text-2xl">⬇️</div>
                  <div className="font-black text-white text-lg">{game.minPlayers}</div>
                  <div className="text-xs" style={{ color: '#7a7a82' }}>حداقل بازیکن</div>
                </div>
                <div
                  className="rounded-2xl px-4 py-4 flex flex-col items-center gap-2"
                  style={{ background: '#1a1a1c', border: '1px solid #2a2a2e' }}
                >
                  <div className="text-2xl">⬆️</div>
                  <div className="font-black text-white text-lg">{game.maxPlayers}</div>
                  <div className="text-xs" style={{ color: '#7a7a82' }}>حداکثر بازیکن</div>
                </div>
              </div>
            </div>
          )}

          {detailTab === 'scoring' && (
            <div
              className="rounded-2xl px-5 py-5 flex flex-col gap-3"
              style={{ background: '#1a1a1c', border: '1px solid #2a2a2e' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span className="font-black text-white text-sm">نحوه امتیاز‌دهی</span>
              </div>
              <p className="text-sm leading-7" style={{ color: '#c0c0c8' }}>{game.scoring}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Tutorial({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState('public')
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null)

  const currentTab = TABS.find(t => t.id === activeTab)!

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0d0d0f' }} dir="rtl">
      <MobileHeader
        title="چطور بازی کنیم؟"
        action={
          <button
            onClick={onClose}
            className="btn-game text-xs px-3 py-1.5 rounded-xl font-bold"
            style={{ color: '#6D6E71', border: '1px solid #2e2e32' }}
          >
            بستن ✕
          </button>
        }
      />

      {/* Category tabs */}
      <div
        className="flex-shrink-0 flex px-4 pt-3 pb-0 gap-2"
        style={{ borderBottom: '1px solid #1a1a1c' }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex flex-col items-center gap-1 pb-3 text-xs font-bold transition-all"
            style={activeTab === tab.id
              ? { color: '#CC2229', borderBottom: '2px solid #CC2229' }
              : { color: '#5a5a62', borderBottom: '2px solid transparent' }}
          >
            <span className="leading-tight text-center">{tab.label}</span>
            <span
              className="text-xs font-normal"
              style={{ color: activeTab === tab.id ? '#CC222980' : '#3a3a42' }}
            >
              {tab.games.length} بازی
            </span>
          </button>
        ))}
      </div>

      {/* Game list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {currentTab.games.map(game => (
          <GameRow
            key={game.id}
            game={game}
            onClick={() => setSelectedGame(game)}
          />
        ))}

        {/* Footer note */}
        <div
          className="mt-2 rounded-2xl px-4 py-3 text-xs leading-6 text-center"
          style={{ background: '#141416', border: '1px solid #1e1e22', color: '#4a4a52' }}
        >
          روی هر بازی کلیک کن تا اطلاعات کامل رو ببینی
        </div>
      </div>

      {/* Bottom sheet */}
      {selectedGame && (
        <BottomSheet game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </div>
  )
}
