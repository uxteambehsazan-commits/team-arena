// Release notes — one entry per published release.
// Only include changes that are actually present in the build.

export type ReleaseStatus = 'draft' | 'ready' | 'building' | 'deploying' | 'live' | 'failed' | 'rolled_back'

export interface ReleaseNote {
  version: string
  title: string
  releaseDate: string
  status: ReleaseStatus
  summary: string
  // User-facing (no technical content):
  userSummary?: string
  userBullets?: string[]
  // Internal (technical — admin only):
  features: string[]
  improvements: string[]
  bugFixes: string[]
  performance: string[]
  security: string[]
  knownIssues: string[]
}

export const RELEASE_HISTORY: ReleaseNote[] = [
  {
    version: '3.14.0',
    title: 'جنگ IT در لابی + ۴ حالت دوز + حذف سرعتی نهایی',
    releaseDate: '2026-10-01',
    status: 'live',
    summary: 'بازی جنگ IT به لیست بازی‌های اصلی اضافه شد. بازی سرعتی نهایی از همه دسته‌بندی‌ها حذف شد. بازی دوز اکنون در ۴ حالت (کلاسیک، پیشرفته، ۵×۵، گوموکو) برای حالت‌های محلی و CPU قابل بازی است. فضای گرید جنگ IT بزرگ‌تر شد.',
    userSummary: 'به‌روزرسانی بازی‌ها',
    userBullets: [
      '🎮 جنگ IT مستقیماً از لابی قابل بازی است',
      '🎲 دوز در ۴ حالت مختلف برای بازی محلی و CPU',
      '🗑️ بازی سرعتی نهایی حذف شد',
      '🔍 گرید جنگ IT بزرگ‌تر و خواناتر',
    ],
    features: [
      'جنگ IT به GAMES_DATA اضافه شد (soloGameId: it_war)',
      'DozVariantSelector برای local_device و solo_cpu در g-final فعال شد',
      'solo_cpu mode با localSoloGameId به standalone games هدایت می‌شود',
    ],
    improvements: [
      'گرید جنگ IT: padding کاهش یافت، سقف cellSize از ۵۲ به ۶۰ افزایش یافت',
      'DozVariantSelector به جای DozGame مستقیم در App.tsx سیم‌کشی شد',
    ],
    bugFixes: [
      'App.tsx internal state فیگما میک با Write tool force-update شد',
      'بازی سرعتی نهایی از همه دسته‌بندی‌ها حذف شد',
    ],
    performance: [],
    security: [],
    knownIssues: ['دوز آنلاین گروهی همچنان از FinalMission 3×3 استفاده می‌کند (sync چند حالت نیاز به کار بیشتر دارد)'],
  },
  {
    version: '3.13.0',
    title: 'بازی جنگ IT + دوز چندگانه + رفع باگ‌های بنیادی',
    releaseDate: '2026-10-01',
    status: 'live',
    summary: 'بازی جنگ IT (Battleship-style) با گرید ۸×۸ و هوش مصنوعی Hunt/Target اضافه شد. بازی دوز به چهار حالت (کلاسیک، پیشرفته، ۵×۵، گوموکو ۱۳×۱۳) تقسیم شد. باگ‌های کش Vite و مشکلات بیلد رفع شدند.',
    userSummary: 'بازی جنگ IT و حالت‌های جدید دوز اضافه شدند!',
    userBullets: [
      '⚔️ بازی جنگ IT — گرید ۸×۸ با هوش مصنوعی Hunt/Target',
      '🎮 دوز چهارحالته — کلاسیک، پیشرفته، ۵×۵، گوموکو ۱۳×۱۳',
      '🐛 رفع باگ‌های Vite cache و build errors',
      '📱 گرید‌های responsive برای موبایل',
    ],
    features: [
      'ITWarGame.tsx — بازی Battleship با گرید ۸×۸ و ۴ نوع باگ',
      'DozVariantSelector.tsx — انتخاب‌گر حالت دوز',
      'GomokuGame.tsx — گوموکو روی تخته ۱۳×۱۳',
      'useITWarOnline.ts — لابی آنلاین با BroadcastChannel',
      'useGridCellSize hook — سایز‌گیری داینامیک از viewport',
    ],
    improvements: [
      'گرید جنگ IT با cellSize پراپ — نه aspectRatio',
      'مینی‌مپ دفاع با سایز جداگانه (miniCell ≈ 38% cellSize)',
      'حالت Hunt/Target در هوش مصنوعی CPU بازی IT War',
    ],
    bugFixes: [
      'رفع خطاهای parse در App.tsx، SpyGame.tsx، NaghghashbashiGame.tsx، TeamChallenge.tsx، DozGame.tsx',
      'کش Vite پاک‌سازی شد — فایل‌های سالم روی دیسک دیده می‌شوند',
      'DozVariantSelector: props اضافه به DozGame حذف شد',
      'ITWarGame: null index type error رفع شد',
    ],
    performance: [],
    security: [],
    knownIssues: [],
  },
  {
    version: '3.12.0',
    title: 'معماری CPU — تفکیک کامل CPU از Remote Player',
    releaseDate: '2026-10-01',
    status: 'live',
    summary: 'CPU با یک فلگ isCPU type-safe شناسایی می‌شود. gameMode در GameState ثبت می‌شود. REPLAY در CPU mode از Lobby می‌گذرد. Human input در نوبت CPU block می‌شود. FastestFinger CPU-aware شد.',
    userSummary: 'بازی‌های انفرادی با CPU حالا معماری جدا دارند — دوباره بازی مستقیم شروع می‌شود!',
    userBullets: [
      '🤖 «دوباره بازی» در بازی‌های CPU دیگر وارد Waiting Room نمی‌شود',
      '🔒 در نوبت CPU، کاربر نمی‌تواند برای CPU بازی کند',
      '🏗️ معماری CPU از Remote Player کاملاً جدا شد',
      '🎯 شناسایی CPU با فلگ isCPU — نه اسم رشته‌ای',
    ],
    features: [
      'Player.isCPU?: boolean — فلگ type-safe برای شناسایی CPU',
      'GameState.gameMode: cpu | local | online — حفظ mode در کل چرخه بازی',
      'CREATE_GAME action: gameMode field اضافه شد',
      'ADD_PLAYER action: isCPU field اضافه شد',
    ],
    improvements: [
      'REPLAY در CPU mode: lobbyCountdown=1 → auto-start بدون نمایش Lobby',
      'useAI.ts: isCPU flag به‌جای p.name===AI_NAME (با fallback برای compatibility)',
      'LogicBreaker: CPU turn → UI تصمیم‌گیری، Human input blocked',
      'SpeedAttack: CPU turn → UI بازی CPU، Human input blocked',
      'FastestFinger: press() — CPU button غیرقابل کلیک توسط انسان',
      'Home.tsx: gameMode: cpu و isCPU: true هنگام شروع بازی CPU',
    ],
    bugFixes: [
      'بعد از REPLAY در بازی CPU، وارد Waiting Room می‌شد',
      'در LogicBreaker نوبت CPU، انسان می‌توانست برای CPU پاسخ بدهد',
      'در SpeedAttack نوبت CPU، انسان می‌توانست برای CPU کلیک کند',
      'در FastestFinger، انسان می‌توانست دکمه CPU را بزند',
    ],
    performance: [],
    security: [],
    knownIssues: [],
  },
  {
    version: '3.11.0',
    title: 'اصلاح CPU دوز + بهینه‌سازی چرخه بازی',
    releaseDate: '2026-10-01',
    status: 'live',
    summary: 'رفع باگ اصلی CPU دوز (stale closure)، تراز VS/امتیاز، بهبود draw detection، اصلاح Loading State در کلمه ممنوعه، پنهان‌سازی جواب در یک کلمه چند سرنخ تا نوبت بازیکن دوم، و ارتقای نسخه.',
    userSummary: 'CPU بازی دوز حالا واقعاً بازی می‌کند — و چند بهبود دیگر!',
    userBullets: [
      '🤖 CPU دوز اصلاح شد — حالا همیشه حرکت انجام می‌دهد',
      '⚖️ نمایش امتیاز در دوز تراز شد',
      '🤝 در صورت تساوی (۰-۰)، CPU برنده اعلام نمی‌شود',
      '🧩 بازی کلمه ممنوعه دیگر صفحه سفید نشان نمی‌دهد',
      '🔒 جواب «یک کلمه، چند سرنخ» تا نوبت بازیکن دوم پنهان می‌ماند',
    ],
    features: [],
    improvements: [
      'DozGame: boardRef pattern برای جلوگیری از stale closure در CPU useEffect',
      'DozGame: grid layout 1fr auto 1fr برای تراز صحیح کارت‌های بازیکن',
      'WinnerCeremony: isDraw detection برای نمایش مساوی به‌جای برنده کاذب',
      'LogicBreaker: loading state به‌جای null return در هنگام آماده‌سازی سوال',
      'OneWordClues: پنهان‌سازی جواب از بازیکن دوم در Local mode',
    ],
    bugFixes: [
      'CPU دوز بعد از حرکت بازیکن حرکت نمی‌کرد (useEffect stale closure)',
      'در تساوی ۰-۰ سیستم CPU را برنده اعلام می‌کرد',
      'کلمه ممنوعه در برخی حالت‌ها صفحه سفید نشان می‌داد',
      'جواب «یک کلمه، چند سرنخ» قبل از نوبت بازیکن دوم نمایش داده می‌شد',
    ],
    performance: [],
    security: [],
    knownIssues: [],
  },
  {
    version: '3.10.0',
    title: 'دوز با CPU واقعی + بازسازی کامل چشمک',
    releaseDate: '2026-09-30',
    status: 'live',
    summary: 'دوز با سه سطح CPU (آسان/متوسط/سخت، minimax)، بازسازی کامل چشمک به بازی نقش‌محور گروهی واقعی با سیستم اتهام، حذف CPU از چشمک.',
    userSummary: 'دو بازی اساساً بهبود یافتند — تجربه جدیدی را امتحان کنید!',
    userBullets: [
      '🎮 بازی دوز اکنون یک حریف هوشمند واقعی دارد — سه سطح دشواری',
      '🧠 حریف سطح سخت با محاسبه دقیق بازی می‌کند',
      '✨ بازی چشمک کاملاً بازسازی شد — گروهی، نقش‌محور، جذاب‌تر از قبل',
      '👥 چشمک حالا ۴ تا ۱۰ نفر را پشتیبانی می‌کند با نقش‌های مخفی',
    ],
    features: [
      'دوز: CPU واقعی با سه سطح — آسان (تصادفی+بلاک)، متوسط (heuristic)، سخت (minimax)',
      'دوز: state machine کامل PLAYER_TURN→CPU_THINKING→CPU_MOVE با delay ۴۰۰-۹۰۰ms',
      'دوز: نمایش خط برنده، آخرین حرکت، امتیاز دور‌های متعدد',
      'چشمک: بازنویسی کامل — بازی نقش‌محور گروهی ۴ تا ۱۰ نفره',
      'چشمک: Role Assignment تصادفی — یک نفر چشمک، بقیه بازیکن عادی',
      'چشمک: Pass-Device role reveal — هر بازیکن نقش خود را خصوصی می‌بیند',
      'چشمک: عملیات مخفی — چشمک می‌تواند هدف را انتخاب و چشمک بزند',
      'چشمک: حذف با تأخیر ۲-۴ ثانیه بعد از چشمک',
      'چشمک: سیستم اتهام با تأیید — حدس درست=پیروزی بازیکنان، حدس اشتباه=حذف متهم‌کننده',
      'چشمک: شرط برد مبتنی بر Game Rule Engine',
    ],
    improvements: [
      'حذف CPU از چشمک در gameCapabilities (supportsSinglePlayer: false)',
      'minPlayers چشمک: ۴، maxPlayers: ۱۰',
      'دوز در gameCapabilities: supportsSinglePlayer: true, supportsCPU: true',
    ],
    bugFixes: [],
    performance: [],
    security: [],
    knownIssues: [
      'Online multiplayer چشمک نیاز به backend push service دارد',
    ],
  },
  {
    version: '3.9.0',
    title: 'مرکز کنترل مدیران — پیام‌رسانی، نسخه‌ها، امنیت',
    releaseDate: '2026-09-30',
    status: 'live',
    summary: 'پنل ادمین ارتقا یافت: مدیریت اعتبارنامه GitHub، مرکز پیام به کاربران، مدیریت نسخه‌ها با ارسال اطلاع‌رسانی، گزارش فعالیت، RBAC و مرکز اعلان کاربران.',
    userSummary: 'چند بهبود مهم در تجربه کلی اپلیکیشن انجام شد.',
    userBullets: [
      '🔔 اعلان‌های جدید — از آخرین اخبار بازی‌ها مطلع شوید',
      '⚡ پایداری و سرعت اپلیکیشن بهتر شده',
      '✨ تجربه کلی استفاده روان‌تر شده',
    ],
    features: [
      'RBAC — ۴ نقش مدیریتی: SYSTEM_ADMIN، CONTENT_ADMIN، SUPPORT_ADMIN، VIEWER',
      'مدیریت اعتبارنامه GitHub با ذخیره‌سازی امن (sessionStorage، بدون localStorage)',
      'تست اتصال واقعی به GitHub API',
      'مرکز پیام‌رسانی به کاربران با انواع پیام، اولویت، مخاطب‌بندی',
      'مرکز اعلان کاربران (notification bell) با badge خوانده‌نشده',
      'مدیریت نسخه‌ها با تاریخچه release و ارسال اطلاع‌رسانی',
      'گزارش فعالیت مدیران (audit log) — رویدادهای حساس بدون ثبت مقدار credential',
      'داشبورد ارتقایافته با کارت‌های سیستم (نسخه، GitHub، پیام‌ها، گزارش)',
    ],
    improvements: [
      'داشبورد ادمین با کارت‌های کلیک‌پذیر برای دسترسی سریع به بخش‌ها',
      'نمایش نقش مدیر در داشبورد',
      'وضعیت اتصال GitHub در نوار وضعیت داشبورد',
    ],
    bugFixes: [
      'رفع خطای NotificationCenter is not defined (WebkitBoxOrient در inline style)',
    ],
    performance: [],
    security: [
      'توکن GitHub هرگز در localStorage، کد منبع، URL یا bundle ذخیره نمی‌شود',
      'تأیید دوباره قبل از نمایش اطلاعات حساس',
      'تمام عملیات حساس در audit log ثبت می‌شوند',
    ],
    knownIssues: [
      'به دلیل frontend-only بودن، RBAC سمت سرور اعمال نمی‌شود',
      'پیام‌ها فقط به همان دستگاه تحویل داده می‌شوند (نیاز به backend push در سیستم واقعی)',
    ],
  },
  {
    version: '3.8.0',
    title: 'بهبود سیستم بازی‌گونه‌سازی و اسپلش ویدیویی',
    releaseDate: '2026-09-30',
    status: 'live',
    summary: 'باز شدن همه بازی‌های عمومی، قفل ماموریت برای شکار بهسازانی، اصلاح کیفیت ویدیو اسپلش، راهنمای بازی‌ها، و ماتریس قابلیت در ادمین.',
    features: [
      'سیستم باز/قفل بازی‌ها بر اساس ماموریت‌ها (GameUnlockEngine)',
      'بازی‌های عمومی (g-*) همیشه باز هستند',
      'شکار بهسازانی فقط پس از تکمیل همه ۸ ماموریت باز می‌شود',
      'نمایش پیشرفت واقعی ماموریت‌ها روی پنل قفل',
      'اسپلش با پس‌زمینه ویدیویی و پنل شیشه‌ای پایین صفحه',
      'ماتریس قابلیت بازی‌ها در پنل ادمین',
    ],
    improvements: [
      'کیفیت ویدیو اسپلش: opacity ویدیو ثابت روی ۱، حذف backdropFilter که رستراسیون ایجاد می‌کرد',
      'راهنمای بازی‌های مافیا، جاسوس، نقاش‌باشی، اسم‌فامیل، شکار بهسازانی',
      'نمایش نسخه در اسپلش',
      'خروج از اسپلش فقط با لمس/کلیک',
      'بهبود CSS آرا (fire، champion، ice، galaxy)',
    ],
    bugFixes: [
      'رفع خطای MISSION_ART is not defined در Tutorial',
      'رفع خطای parse در Tutorial.tsx (b-hunt خارج از آرایه)',
      'رفع کلید BEHSAZAN_ART برای b-naghghashi',
    ],
    performance: [],
    security: [],
    knownIssues: [],
  },
  {
    version: '3.7.0',
    title: 'بهبود UI خانه و سیستم پروفایل',
    releaseDate: '2026-09-28',
    status: 'live',
    summary: 'بهبود صفحه اصلی، سیستم آرا و فریم پروفایل، راهنمای بازی.',
    features: [],
    improvements: ['سیستم آرا پروفایل', 'بهبود کارت‌های بازی در صفحه اصلی'],
    bugFixes: [],
    performance: [],
    security: [],
    knownIssues: [],
  },
  {
    version: '3.6.0',
    title: 'راه‌اندازی چندنفره آنلاین',
    releaseDate: '2026-09-20',
    status: 'live',
    summary: 'پشتیبانی از حالت‌های آنلاین چندنفره، محلی تک‌دستگاه، و انفرادی با CPU.',
    features: ['حالت چندنفره آنلاین', 'حالت محلی تک‌دستگاه', 'بازی با CPU'],
    improvements: [],
    bugFixes: [],
    performance: [],
    security: [],
    knownIssues: [],
  },
]

export function getCurrentRelease(): ReleaseNote {
  return RELEASE_HISTORY[0]
}

export function getReleaseByVersion(version: string): ReleaseNote | undefined {
  return RELEASE_HISTORY.find(r => r.version === version)
}

export const RELEASE_STATUS_LABELS: Record<ReleaseStatus, string> = {
  draft: 'پیش‌نویس',
  ready: 'آماده',
  building: 'در حال ساخت',
  deploying: 'در حال انتشار',
  live: 'منتشر شده',
  failed: 'ناموفق',
  rolled_back: 'برگشت داده شده',
}

export const RELEASE_STATUS_COLORS: Record<ReleaseStatus, string> = {
  draft: '#6D6E71',
  ready: '#3b82f6',
  building: '#f97316',
  deploying: '#ffd60a',
  live: '#22c55e',
  failed: '#CC2229',
  rolled_back: '#a855f7',
}
