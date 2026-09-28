import { useState } from 'react'
import { loadScores, clearScores, type ScoreEntry } from '../lib/scores'
import { GAME_NAME } from '../constants'
import MobileHeader from '../components/MobileHeader'

interface Props { onClose: () => void }

const RANK_MEDAL = ['🥇', '🥈', '🥉']

/* Group score entries by gameId → each group = one game session */
function groupByGame(scores: ScoreEntry[]) {
  const map = new Map<string, ScoreEntry[]>()
  for (const s of scores) {
    if (!map.has(s.gameId)) map.set(s.gameId, [])
    map.get(s.gameId)!.push(s)
  }
  /* Each group is already sorted by rank (rank 1 = winner).
     Sort sessions newest-first by extracting timestamp from gameId "game-{ts}" */
  return Array.from(map.entries())
    .map(([id, entries]) => ({ id, entries: entries.sort((a, b) => a.rank - b.rank) }))
    .sort((a, b) => {
      const ta = parseInt(a.id.replace('game-', '')) || 0
      const tb = parseInt(b.id.replace('game-', '')) || 0
      return tb - ta
    })
}

/* Best score per person across all sessions */
function bestPerPerson(scores: ScoreEntry[]) {
  const map = new Map<string, ScoreEntry>()
  for (const s of scores) {
    const prev = map.get(s.playerName)
    if (!prev || s.score > prev.score) map.set(s.playerName, s)
  }
  return Array.from(map.values()).sort((a, b) => b.score - a.score)
}

/* Stats card: total wins per person */
function winCounts(scores: ScoreEntry[]) {
  const map = new Map<string, number>()
  for (const s of scores) {
    if (s.rank === 1) map.set(s.playerName, (map.get(s.playerName) ?? 0) + 1)
  }
  return map
}

async function shareOrCopy(text: string, setCopied: (v: boolean) => void) {
  if (navigator.share) {
    try { await navigator.share({ title: GAME_NAME, text }); return } catch { /* fallthrough */ }
  }
  await navigator.clipboard.writeText(text)
  setCopied(true)
  setTimeout(() => setCopied(false), 2500)
}

export default function HighScores({ onClose }: Props) {
  const [rawScores, setRawScores] = useState<ScoreEntry[]>(loadScores)
  const [tab, setTab] = useState<'top' | 'games'>('top')
  const [copied, setCopied] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [expandedGame, setExpandedGame] = useState<string | null>(null)

  const gameSessions = groupByGame(rawScores)
  const topPlayers = bestPerPerson(rawScores)
  const wins = winCounts(rawScores)
  const empty = rawScores.length === 0

  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); return }
    clearScores(); setRawScores([]); setConfirmClear(false)
  }

  function buildShareText() {
    const lines = topPlayers.slice(0, 5).map((s, i) =>
      `${RANK_MEDAL[i] ?? `${i + 1}.`} ${s.playerName} — ${s.score.toLocaleString('fa-IR')} امتیاز (${wins.get(s.playerName) ?? 0} قهرمانی)`
    )
    return `🏆 جدول امتیازات همکاران — ${GAME_NAME}\n\n${lines.join('\n')}\n\nبهسازان ملت | Behsazan Mellat`
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0e0e0f' }} dir="rtl">

      <MobileHeader
        title="جدول امتیازات همکاران 🏆"
        onBack={onClose}
        action={!empty ? (
          <button onClick={() => shareOrCopy(buildShareText(), setCopied)}
            className="btn-game px-3 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#CC2229,#e84249)' }}>
            {copied ? '✓ کپی' : '📤'}
          </button>
        ) : undefined}
      />

      {/* Tab bar */}
      {!empty && (
        <div className="flex gap-1 px-4 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e20' }}>
          {([['top', 'برترین همکاران'], ['games', 'سابقه بازی‌ها']] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className="btn-game flex-1 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: tab === t ? '#CC222920' : 'transparent',
                color: tab === t ? '#e84249' : '#6D6E71',
                border: `1.5px solid ${tab === t ? '#CC222955' : 'transparent'}`,
              }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {empty ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
            <div className="text-6xl">🏆</div>
            <p className="text-white font-bold text-lg">هنوز بازی‌ای ثبت نشده</p>
            <p className="text-sm text-center" style={{ color: '#6D6E71' }}>بعد از اولین بازی اینجا نمایش داده می‌شه</p>
          </div>
        ) : tab === 'top' ? (
          /* ── Top players tab ── */
          <div className="flex flex-col gap-3 max-w-lg mx-auto">
            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-2 mb-1">
              {[
                { label: 'بازی‌های ثبت‌شده', value: gameSessions.length },
                { label: 'همکاران شرکت‌کننده', value: topPlayers.length },
                { label: 'بیشترین قهرمانی', value: topPlayers.length > 0 ? (wins.get(topPlayers.sort((a,b)=>(wins.get(b.playerName)??0)-(wins.get(a.playerName)??0))[0]?.playerName) ?? 0) : 0 },
              ].map((stat, i) => (
                <div key={i} className="glass-panel rounded-2xl p-3 text-center"
                  style={{ border: '1px solid #2e2e32' }}>
                  <div className="text-xl font-black" style={{ color: '#CC2229' }}>{stat.value}</div>
                  <div className="text-xs mt-0.5 leading-4" style={{ color: '#6D6E71' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {topPlayers.map((s, i) => {
              const isTop3 = i < 3
              const winCount = wins.get(s.playerName) ?? 0
              return (
                <div key={s.playerName}
                  className="glass-panel rounded-2xl px-4 py-3.5 flex items-center gap-3 animate-slide-up"
                  style={{
                    animationDelay: `${Math.min(i, 8) * 0.06}s`,
                    border: `1.5px solid ${i === 0 ? '#ffd60a44' : i === 1 ? '#c0c0c033' : i === 2 ? '#cd7f3233' : '#CC222922'}`,
                    boxShadow: i === 0 ? '0 0 24px #ffd60a1a' : 'none',
                  }}>
                  {/* Rank */}
                  <div className="text-2xl w-8 text-center flex-shrink-0">
                    {isTop3 ? RANK_MEDAL[i] : <span className="font-black text-base" style={{ color: '#6D6E71' }}>{i + 1}</span>}
                  </div>
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-white text-sm truncate">{s.playerName}</div>
                    <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: '#6D6E71' }}>
                      <span>🏆 {winCount} قهرمانی</span>
                      <span>·</span>
                      <span>{s.totalPlayers} نفر</span>
                      <span>·</span>
                      <span>{s.date}</span>
                    </div>
                  </div>
                  {/* Best score */}
                  <div className="text-left flex-shrink-0">
                    <div className="font-display text-lg font-black"
                      style={{ color: i === 0 ? '#ffd60a' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#CC2229' }}>
                      {s.score.toLocaleString('fa-IR')}
                    </div>
                    <div className="text-xs text-left" style={{ color: '#6D6E71' }}>بهترین</div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ── Game sessions tab ── */
          <div className="flex flex-col gap-3 max-w-lg mx-auto">
            <p className="text-xs text-center mb-1" style={{ color: '#6D6E71' }}>
              جزئیات هر بازی — از جدیدترین تا قدیمی‌ترین
            </p>
            {gameSessions.map((session, si) => {
              const winner = session.entries[0]
              const isExpanded = expandedGame === session.id
              const gameNum = gameSessions.length - si
              return (
                <div key={session.id}
                  className="glass-panel rounded-2xl overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${Math.min(si, 8) * 0.06}s`, border: '1.5px solid #2e2e32' }}>
                  {/* Session header — tap to expand */}
                  <button
                    onClick={() => setExpandedGame(isExpanded ? null : session.id)}
                    className="btn-game w-full flex items-center gap-3 px-4 py-3.5 text-right"
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
                      style={{ background: '#CC222920', color: '#e84249', border: '1px solid #CC222944' }}>
                      {gameNum}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🏆</span>
                        <span className="font-black text-white text-sm truncate">{winner.playerName}</span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>
                        {winner.date} · {winner.totalPlayers} نفر شرکت کردن
                      </div>
                    </div>
                    <div className="text-left flex-shrink-0">
                      <div className="font-display text-base font-black" style={{ color: '#ffd60a' }}>
                        {winner.score.toLocaleString('fa-IR')}
                      </div>
                      <div className="text-xs" style={{ color: '#3e3e42' }}>{isExpanded ? '▲' : '▼'}</div>
                    </div>
                  </button>

                  {/* Expanded: full podium */}
                  {isExpanded && (
                    <div className="border-t px-4 pb-4 flex flex-col gap-2" style={{ borderColor: '#1e1e20' }}>
                      <p className="text-xs pt-3 mb-1 font-bold" style={{ color: '#6D6E71' }}>نتایج کامل این بازی:</p>
                      {session.entries.map((entry, ei) => (
                        <div key={entry.id} className="flex items-center gap-3 rounded-xl px-3 py-2"
                          style={{ background: ei === 0 ? '#ffd60a0d' : '#1a1a1c', border: `1px solid ${ei === 0 ? '#ffd60a33' : '#2e2e32'}` }}>
                          <span className="w-6 text-center text-base">{RANK_MEDAL[ei] ?? `${ei + 1}`}</span>
                          <span className="flex-1 text-sm font-bold text-white">{entry.playerName}</span>
                          <span className="font-display font-black text-sm"
                            style={{ color: ei === 0 ? '#ffd60a' : ei === 1 ? '#c0c0c0' : ei === 2 ? '#cd7f32' : '#9a9b9e' }}>
                            {entry.score.toLocaleString('fa-IR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {!empty && (
        <div className="glass-panel px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid #1e1e20' }}>
          <button onClick={handleClear}
            className="btn-game w-full py-2.5 rounded-xl text-sm font-bold transition-colors"
            style={{
              color: confirmClear ? '#e84249' : '#6D6E71',
              border: `1px solid ${confirmClear ? '#CC2229' : '#333'}`,
              background: confirmClear ? '#CC222911' : 'transparent',
            }}>
            {confirmClear ? '⚠️ دوباره بزن تا پاک بشه' : '🗑️ پاک کردن سوابق'}
          </button>
        </div>
      )}
    </div>
  )
}
