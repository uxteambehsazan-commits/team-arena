import { useState } from 'react'
import type { BehsazaniPlayer } from '../BehsazaniHub'

type Phase = 'role_reveal' | 'reveal_idx' | 'propose' | 'vote_team' | 'mission' | 'mission_result' | 'result'
type Role = 'loyal' | 'saboteur'

interface Props { players: BehsazaniPlayer[]; myPlayer?: BehsazaniPlayer; isHost?: boolean; isOnline?: boolean; roomCode?: string; hostPlayerId?: string; onExit: () => void }

const MISSION_SIZES: Record<number, number[]> = {
  5:  [2, 3, 2, 3, 3],
  6:  [2, 3, 4, 3, 4],
  7:  [2, 3, 3, 4, 4],
  8:  [3, 4, 4, 5, 5],
  9:  [3, 4, 4, 5, 5],
  10: [3, 4, 4, 5, 5],
}

function getSaboteurCount(n: number): number {
  if (n <= 6) return 2
  if (n <= 9) return 3
  return 4
}

export default function ProjectCouncilGame({ players, onExit }: Props) {
  const n = players.length
  const saboteurCount = getSaboteurCount(n)
  const missionSizes = MISSION_SIZES[Math.min(Math.max(n, 5), 10)] || [2, 3, 3, 4, 4]

  const [roles] = useState<Record<string, Role>>(() => {
    const saboteurs = [...players].sort(() => Math.random() - 0.5).slice(0, saboteurCount).map(p => p.id)
    const r: Record<string, Role> = {}
    players.forEach(p => { r[p.id] = saboteurs.includes(p.id) ? 'saboteur' : 'loyal' })
    return r
  })

  const [phase, setPhase] = useState<Phase>('role_reveal')
  const [revealIdx, setRevealIdx] = useState(0)
  const [showRole, setShowRole] = useState(false)
  const [missionNum, setMissionNum] = useState(0)
  const [leaderIdx, setLeaderIdx] = useState(0)
  const [proposed, setProposed] = useState<string[]>([])
  const [teamVotes, setTeamVotes] = useState<Record<string, boolean>>({})
  const [currentVoter, setCurrentVoter] = useState(0)
  const [missionVotes, setMissionVotes] = useState<Record<string, boolean>>({})
  const [currentMissionVoter, setCurrentMissionVoter] = useState(0)
  const [missionResults, setMissionResults] = useState<boolean[]>([])  // true = success
  const [consecutiveRejections, setConsecutiveRejections] = useState(0)

  const leader = players[leaderIdx % players.length]
  const missionSize = missionSizes[missionNum] || 3
  const successCount = missionResults.filter(Boolean).length
  const failCount = missionResults.filter(x => !x).length
  const winner = successCount >= 3 ? 'loyal' : failCount >= 3 ? 'saboteur' : null

  if (phase === 'role_reveal') {
    const player = players[revealIdx]
    if (!showRole) return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="text-6xl">📋</div>
        <h2 className="font-black text-white text-xl text-center">گوشی را به <span style={{ color: '#ffd60a' }}>{player.name}</span> بده</h2>
        <button onClick={() => setShowRole(true)}
          className="btn-game px-8 py-4 rounded-2xl font-black text-lg text-white"
          style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
          نمایش نقش من
        </button>
      </div>
    )
    const role = roles[player.id]
    const isSab = role === 'saboteur'
    const saboteurs = players.filter(p => roles[p.id] === 'saboteur')
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <div className="w-48 px-6 py-8 rounded-3xl flex flex-col items-center gap-3 border-2"
          style={{ background: isSab ? '#CC222922' : '#22c55e22', borderColor: isSab ? '#CC2229' : '#22c55e' }}>
          <span style={{ fontSize: 52 }}>{isSab ? '🦹' : '🤝'}</span>
          <span className="font-black text-xl text-white">{isSab ? 'خرابکار!' : 'عضو سالم'}</span>
          {isSab && (
            <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>
              خرابکاران: {saboteurs.map(p => p.name).join('، ')}
            </p>
          )}
        </div>
        <button onClick={() => {
          setShowRole(false)
          if (revealIdx + 1 < players.length) setRevealIdx(revealIdx + 1)
          else setPhase('propose')
        }}
          className="btn-game px-8 py-4 rounded-2xl font-black text-white"
          style={{ background: 'rgba(255,255,255,0.1)' }}>
          {revealIdx + 1 < players.length ? `نوبت ${players[revealIdx + 1]?.name}` : 'شروع بازی!'}
        </button>
      </div>
    )
  }

  if (phase === 'propose') return (
    <div className="h-full flex flex-col gap-4 px-6 py-6" dir="rtl">
      <div className="text-center">
        <div className="text-3xl mb-1">📋</div>
        <h2 className="font-black text-white text-lg">مأموریت {missionNum + 1} — رهبر: {leader?.name}</h2>
        <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>
          {missionSize} نفر انتخاب کن • {successCount} موفق / {failCount} شکست
        </p>
      </div>
      <div className="flex gap-1.5 flex-wrap justify-center">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-6 h-6 rounded-full"
            style={{ background: i <= successCount ? '#22c55e' : i <= successCount + failCount ? '#CC2229' : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>
      <p className="text-xs font-bold text-center" style={{ color: '#a855f7' }}>
        انتخاب {proposed.length} از {missionSize}
      </p>
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {players.map(p => {
          const sel = proposed.includes(p.id)
          return (
            <button key={p.id} onClick={() => {
              setProposed(prev => sel ? prev.filter(x => x !== p.id)
                : prev.length < missionSize ? [...prev, p.id] : prev)
            }}
              className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
              style={{ background: sel ? 'rgba(168,85,247,0.25)' : 'rgba(30,30,34,0.9)', border: `1.5px solid ${sel ? '#a855f7' : 'rgba(255,255,255,0.1)'}` }}>
              <span>👤</span><span className="flex-1 text-right">{p.name}</span>
              {sel && <span style={{ color: '#a855f7' }}>✓</span>}
            </button>
          )
        })}
      </div>
      <button disabled={proposed.length !== missionSize}
        onClick={() => { setCurrentVoter(0); setTeamVotes({}); setPhase('vote_team') }}
        className="btn-game py-3.5 rounded-2xl font-black text-white"
        style={{ background: proposed.length === missionSize ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'rgba(255,255,255,0.07)', opacity: proposed.length === missionSize ? 1 : 0.5 }}>
        پیشنهاد تیم →
      </button>
    </div>
  )

  if (phase === 'vote_team') {
    const voter = players[currentVoter]
    if (!voter) {
      const approvals = Object.values(teamVotes).filter(Boolean).length
      const majority = approvals > players.length / 2
      if (!majority) {
        const newRejections = consecutiveRejections + 1
        return (
          <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
            <div className="text-5xl">❌</div>
            <h2 className="font-black text-white text-xl text-center">تیم رد شد!</h2>
            <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>
              {approvals} موافق / {players.length - approvals} مخالف
              {newRejections >= 5 && <span style={{ color: '#CC2229' }}><br />۵ رد متوالی — مافیا برد!</span>}
            </p>
            <button onClick={() => {
              setConsecutiveRejections(newRejections)
              if (newRejections >= 5) { setPhase('result'); return }
              setLeaderIdx(i => i + 1)
              setProposed([])
              setPhase('propose')
            }}
              className="btn-game px-8 py-4 rounded-2xl font-black text-white"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              {newRejections >= 5 ? 'پایان بازی' : 'رهبر بعدی'}
            </button>
          </div>
        )
      }
      setConsecutiveRejections(0)
      setCurrentMissionVoter(0)
      setMissionVotes({})
      setPhase('mission')
      return null
    }

    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <h2 className="font-black text-white text-xl">رأی {voter.name}</h2>
        <p className="text-xs" style={{ color: '#9a9b9e' }}>آیا با این تیم موافقی؟</p>
        <div className="flex gap-2 w-full max-w-xs">
          {[true, false].map(v => (
            <button key={String(v)} onClick={() => {
              setTeamVotes(prev => ({ ...prev, [voter.id]: v }))
              setCurrentVoter(c => c + 1)
            }}
              className="btn-game flex-1 py-4 rounded-2xl font-black text-lg text-white"
              style={{ background: v ? 'rgba(34,197,94,0.25)' : 'rgba(204,34,41,0.25)', border: `1.5px solid ${v ? '#22c55e' : '#CC2229'}` }}>
              {v ? '👍 موافق' : '👎 مخالف'}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'mission') {
    const voter = proposed[currentMissionVoter]
    const voterPlayer = players.find(p => p.id === voter)
    if (!voterPlayer) {
      const fails = Object.values(missionVotes).filter(x => !x).length
      const success = fails === 0
      return (
        <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
          <div className="text-6xl">{success ? '✅' : '💣'}</div>
          <h2 className="font-black text-white text-2xl text-center">مأموریت {success ? 'موفق!' : 'شکست خورد!'}</h2>
          <p className="text-sm" style={{ color: '#9a9b9e' }}>خرابکاری: {fails} رأی</p>
          <button onClick={() => {
            const newResults = [...missionResults, success]
            setMissionResults(newResults)
            const s = newResults.filter(Boolean).length
            const f = newResults.filter(x => !x).length
            if (s >= 3 || f >= 3) setPhase('result')
            else { setMissionNum(m => m + 1); setLeaderIdx(i => i + 1); setProposed([]); setPhase('propose') }
          }}
            className="btn-game px-8 py-4 rounded-2xl font-black text-white"
            style={{ background: success ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #CC2229, #9e1a20)' }}>
            مأموریت بعدی
          </button>
        </div>
      )
    }
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <h2 className="font-black text-white text-xl">{voterPlayer.name} — مأموریت</h2>
        <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>رأی شما مخفی است</p>
        <div className="flex gap-3">
          <button onClick={() => { setMissionVotes(p => ({ ...p, [voter]: true })); setCurrentMissionVoter(c => c + 1) }}
            className="btn-game px-8 py-4 rounded-2xl font-black text-white text-lg"
            style={{ background: 'rgba(34,197,94,0.25)', border: '1.5px solid #22c55e' }}>
            ✅ موفقیت
          </button>
          <button onClick={() => { setMissionVotes(p => ({ ...p, [voter]: false })); setCurrentMissionVoter(c => c + 1) }}
            className="btn-game px-8 py-4 rounded-2xl font-black text-white text-lg"
            style={{ background: 'rgba(204,34,41,0.25)', border: '1.5px solid #CC2229' }}>
            💣 خرابکاری
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    const finalWinner = winner || (successCount >= 3 ? 'loyal' : 'saboteur')
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="text-7xl">{finalWinner === 'loyal' ? '🏆' : '💣'}</div>
        <h2 className="font-black text-white text-3xl">{finalWinner === 'loyal' ? 'تیم سالم برد!' : 'خرابکاران بردند!'}</h2>
        <div className="w-full max-w-xs flex flex-col gap-2">
          {players.map(p => {
            const isSab = roles[p.id] === 'saboteur'
            return (
              <div key={p.id} className="flex items-center justify-between px-4 py-2 rounded-xl"
                style={{ background: 'rgba(30,30,34,0.8)' }}>
                <span className="font-bold text-white text-sm">{p.name}</span>
                <span className="text-xs font-bold" style={{ color: isSab ? '#CC2229' : '#22c55e' }}>
                  {isSab ? '🦹 خرابکار' : '🤝 سالم'}
                </span>
              </div>
            )
          })}
        </div>
        <button onClick={onExit} className="btn-game px-8 py-4 rounded-2xl font-black text-white"
          style={{ background: 'rgba(255,255,255,0.1)' }}>خروج</button>
      </div>
    )
  }

  return null
}
