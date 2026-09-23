const KEY = 'bm_admin_settings'

export interface GameConfig {
  key: string
  name: string
  tab: 'general' | 'behsazan'
  enabled: boolean
}

export const ALL_GAMES: Omit<GameConfig, 'enabled'>[] = [
  { key: 'g-speed',      name: 'حدس بزن',               tab: 'general'  },
  { key: 'g-namefamily', name: 'اسم‌فامیل سرعتی',        tab: 'general'  },
  { key: 'g-memory',     name: 'قایم‌باشک',              tab: 'general'  },
  { key: 'g-final',      name: 'دوز — نبرد قلمرو',       tab: 'general'  },
  { key: 'g-oneword',    name: 'یک کلمه، چند سرنخ',      tab: 'general'  },
  { key: 'g-logic',      name: 'کلمه ممنوعه',            tab: 'general'  },
  { key: 'g-team',       name: 'چشمک',                   tab: 'general'  },
  { key: 'g-fastest',    name: 'بازی سرعتی نهایی',       tab: 'general'  },
  { key: 'b-designer',   name: 'طراح ناشناس',            tab: 'behsazan' },
  { key: 'b-council',    name: 'شورای پروژه',            tab: 'behsazan' },
  { key: 'b-codebreak',  name: 'رمزگشایان بهسازان',     tab: 'behsazan' },
  { key: 'b-bigrace',    name: 'مسابقه بزرگ',            tab: 'behsazan' },
  { key: 'b-mafia',      name: 'مافیای بهسازان',         tab: 'behsazan' },
  { key: 'b-secretcode', name: 'کد مخفی پروژه',          tab: 'behsazan' },
  { key: 'b-spy',        name: 'جاسوس بهسازان',          tab: 'behsazan' },
  { key: 'b-oneword',    name: 'یک کلمه',                tab: 'behsazan' },
]

export interface AdminSettings {
  feedbackEnabled: boolean
  feedbackTiming: 'end' | 'start' | 'both'
  disabledGames: string[]
}

const DEFAULT: AdminSettings = {
  feedbackEnabled: true,
  feedbackTiming: 'end',
  disabledGames: [],
}

export function loadAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    return { ...DEFAULT, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveAdminSettings(s: AdminSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function isGameEnabled(key: string): boolean {
  return !loadAdminSettings().disabledGames.includes(key)
}

export function isFeedbackEnabled(): boolean {
  return loadAdminSettings().feedbackEnabled
}
