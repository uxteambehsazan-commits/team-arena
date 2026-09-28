// ─── DAILY / WEEKLY MISSION SYSTEM ────────────────────────────────────────────

const DAILY_KEY = 'ta_daily_missions'
const WEEKLY_KEY = 'ta_weekly_missions'

export type MissionType = 'daily' | 'weekly'
export type MissionStatus = 'active' | 'completed' | 'expired'

export interface MissionProgress {
  id: string
  progress: number
  completed: boolean
  claimedXP: boolean
  assignedAt: number // timestamp of assignment
}

export interface MissionDef {
  id: string
  type: MissionType
  icon: string
  title: string
  description: string
  target: number
  rewardXP: number
  // how to measure: game results from scores
  trackKey: 'matches' | 'wins' | 'uniqueGames' | 'teamGames' | 'streak'
}

// ─── MISSION DEFINITIONS ──────────────────────────────────────────────────────

export const DAILY_MISSIONS: MissionDef[] = [
  { id: 'd-play2',    type: 'daily', icon: '🎮', title: 'بازیکن روز',       description: 'دو بازی انجام بده',                target: 2, rewardXP: 100, trackKey: 'matches' },
  { id: 'd-win1',     type: 'daily', icon: '🏆', title: 'پیروز روز',        description: 'یک بازی ببر',                       target: 1, rewardXP: 150, trackKey: 'wins' },
  { id: 'd-explore',  type: 'daily', icon: '🧭', title: 'کاوشگر',           description: 'یک بازی جدید امتحان کن',           target: 1, rewardXP: 120, trackKey: 'uniqueGames' },
  { id: 'd-streak2',  type: 'daily', icon: '🔥', title: 'استریک آتشین',    description: 'دو برد متوالی داشته باش',          target: 2, rewardXP: 200, trackKey: 'streak' },
  { id: 'd-team',     type: 'daily', icon: '🤝', title: 'هم‌تیمی',         description: 'در یک بازی تیمی شرکت کن',         target: 1, rewardXP: 130, trackKey: 'teamGames' },
]

export const WEEKLY_MISSIONS: MissionDef[] = [
  { id: 'w-play8',    type: 'weekly', icon: '🎯', title: 'آرنا نشین',       description: '۸ بازی انجام بده',                 target: 8, rewardXP: 500, trackKey: 'matches' },
  { id: 'w-win5',     type: 'weekly', icon: '🥇', title: 'ماشین پیروزی',   description: '۵ بازی ببر',                       target: 5, rewardXP: 600, trackKey: 'wins' },
  { id: 'w-explore4', type: 'weekly', icon: '🌍', title: 'کاوشگر بازی‌ها', description: '۴ بازی متفاوت انجام بده',          target: 4, rewardXP: 700, trackKey: 'uniqueGames' },
  { id: 'w-team3',    type: 'weekly', icon: '🛡️', title: 'ستون تیم',        description: '۳ بازی تیمی انجام بده',            target: 3, rewardXP: 550, trackKey: 'teamGames' },
  { id: 'w-streak3',  type: 'weekly', icon: '⚡', title: 'سری‌باز',         description: 'استریک ۳ برد متوالی بزن',          target: 3, rewardXP: 650, trackKey: 'streak' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function weekKey(ts: number): string {
  const d = new Date(ts)
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${week}`
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────

interface StoredMissions {
  periodKey: string
  missions: MissionProgress[]
  assignedDefs: MissionDef[]
}

function loadStored(key: string): StoredMissions | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveStored(key: string, data: StoredMissions): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function freshProgress(def: MissionDef): MissionProgress {
  return { id: def.id, progress: 0, completed: false, claimedXP: false, assignedAt: Date.now() }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export interface ActiveMission {
  def: MissionDef
  progress: MissionProgress
}

export function getDailyMissions(): ActiveMission[] {
  const now = Date.now()
  const key = dayKey(now)
  const stored = loadStored(DAILY_KEY)
  if (stored && stored.periodKey === key) {
    return stored.assignedDefs.map(def => ({
      def,
      progress: stored.missions.find(m => m.id === def.id) ?? freshProgress(def),
    }))
  }
  // Assign new daily missions (pick 3 random)
  const defs = pickRandom(DAILY_MISSIONS, 3)
  const missions = defs.map(freshProgress)
  saveStored(DAILY_KEY, { periodKey: key, missions, assignedDefs: defs })
  return defs.map((def, i) => ({ def, progress: missions[i] }))
}

export function getWeeklyMissions(): ActiveMission[] {
  const now = Date.now()
  const key = weekKey(now)
  const stored = loadStored(WEEKLY_KEY)
  if (stored && stored.periodKey === key) {
    return stored.assignedDefs.map(def => ({
      def,
      progress: stored.missions.find(m => m.id === def.id) ?? freshProgress(def),
    }))
  }
  const defs = pickRandom(WEEKLY_MISSIONS, 3)
  const missions = defs.map(freshProgress)
  saveStored(WEEKLY_KEY, { periodKey: key, missions, assignedDefs: defs })
  return defs.map((def, i) => ({ def, progress: missions[i] }))
}

export function claimMissionXP(missionId: string, type: MissionType): number {
  const storageKey = type === 'daily' ? DAILY_KEY : WEEKLY_KEY
  const stored = loadStored(storageKey)
  if (!stored) return 0
  const prog = stored.missions.find(m => m.id === missionId)
  const def = stored.assignedDefs.find(d => d.id === missionId)
  if (!prog || !def || !prog.completed || prog.claimedXP) return 0
  prog.claimedXP = true
  saveStored(storageKey, stored)
  return def.rewardXP
}

// Update mission progress based on a game result
export interface GameResultForMission {
  won: boolean
  gameId: string // used for uniqueGames tracking
  isTeamGame?: boolean
  newStreak: number
}

export function updateMissionsAfterGame(result: GameResultForMission): number {
  let totalXP = 0

  function updateStore(key: string): void {
    const stored = loadStored(key)
    if (!stored) return
    let dirty = false
    for (const def of stored.assignedDefs) {
      const prog = stored.missions.find(m => m.id === def.id)
      if (!prog || prog.completed) continue
      let gained = 0
      if (def.trackKey === 'matches') gained = 1
      else if (def.trackKey === 'wins' && result.won) gained = 1
      else if (def.trackKey === 'teamGames' && result.isTeamGame) gained = 1
      else if (def.trackKey === 'streak') {
        prog.progress = result.newStreak
        if (prog.progress >= def.target && !prog.completed) {
          prog.completed = true
          totalXP += def.rewardXP
          prog.claimedXP = true
          dirty = true
        }
        dirty = true
        continue
      } else if (def.trackKey === 'uniqueGames') {
        const existing = stored.missions.find(m => m.id === def.id) as any
        const played: Set<string> = new Set(existing._playedGames ?? [])
        played.add(result.gameId)
        ;(prog as any)._playedGames = Array.from(played)
        prog.progress = played.size
        if (prog.progress >= def.target && !prog.completed) {
          prog.completed = true
          totalXP += def.rewardXP
          prog.claimedXP = true
        }
        dirty = true
        continue
      }
      if (gained > 0) {
        prog.progress = Math.min(prog.progress + gained, def.target)
        if (prog.progress >= def.target && !prog.completed) {
          prog.completed = true
          totalXP += def.rewardXP
          prog.claimedXP = true
        }
        dirty = true
      }
    }
    if (dirty) saveStored(key, stored)
  }

  updateStore(DAILY_KEY)
  updateStore(WEEKLY_KEY)
  return totalXP
}

export function completedMissionCount(): number {
  const daily = getDailyMissions()
  const weekly = getWeeklyMissions()
  return [...daily, ...weekly].filter(m => m.progress.completed).length
}
