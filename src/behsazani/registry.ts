import type { GameCapabilityManifest, GameStatusLevel, PlayMode } from '../lib/gameTypes'

// Re-export for backward compat
export type { GameStatusLevel as GameStatus }
export type { GameCapabilityManifest }

// Legacy interface kept for BehsazaniHub compatibility
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
  status: GameStatusLevel
}

export const STATUS_LABEL: Record<GameStatusLevel, string> = {
  ready: 'آماده',
  improving: 'در حال بهبود',
  developing: 'در حال توسعه',
  coming_soon: 'به زودی',
}

export const STATUS_COLOR: Record<GameStatusLevel, string> = {
  ready: '#22c55e',
  improving: '#ffd60a',
  developing: '#3b82f6',
  coming_soon: '#a855f7',
}

// ── Full capability manifests (PHASE 1) ─────────────────────────────────────

export const GAME_MANIFESTS: GameCapabilityManifest[] = [
  {
    gameId: 'behsazani_mafia',
    title: 'مافیای بهسازانی',
    titleEn: 'Mafia',
    description: 'جناح‌ها، رأی‌گیری و حذف — مافیا رو پیدا کن قبل از اینکه دیر بشه!',
    icon: '🕵️',
    color: '#CC2229',
    theme: 'behsazan',
    category: 'نقش مخفی',
    modes: ['ONLINE_MULTIPLAYER', 'SINGLE_DEVICE'] as PlayMode[],
    minPlayers: 4,
    maxPlayers: 16,
    estimatedMinutes: 20,
    requiresRoom: true,
    requiresRealtime: true,
    supportsSingleDevice: true,
    supportsOnlineMultiplayer: true,
    supportsCPU: false,
    supportsReconnect: true,
    status: 'ready',
    version: '2.1.0',
  },
  {
    gameId: 'behsazani_spy',
    title: 'جاسوس',
    titleEn: 'Spy',
    description: 'مکان مخفی را حدس بزن — جاسوس کیه؟',
    icon: '🔍',
    color: '#3b82f6',
    theme: 'behsazan',
    category: 'استنتاج',
    modes: ['ONLINE_MULTIPLAYER', 'SINGLE_DEVICE'] as PlayMode[],
    minPlayers: 3,
    maxPlayers: 10,
    estimatedMinutes: 10,
    requiresRoom: true,
    requiresRealtime: true,
    supportsSingleDevice: true,
    supportsOnlineMultiplayer: true,
    supportsCPU: false,
    supportsReconnect: true,
    status: 'ready',
    version: '1.0.0',
  },
  {
    gameId: 'behsazani_project_council',
    title: 'شورای پروژه',
    titleEn: 'Project Council',
    description: 'تیم درست بفرست — خرابکار نبفرست!',
    icon: '📋',
    color: '#a855f7',
    theme: 'behsazan',
    category: 'مأموریت',
    modes: ['ONLINE_MULTIPLAYER', 'SINGLE_DEVICE'] as PlayMode[],
    minPlayers: 5,
    maxPlayers: 10,
    estimatedMinutes: 15,
    requiresRoom: true,
    requiresRealtime: true,
    supportsSingleDevice: true,
    supportsOnlineMultiplayer: true,
    supportsCPU: false,
    supportsReconnect: true,
    status: 'ready',
    version: '1.0.0',
  },
  {
    gameId: 'behsazani_code_breakers',
    title: 'رمزگشایان بهسازان',
    titleEn: 'Code Breakers',
    description: 'کلمات تیمت را با سرنخ پیدا کن!',
    icon: '🔐',
    color: '#06b6d4',
    theme: 'behsazan',
    category: 'کلمه‌ای تیمی',
    modes: ['ONLINE_MULTIPLAYER', 'SINGLE_DEVICE'] as PlayMode[],
    minPlayers: 4,
    maxPlayers: 8,
    estimatedMinutes: 12,
    requiresRoom: true,
    requiresRealtime: true,
    supportsSingleDevice: true,
    supportsOnlineMultiplayer: true,
    supportsCPU: false,
    supportsReconnect: true,
    status: 'ready',
    version: '1.0.0',
  },
  {
    gameId: 'behsazani_project_code',
    title: 'رمز پروژه',
    titleEn: 'Project Code',
    description: 'کد مخفی را با سرنخ کشف کن!',
    icon: '🗝️',
    color: '#ffd60a',
    theme: 'behsazan',
    category: 'رمزگشایی',
    modes: ['ONLINE_MULTIPLAYER', 'SINGLE_DEVICE'] as PlayMode[],
    minPlayers: 4,
    maxPlayers: 8,
    estimatedMinutes: 10,
    requiresRoom: true,
    requiresRealtime: true,
    supportsSingleDevice: true,
    supportsOnlineMultiplayer: true,
    supportsCPU: false,
    supportsReconnect: true,
    status: 'ready',
    version: '1.0.0',
  },
  {
    gameId: 'behsazani_one_word',
    title: 'یک کلمه',
    titleEn: 'One Word',
    description: 'فقط یک کلمه سرنخ بده — سرنخ‌های تکراری حذف می‌شن!',
    icon: '💬',
    color: '#22c55e',
    theme: 'behsazan',
    category: 'خلاقیت',
    modes: ['ONLINE_MULTIPLAYER', 'SINGLE_DEVICE'] as PlayMode[],
    minPlayers: 3,
    maxPlayers: 8,
    estimatedMinutes: 8,
    requiresRoom: true,
    requiresRealtime: true,
    supportsSingleDevice: true,
    supportsOnlineMultiplayer: true,
    supportsCPU: false,
    supportsReconnect: true,
    status: 'ready',
    version: '1.0.0',
  },
  {
    gameId: 'behsazani_it_quiz',
    title: 'مسابقه بزرگ IT',
    titleEn: 'IT Quiz',
    description: 'رقابت دانش فناوری اطلاعات — آماده‌ای؟',
    icon: '💻',
    color: '#8b5cf6',
    theme: 'behsazan',
    category: 'مسابقه اطلاعاتی',
    modes: ['ONLINE_MULTIPLAYER', 'SINGLE_DEVICE'] as PlayMode[],
    minPlayers: 2,
    maxPlayers: 12,
    estimatedMinutes: 15,
    requiresRoom: true,
    requiresRealtime: true,
    supportsSingleDevice: true,
    supportsOnlineMultiplayer: true,
    supportsCPU: false,
    supportsReconnect: true,
    status: 'ready',
    version: '1.0.0',
  },
  {
    gameId: 'behsazani_hunt',
    title: 'شکار بهسازانی',
    titleEn: 'Behsazan Hunt',
    description: 'جاسازی کن یا پیدا کن — هر بازیکن دستگاه مستقل!',
    icon: '🏢',
    color: '#a855f7',
    theme: 'behsazan',
    category: 'نقش‌محور آنلاین',
    modes: ['ONLINE_MULTIPLAYER'] as PlayMode[],
    minPlayers: 4,
    maxPlayers: 12,
    estimatedMinutes: 20,
    requiresRoom: true,
    requiresRealtime: true,
    supportsSingleDevice: false,
    supportsOnlineMultiplayer: true,
    supportsCPU: false,
    supportsReconnect: true,
    status: 'improving',
    version: '1.2.0',
  },
  {
    gameId: 'behsazani_naghghashi',
    title: 'نقاش‌باشی',
    titleEn: 'Naghghash-Bashi',
    description: 'نقاش زنده بکش — بقیه حدس بزنند!',
    icon: '🖌️',
    color: '#7c3aed',
    theme: 'behsazan',
    category: 'نقاشی حدسی',
    modes: ['ONLINE_MULTIPLAYER'] as PlayMode[],
    minPlayers: 3,
    maxPlayers: 8,
    estimatedMinutes: 15,
    requiresRoom: true,
    requiresRealtime: true,
    supportsSingleDevice: false,
    supportsOnlineMultiplayer: true,
    supportsCPU: false,
    supportsReconnect: true,
    status: 'developing',
    version: '2.0.0',
  },
]

// ── Legacy BEHSAZANI_GAMES for backward compat ──────────────────────────────

export const BEHSAZANI_GAMES: BehsazaniGameDef[] = GAME_MANIFESTS.map(m => ({
  id: m.gameId,
  name: m.title,
  nameEn: m.titleEn,
  desc: m.description,
  icon: m.icon,
  color: m.color,
  minPlayers: m.minPlayers,
  maxPlayers: m.maxPlayers,
  type: m.category,
  status: m.status,
}))

export function getBehsazaniGame(id: string): BehsazaniGameDef | undefined {
  return BEHSAZANI_GAMES.find(g => g.id === id)
}

export function getGameManifest(id: string): GameCapabilityManifest | undefined {
  return GAME_MANIFESTS.find(m => m.gameId === id)
}
