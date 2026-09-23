export interface ScoreEntry {
  id: string
  playerName: string
  score: number
  rank: number
  totalPlayers: number
  date: string
  gameId: string
}

const KEY = 'mission256_scores'

export function saveGameScores(players: { name: string; score: number }[], gameId: string) {
  const existing = loadScores()
  const date = new Date().toLocaleDateString('fa-IR')
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const newEntries: ScoreEntry[] = sorted.map((p, i) => ({
    id: `${gameId}-${i}`,
    playerName: p.name,
    score: p.score,
    rank: i + 1,
    totalPlayers: players.length,
    date,
    gameId,
  }))
  const merged = [...newEntries, ...existing]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
  localStorage.setItem(KEY, JSON.stringify(merged))
}

export function loadScores(): ScoreEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as ScoreEntry[]
  } catch {
    return []
  }
}

export function clearScores() {
  localStorage.removeItem(KEY)
}
