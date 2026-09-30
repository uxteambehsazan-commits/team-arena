// Release notes — one entry per published release.
// Only include changes that are actually present in the build.

export type ReleaseStatus = 'draft' | 'ready' | 'building' | 'deploying' | 'live' | 'failed' | 'rolled_back'

export interface ReleaseNote {
  version: string
  title: string
  releaseDate: string
  status: ReleaseStatus
  summary: string
  features: string[]
  improvements: string[]
  bugFixes: string[]
  performance: string[]
  security: string[]
  knownIssues: string[]
}

export const RELEASE_HISTORY: ReleaseNote[] = [
  {
    version: '3.9.0',
    title: 'مرکز کنترل مدیران — پیام‌رسانی، نسخه‌ها، امنیت',
    releaseDate: '2026-09-30',
    status: 'live',
    summary: 'پنل ادمین ارتقا یافت: مدیریت اعتبارنامه GitHub، مرکز پیام به کاربران، مدیریت نسخه‌ها با ارسال اطلاع‌رسانی، گزارش فعالیت، RBAC و مرکز اعلان کاربران.',
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
