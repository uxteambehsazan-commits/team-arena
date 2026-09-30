// چشمک — نقش‌محور گروهی، پاس‌اند‌پلی
// Real wink game: one secret Winker, rest Players.
// Local pass-device mode only.

import { useState, useEffect, useRef, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = 'WINK' | 'PLAYER'
type PlayerStatus = 'alive' | 'eliminated'
type Phase =
  | 'setup'          // entering player names
  | 'role_reveal'    // pass device, each player sees their role privately
  | 'game'           // main game board (public view)
  | 'secret_action'  // winker privately selects wink target
  | 'accusation'     // a player formally accuses someone
  | 'result'         // game over screen

interface Player {
  id: string
  name: string
  role: Role
  status: PlayerStatus
  pendingElimination: boolean
  eliminations: number
}

interface Accusation {
  accuserId: string
  targetId: string
  correct: boolean
  ts: number
}

interface GameResult {
  winner: 'winker' | 'players'
  winkerName: string
  reason: string
  accusations: Accusation[]
  eliminations: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function randomId() { return Math.random().toString(36).slice(2, 9) }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const AVATAR_EMOJIS = ['😊','🦊','🐼','🦁','🐯','🦋','🐸','🐧','🦜','🌟']

const S = {
  container: {
    position: 'fixed', inset: 0, zIndex: 500,
    background: '#050304',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  } as React.CSSProperties,
  header: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 20px',
    borderBottom: '1px solid #1e1e20',
    flexShrink: 0,
  } as React.CSSProperties,
  backBtn: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#9a9b9e', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontSize: 12,
  } as React.CSSProperties,
  primaryBtn: (disabled = false): React.CSSProperties => ({
    width: '100%', padding: '16px', borderRadius: 18,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? '#1a1a1c' : 'linear-gradient(135deg,#CC2229,#e84249)',
    color: disabled ? '#555' : '#fff',
    fontWeight: 900, fontSize: 18, border: 'none',
    boxShadow: disabled ? 'none' : '0 4px 24px #CC222955',
    transition: 'all 0.2s',
  }),
}

// ── Component ──────────────────────────────────────────────────────────────────
interface Props {
  localPlayerId?: string
  onExit?: () => void
  [key: string]: any
}

export default function TeamChallenge({ onExit }: Props) {
  // ── Core state ─────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('setup')
  const [nameInputs, setNameInputs] = useState<string[]>(['', '', '', ''])
  const [isStarting, setIsStarting] = useState(false)

  const [players, setPlayers] = useState<Player[]>([])
  const [revealIndex, setRevealIndex] = useState(0)
  const [showingRole, setShowingRole] = useState(false)

  const [winkerId, setWinkerId] = useState<string | null>(null)
  const [pendingVictimId, setPendingVictimId] = useState<string | null>(null)
  const [accusations, setAccusations] = useState<Accusation[]>([])
  const [result, setResult] = useState<GameResult | null>(null)

  // Secret action
  const [secretActorId, setSecretActorId] = useState<string | null>(null)
  const [winkTarget, setWinkTarget] = useState<string | null>(null)
  const [winkConfirmStep, setWinkConfirmStep] = useState(false)

  // Accusation
  const [accuserId, setAccuserId] = useState<string | null>(null)
  const [accuseTarget, setAccuseTarget] = useState<string | null>(null)
  const [accuseConfirm, setAccuseConfirm] = useState(false)

  const eliminationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Win condition — reactive via useEffect ────────────────────────────────
  const checkWin = useCallback((ps: Player[], accs: Accusation[]): GameResult | null => {
    const winker = ps.find(p => p.role === 'WINK')
    if (!winker) return null

    // Correct accusation → players win
    const correctAcc = accs.find(a => a.targetId === winker.id && a.correct)
    if (correctAcc) {
      const accuserName = ps.find(p => p.id === correctAcc.accuserId)?.name ?? ''
      return {
        winner: 'players',
        winkerName: winker.name,
        reason: `${accuserName} درست حدس زد و چشمک را شناسایی کرد!`,
        accusations: accs,
        eliminations: winker.eliminations,
      }
    }

    // Winker eliminated → players win
    if (winker.status === 'eliminated') {
      return {
        winner: 'players',
        winkerName: winker.name,
        reason: 'چشمک حذف شد — بازیکنان برنده شدند!',
        accusations: accs,
        eliminations: winker.eliminations,
      }
    }

    // Only winker + ≤1 player alive → winker wins
    const aliveOthers = ps.filter(p => p.status === 'alive' && p.role !== 'WINK')
    if (aliveOthers.length <= 1) {
      return {
        winner: 'winker',
        winkerName: winker.name,
        reason: `${winker.name} موفق شد! فقط یک بازیکن دیگر باقی ماند.`,
        accusations: accs,
        eliminations: winker.eliminations,
      }
    }

    return null
  }, [])

  // Reactive win check — runs whenever players or accusations change during game
  useEffect(() => {
    if (phase === 'result' || phase === 'setup' || phase === 'role_reveal') return
    if (players.length === 0) return
    const win = checkWin(players, accusations)
    if (win) {
      setResult(win)
      setPhase('result')
    }
  }, [players, accusations, phase, checkWin])

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (eliminationTimerRef.current) clearTimeout(eliminationTimerRef.current)
  }, [])

  // ── Setup ─────────────────────────────────────────────────────────────────
  function addPlayer() {
    if (nameInputs.length >= 10) return
    setNameInputs(p => [...p, ''])
  }

  function removePlayer(idx: number) {
    if (nameInputs.length <= 4) return
    setNameInputs(p => p.filter((_, i) => i !== idx))
  }

  function startGame() {
    if (isStarting) return  // prevent double-click
    const names = nameInputs.map(n => n.trim()).filter(Boolean)
    if (names.length < 4) return

    setIsStarting(true)

    const shuffledNames = shuffle(names)
    const newPlayers: Player[] = shuffle(
      shuffledNames.map((name, i) => ({
        id: randomId(),
        name,
        role: (i === 0 ? 'WINK' : 'PLAYER') as Role,
        status: 'alive' as PlayerStatus,
        pendingElimination: false,
        eliminations: 0,
      }))
    )

    setPlayers(newPlayers)
    setWinkerId(newPlayers.find(p => p.role === 'WINK')!.id)
    setAccusations([])
    setResult(null)
    setPendingVictimId(null)
    setRevealIndex(0)
    setShowingRole(false)
    setIsStarting(false)
    setPhase('role_reveal')
  }

  // ── Role reveal ───────────────────────────────────────────────────────────
  function handleRoleRevealed() {
    setShowingRole(false)
    if (revealIndex + 1 >= players.length) {
      setPhase('game')
    } else {
      setRevealIndex(i => i + 1)
    }
  }

  // ── Secret action (wink) ──────────────────────────────────────────────────
  function openSecretAction(playerId: string) {
    setSecretActorId(playerId)
    setWinkTarget(null)
    setWinkConfirmStep(false)
    setPhase('secret_action')
  }

  function closeSecretAction() {
    setSecretActorId(null)
    setWinkTarget(null)
    setWinkConfirmStep(false)
    setPhase('game')
  }

  function confirmWink() {
    if (!winkTarget || !winkerId) return
    const target = players.find(p => p.id === winkTarget)
    if (!target || target.status !== 'alive') return
    if (pendingVictimId) return  // block double wink while one is pending

    setPendingVictimId(winkTarget)
    setPlayers(ps => ps.map(p =>
      p.id === winkTarget ? { ...p, pendingElimination: true } : p
    ))
    setPlayers(ps => ps.map(p =>
      p.id === winkerId ? { ...p, eliminations: p.eliminations + 1 } : p
    ))

    closeSecretAction()

    // Publicly eliminate after delay — win check handled by reactive useEffect
    const delay = 2000 + Math.random() * 2000
    eliminationTimerRef.current = setTimeout(() => {
      setPlayers(ps => ps.map(p =>
        p.id === winkTarget
          ? { ...p, status: 'eliminated' as PlayerStatus, pendingElimination: false }
          : p
      ))
      setPendingVictimId(null)
    }, delay)
  }

  // ── Accusation ────────────────────────────────────────────────────────────
  function submitAccusation() {
    if (!accuserId || !accuseTarget || !winkerId) return

    const isCorrect = accuseTarget === winkerId
    const newAcc: Accusation = {
      accuserId, targetId: accuseTarget,
      correct: isCorrect,
      ts: Date.now(),
    }

    // Update players based on outcome
    setPlayers(ps => ps.map(p => {
      if (isCorrect && p.id === accuseTarget) return { ...p, status: 'eliminated' as PlayerStatus }
      if (!isCorrect && p.id === accuserId) return { ...p, status: 'eliminated' as PlayerStatus }
      return p
    }))

    // Append accusation — win check handled by reactive useEffect
    setAccusations(prev => [...prev, newAcc])

    setAccuserId(null)
    setAccuseTarget(null)
    setAccuseConfirm(false)
    setPhase('game')
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function resetAll() {
    if (eliminationTimerRef.current) clearTimeout(eliminationTimerRef.current)
    setPhase('setup')
    setPlayers([])
    setNameInputs(['', '', '', ''])
    setWinkerId(null)
    setPendingVictimId(null)
    setAccusations([])
    setResult(null)
    setSecretActorId(null)
    setRevealIndex(0)
    setShowingRole(false)
    setIsStarting(false)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // ── SETUP ─────────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    const filledCount = nameInputs.filter(n => n.trim()).length
    const valid = filledCount >= 4
    return (
      <div dir="rtl" style={S.container}>
        <div style={S.header}>
          {onExit && <button onClick={onExit} style={S.backBtn}>← خروج</button>}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, margin: 0 }}>👁 چشمک</p>
            <p style={{ color: '#6D6E71', fontSize: 12, margin: 0 }}>بازی نقش‌محور گروهی</p>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 40px' }}>
          <div style={{
            padding: '14px', borderRadius: 14, marginBottom: 20,
            background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)',
            textAlign: 'center',
          }}>
            <p style={{ color: '#c084fc', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              یک نفر مخفیانه «چشمک» است و بازیکنان را یکی‌یکی حذف می‌کند.<br />
              بقیه باید او را شناسایی کنند.
            </p>
          </div>

          <p style={{ color: '#6D6E71', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
            نام بازیکنان ({filledCount}/{nameInputs.length})
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380, margin: '0 auto' }}>
            {nameInputs.map((name, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{AVATAR_EMOJIS[i % AVATAR_EMOJIS.length]}</span>
                <input
                  value={name}
                  onChange={e => setNameInputs(p => { const n = [...p]; n[i] = e.target.value; return n })}
                  placeholder={`بازیکن ${i + 1}`}
                  dir="rtl"
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 12,
                    background: '#1a1a1c', border: '1px solid #2e2e32',
                    color: '#fff', fontSize: 14, outline: 'none',
                  }}
                />
                {nameInputs.length > 4 && (
                  <button onClick={() => removePlayer(i)} style={{
                    background: 'none', border: 'none', color: '#CC2229',
                    cursor: 'pointer', fontSize: 18, padding: '4px', flexShrink: 0,
                  }}>✕</button>
                )}
              </div>
            ))}
          </div>

          {nameInputs.length < 10 && (
            <div style={{ maxWidth: 380, margin: '12px auto 0' }}>
              <button onClick={addPlayer} style={{
                width: '100%', padding: '10px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid #2e2e32',
                color: '#9a9b9e', fontSize: 13, fontWeight: 700,
              }}>
                + افزودن بازیکن
              </button>
            </div>
          )}

          <div style={{ maxWidth: 380, margin: '24px auto 0' }}>
            <p style={{ color: '#555', fontSize: 11, textAlign: 'center', marginBottom: 12 }}>
              حداقل ۴ بازیکن · حداکثر ۱۰ بازیکن
            </p>
            <button onClick={startGame} disabled={!valid || isStarting}
              style={S.primaryBtn(!valid || isStarting)}>
              {isStarting ? '⏳ در حال شروع...' : '▶ شروع بازی'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── ROLE REVEAL ───────────────────────────────────────────────────────────
  if (phase === 'role_reveal') {
    const currentPlayer = players[revealIndex]
    const isWinker = currentPlayer?.role === 'WINK'
    const isLast = revealIndex === players.length - 1

    return (
      <div dir="rtl" style={{ ...S.container, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {players.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: 999,
              background: i < revealIndex ? '#4ade80' : i === revealIndex ? '#fff' : '#2e2e32',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {!showingRole ? (
          <div style={{ textAlign: 'center', maxWidth: 340 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 999, fontSize: 40,
              background: 'rgba(168,85,247,0.1)', border: '2px solid rgba(168,85,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              📱
            </div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 22, margin: '0 0 10px' }}>
              دستگاه را به <span style={{ color: '#c084fc' }}>{currentPlayer?.name}</span> بدهید
            </h2>
            <p style={{ color: '#6D6E71', fontSize: 14, lineHeight: 1.7, margin: '0 0 28px' }}>
              {currentPlayer?.name} عزیز، صفحه را فقط خودت ببین.<br />
              بعد از دیدن نقشت دستگاه را پاس بده.
            </p>
            <button onClick={() => setShowingRole(true)}
              style={{
                padding: '14px 40px', borderRadius: 16, cursor: 'pointer',
                background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                color: '#fff', fontWeight: 900, fontSize: 16, border: 'none',
                boxShadow: '0 4px 20px rgba(168,85,247,0.4)',
              }}>
              نقش خود را ببین 👁
            </button>
            <p style={{ color: '#333', fontSize: 11, marginTop: 16 }}>
              بازیکن {revealIndex + 1} از {players.length}
            </p>
          </div>
        ) : (
          <div style={{
            textAlign: 'center', maxWidth: 340, width: '100%',
            padding: 32, borderRadius: 24,
            background: isWinker ? 'rgba(204,34,41,0.1)' : 'rgba(74,222,128,0.06)',
            border: `2px solid ${isWinker ? '#CC222960' : '#4ade8040'}`,
          }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>
              {isWinker ? '👁' : '🧑'}
            </div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 20, margin: '0 0 8px' }}>
              {currentPlayer?.name}
            </h2>
            <div style={{
              padding: '10px 24px', borderRadius: 12, display: 'inline-block',
              margin: '8px 0 16px',
              background: isWinker ? 'rgba(204,34,41,0.2)' : 'rgba(74,222,128,0.1)',
              border: `1px solid ${isWinker ? '#CC222980' : '#4ade8060'}`,
            }}>
              <p style={{
                fontSize: 22, fontWeight: 900, margin: 0,
                color: isWinker ? '#e84249' : '#4ade80',
              }}>
                {isWinker ? '👁 چشمک!' : '🧑 بازیکن'}
              </p>
            </div>
            <p style={{ color: '#9a9b9e', fontSize: 13, lineHeight: 1.7, margin: '0 0 24px' }}>
              {isWinker
                ? 'تو چشمکی! مخفیانه به بازیکنان چشمک بزن و از شناسایی فرار کن.'
                : 'تو یک بازیکن عادی هستی. به رفتار دیگران توجه کن و چشمک را پیدا کن.'}
            </p>
            <button onClick={handleRoleRevealed}
              style={{
                padding: '12px 36px', borderRadius: 14, cursor: 'pointer',
                background: isWinker ? 'rgba(204,34,41,0.2)' : 'rgba(74,222,128,0.12)',
                border: `1.5px solid ${isWinker ? '#CC2229' : '#4ade80'}`,
                color: isWinker ? '#e84249' : '#4ade80',
                fontWeight: 900, fontSize: 15,
              }}>
              {isLast ? 'شروع بازی →' : 'متوجه شدم — دستگاه را پاس بده ✓'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── SECRET ACTION (wink target selection) ─────────────────────────────────
  if (phase === 'secret_action') {
    const actor = players.find(p => p.id === secretActorId)
    const isWinkerActor = actor?.role === 'WINK'
    const aliveTargets = players.filter(p => p.status === 'alive' && p.id !== secretActorId)

    return (
      <div dir="rtl" style={{ ...S.container, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 380, width: '100%' }}>

          {!isWinkerActor ? (
            <>
              <div style={{
                width: 72, height: 72, borderRadius: 999, fontSize: 36,
                background: 'rgba(74,222,128,0.08)', border: '2px solid rgba(74,222,128,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>🧑</div>
              <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: '0 0 8px' }}>
                {actor?.name}
              </h2>
              <p style={{ color: '#4ade80', fontSize: 14, margin: '0 0 8px', fontWeight: 700 }}>
                بازیکن عادی
              </p>
              <p style={{ color: '#6D6E71', fontSize: 13, lineHeight: 1.7, margin: '0 0 28px' }}>
                هیچ عملیات مخفی‌ای نداری.<br />
                به رفتار دیگران توجه کن و چشمک را پیدا کن.
              </p>
              <button onClick={closeSecretAction} style={{
                padding: '12px 36px', borderRadius: 14, cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)', border: '1px solid #2e2e32',
                color: '#9a9b9e', fontWeight: 700, fontSize: 14,
              }}>
                برگشت به بازی
              </button>
            </>
          ) : !winkConfirmStep ? (
            <>
              <div style={{
                width: 72, height: 72, borderRadius: 999, fontSize: 36,
                background: 'rgba(204,34,41,0.1)', border: '2px solid rgba(204,34,41,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>👁</div>
              <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: '0 0 4px' }}>
                {actor?.name}
              </h2>
              <p style={{ color: '#e84249', fontSize: 13, fontWeight: 700, margin: '0 0 6px' }}>
                👁 تو چشمکی!
              </p>
              {pendingVictimId ? (
                <div style={{
                  padding: '14px', borderRadius: 14, marginBottom: 20,
                  background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
                }}>
                  <p style={{ color: '#fbbf24', fontSize: 14, margin: 0, fontWeight: 700 }}>
                    ⏳ چشمک در حال اجراست...
                  </p>
                  <p style={{ color: '#9a9b9e', fontSize: 12, margin: '4px 0 0' }}>
                    باید صبر کنی تا حذف قبلی اجرا شود.
                  </p>
                </div>
              ) : (
                <>
                  <p style={{ color: '#9a9b9e', fontSize: 13, margin: '0 0 16px' }}>
                    یک بازیکن را برای چشمک انتخاب کن
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {aliveTargets.map(p => (
                      <button key={p.id} onClick={() => setWinkTarget(p.id)}
                        style={{
                          padding: '12px 16px', borderRadius: 14, cursor: 'pointer',
                          background: winkTarget === p.id ? 'rgba(204,34,41,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1.5px solid ${winkTarget === p.id ? '#CC2229' : '#2e2e32'}`,
                          color: winkTarget === p.id ? '#e84249' : '#c5c5c9',
                          fontWeight: 700, fontSize: 15,
                          display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                        <span style={{ fontSize: 22 }}>{AVATAR_EMOJIS[players.findIndex(x => x.id === p.id) % AVATAR_EMOJIS.length]}</span>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={closeSecretAction} style={{
                  flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid #2e2e32',
                  color: '#555', fontSize: 13,
                }}>انصراف</button>
                {!pendingVictimId && (
                  <button onClick={() => winkTarget && setWinkConfirmStep(true)}
                    disabled={!winkTarget}
                    style={{
                      flex: 2, padding: '12px', borderRadius: 12,
                      cursor: winkTarget ? 'pointer' : 'not-allowed',
                      background: winkTarget ? 'rgba(204,34,41,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${winkTarget ? '#CC2229' : '#2e2e32'}`,
                      color: winkTarget ? '#e84249' : '#555',
                      fontWeight: 900, fontSize: 15,
                    }}>
                    👁 چشمک بزن
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👁</div>
              <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: '0 0 8px' }}>تأیید چشمک</h2>
              <p style={{ color: '#9a9b9e', fontSize: 14, margin: '0 0 4px' }}>
                هدف: <strong style={{ color: '#e84249' }}>{players.find(p => p.id === winkTarget)?.name}</strong>
              </p>
              <p style={{ color: '#555', fontSize: 12, margin: '0 0 24px' }}>
                بعد از تأیید، هدف ظرف چند ثانیه از بازی خارج می‌شود.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setWinkConfirmStep(false)} style={{
                  flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid #2e2e32',
                  color: '#555', fontSize: 13,
                }}>بازگشت</button>
                <button onClick={confirmWink} style={{
                  flex: 2, padding: '12px', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(204,34,41,0.2)', border: '1.5px solid #CC2229',
                  color: '#e84249', fontWeight: 900, fontSize: 15,
                }}>✅ تأیید — چشمک ارسال شد</button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── ACCUSATION ────────────────────────────────────────────────────────────
  if (phase === 'accusation') {
    const accuser = players.find(p => p.id === accuserId)
    const aliveSuspects = players.filter(p => p.status === 'alive' && p.id !== accuserId)

    return (
      <div dir="rtl" style={{ ...S.container, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 380, width: '100%' }}>
          {!accuseConfirm ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: '0 0 4px' }}>
                {accuser?.name} متهم می‌کند
              </h2>
              <p style={{ color: '#9a9b9e', fontSize: 13, margin: '0 0 6px' }}>
                کدام بازیکن را به عنوان «چشمک» متهم می‌کنی؟
              </p>
              <p style={{ color: '#CC2229', fontSize: 11, margin: '0 0 20px', fontWeight: 700 }}>
                ⚠️ اگر اشتباه باشی، خودت حذف می‌شوی!
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {aliveSuspects.map(p => (
                  <button key={p.id} onClick={() => setAccuseTarget(p.id)}
                    style={{
                      padding: '12px 16px', borderRadius: 14, cursor: 'pointer',
                      background: accuseTarget === p.id ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${accuseTarget === p.id ? '#fbbf24' : '#2e2e32'}`,
                      color: accuseTarget === p.id ? '#fbbf24' : '#c5c5c9',
                      fontWeight: 700, fontSize: 15,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                    <span style={{ fontSize: 22 }}>{AVATAR_EMOJIS[players.findIndex(x => x.id === p.id) % AVATAR_EMOJIS.length]}</span>
                    {p.name}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => { setPhase('game'); setAccuserId(null); setAccuseTarget(null) }} style={{
                  flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid #2e2e32',
                  color: '#555', fontSize: 13,
                }}>انصراف</button>
                <button onClick={() => accuseTarget && setAccuseConfirm(true)}
                  disabled={!accuseTarget}
                  style={{
                    flex: 2, padding: '12px', borderRadius: 12,
                    cursor: accuseTarget ? 'pointer' : 'not-allowed',
                    background: accuseTarget ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${accuseTarget ? '#fbbf24' : '#2e2e32'}`,
                    color: accuseTarget ? '#fbbf24' : '#555',
                    fontWeight: 900, fontSize: 15,
                  }}>متهم می‌کنم</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
              <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: '0 0 8px' }}>مطمئنی؟</h2>
              <p style={{ color: '#9a9b9e', fontSize: 14, margin: '0 0 4px' }}>
                {accuser?.name} ادعا می‌کند:
              </p>
              <p style={{ color: '#fbbf24', fontSize: 20, fontWeight: 900, margin: '0 0 8px' }}>
                «{players.find(p => p.id === accuseTarget)?.name}» چشمک است
              </p>
              <p style={{ color: '#555', fontSize: 12, margin: '0 0 24px' }}>
                اگر اشتباه باشی، خودت حذف می‌شوی!
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setAccuseConfirm(false)} style={{
                  flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid #2e2e32',
                  color: '#555', fontSize: 13,
                }}>بازگشت</button>
                <button onClick={submitAccusation} style={{
                  flex: 2, padding: '12px', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(251,191,36,0.15)', border: '1.5px solid #fbbf24',
                  color: '#fbbf24', fontWeight: 900, fontSize: 15,
                }}>بله، متهم می‌کنم!</button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const isWinkerWin = result.winner === 'winker'
    return (
      <div dir="rtl" style={{ ...S.container, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 380, width: '100%' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>
            {isWinkerWin ? '👁' : '🕵️'}
          </div>
          <h2 style={{
            fontWeight: 900, fontSize: 26, margin: '0 0 8px',
            color: isWinkerWin ? '#e84249' : '#4ade80',
          }}>
            {isWinkerWin ? 'چشمک برنده شد!' : 'بازیکنان بردند!'}
          </h2>
          <p style={{ color: '#9a9b9e', fontSize: 14, lineHeight: 1.7, margin: '0 0 20px' }}>
            {result.reason}
          </p>

          {/* Player roles revealed */}
          <div style={{
            padding: '14px 16px', borderRadius: 16, marginBottom: 16,
            background: 'rgba(255,255,255,0.04)', border: '1px solid #2e2e32',
          }}>
            <p style={{ color: '#6D6E71', fontSize: 11, fontWeight: 700, margin: '0 0 10px', textAlign: 'right' }}>
              نقش‌های بازیکنان
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {players.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 10,
                  background: p.role === 'WINK' ? 'rgba(204,34,41,0.1)' : 'rgba(255,255,255,0.03)',
                }}>
                  <span style={{ fontSize: 20 }}>{AVATAR_EMOJIS[i % AVATAR_EMOJIS.length]}</span>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, flex: 1, textAlign: 'right' }}>{p.name}</span>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 700,
                    background: p.role === 'WINK' ? 'rgba(204,34,41,0.2)' : 'rgba(74,222,128,0.1)',
                    color: p.role === 'WINK' ? '#e84249' : '#4ade80',
                    border: `1px solid ${p.role === 'WINK' ? '#CC222960' : '#4ade8040'}`,
                  }}>
                    {p.role === 'WINK' ? '👁 چشمک' : '🧑 بازیکن'}
                  </span>
                  {p.status === 'eliminated' && (
                    <span style={{ fontSize: 11, color: '#444' }}>❌</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
              <span style={{ color: '#6D6E71', fontSize: 12 }}>
                حذف توسط چشمک: <strong style={{ color: '#fff' }}>{result.eliminations}</strong>
              </span>
              <span style={{ color: '#6D6E71', fontSize: 12 }}>
                اتهام‌ها: <strong style={{ color: '#fff' }}>{result.accusations.length}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={resetAll} style={{
              flex: 1, padding: '14px', borderRadius: 16, cursor: 'pointer',
              background: 'rgba(204,34,41,0.15)', border: '1.5px solid #CC2229',
              color: '#e84249', fontWeight: 900, fontSize: 15,
            }}>
              🔄 بازی مجدد
            </button>
            {onExit && (
              <button onClick={onExit} style={{
                flex: 1, padding: '14px', borderRadius: 16, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid #2e2e32',
                color: '#9a9b9e', fontWeight: 700, fontSize: 14,
              }}>
                خروج
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── GAME (main board) ─────────────────────────────────────────────────────
  const alive = players.filter(p => p.status === 'alive')
  const eliminated = players.filter(p => p.status === 'eliminated')

  return (
    <div dir="rtl" style={S.container}>
      <div style={S.header}>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, margin: 0 }}>👁 چشمک</p>
          <p style={{ color: '#6D6E71', fontSize: 11, margin: 0 }}>
            {alive.length} بازیکن زنده
            {eliminated.length > 0 && ` · ${eliminated.length} حذف‌شده`}
            {pendingVictimId && ' · ⏳ در انتظار حذف'}
          </p>
        </div>
        <button onClick={resetAll} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid #2e2e32',
          color: '#6D6E71', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontSize: 12,
        }}>پایان بازی</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 32px' }}>

        {/* Players grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
          {players.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '10px 12px', borderRadius: 16, minWidth: 72,
              background: p.status === 'eliminated'
                ? 'rgba(255,255,255,0.02)'
                : p.pendingElimination
                  ? 'rgba(251,191,36,0.08)'
                  : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${p.status === 'eliminated'
                ? '#1e1e20'
                : p.pendingElimination ? '#fbbf2460' : '#2e2e32'}`,
              opacity: p.status === 'eliminated' ? 0.35 : 1,
              transition: 'all 0.3s',
            }}>
              <span style={{ fontSize: 28, filter: p.status === 'eliminated' ? 'grayscale(1)' : 'none' }}>
                {AVATAR_EMOJIS[i % AVATAR_EMOJIS.length]}
              </span>
              <p style={{
                color: p.status === 'eliminated' ? '#444' : '#fff',
                fontSize: 11, fontWeight: 700, margin: 0, textAlign: 'center',
                maxWidth: 68, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{p.name}</p>
              <span style={{
                fontSize: 9, padding: '1px 6px', borderRadius: 999,
                background: p.status === 'eliminated' ? '#2e2e32' : p.pendingElimination ? 'rgba(251,191,36,0.15)' : 'transparent',
                color: p.status === 'eliminated' ? '#444' : p.pendingElimination ? '#fbbf24' : 'transparent',
              }}>
                {p.status === 'eliminated' ? 'حذف شده' : p.pendingElimination ? '⏳' : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Instructions panel */}
        <div style={{
          padding: '14px', borderRadius: 14, marginBottom: 16, textAlign: 'center',
          background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)',
        }}>
          <p style={{ color: '#c084fc', fontSize: 13, margin: '0 0 4px', fontWeight: 700 }}>
            🎮 بازی در جریان است
          </p>
          <p style={{ color: '#9a9b9e', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
            هر بازیکن می‌تواند عملیات مخفی انجام دهد یا دیگران را متهم کند.
          </p>
        </div>

        {/* Accusation history */}
        {accusations.length > 0 && (
          <div style={{
            padding: '12px 14px', borderRadius: 14, marginBottom: 16,
            background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
          }}>
            <p style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700, margin: '0 0 8px' }}>
              اتهام‌های ثبت‌شده ({accusations.length})
            </p>
            {accusations.map((acc, i) => {
              const accuser = players.find(p => p.id === acc.accuserId)
              const target = players.find(p => p.id === acc.targetId)
              return (
                <p key={i} style={{ color: '#9a9b9e', fontSize: 12, margin: '3px 0' }}>
                  {accuser?.name} → {target?.name}
                  {' '}
                  <span style={{ color: acc.correct ? '#4ade80' : '#e84249' }}>
                    {acc.correct ? '✅ درست' : '❌ اشتباه'}
                  </span>
                </p>
              )
            })}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ color: '#6D6E71', fontSize: 11, fontWeight: 700, margin: '0 0 4px' }}>
            عملیات مخفی
          </p>
          {alive.map(p => (
            <button key={p.id} onClick={() => openSecretAction(p.id)}
              style={{
                padding: '11px 16px', borderRadius: 14, cursor: 'pointer',
                background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)',
                color: '#c084fc', fontWeight: 700, fontSize: 13, textAlign: 'right',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
              <span style={{ fontSize: 18 }}>{AVATAR_EMOJIS[players.findIndex(x => x.id === p.id) % AVATAR_EMOJIS.length]}</span>
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>🔒 عملیات مخفی</span>
            </button>
          ))}

          <div style={{ height: 1, background: '#1e1e20', margin: '8px 0' }} />

          <p style={{ color: '#6D6E71', fontSize: 11, fontWeight: 700, margin: '0 0 4px' }}>
            اتهام
          </p>
          {alive.map(p => (
            <button key={`acc-${p.id}`} onClick={() => {
              setAccuserId(p.id)
              setAccuseTarget(null)
              setAccuseConfirm(false)
              setPhase('accusation')
            }}
              style={{
                padding: '11px 16px', borderRadius: 14, cursor: 'pointer',
                background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.18)',
                color: '#fbbf24', fontWeight: 700, fontSize: 13, textAlign: 'right',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
              <span style={{ fontSize: 18 }}>{AVATAR_EMOJIS[players.findIndex(x => x.id === p.id) % AVATAR_EMOJIS.length]}</span>
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>🔍 متهم می‌کنم</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
