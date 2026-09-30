// چشمک — نقش‌محور گروهی، بدون CPU
// Real wink game: one secret Winker, rest Players.
// Supports LOCAL (pass-device) mode.

import { useState, useEffect, useRef, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = 'WINK' | 'PLAYER'
type PlayerStatus = 'alive' | 'eliminated'
type Phase =
  | 'setup'          // entering player names
  | 'role_reveal'    // pass device, each player sees their role
  | 'game'           // main game loop
  | 'secret_action'  // private screen (wink target selection or victim notice)
  | 'accusation'     // accusation flow
  | 'result'         // game over

interface Player {
  id: string
  name: string
  role: Role
  status: PlayerStatus
  pendingElimination: boolean  // received wink, will be eliminated soon
  eliminations: number         // how many times they were the winker and successfully eliminated someone (only for winker)
}

interface Accusation {
  accuserId: string
  targetId: string
  correct: boolean
  ts: number
}

interface GameResult {
  winner: 'winker' | 'players' | null
  winkerName: string
  reason: string
  accusations: Accusation[]
  eliminations: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function randomId() { return Math.random().toString(36).slice(2,9) }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const AVATAR_EMOJIS = ['😊','🦊','🐼','🦁','🐯','🦋','🐸','🐧','🦜','🌟']

// ── Component ──────────────────────────────────────────────────────────────────
interface Props {
  localPlayerId?: string
  onExit?: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function TeamChallenge({ onExit }: Props) {
  // ── Setup state ────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('setup')
  const [nameInputs, setNameInputs] = useState<string[]>(['','','',''])
  const [players, setPlayers] = useState<Player[]>([])
  const [revealIndex, setRevealIndex] = useState(0)      // which player is currently revealing role
  const [showingRole, setShowingRole] = useState(false)  // role is visible now

  // ── Game state ─────────────────────────────────────────────────────────────
  const [winkerId, setWinkerId] = useState<string | null>(null)
  const [pendingVictimId, setPendingVictimId] = useState<string | null>(null)
  const [accusations, setAccusations] = useState<Accusation[]>([])
  const [result, setResult] = useState<GameResult | null>(null)

  // ── Secret action state ────────────────────────────────────────────────────
  const [secretActorId, setSecretActorId] = useState<string | null>(null)
  const [winkTarget, setWinkTarget] = useState<string | null>(null)
  const [winkConfirmStep, setWinkConfirmStep] = useState(false)

  // ── Accusation state ───────────────────────────────────────────────────────
  const [accuserId, setAccuserId] = useState<string | null>(null)
  const [accuseTarget, setAccuseTarget] = useState<string | null>(null)
  const [accuseConfirm, setAccuseConfirm] = useState(false)

  const eliminationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup on unmount
  useEffect(() => () => {
    if (eliminationTimerRef.current) clearTimeout(eliminationTimerRef.current)
  }, [])

  // ── Win condition checker ─────────────────────────────────────────────────
  const checkWinCondition = useCallback((currentPlayers: Player[], currentAccusations: Accusation[]): GameResult | null => {
    const alive = currentPlayers.filter(p => p.status === 'alive')
    const winker = currentPlayers.find(p => p.role === 'WINK')
    if (!winker) return null

    // Winker correctly accused → players win
    const correctAccusation = currentAccusations.find(a => a.targetId === winker.id && a.correct)
    if (correctAccusation) {
      return {
        winner: 'players',
        winkerName: winker.name,
        reason: `چشمک شناسایی شد! ${currentPlayers.find(p => p.id === correctAccusation.accuserId)?.name} درست حدس زد.`,
        accusations: currentAccusations,
        eliminations: winker.eliminations,
      }
    }

    // Winker eliminated → players win
    if (winker.status === 'eliminated') {
      return {
        winner: 'players',
        winkerName: winker.name,
        reason: 'چشمک حذف شد — بازیکنان برنده شدند!',
        accusations: currentAccusations,
        eliminations: winker.eliminations,
      }
    }

    // Only winker + 1 player left → winker wins
    const aliveNonWinker = alive.filter(p => p.role !== 'WINK')
    if (aliveNonWinker.length <= 1) {
      return {
        winner: 'winker',
        winkerName: winker.name,
        reason: `${winker.name} موفق شد! تنها بازیکن باقی‌مانده بود.`,
        accusations: currentAccusations,
        eliminations: winker.eliminations,
      }
    }

    return null
  }, [])

  // ── Setup handlers ─────────────────────────────────────────────────────────
  function addPlayer() {
    if (nameInputs.length >= 10) return
    setNameInputs(p => [...p, ''])
  }

  function removePlayer(idx: number) {
    if (nameInputs.length <= 4) return
    setNameInputs(p => p.filter((_,i) => i !== idx))
  }

  function startGame() {
    const names = nameInputs.map(n => n.trim()).filter(Boolean)
    if (names.length < 4) return

    // Assign roles: one random WINK, rest PLAYER
    const shuffledNames = shuffle(names)
    const newPlayers: Player[] = shuffledNames.map((name, i) => ({
      id: randomId(),
      name,
      role: i === 0 ? 'WINK' : 'PLAYER',
      status: 'alive',
      pendingElimination: false,
      eliminations: 0,
    }))
    // Shuffle players display order but keep role assignment
    const displayPlayers = shuffle(newPlayers)

    setPlayers(displayPlayers)
    setWinkerId(displayPlayers.find(p => p.role === 'WINK')!.id)
    setRevealIndex(0)
    setShowingRole(false)
    setPhase('role_reveal')
  }

  // ── Role reveal handlers ───────────────────────────────────────────────────
  function handleRoleRevealed() {
    setShowingRole(false)
    if (revealIndex + 1 >= players.length) {
      // All players have seen their role → start game
      setPhase('game')
    } else {
      setRevealIndex(i => i + 1)
    }
  }

  // ── Secret action ─────────────────────────────────────────────────────────
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

    // Mark pending elimination (private event — only reflected in public state after delay)
    setPendingVictimId(winkTarget)
    setPlayers(ps => ps.map(p =>
      p.id === winkTarget ? { ...p, pendingElimination: true } : p
    ))

    // Update winker's elimination count
    setPlayers(ps => ps.map(p =>
      p.id === winkerId ? { ...p, eliminations: p.eliminations + 1 } : p
    ))

    closeSecretAction()

    // After delay (2–4s), publicly eliminate the victim
    const delay = 2000 + Math.random() * 2000
    eliminationTimerRef.current = setTimeout(() => {
      setPlayers(ps => {
        const updated = ps.map(p =>
          p.id === winkTarget ? { ...p, status: 'eliminated' as PlayerStatus, pendingElimination: false } : p
        )
        const win = checkWinCondition(updated, accusations)
        if (win) {
          setResult(win)
          setPhase('result')
        }
        return updated
      })
      setPendingVictimId(null)
    }, delay)
  }

  // ── Accusation handlers ────────────────────────────────────────────────────
  function submitAccusation() {
    if (!accuserId || !accuseTarget || !winkerId) return

    const isCorrect = accuseTarget === winkerId
    const newAcc: Accusation = {
      accuserId, targetId: accuseTarget,
      correct: isCorrect,
      ts: Date.now(),
    }

    setAccusations(prev => {
      const updated = [...prev, newAcc]

      setPlayers(ps => {
        let next = ps
        if (isCorrect) {
          // Winker loses — game over
          next = ps.map(p => p.id === accuseTarget ? { ...p, status: 'eliminated' as PlayerStatus } : p)
        } else {
          // Accuser loses
          next = ps.map(p => p.id === accuserId ? { ...p, status: 'eliminated' as PlayerStatus } : p)
        }
        const win = checkWinCondition(next, updated)
        if (win) { setResult(win); setPhase('result') }
        return next
      })

      return updated
    })

    setAccuserId(null)
    setAccuseTarget(null)
    setAccuseConfirm(false)
    setPhase('game')
  }

  function resetAll() {
    if (eliminationTimerRef.current) clearTimeout(eliminationTimerRef.current)
    setPhase('setup')
    setPlayers([])
    setNameInputs(['','','',''])
    setWinkerId(null)
    setPendingVictimId(null)
    setAccusations([])
    setResult(null)
    setSecretActorId(null)
    setRevealIndex(0)
    setShowingRole(false)
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  const containerStyle: React.CSSProperties = {
    position:'fixed',inset:0,zIndex:500,
    background:'#050304',
    display:'flex',flexDirection:'column',
    overflow:'hidden',
  }

  const headerStyle: React.CSSProperties = {
    display:'flex',alignItems:'center',gap:12,
    padding:'14px 20px',
    borderBottom:'1px solid #1e1e20',
    flexShrink:0,
  }

  // ── SETUP ─────────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    const valid = nameInputs.filter(n => n.trim()).length >= 4
    return (
      <div dir="rtl" style={containerStyle}>
        <div style={headerStyle}>
          {onExit && (
            <button onClick={onExit} style={backBtn}>← خروج</button>
          )}
          <div style={{flex:1,textAlign:'center'}}>
            <p style={{color:'#fff',fontWeight:900,fontSize:16,margin:0}}>👁 چشمک</p>
            <p style={{color:'#6D6E71',fontSize:12,margin:0}}>بازی نقش‌محور گروهی</p>
          </div>
        </div>

        <div style={{flex:1,overflow:'auto',padding:'20px 20px 32px'}}>
          <p style={{color:'#9a9b9e',fontSize:13,lineHeight:1.7,marginBottom:20,textAlign:'center'}}>
            یک بازیکن مخفیانه نقش «چشمک» را دارد.<br/>
            بازیکنان باید او را شناسایی کنند.
          </p>

          <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:380,margin:'0 auto'}}>
            {nameInputs.map((name, i) => (
              <div key={i} style={{display:'flex',gap:8,alignItems:'center'}}>
                <span style={{fontSize:22,flexShrink:0}}>{AVATAR_EMOJIS[i % AVATAR_EMOJIS.length]}</span>
                <input
                  value={name}
                  onChange={e => setNameInputs(p => { const n=[...p]; n[i]=e.target.value; return n })}
                  placeholder={`بازیکن ${i+1}`}
                  dir="rtl"
                  style={{
                    flex:1,padding:'10px 14px',borderRadius:12,
                    background:'#1a1a1c',border:'1px solid #2e2e32',
                    color:'#fff',fontSize:14,outline:'none',
                  }}
                />
                {nameInputs.length > 4 && (
                  <button onClick={() => removePlayer(i)} style={{
                    background:'none',border:'none',color:'#CC2229',
                    cursor:'pointer',fontSize:18,padding:'4px',flexShrink:0,
                  }}>✕</button>
                )}
              </div>
            ))}
          </div>

          <div style={{display:'flex',gap:10,marginTop:16,maxWidth:380,margin:'16px auto 0'}}>
            {nameInputs.length < 10 && (
              <button onClick={addPlayer} style={{
                flex:1,padding:'10px',borderRadius:12,cursor:'pointer',
                background:'rgba(255,255,255,0.04)',border:'1px solid #2e2e32',
                color:'#9a9b9e',fontSize:13,fontWeight:700,
              }}>
                + افزودن بازیکن
              </button>
            )}
          </div>

          <div style={{marginTop:24,maxWidth:380,margin:'24px auto 0'}}>
            <p style={{color:'#555',fontSize:11,textAlign:'center',marginBottom:12}}>
              حداقل ۴ بازیکن · حداکثر ۱۰ بازیکن
            </p>
            <button onClick={startGame} disabled={!valid}
              style={{
                width:'100%',padding:'16px',borderRadius:18,cursor: valid ? 'pointer' : 'not-allowed',
                background: valid ? 'linear-gradient(135deg,#CC2229,#e84249)' : '#1a1a1c',
                color: valid ? '#fff' : '#555',
                fontWeight:900,fontSize:18,border:'none',
                boxShadow: valid ? '0 4px 24px #CC222955' : 'none',
                transition:'all 0.2s',
              }}>
              شروع بازی
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── ROLE REVEAL ──────────────────────────────────────────────────────────
  if (phase === 'role_reveal') {
    const currentPlayer = players[revealIndex]
    const isWinker = currentPlayer?.role === 'WINK'
    return (
      <div dir="rtl" style={{...containerStyle,alignItems:'center',justifyContent:'center',padding:24}}>
        {!showingRole ? (
          <div style={{textAlign:'center',maxWidth:360}}>
            <div style={{fontSize:64,marginBottom:16}}>📱</div>
            <h2 style={{color:'#fff',fontWeight:900,fontSize:22,margin:'0 0 8px'}}>
              گوشی را به {currentPlayer?.name} بدهید
            </h2>
            <p style={{color:'#6D6E71',fontSize:14,lineHeight:1.7,margin:'0 0 28px'}}>
              {currentPlayer?.name} عزیز، گوشی را فقط خودت نگه دار.<br/>
              بعد از دیدن نقشت روی «متوجه شدم» بزن.
            </p>
            <button onClick={() => setShowingRole(true)}
              style={{
                padding:'14px 40px',borderRadius:16,cursor:'pointer',
                background:'linear-gradient(135deg,#CC2229,#e84249)',
                color:'#fff',fontWeight:900,fontSize:16,border:'none',
                boxShadow:'0 4px 20px #CC222955',
              }}>
              نقش خود را ببین 👁
            </button>
            <p style={{color:'#444',fontSize:11,marginTop:16}}>
              بازیکن {revealIndex+1} از {players.length}
            </p>
          </div>
        ) : (
          <div style={{
            textAlign:'center',maxWidth:360,
            padding:32,borderRadius:24,
            background: isWinker ? 'rgba(204,34,41,0.1)' : 'rgba(74,222,128,0.06)',
            border:`2px solid ${isWinker ? '#CC222955' : '#4ade8033'}`,
          }}>
            <div style={{fontSize:56,marginBottom:12}}>
              {isWinker ? '👁' : '🧑'}
            </div>
            <h2 style={{color:'#fff',fontWeight:900,fontSize:20,margin:'0 0 8px'}}>
              {currentPlayer?.name}
            </h2>
            <div style={{
              padding:'10px 20px',borderRadius:12,display:'inline-block',
              margin:'8px 0 12px',
              background: isWinker ? 'rgba(204,34,41,0.2)' : 'rgba(74,222,128,0.1)',
              border:`1px solid ${isWinker ? '#CC222966' : '#4ade8044'}`,
            }}>
              <p style={{
                fontSize:22,fontWeight:900,margin:0,
                color: isWinker ? '#e84249' : '#4ade80',
              }}>
                {isWinker ? '👁 چشمک!' : '🧑 بازیکن'}
              </p>
            </div>
            <p style={{color:'#9a9b9e',fontSize:13,lineHeight:1.7,margin:'0 0 24px'}}>
              {isWinker
                ? 'تو چشمکی! مخفیانه به بازیکنان چشمک بزن\nو از شناسایی شدن فرار کن.'
                : 'تو یک بازیکن عادی هستی.\nسعی کن چشمک را پیدا کنی.'}
            </p>
            <button onClick={handleRoleRevealed}
              style={{
                padding:'12px 36px',borderRadius:14,cursor:'pointer',
                background: isWinker ? '#CC222920' : '#4ade8015',
                border:`1.5px solid ${isWinker ? '#CC2229' : '#4ade80'}`,
                color: isWinker ? '#e84249' : '#4ade80',
                fontWeight:900,fontSize:15,
              }}>
              متوجه شدم ✓
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── SECRET ACTION ────────────────────────────────────────────────────────
  if (phase === 'secret_action') {
    const actor = players.find(p => p.id === secretActorId)
    const isWinkerActor = actor?.role === 'WINK'
    const aliveTargets = players.filter(p => p.status === 'alive' && p.id !== secretActorId)

    return (
      <div dir="rtl" style={{...containerStyle,alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{textAlign:'center',maxWidth:380,width:'100%'}}>
          {!isWinkerActor ? (
            // Regular player — no secret action
            <>
              <div style={{fontSize:48,marginBottom:16}}>🕵️</div>
              <h2 style={{color:'#fff',fontWeight:900,fontSize:18,margin:'0 0 8px'}}>
                {actor?.name}
              </h2>
              <p style={{color:'#6D6E71',fontSize:14,lineHeight:1.7,margin:'0 0 24px'}}>
                تو هیچ ماموریت مخفی‌ای نداری.<br/>
                ادامه بده و چشمک را پیدا کن!
              </p>
              <button onClick={closeSecretAction} style={{
                padding:'12px 36px',borderRadius:14,cursor:'pointer',
                background:'rgba(255,255,255,0.06)',border:'1px solid #2e2e32',
                color:'#9a9b9e',fontWeight:700,fontSize:14,
              }}>
                برگشت به بازی
              </button>
            </>
          ) : !winkConfirmStep ? (
            // Wink player — target selection
            <>
              <div style={{fontSize:48,marginBottom:12}}>👁</div>
              <h2 style={{color:'#fff',fontWeight:900,fontSize:18,margin:'0 0 6px'}}>
                {actor?.name} — تو چشمکی!
              </h2>
              <p style={{color:'#9a9b9e',fontSize:13,margin:'0 0 20px'}}>
                یک بازیکن را برای چشمک انتخاب کن
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {aliveTargets.map(p => (
                  <button key={p.id} onClick={() => setWinkTarget(p.id)}
                    style={{
                      padding:'12px 16px',borderRadius:14,cursor:'pointer',
                      background: winkTarget===p.id ? 'rgba(204,34,41,0.15)' : 'rgba(255,255,255,0.04)',
                      border:`1.5px solid ${winkTarget===p.id ? '#CC2229' : '#2e2e32'}`,
                      color: winkTarget===p.id ? '#e84249' : '#c5c5c9',
                      fontWeight:700,fontSize:15,display:'flex',alignItems:'center',gap:10,
                    }}>
                    <span style={{fontSize:22}}>{AVATAR_EMOJIS[players.findIndex(x => x.id===p.id) % AVATAR_EMOJIS.length]}</span>
                    {p.name}
                  </button>
                ))}
              </div>
              <div style={{display:'flex',gap:10,marginTop:20}}>
                <button onClick={closeSecretAction} style={{
                  flex:1,padding:'10px',borderRadius:12,cursor:'pointer',
                  background:'rgba(255,255,255,0.04)',border:'1px solid #2e2e32',
                  color:'#555',fontSize:13,
                }}>
                  انصراف
                </button>
                <button onClick={() => winkTarget && setWinkConfirmStep(true)}
                  disabled={!winkTarget}
                  style={{
                    flex:2,padding:'12px',borderRadius:12,cursor: winkTarget ? 'pointer' : 'not-allowed',
                    background: winkTarget ? 'rgba(204,34,41,0.15)' : 'rgba(255,255,255,0.03)',
                    border:`1.5px solid ${winkTarget ? '#CC2229' : '#2e2e32'}`,
                    color: winkTarget ? '#e84249' : '#555',
                    fontWeight:900,fontSize:15,
                  }}>
                  👁 چشمک بزن
                </button>
              </div>
            </>
          ) : (
            // Confirm wink
            <>
              <div style={{fontSize:48,marginBottom:12}}>👁</div>
              <h2 style={{color:'#fff',fontWeight:900,fontSize:18,margin:'0 0 6px'}}>
                تأیید چشمک
              </h2>
              <p style={{color:'#9a9b9e',fontSize:14,margin:'0 0 4px'}}>
                هدف: <strong style={{color:'#e84249'}}>{players.find(p=>p.id===winkTarget)?.name}</strong>
              </p>
              <p style={{color:'#555',fontSize:12,margin:'0 0 24px'}}>
                پس از تأیید، هدف بعد از چند ثانیه از بازی خارج می‌شود.
              </p>
              <div style={{display:'flex',gap:10}}>
                <button onClick={() => setWinkConfirmStep(false)} style={{
                  flex:1,padding:'12px',borderRadius:12,cursor:'pointer',
                  background:'rgba(255,255,255,0.04)',border:'1px solid #2e2e32',
                  color:'#555',fontSize:13,
                }}>
                  بازگشت
                </button>
                <button onClick={confirmWink} style={{
                  flex:2,padding:'12px',borderRadius:12,cursor:'pointer',
                  background:'rgba(204,34,41,0.2)',border:'1.5px solid #CC2229',
                  color:'#e84249',fontWeight:900,fontSize:15,
                }}>
                  ✅ تأیید — چشمک ارسال شد
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── ACCUSATION ───────────────────────────────────────────────────────────
  if (phase === 'accusation') {
    const accuser = players.find(p => p.id === accuserId)
    const aliveSuspects = players.filter(p => p.status === 'alive' && p.id !== accuserId)

    return (
      <div dir="rtl" style={{...containerStyle,alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{textAlign:'center',maxWidth:380,width:'100%'}}>
          {!accuseConfirm ? (
            <>
              <div style={{fontSize:48,marginBottom:12}}>🔍</div>
              <h2 style={{color:'#fff',fontWeight:900,fontSize:18,margin:'0 0 6px'}}>
                {accuser?.name} متهم می‌کند
              </h2>
              <p style={{color:'#9a9b9e',fontSize:13,margin:'0 0 20px'}}>
                کدام بازیکن را به عنوان «چشمک» متهم می‌کنی؟
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {aliveSuspects.map(p => (
                  <button key={p.id} onClick={() => setAccuseTarget(p.id)}
                    style={{
                      padding:'12px 16px',borderRadius:14,cursor:'pointer',
                      background: accuseTarget===p.id ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)',
                      border:`1.5px solid ${accuseTarget===p.id ? '#fbbf24' : '#2e2e32'}`,
                      color: accuseTarget===p.id ? '#fbbf24' : '#c5c5c9',
                      fontWeight:700,fontSize:15,display:'flex',alignItems:'center',gap:10,
                    }}>
                    <span style={{fontSize:22}}>{AVATAR_EMOJIS[players.findIndex(x=>x.id===p.id) % AVATAR_EMOJIS.length]}</span>
                    {p.name}
                  </button>
                ))}
              </div>
              <div style={{display:'flex',gap:10,marginTop:20}}>
                <button onClick={() => { setPhase('game'); setAccuserId(null); setAccuseTarget(null) }} style={{
                  flex:1,padding:'10px',borderRadius:12,cursor:'pointer',
                  background:'rgba(255,255,255,0.04)',border:'1px solid #2e2e32',
                  color:'#555',fontSize:13,
                }}>
                  انصراف
                </button>
                <button onClick={() => accuseTarget && setAccuseConfirm(true)}
                  disabled={!accuseTarget}
                  style={{
                    flex:2,padding:'12px',borderRadius:12,cursor: accuseTarget ? 'pointer' : 'not-allowed',
                    background: accuseTarget ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)',
                    border:`1.5px solid ${accuseTarget ? '#fbbf24' : '#2e2e32'}`,
                    color: accuseTarget ? '#fbbf24' : '#555',
                    fontWeight:900,fontSize:15,
                  }}>
                  متهم می‌کنم
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{fontSize:48,marginBottom:12}}>⚠️</div>
              <h2 style={{color:'#fff',fontWeight:900,fontSize:18,margin:'0 0 8px'}}>
                مطمئنی؟
              </h2>
              <p style={{color:'#9a9b9e',fontSize:14,margin:'0 0 4px'}}>
                {accuser?.name} ادعا می‌کند که
              </p>
              <p style={{color:'#fbbf24',fontSize:18,fontWeight:900,margin:'0 0 8px'}}>
                «{players.find(p=>p.id===accuseTarget)?.name}» چشمک است
              </p>
              <p style={{color:'#555',fontSize:12,margin:'0 0 24px'}}>
                اگر اشتباه باشی، تو از بازی خارج می‌شوی!
              </p>
              <div style={{display:'flex',gap:10}}>
                <button onClick={() => setAccuseConfirm(false)} style={{
                  flex:1,padding:'12px',borderRadius:12,cursor:'pointer',
                  background:'rgba(255,255,255,0.04)',border:'1px solid #2e2e32',
                  color:'#555',fontSize:13,
                }}>
                  بازگشت
                </button>
                <button onClick={submitAccusation} style={{
                  flex:2,padding:'12px',borderRadius:12,cursor:'pointer',
                  background:'rgba(251,191,36,0.15)',border:'1.5px solid #fbbf24',
                  color:'#fbbf24',fontWeight:900,fontSize:15,
                }}>
                  بله، متهم می‌کنم!
                </button>
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
      <div dir="rtl" style={{...containerStyle,alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{textAlign:'center',maxWidth:380,width:'100%'}}>
          <div style={{fontSize:64,marginBottom:12}}>
            {isWinkerWin ? '👁' : '🕵️'}
          </div>
          <h2 style={{
            fontWeight:900,fontSize:24,margin:'0 0 8px',
            color: isWinkerWin ? '#e84249' : '#4ade80',
          }}>
            {isWinkerWin ? 'چشمک برنده شد!' : 'بازیکنان بردند!'}
          </h2>
          <p style={{color:'#9a9b9e',fontSize:14,lineHeight:1.7,margin:'0 0 16px'}}>
            {result.reason}
          </p>
          <div style={{
            padding:'16px',borderRadius:16,marginBottom:20,
            background:'rgba(255,255,255,0.04)',border:'1px solid #2e2e32',
            textAlign:'right',
          }}>
            <p style={{color:'#6D6E71',fontSize:12,fontWeight:700,marginBottom:8}}>چشمک: <span style={{color:'#e84249'}}>{result.winkerName}</span></p>
            <p style={{color:'#6D6E71',fontSize:12,margin:'4px 0'}}>تعداد حذف‌ها: <span style={{color:'#fff'}}>{result.eliminations}</span></p>
            <p style={{color:'#6D6E71',fontSize:12,margin:'4px 0'}}>کل اتهام‌ها: <span style={{color:'#fff'}}>{result.accusations.length}</span></p>
            {result.accusations.filter(a => a.correct).length > 0 && (
              <p style={{color:'#6D6E71',fontSize:12,margin:'4px 0'}}>اتهام درست: <span style={{color:'#4ade80'}}>✅</span></p>
            )}
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={resetAll} style={{
              flex:1,padding:'14px',borderRadius:16,cursor:'pointer',
              background:'rgba(204,34,41,0.15)',border:'1.5px solid #CC2229',
              color:'#e84249',fontWeight:900,fontSize:15,
            }}>
              🔄 بازی مجدد
            </button>
            {onExit && (
              <button onClick={onExit} style={{
                flex:1,padding:'14px',borderRadius:16,cursor:'pointer',
                background:'rgba(255,255,255,0.04)',border:'1px solid #2e2e32',
                color:'#9a9b9e',fontWeight:700,fontSize:14,
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
    <div dir="rtl" style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{flex:1}}>
          <p style={{color:'#fff',fontWeight:900,fontSize:16,margin:0}}>👁 چشمک</p>
          <p style={{color:'#6D6E71',fontSize:11,margin:0}}>
            {alive.length} بازیکن زنده · {eliminated.length} حذف‌شده
          </p>
        </div>
        <button onClick={resetAll} style={{
          background:'rgba(255,255,255,0.05)',border:'1px solid #2e2e32',
          color:'#6D6E71',borderRadius:10,padding:'6px 12px',cursor:'pointer',fontSize:12,
        }}>پایان بازی</button>
      </div>

      <div style={{flex:1,overflow:'auto',padding:'16px 20px'}}>
        {/* Player circle */}
        <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center',marginBottom:20}}>
          {players.map((p, i) => (
            <div key={p.id} style={{
              display:'flex',flexDirection:'column',alignItems:'center',gap:4,
              padding:'10px 12px',borderRadius:16,minWidth:70,
              background: p.status==='eliminated' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
              border:`1.5px solid ${p.status==='eliminated' ? '#1e1e20' : p.pendingElimination ? '#fbbf24' : '#2e2e32'}`,
              opacity: p.status==='eliminated' ? 0.4 : 1,
              transition:'all 0.3s',
            }}>
              <span style={{fontSize:30,filter: p.status==='eliminated' ? 'grayscale(1)' : 'none'}}>
                {AVATAR_EMOJIS[i % AVATAR_EMOJIS.length]}
              </span>
              <p style={{
                color: p.status==='eliminated' ? '#444' : '#fff',
                fontSize:12,fontWeight:700,margin:0,textAlign:'center',
                maxWidth:68,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
              }}>{p.name}</p>
              <span style={{
                fontSize:10,padding:'2px 6px',borderRadius:999,
                background: p.status==='eliminated' ? '#2e2e32' : '#1e1e20',
                color: p.status==='eliminated' ? '#444' : '#555',
              }}>
                {p.status==='eliminated' ? 'حذف شده' : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div style={{
          padding:'14px',borderRadius:14,marginBottom:16,textAlign:'center',
          background:'rgba(255,255,255,0.03)',border:'1px solid #2e2e32',
        }}>
          <p style={{color:'#9a9b9e',fontSize:13,margin:0,lineHeight:1.6}}>
            با دقت به رفتار بازیکنان توجه کن.<br/>
            وقتی کسی حذف شد، علت آن اعلام نمی‌شود.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {/* Secret action — for all alive players */}
          {alive.map(p => (
            <button key={p.id} onClick={() => openSecretAction(p.id)}
              style={{
                padding:'13px 16px',borderRadius:14,cursor:'pointer',
                background:'rgba(168,85,247,0.08)',border:'1px solid rgba(168,85,247,0.25)',
                color:'#c084fc',fontWeight:700,fontSize:14,textAlign:'center',
              }}>
              🔒 عملیات مخفی — {p.name}
            </button>
          ))}

          <div style={{height:1,background:'#1e1e20',margin:'4px 0'}} />

          {/* Accusation — for all alive players */}
          {alive.map(p => (
            <button key={`acc-${p.id}`} onClick={() => {
              setAccuserId(p.id); setAccuseTarget(null)
              setAccuseConfirm(false); setPhase('accusation')
            }}
              style={{
                padding:'13px 16px',borderRadius:14,cursor:'pointer',
                background:'rgba(251,191,36,0.06)',border:'1px solid rgba(251,191,36,0.2)',
                color:'#fbbf24',fontWeight:700,fontSize:14,textAlign:'center',
              }}>
              🔍 متهم می‌کنم — {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const backBtn: React.CSSProperties = {
  background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',
  color:'#9a9b9e',borderRadius:10,padding:'6px 12px',cursor:'pointer',fontSize:12,
}
