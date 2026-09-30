import { loadProfile } from './playerProfile'
import { getMissionCompletionState } from './missionCompletion'

export type UnlockStatus = 'unlocked' | 'locked'

// ── General (public arena) games — ALWAYS UNLOCKED ───────────────────────────
// These are never gated by XP / level / missions.
export const GENERAL_GAME_KEYS = new Set([
  'g-namefamily',
  'g-speed',
  'g-final',
  'g-fastest',
  'g-logic',
  'g-team',
  'g-oneword',
])

// ── Behsazani starter games — unlocked from day one ──────────────────────────
const BEHSAZANI_STARTER = new Set([
  'b-mafia',
  'b-naghghashi',
])

// ── Rule types ───────────────────────────────────────────────────────────────
export type UnlockRuleType =
  | 'level'
  | 'xp'
  | 'completed_games'
  | 'prerequisite'
  | 'all_missions_completed'

export interface GameUnlockRule {
  gameKey: string
  type: UnlockRuleType
  // type-specific params
  requiredLevel?: number
  requiredXP?: number
  requiredCompletedGames?: number
  prerequisiteGameKeys?: string[]
  unlockMessage: string
  unlockConditionLabel: string
}

export const UNLOCK_RULES: GameUnlockRule[] = [
  // ── شکار بهسازانی — ALL MISSIONS COMPLETED ────────────────────────────────
  {
    gameKey: 'b-hunt',
    type: 'all_missions_completed',
    unlockMessage: 'برای باز شدن این بازی باید همه ماموریت‌ها را تکمیل کنید',
    unlockConditionLabel: 'تکمیل همه ماموریت‌ها',
  },

  // ── Behsazani games with gamification rules ───────────────────────────────
  {
    gameKey: 'b-spy',
    type: 'completed_games',
    requiredCompletedGames: 2,
    unlockMessage: 'پس از ۲ بازی تکمیل‌شده باز می‌شود',
    unlockConditionLabel: 'تکمیل ۲ بازی',
  },
  {
    gameKey: 'b-council',
    type: 'prerequisite',
    prerequisiteGameKeys: ['b-mafia'],
    unlockMessage: 'پس از تکمیل مافیای بهسازانی باز می‌شود',
    unlockConditionLabel: 'تکمیل مافیا',
  },
  {
    gameKey: 'b-codebreak',
    type: 'level',
    requiredLevel: 4,
    unlockMessage: 'با رسیدن به سطح ۴ باز می‌شود',
    unlockConditionLabel: 'سطح ۴',
  },
  {
    gameKey: 'b-secretcode',
    type: 'xp',
    requiredXP: 500,
    unlockMessage: 'با کسب ۵۰۰ امتیاز تجربه باز می‌شود',
    unlockConditionLabel: '۵۰۰ XP',
  },
  {
    gameKey: 'b-oneword',
    type: 'level',
    requiredLevel: 2,
    unlockMessage: 'با رسیدن به سطح ۲ باز می‌شود',
    unlockConditionLabel: 'سطح ۲',
  },
  {
    gameKey: 'b-bigrace',
    type: 'level',
    requiredLevel: 5,
    unlockMessage: 'با رسیدن به سطح ۵ باز می‌شود',
    unlockConditionLabel: 'سطح ۵',
  },
  {
    gameKey: 'b-naghghashi',
    type: 'completed_games',
    requiredCompletedGames: 5,
    unlockMessage: 'پس از ۵ بازی تکمیل‌شده باز می‌شود',
    unlockConditionLabel: 'تکمیل ۵ بازی',
  },
]

// ── State shape ───────────────────────────────────────────────────────────────
export interface MissionUnlockProgress {
  completed: number
  total: number
}

export interface UnlockState {
  status: UnlockStatus
  rule?: GameUnlockRule
  progress?: number           // 0–1 for bar display
  missionProgress?: MissionUnlockProgress  // only for all_missions_completed rule
}

// ── Core evaluation ───────────────────────────────────────────────────────────
export function getUnlockState(gameKey: string): UnlockState {
  // 1. General games are always unlocked — no exceptions
  if (GENERAL_GAME_KEYS.has(gameKey)) return { status: 'unlocked' }

  // 2. Behsazani starters are always unlocked
  if (BEHSAZANI_STARTER.has(gameKey)) return { status: 'unlocked' }

  // 3. Look up rule; no rule = unlocked by default
  const rule = UNLOCK_RULES.find(r => r.gameKey === gameKey)
  if (!rule) return { status: 'unlocked' }

  // 4. Evaluate rule
  if (rule.type === 'all_missions_completed') {
    const { completed, total } = getMissionCompletionState()
    if (completed >= total) {
      return { status: 'unlocked', rule, progress: 1, missionProgress: { completed, total } }
    }
    return {
      status: 'locked',
      rule,
      progress: total > 0 ? completed / total : 0,
      missionProgress: { completed, total },
    }
  }

  const profile = loadProfile()
  const completedGameKeys: string[] = (profile as any).completedGameKeys ?? []

  if (rule.type === 'level') {
    const required = rule.requiredLevel!
    if (profile.level < required) {
      return { status: 'locked', rule, progress: Math.min(1, profile.level / required) }
    }
  }

  if (rule.type === 'xp') {
    const required = rule.requiredXP!
    if (profile.xp < required) {
      return { status: 'locked', rule, progress: Math.min(1, profile.xp / required) }
    }
  }

  if (rule.type === 'completed_games') {
    const required = rule.requiredCompletedGames!
    if (profile.matches < required) {
      return { status: 'locked', rule, progress: Math.min(1, profile.matches / required) }
    }
  }

  if (rule.type === 'prerequisite') {
    const missing = (rule.prerequisiteGameKeys ?? []).filter(k => !completedGameKeys.includes(k))
    if (missing.length > 0) {
      return { status: 'locked', rule, progress: 0 }
    }
  }

  return { status: 'unlocked', rule }
}

export function isGameUnlocked(gameKey: string): boolean {
  return getUnlockState(gameKey).status === 'unlocked'
}
