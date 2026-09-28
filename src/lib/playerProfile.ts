// ─── PLAYER PROFILE & PROGRESSION SYSTEM ─────────────────────────────────────

import { loadScores } from './scores'

const PROFILE_KEY = 'ta_player_profile'

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type Rank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'champion'
export type FrameId = 'default' | 'bronze' | 'silver' | 'gold' | 'champion' | 'event'
export type AuraId = 'none' | 'fire' | 'champion' | 'ice' | 'galaxy'
export type AvatarState = 'idle' | 'hover' | 'selected' | 'win' | 'lose' | 'levelup' | 'streak' | 'top'
export type TitleId = 'newcomer' | 'explorer' | 'strategist' | 'veteran' | 'champion' | 'team-player' | 'game-master'

export interface TitleDef {
  id: TitleId
  label: string
  unlockCondition: (p: PlayerProfile) => boolean
  description: string
}

export const TITLES: TitleDef[] = [
  { id: 'newcomer',    label: 'تازه‌وارد',      description: 'در حال کشف آرنا',         unlockCondition: () => true },
  { id: 'explorer',   label: 'کاوشگر',          description: 'بازی‌های مختلف امتحان کن', unlockCondition: p => p.matches >= 5 },
  { id: 'strategist', label: 'استراتژیست',      description: 'نرخ برد ۶۰٪ یا بیشتر',   unlockCondition: p => p.matches >= 10 && winRate(p) >= 60 },
  { id: 'veteran',    label: 'کارکشته',          description: '۵۰ بازی انجام بده',       unlockCondition: p => p.matches >= 50 },
  { id: 'champion',   label: 'قهرمان',           description: 'رتبه قهرمان کسب کن',     unlockCondition: p => calcRank(p.wins) === 'champion' },
  { id: 'team-player',label: 'هم‌تیمی',         description: 'روح تیم‌بازی',            unlockCondition: p => p.wins >= 20 },
  { id: 'game-master', label: 'استاد بازی',      description: 'Level 15 یا بیشتر',      unlockCondition: p => p.level >= 15 },
]

export interface Achievement {
  id: string
  icon: string
  title: string
  description: string
  unlockCondition: (p: PlayerProfile) => boolean
}

export interface PlayerProfile {
  name: string
  avatarId: string        // charIdx as string
  frameId: FrameId
  auraId: AuraId
  titleId: TitleId
  level: number
  xp: number
  totalScore: number
  matches: number
  wins: number
  losses: number
  currentStreak: number
  bestStreak: number
  unlockedAchievements: string[]
}

export function getUnlockedTitles(profile: PlayerProfile): TitleDef[] {
  return TITLES.filter(t => t.unlockCondition(profile))
}

export function getActiveTitle(profile: PlayerProfile): TitleDef {
  return TITLES.find(t => t.id === profile.titleId) ?? TITLES[0]
}

// ─── XP & LEVEL MATH ─────────────────────────────────────────────────────────

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.35))
}

export function getLevelProgress(profile: PlayerProfile): { current: number; needed: number; pct: number } {
  const current = profile.xp - totalXpForLevel(profile.level)
  const needed = xpForLevel(profile.level)
  return { current: Math.max(0, current), needed, pct: Math.min(1, Math.max(0, current / needed)) }
}

function totalXpForLevel(level: number): number {
  let total = 0
  for (let l = 1; l < level; l++) total += xpForLevel(l)
  return total
}

export function xpToLevel(totalXp: number): number {
  let level = 1
  let accumulated = 0
  while (accumulated + xpForLevel(level) <= totalXp) {
    accumulated += xpForLevel(level)
    level++
  }
  return level
}

// ─── RANK ─────────────────────────────────────────────────────────────────────

export const RANK_META: Record<Rank, { label: string; icon: string; color: string; minWins: number }> = {
  bronze:   { label: 'برنز',   icon: '🥉', color: '#cd7f32', minWins: 0  },
  silver:   { label: 'نقره',   icon: '🥈', color: '#c0c0c0', minWins: 10 },
  gold:     { label: 'طلا',    icon: '🥇', color: '#ffd700', minWins: 25 },
  platinum: { label: 'پلاتین', icon: '💎', color: '#e5e4e2', minWins: 50 },
  diamond:  { label: 'الماس', icon: '🔷', color: '#b9f2ff', minWins: 100 },
  champion: { label: 'قهرمان', icon: '👑', color: '#a855f7', minWins: 200 },
}

export function calcRank(wins: number): Rank {
  const ranks = Object.entries(RANK_META).reverse() as [Rank, typeof RANK_META[Rank]][]
  for (const [rank, meta] of ranks) {
    if (wins >= meta.minWins) return rank
  }
  return 'bronze'
}

export function winRate(profile: PlayerProfile): number {
  if (profile.matches === 0) return 0
  return Math.round((profile.wins / profile.matches) * 1000) / 10
}

// ─── FRAME / AURA UNLOCK ─────────────────────────────────────────────────────

export interface UnlockRule {
  id: string
  itemType: 'frame' | 'aura'
  itemId: FrameId | AuraId
  label: string
  check: (p: PlayerProfile) => boolean
  description: string
}

export const UNLOCK_RULES: UnlockRule[] = [
  { id: 'frame-bronze',   itemType: 'frame', itemId: 'bronze',   label: 'قاب برنز',    description: '10 بازی', check: p => p.matches >= 10 },
  { id: 'frame-silver',   itemType: 'frame', itemId: 'silver',   label: 'قاب نقره',    description: 'Level 5', check: p => p.level >= 5 },
  { id: 'frame-gold',     itemType: 'frame', itemId: 'gold',     label: 'قاب طلا',     description: 'Level 10', check: p => p.level >= 10 },
  { id: 'frame-champion', itemType: 'frame', itemId: 'champion', label: 'قاب قهرمان',  description: 'Level 20', check: p => p.level >= 20 },
  { id: 'aura-fire',      itemType: 'aura',  itemId: 'fire',     label: 'هاله آتش',    description: '5 برد متوالی', check: p => p.bestStreak >= 5 },
  { id: 'aura-champion',  itemType: 'aura',  itemId: 'champion', label: 'هاله قهرمان', description: 'رتبه قهرمان', check: p => calcRank(p.wins) === 'champion' },
]

export function isUnlocked(rule: UnlockRule, profile: PlayerProfile): boolean {
  return rule.check(profile)
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-win',   icon: '🏆', title: 'اولین پیروزی',  description: 'اولین بازی را ببر',          unlockCondition: p => p.wins >= 1 },
  { id: 'streak-5',   icon: '🔥', title: 'برد متوالی',    description: '5 بازی پشت سرهم ببر',        unlockCondition: p => p.bestStreak >= 5 },
  { id: 'veteran',    icon: '⚔️', title: 'کارکشته',       description: '50 بازی انجام بده',          unlockCondition: p => p.matches >= 50 },
  { id: 'level-10',   icon: '⭐', title: 'بازیکن ارشد',   description: 'به Level 10 برس',             unlockCondition: p => p.level >= 10 },
  { id: 'champion',   icon: '👑', title: 'قهرمان',        description: 'رتبه قهرمان را کسب کن',      unlockCondition: p => calcRank(p.wins) === 'champion' },
  { id: 'winrate-70', icon: '🎯', title: 'نخبه',          description: 'نرخ برد ۷۰٪ یا بیشتر (min 20 بازی)', unlockCondition: p => p.matches >= 20 && winRate(p) >= 70 },
  { id: 'matches-10', icon: '🎮', title: 'شروع‌گر',       description: '10 بازی انجام بده',          unlockCondition: p => p.matches >= 10 },
  { id: 'score-1k',   icon: '💯', title: 'هزاری',         description: '1000 امتیاز کسب کن',         unlockCondition: p => p.totalScore >= 1000 },
]

export function getUnlockedAchievements(profile: PlayerProfile): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.unlockCondition(profile))
}

// ─── PROFILE STORAGE ─────────────────────────────────────────────────────────

const DEFAULT_PROFILE: PlayerProfile = {
  name: '',
  avatarId: '0',
  frameId: 'default',
  auraId: 'none',
  titleId: 'newcomer',
  level: 1,
  xp: 0,
  totalScore: 0,
  matches: 0,
  wins: 0,
  losses: 0,
  currentStreak: 0,
  bestStreak: 0,
  unlockedAchievements: [],
}

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return buildProfileFromScores()
    const saved = JSON.parse(raw) as PlayerProfile
    return { ...DEFAULT_PROFILE, ...saved }
  } catch {
    return buildProfileFromScores()
  }
}

export function saveProfile(profile: PlayerProfile): void {
  const unlocked = ACHIEVEMENTS.filter(a => a.unlockCondition(profile)).map(a => a.id)
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, unlockedAchievements: unlocked }))
}

function buildProfileFromScores(): PlayerProfile {
  const scores = loadScores()
  if (scores.length === 0) return { ...DEFAULT_PROFILE }
  const totalScore = scores.reduce((s, e) => s + e.score, 0)
  const wins = scores.filter(e => e.rank === 1).length
  const matches = scores.length
  const losses = matches - wins
  const xp = Math.floor(totalScore / 10) + wins * 50 + matches * 10
  const level = xpToLevel(xp)
  const profile: PlayerProfile = {
    ...DEFAULT_PROFILE,
    totalScore,
    wins,
    losses,
    matches,
    xp,
    level,
    currentStreak: 0,
    bestStreak: 0,
  }
  return profile
}

export function addGameResult(isWin: boolean, scoreGained: number): { xpGained: number; leveledUp: boolean; newLevel: number } {
  const profile = loadProfile()
  const xpGained = isWin ? 80 + Math.floor(scoreGained / 5) : 20 + Math.floor(scoreGained / 10)
  const prevLevel = profile.level
  profile.xp += xpGained
  profile.totalScore += scoreGained
  profile.matches += 1
  if (isWin) {
    profile.wins += 1
    profile.currentStreak += 1
    if (profile.currentStreak > profile.bestStreak) profile.bestStreak = profile.currentStreak
  } else {
    profile.losses += 1
    profile.currentStreak = 0
  }
  profile.level = xpToLevel(profile.xp)
  saveProfile(profile)
  return { xpGained, leveledUp: profile.level > prevLevel, newLevel: profile.level }
}
