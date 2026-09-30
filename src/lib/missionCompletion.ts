import { DEFAULT_ENABLED_MISSIONS } from '../constants'

const STORAGE_KEY = 'ta_completed_mission_ids'

export function getCompletedMissionIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export function markMissionCompleted(missionId: string): void {
  const ids = getCompletedMissionIds()
  if (!ids.includes(missionId)) {
    ids.push(missionId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }
}

/** Returns { completed, total } against the canonical mission list. */
export function getMissionCompletionState(): { completed: number; total: number } {
  const total = DEFAULT_ENABLED_MISSIONS.length
  const completedIds = getCompletedMissionIds()
  const completed = DEFAULT_ENABLED_MISSIONS.filter(id => completedIds.includes(id)).length
  return { completed, total }
}

export function areAllMissionsCompleted(): boolean {
  const { completed, total } = getMissionCompletionState()
  return total > 0 && completed >= total
}
