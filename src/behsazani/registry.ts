export interface BehsazaniGameDef {
  id: string
  name: string
  nameEn: string
  desc: string
  icon: string
  color: string
  minPlayers: number
  maxPlayers: number
  type: string
}

export const BEHSAZANI_GAMES: BehsazaniGameDef[] = [
  {
    id: 'behsazani_mafia',
    name: 'مافیای بهسازانی',
    nameEn: 'Mafia',
    desc: 'جناح‌ها، رأی‌گیری و حذف',
    icon: '🕵️',
    color: '#CC2229',
    minPlayers: 4,
    maxPlayers: 16,
    type: 'نقش مخفی',
  },
  {
    id: 'behsazani_spy',
    name: 'جاسوس',
    nameEn: 'Spy',
    desc: 'مکان مخفی را حدس بزن',
    icon: '🔍',
    color: '#3b82f6',
    minPlayers: 3,
    maxPlayers: 10,
    type: 'استنتاج',
  },
  {
    id: 'behsazani_project_council',
    name: 'شورای پروژه',
    nameEn: 'Project Council',
    desc: 'تیم درست بفرست، خرابکار نبفرست',
    icon: '📋',
    color: '#a855f7',
    minPlayers: 5,
    maxPlayers: 10,
    type: 'مأموریت',
  },
  {
    id: 'behsazani_code_breakers',
    name: 'رمزگشایان بهسازان',
    nameEn: 'Code Breakers',
    desc: 'کلمات تیمت را پیدا کن',
    icon: '🔐',
    color: '#06b6d4',
    minPlayers: 4,
    maxPlayers: 8,
    type: 'کلمه‌ای تیمی',
  },
  {
    id: 'behsazani_project_code',
    name: 'رمز پروژه',
    nameEn: 'Project Code',
    desc: 'کد مخفی را با سرنخ کشف کن',
    icon: '🗝️',
    color: '#ffd60a',
    minPlayers: 4,
    maxPlayers: 8,
    type: 'رمزگشایی تیمی',
  },
  {
    id: 'behsazani_one_word',
    name: 'یک کلمه',
    nameEn: 'One Word',
    desc: 'فقط یک کلمه سرنخ بده',
    icon: '💬',
    color: '#22c55e',
    minPlayers: 3,
    maxPlayers: 8,
    type: 'خلاقیت',
  },
  {
    id: 'behsazani_anonymous_drawer',
    name: 'طراح ناشناس',
    nameEn: 'Anonymous Drawer',
    desc: 'نقاشی کن، حدس بزن',
    icon: '🎨',
    color: '#f97316',
    minPlayers: 3,
    maxPlayers: 8,
    type: 'نقاشی',
  },
  {
    id: 'behsazani_it_quiz',
    name: 'مسابقه بزرگ IT',
    nameEn: 'IT Quiz',
    desc: 'دانش فناوری اطلاعات',
    icon: '💻',
    color: '#8b5cf6',
    minPlayers: 2,
    maxPlayers: 12,
    type: 'مسابقه اطلاعاتی',
  },
  {
    id: 'behsazani_hunt',
    name: 'شکار بهسازانی',
    nameEn: 'Behsazan Hunt',
    desc: 'جاسازی کن یا پیدا کن — هر بازیکن دستگاه مستقل',
    icon: '🏢',
    color: '#a855f7',
    minPlayers: 4,
    maxPlayers: 12,
    type: 'نقش‌محور آنلاین',
  },
]

export function getBehsazaniGame(id: string): BehsazaniGameDef | undefined {
  return BEHSAZANI_GAMES.find(g => g.id === id)
}
