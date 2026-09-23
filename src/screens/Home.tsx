import { useState, useRef, useMemo, useEffect } from 'react'
import { usePWAInstall } from '../lib/usePWAInstall'
import type { GameAction } from '../types'
import { GAME_NAME, PLAYER_COLORS } from '../constants'
import { api } from '../lib/supabase'
import type { OnlineSession } from '../App'
import MobileHeader from '../components/MobileHeader'
import { loadAdminSettings } from '../lib/adminSettings'
import { loadProfile, saveProfile } from '../lib/playerProfile'
import { MISSIONS } from '../constants'

/* ── Game artwork ── */
import { MISSION_ART } from '../lib/missionArt'
/* ── Behsazan-specific artwork ── */
import artBDesigner   from '../imports/art-b-designer.png'
import artBCouncil    from '../imports/art-b-council.png'
import artBCodebreak  from '../imports/art-b-codebreak.png'
import artBBigrace    from '../imports/art-b-bigrace.png'
import artBMafia      from '../imports/art-b-mafia.png'
import artBSecretcode from '../imports/art-b-secretcode.png'
import artBSpy        from '../imports/art-b-spy.png'
import artBOneword    from '../imports/art-b-oneword.png'

import char1  from '../imports/image-29.png'
import char2  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_2.png'
import char3  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_3.png'
import char4  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_4.png'
import char5  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_5.png'
import char6  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_6.png'
import char7  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_7.png'
import char8  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_8.png'
import char9  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_9.png'
import char10 from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_10.png'

const base    = import.meta.env.BASE_URL
const bmLogo  = `${base}imgs/bm-logo.png`
const bgImg   = `${base}imgs/Bg.jpg`
const backImg = `${base}imgs/Back.png`

/* ── Character roster ── */
const CHARS = [
  { src: char1,  name: 'ملکه',      accent: '#e84249' },
  { src: char2,  name: 'نگهبان',    accent: '#3b82f6' },
  { src: char3,  name: 'ساحره',     accent: '#a855f7' },
  { src: char4,  name: 'پزشک',      accent: '#06b6d4' },
  { src: char5,  name: 'شوالیه',    accent: '#94a3b8' },
  { src: char6,  name: 'شمشیرباز',  accent: '#f97316' },
  { src: char7,  name: 'قهرمان',    accent: '#22c55e' },
  { src: char8,  name: 'جادوگر',    accent: '#a855f7' },
  { src: char9,  name: 'پادشاه',    accent: '#ffd60a' },
  { src: char10, name: 'سرباز',     accent: '#ef4444' },
]

const MAX_MISSIONS = 4
const MISSIONS_MAP = Object.fromEntries(MISSIONS.map(m => [m.id, m]))

type GameEntry = {
  key: string
  missionId?: string          // only for general tab games
  behsazaniId?: string        // only for behsazan tab games
  soloGameId?: string         // standalone single-player games (no engine dispatch)
  name: string; desc: string
  art: string; color: string; type: string; tab: 'general' | 'behsazan'
}

const GAMES_DATA: GameEntry[] = [
  /* ── بازی‌های عمومی — هر کارت به mission engine خودش متصل است ── */
  { key: 'b-hunt',       behsazaniId: 'behsazani_hunt',                  tab: 'behsazan', color: '#a855f7', type: 'آنلاین',     art: MISSION_ART['MEMORY'],     name: 'شکار بهسازانی',          desc: 'جاسازی کن یا پیدا کن — هر بازیکن دستگاه خودش!' },
  { key: 'g-namefamily', missionId: 'NAME_FAMILY', tab: 'general',  color: '#06b6d4', type: 'همزمان',    art: MISSION_ART['NAME_FAMILY'], name: 'اسم‌فامیل سرعتی',      desc: 'اسم و فامیل با حرف مشخص، هر چه سریع‌تر!' },
  { key: 'g-speed',      missionId: 'SPEED',       tab: 'general',  color: '#f97316', type: 'سرعتی',     art: MISSION_ART['SPEED'],       name: 'حدس بزن',               desc: 'با سرعت کلمه رو از روی توضیحات حدس بزن!' },
  { key: 'g-oneword',    missionId: 'ONE_WORD',    tab: 'general',  color: '#ffd60a', type: 'همزمان',    art: MISSION_ART['ONE_WORD'],    name: 'یک کلمه، چند سرنخ',    desc: 'با یک کلمه سرنخ بده تا تیمت حدس بزنه!' },
  { key: 'g-final',      missionId: 'FINAL',       tab: 'general',  color: '#CC2229', type: 'استراتژیک', art: MISSION_ART['FINAL'],       name: 'دوز — نبرد قلمرو',      desc: 'میدان نبرد رو تصرف کن و حریف رو شکست بده!' },
  { key: 'g-logic',      missionId: 'LOGIC',       tab: 'general',  color: '#3b82f6', type: 'نوبتی',     art: MISSION_ART['LOGIC'],       name: 'کلمه ممنوعه',           desc: 'کلمه رو توضیح بده ولی از ممنوعه‌ها استفاده نکن!' },
  { key: 'g-fastest',    missionId: 'FASTEST',     tab: 'general',  color: '#ef4444', type: 'همزمان',    art: MISSION_ART['FASTEST'],     name: 'بازی سرعتی نهایی',     desc: 'سریع‌ترین انگشت رو داری؟ اثبات کن!' },
  { key: 'g-team',       missionId: 'TEAM',        tab: 'general',  color: '#22c55e', type: 'تیمی',      art: MISSION_ART['TEAM'],        name: 'چشمک',                  desc: 'با چشمک تیمت رو راهنمایی کن و امتیاز بگیر!' },
  /* ── بازی‌های آنلاین بهسازانی — هر کارت ID اختصاصی دارد ── */
  { key: 'b-mafia',      behsazaniId: 'behsazani_mafia',             tab: 'behsazan', color: '#CC2229', type: 'نقش مخفی',    art: artBMafia,      name: 'مافیای بهسازانی',      desc: 'مافیا رو پیدا کن قبل از اینکه دیر بشه!' },
  { key: 'b-spy',        behsazaniId: 'behsazani_spy',               tab: 'behsazan', color: '#3b82f6', type: 'استنتاج',     art: artBSpy,        name: 'جاسوس',                desc: 'جاسوس کیه؟ مکان رو حدس بزن قبل از شناسایی!' },
  { key: 'b-council',    behsazaniId: 'behsazani_project_council',   tab: 'behsazan', color: '#a855f7', type: 'مأموریت',     art: artBCouncil,    name: 'شورای پروژه',          desc: 'تیم درست بفرست — خرابکار نبفرست!' },
  { key: 'b-codebreak',  behsazaniId: 'behsazani_code_breakers',     tab: 'behsazan', color: '#06b6d4', type: 'کلمه‌ای تیمی', art: artBCodebreak,  name: 'رمزگشایان بهسازان',    desc: 'کلمات تیمت رو با سرنخ پیدا کن!' },
  { key: 'b-secretcode', behsazaniId: 'behsazani_project_code',      tab: 'behsazan', color: '#ffd60a', type: 'رمزگشایی',    art: artBSecretcode, name: 'رمز پروژه',            desc: 'با سرنخ‌های پنهان، کد مخفی رو پیدا کن!' },
  { key: 'b-oneword',    behsazaniId: 'behsazani_one_word',          tab: 'behsazan', color: '#22c55e', type: 'خلاقیت',      art: artBOneword,    name: 'یک کلمه',              desc: 'فقط یک کلمه سرنخ — سرنخ‌های تکراری حذف می‌شن!' },
  { key: 'b-designer',   behsazaniId: 'behsazani_anonymous_drawer',  tab: 'behsazan', color: '#f97316', type: 'نقاشی',       art: artBDesigner,   name: 'طراح ناشناس',          desc: 'نقاشی کن، بقیه حدس بزنن — طراح عوض می‌شه!' },
  { key: 'b-bigrace',    behsazaniId: 'behsazani_it_quiz',           tab: 'behsazan', color: '#8b5cf6', type: 'مسابقه',      art: artBBigrace,    name: 'مسابقه بزرگ IT',       desc: 'رقابت دانش فناوری اطلاعات — آماده‌ای؟' },
]

type Step       = 'home' | 'avatar-select' | 'name-mode' | 'game-config'
type PlayMode   = 'online' | 'join' | 'offline'
type ConfigMode = 'online' | 'local'

interface Props {
  dispatch: React.Dispatch<GameAction>
  onOnlineCreate: (session: OnlineSession) => void
  onOnlineJoin:   (session: OnlineSession, state: null) => void
  onShowScores:   () => void
  onShowCredits:  () => void
  onShowTutorial: () => void
  onShowAdmin?:   () => void
  onShowProfile?: () => void
  onBehsazaniGame?: (gameId: string, playerName: string, avatar: string, colorIndex: number) => void
  onBehsazaniJoin?: (code: string, playerName: string, avatar: string, colorIndex: number) => void
  onSoloGame?: (gameId: string) => void
}

/* ─── Glowing pedestal ─── */
function Pedestal({ accent }: { accent: string }) {
  return (
    <div style={{ position: 'relative', width: 180, height: 28, margin: '0 auto' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 90% 100% at 50% 50%, ${accent}55 0%, ${accent}18 55%, transparent 100%)`,
        borderRadius: '50%',
        animation: 'pedestalPulse 2.4s ease-in-out infinite',
        filter: 'blur(6px)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 10,
        background: `radial-gradient(ellipse at 50% 100%, ${accent}40 0%, transparent 80%)`,
        borderRadius: '50%',
      }} />
    </div>
  )
}

/* ─── Hero character display ─── */
function HeroChar({ charIdx, size = 260 }: { charIdx: number; size?: number }) {
  const ch = CHARS[charIdx]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <div style={{ animation: 'charFloat 3.5s ease-in-out infinite', willChange: 'transform' }}>
        <img
          src={ch.src} alt={ch.name}
          style={{
            width: size, height: size,
            objectFit: 'contain',
            filter: `drop-shadow(0 12px 32px ${ch.accent}55) drop-shadow(0 0 60px ${ch.accent}25)`,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      </div>
      <Pedestal accent={ch.accent} />
    </div>
  )
}

/* ─── Horizontal snap carousel ─── */
function CharCarousel({ selected, onSelect }: { selected: number; onSelect: (i: number) => void }) {
  const rowRef = useRef<HTMLDivElement>(null)
  function pick(i: number) {
    onSelect(i)
    const el = rowRef.current?.children[i] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }
  return (
    <div
      ref={rowRef}
      style={{
        display: 'flex', gap: 10, overflowX: 'auto', padding: '6px 24px',
        scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
      }}
    >
      {CHARS.map((ch, i) => {
        const sel = i === selected
        return (
          <button
            key={i}
            onClick={() => pick(i)}
            className="btn-game"
            style={{
              flexShrink: 0,
              scrollSnapAlign: 'center',
              width: 72, height: 72,
              borderRadius: 20,
              overflow: 'hidden',
              background: sel ? `${ch.accent}22` : 'rgba(26,26,28,0.7)',
              border: `2.5px solid ${sel ? ch.accent : 'rgba(255,255,255,0.08)'}`,
              boxShadow: sel ? `0 0 14px ${ch.accent}66` : 'none',
              transform: sel ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.25s',
              padding: 0,
              position: 'relative',
            }}
          >
            <img src={ch.src} alt={ch.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            {sel && (
              <div style={{
                position: 'absolute', bottom: 3, right: 3,
                width: 16, height: 16, borderRadius: '50%',
                background: ch.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 9, fontWeight: 900 }}>✓</span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ─── Mode card ─── */
function ModeCard({ icon, title, desc, selected, accent, onClick }: {
  icon: string; title: string; desc: string
  selected: boolean; accent: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="btn-game"
      style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        padding: '14px 8px',
        borderRadius: 20,
        background: selected ? `${accent}18` : 'rgba(26,26,28,0.7)',
        border: `2px solid ${selected ? accent : 'rgba(255,255,255,0.08)'}`,
        boxShadow: selected ? `0 0 18px ${accent}40, inset 0 0 12px ${accent}10` : 'none',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.22s',
        animation: 'modeCardPop 0.3s ease forwards',
      }}
    >
      <span style={{ fontSize: 28, animation: selected ? 'float 2s ease-in-out infinite' : 'none' }}>
        {icon}
      </span>
      <span style={{ fontSize: 12, fontWeight: 900, color: selected ? accent : 'rgba(255,255,255,0.75)', lineHeight: 1.2, textAlign: 'center' }}>
        {title}
      </span>
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.3 }}>
        {desc}
      </span>
    </button>
  )
}

/* ─── CTA button ─── */
function CtaBtn({ onClick, disabled, loading, children, accent = '#a855f7' }: {
  onClick: () => void; disabled?: boolean; loading?: boolean
  children: React.ReactNode; accent?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="btn-game"
      style={{
        width: '100%', padding: '17px 0',
        borderRadius: 22,
        fontWeight: 900, fontSize: 18, color: '#fff',
        background: disabled || loading
          ? 'rgba(40,40,44,0.8)'
          : `linear-gradient(135deg, ${accent}dd, ${accent})`,
        border: `2px solid ${disabled || loading ? 'rgba(255,255,255,0.07)' : accent + '88'}`,
        boxShadow: disabled || loading ? 'none' : `0 4px 28px ${accent}55`,
        animation: disabled || loading ? 'none' : 'ctaBreathePurple 2s ease-in-out infinite',
        opacity: disabled ? 0.45 : 1,
        transition: 'background 0.3s, opacity 0.3s',
      }}
    >
      {children}
    </button>
  )
}

/* ─── Castle background ─── */
function CastleBg() {
  return (
    <>
      <img src={bgImg} alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none"
        style={{ zIndex: 0, opacity: 0.22 }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 1,
        background: 'linear-gradient(to bottom, #111112ee 0%, #111112aa 30%, #111112cc 70%, #111112 100%)',
      }} />
    </>
  )
}

/* ─── Input ─── */
function FancyInput({ value, onChange, placeholder, dir = 'rtl', autoFocus = false, large = false, onEnter }: {
  value: string; onChange: (v: string) => void; placeholder: string
  dir?: string; autoFocus?: boolean; large?: boolean; onEnter?: () => void
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onEnter?.()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      maxLength={large ? 7 : 16}
      dir={dir}
      style={{
        width: '100%', boxSizing: 'border-box',
        padding: large ? '14px 16px' : '14px 18px',
        borderRadius: 16,
        fontSize: large ? 22 : 16,
        fontWeight: large ? 900 : 700,
        textAlign: large ? 'center' : 'right',
        letterSpacing: large ? '0.18em' : 0,
        color: '#fff',
        background: 'rgba(20,20,22,0.9)',
        border: `2px solid ${focused || value ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: focused ? '0 0 0 3px rgba(168,85,247,0.2), 0 2px 16px rgba(168,85,247,0.15)' : 'none',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        backdropFilter: 'blur(8px)',
        fontFamily: "'IranSans', sans-serif",
      }}
      className="placeholder:opacity-35"
    />
  )
}

/* ─── Particle dots ─── */
function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
      {[
        { top: '18%', right: '12%', delay: '0s',   dur: '5s',   size: 6 },
        { top: '32%', right: '85%', delay: '1.3s', dur: '4.5s', size: 4 },
        { top: '50%', right: '55%', delay: '2.1s', dur: '6s',   size: 5 },
        { top: '22%', right: '42%', delay: '0.7s', dur: '5.5s', size: 4 },
        { top: '40%', right: '70%', delay: '3.2s', dur: '4.8s', size: 5 },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: p.top, right: p.right,
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: '#CC2229',
          boxShadow: '0 0 8px 2px #CC222966',
          animation: `home-dot-float ${p.dur} ease-in-out infinite`,
          animationDelay: p.delay,
        }} />
      ))}
    </div>
  )
}

export default function Home({ dispatch, onOnlineCreate, onOnlineJoin, onShowScores, onShowCredits, onShowTutorial, onShowAdmin, onShowProfile, onBehsazaniGame, onBehsazaniJoin, onSoloGame }: Props) {
  const [step, setStep]             = useState<Step>('home')
  const savedProfile = useMemo(() => loadProfile(), [])
  const [charIdx, setCharIdx]       = useState(() => {
    const idx = parseInt(savedProfile.avatarId ?? '0', 10)
    return isNaN(idx) ? 0 : Math.max(0, Math.min(idx, CHARS.length - 1))
  })
  const [setupCompleted, setSetupCompleted] = useState(() => !!(loadProfile().name && loadProfile().name.trim()))
  const [displayAvatarIdx, setDisplayAvatarIdx] = useState(() => {
    const p = loadProfile()
    if (!p.name || !p.name.trim()) return -1  // new user → gray placeholder
    const idx = parseInt(p.avatarId ?? '0', 10)
    return isNaN(idx) ? 0 : Math.max(0, Math.min(idx, CHARS.length - 1))
  })
  const [colorIdx, setColorIdx]     = useState(0)
  const [name, setName]             = useState(() => savedProfile.name || '')
  const [roomCode, setRoomCode]     = useState('')
  const [playMode, setPlayMode]     = useState<PlayMode>('online')
  const [configMode, setConfigMode] = useState<ConfigMode>('online')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy')
  const [selectedGameKeys, setSelectedGameKeys] = useState<string[]>([])
  const [gameTab, setGameTab]       = useState<'general' | 'behsazan'>('behsazan')
  const [showGameSheet, setShowGameSheet] = useState(false)
  const { canInstall, triggerInstall } = usePWAInstall()

  // Refresh avatar from profile whenever we return to home step
  useEffect(() => {
    if (step === 'home') {
      const p = loadProfile()
      const hasName = !!(p.name && p.name.trim())
      if (!hasName) {
        setDisplayAvatarIdx(-1)
      } else {
        const idx = parseInt(p.avatarId ?? '0', 10)
        const safe = isNaN(idx) ? 0 : Math.max(0, Math.min(idx, CHARS.length - 1))
        setDisplayAvatarIdx(safe)
        setCharIdx(safe)
        setSetupCompleted(true)
      }
      if (p.name) setName(p.name)
    }
  }, [step])

  useEffect(() => {
    if (configMode === 'local' && gameTab === 'behsazan') {
      setGameTab('general')
    }
  }, [configMode, gameTab])

  const currentChar = CHARS[charIdx]

  function reset() { setError(''); setLoading(false) }
  function goHome() { setStep('home'); reset() }

  /* ── Mode selected from game sheet (profile already complete) ── */
  function handleModeSelect(mode: PlayMode) {
    setPlayMode(mode)
    reset()
    if (mode === 'join') {
      setStep('name-mode')  // still need room code
    } else {
      setConfigMode(mode === 'online' ? 'online' : 'local')
      setStep('game-config')
    }
  }

  function startFlow(mode: PlayMode) {
    setPlayMode(mode)
    reset()
    // If the user already has a saved name+avatar from their profile, skip selection
    if (savedProfile.name) {
      setStep('name-mode')
    } else {
      setStep('avatar-select')
    }
  }

  function toggleGame(key: string) {
    const g = GAMES_DATA.find(x => x.key === key)
    const isBehsazani = g?.tab === 'behsazan'
    setSelectedGameKeys(prev => {
      if (prev.includes(key)) return prev.length > 1 ? prev.filter(x => x !== key) : prev
      // Behsazani games: only 1 at a time (each has its own hub)
      if (isBehsazani) return [key]
      // General games: max MAX_MISSIONS, no behsazani mixed
      const generalPrev = prev.filter(k => GAMES_DATA.find(x => x.key === k)?.tab === 'general')
      if (generalPrev.length >= MAX_MISSIONS) return prev
      return [...generalPrev, key]
    })
  }

  function getSelectedMissionIds() {
    return [...new Set(
      selectedGameKeys
        .map(k => GAMES_DATA.find(g => g.key === k))
        .filter((g): g is GameEntry => !!g && !!g.missionId && !g.soloGameId)
        .map(g => g.missionId as string)
    )]
  }

  function getSelectedBehsazaniId(): string | null {
    const behsazaniKey = selectedGameKeys.find(k => {
      const g = GAMES_DATA.find(x => x.key === k)
      return g?.tab === 'behsazan' && !!g.behsazaniId
    })
    if (!behsazaniKey) return null
    return GAMES_DATA.find(g => g.key === behsazaniKey)?.behsazaniId || null
  }

  function handleCode(v: string) {
    let c = v.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (c.length > 2) c = c.slice(0, 2) + '-' + c.slice(2, 6)
    setRoomCode(c); setError('')
  }

  /* ── Avatar selected → go to name-mode keeping the pre-set playMode ── */
  function handleAvatarConfirm() {
    setStep('name-mode')
    setError('')
  }

  /* ── Name-mode CTA ── */
  async function handleCta() {
    if (!name.trim()) { setError('اسمت رو بنویس'); return }
    const avatarStr = String(charIdx)

    // Always persist name + avatar to localStorage
    saveProfile({ ...loadProfile(), name: name.trim(), avatarId: avatarStr })

    if (playMode === 'join') {
      const raw = roomCode.replace('-', '').toUpperCase()
      if (raw.length < 4) { setError('کد اتاق صحیح نیست'); return }

      // Codes starting with 'B' are Behsazani online rooms
      if (raw.startsWith('B') && raw.length === 6 && onBehsazaniJoin) {
        onBehsazaniJoin(roomCode.toUpperCase(), name.trim() || 'بازیکن', avatarStr, colorIdx)
        return
      }

      setLoading(true); setError('')
      try {
        const res = await api.joinRoom(roomCode, name.trim(), avatarStr, colorIdx) as any
        if (res.error) { setError(res.error); setLoading(false); return }
        onOnlineJoin({ code: roomCode, playerId: res.playerId, isHost: false, joinInfo: { name: name.trim(), avatar: avatarStr, colorIndex: colorIdx } }, null)
      } catch { setError('اتاق پیدا نشد یا خطای اتصال'); setLoading(false) }
      return
    }

    if (!setupCompleted) {
      // First-time setup complete → mark done, go home, then show game sheet
      setSetupCompleted(true)
      setStep('home')
      setTimeout(() => setShowGameSheet(true), 60)
      return
    }

    if (playMode === 'online') {
      setConfigMode('online')
      setStep('game-config')
      return
    }

    // offline
    setConfigMode('local')
    setStep('game-config')
  }

  /* ── Game config: create room or start offline ── */
  async function handleConfirmConfig() {
    const avatarStr = String(charIdx)

    // Solo games launch standalone — no engine dispatch needed
    const soloKey = selectedGameKeys.find(k => !!GAMES_DATA.find(g => g.key === k)?.soloGameId)
    const soloGame = soloKey ? GAMES_DATA.find(g => g.key === soloKey) : null
    if (soloGame?.soloGameId && onSoloGame) {
      onSoloGame(soloGame.soloGameId)
      return
    }

    // Behsazani games route to BehsazaniHub, not the general game engine
    const behsazaniId = getSelectedBehsazaniId()
    if (behsazaniId && onBehsazaniGame) {
      onBehsazaniGame(behsazaniId, name.trim() || 'بازیکن', avatarStr, colorIdx)
      return
    }

    const missionIds = getSelectedMissionIds()

    if (configMode === 'online') {
      setLoading(true); setError('')
      try {
        const res = await api.createRoom(name.trim(), avatarStr, colorIdx) as any
        if (res.error) { setError(res.error); setLoading(false); return }
        dispatch({ type: 'SET_ENABLED_MISSIONS', ids: missionIds })
        dispatch({ type: 'SET_DIFFICULTY', difficulty })
        dispatch({ type: 'CREATE_GAME', name: name.trim(), avatar: avatarStr, colorIndex: colorIdx })
        onOnlineCreate({ code: res.code, playerId: res.playerId, isHost: true })
      } catch { setError('خطا در اتصال به سرور'); setLoading(false) }
      return
    }

    // offline: add AI and start
    dispatch({ type: 'SET_ENABLED_MISSIONS', ids: missionIds.filter(id => { const m = MISSIONS_MAP[id]; return m && m.minPlayers <= 2 }) })
    dispatch({ type: 'SET_DIFFICULTY', difficulty })
    dispatch({ type: 'CREATE_GAME', name: name.trim(), avatar: avatarStr, colorIndex: colorIdx })
    setTimeout(() => {
      dispatch({ type: 'ADD_PLAYER', name: 'هوش مصنوعی', avatar: '7', colorIndex: 1 })
      dispatch({ type: 'START_GAME' })
    }, 50)
  }

  const displayChar = displayAvatarIdx >= 0 ? CHARS[displayAvatarIdx] : null

  /* ════════════════════════════════════════════════
     STEP 0: Main Home Screen — premium minimal
  ════════════════════════════════════════════════ */
  if (step === 'home') return (
    <div className="h-full flex flex-col relative overflow-hidden" dir="rtl">

      {/* Background */}
      <img src={bgImg} alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none"
        style={{ zIndex: 0, opacity: 0.2 }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 1,
        background: 'linear-gradient(to bottom, rgba(17,17,18,0.7) 0%, rgba(17,17,18,0.1) 30%, rgba(17,17,18,0.25) 60%, rgba(17,17,18,0.92) 80%, #111112 100%)',
      }} />

      {/* Shooting star */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
        <div style={{
          position: 'absolute', top: '10%', right: '75%', width: 110, height: 2.5, borderRadius: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,240,200,0.25) 30%, rgba(255,248,220,0.9) 75%, #fff 100%)',
          boxShadow: '0 0 6px 2px rgba(255,240,200,0.5)',
          animation: 'shooting-star 6s cubic-bezier(0.25,0.46,0.45,0.94) infinite', animationDelay: '1.5s',
        }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {[
          { top: '22%', right: '18%', delay: '0s',   dur: '5s',   size: 5 },
          { top: '35%', right: '82%', delay: '1.2s', dur: '4.5s', size: 3 },
          { top: '48%', right: '55%', delay: '2.1s', dur: '6s',   size: 5 },
          { top: '18%', right: '40%', delay: '0.8s', dur: '5.5s', size: 3 },
        ].map((p, i) => (
          <div key={i} style={{
            position: 'absolute', top: p.top, right: p.right,
            width: p.size, height: p.size, borderRadius: '50%',
            background: '#CC2229', boxShadow: '0 0 8px 2px #CC222966',
            animation: `home-dot-float ${p.dur} ease-in-out infinite`, animationDelay: p.delay,
          }} />
        ))}
      </div>

      {/* ── Header ── */}
      <div className="relative flex-shrink-0 flex items-center justify-between px-4 pt-5 pb-2" style={{ zIndex: 10 }}>
        {/* Avatar with animated aura — taps to Profile */}
        {onShowProfile ? (
          <button
            onClick={onShowProfile}
            aria-label="پروفایل بازیکن"
            className="btn-game"
            style={{ background: 'transparent', border: 'none', padding: 4, position: 'relative' }}
          >
            {displayChar ? (
              <>
                {/* Aura rings for returning user */}
                <div className="avatar-aura" style={{
                  position: 'absolute', inset: -6, borderRadius: '50%',
                  background: `radial-gradient(circle, ${displayChar.accent}50 0%, ${displayChar.accent}20 45%, transparent 70%)`,
                  animation: 'avatar-aura-pulse 3s ease-in-out infinite',
                }} />
                <div style={{
                  position: 'absolute', inset: -3, borderRadius: '50%',
                  border: `1.5px solid ${displayChar.accent}55`,
                  animation: 'avatar-aura-sweep 8s linear infinite',
                  opacity: 0.7,
                }} />
                {/* Avatar circle with char image */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
                  border: `2px solid ${displayChar.accent}cc`,
                  boxShadow: `0 0 14px ${displayChar.accent}55, 0 2px 8px rgba(0,0,0,0.4)`,
                  background: 'rgba(20,14,28,0.9)',
                  position: 'relative', zIndex: 1,
                }}>
                  <img src={displayChar.src} alt={displayChar.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              </>
            ) : (
              /* Gray placeholder for new users */
              <div style={{
                width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.18)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                background: 'rgba(80,80,92,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.38)" />
                  <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="rgba(255,255,255,0.38)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </button>
        ) : (
          <div style={{ width: 44 }} />
        )}

        {/* Logo center */}
        <img src={bmLogo} alt="بهسازان ملت" className="object-contain opacity-90"
          style={{ height: 32, maxWidth: 140, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
        />

        {/* Admin icon */}
        {onShowAdmin ? (
          <button onClick={onShowAdmin}
            aria-label="ورود مدیر"
            className="btn-game w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(10px)',
            }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </button>
        ) : (
          <div style={{ width: 40 }} />
        )}
      </div>

      {/* ── Title + hero ── */}
      <div className="relative flex-shrink-0 flex flex-col items-center w-full pt-2 pb-0" style={{ zIndex: 10 }}>
        <h1 className="font-black text-white text-center leading-tight w-full"
          style={{
            fontSize: 'clamp(1.55rem, 7.5vw, 2.2rem)',
            animation: 'title-3d-float 4s ease-in-out infinite',
            textShadow: '1px 1px 0 #8B0000,2px 2px 0 #7A0000,3px 3px 8px rgba(204,34,41,0.5),0 0 32px rgba(204,34,41,0.3)',
          }}>
          میدان هم‌تیمی‌ها
        </h1>
        <p className="text-center mt-1"
          style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 500, letterSpacing: '0.03em' }}>
          بازی‌های گروهی ویژه تیم بهسازان ملت
        </p>
      </div>

      {/* ── Character artwork (center stage) ── */}
      <div className="absolute inset-x-0 pointer-events-none flex justify-center" style={{ zIndex: 3, top: '16%', bottom: 240 }}>
        <img src={backImg} alt="" aria-hidden
          className="w-full max-w-xs object-contain object-bottom select-none h-full"
          style={{ filter: 'drop-shadow(0 -6px 40px rgba(204,34,41,0.2))' }}
        />
      </div>

      <div className="flex-1" style={{ minHeight: 0 }} />

      {/* ── CTA cluster ── */}
      <div className="relative flex-shrink-0 flex flex-col gap-3 px-5 w-full max-w-sm mx-auto"
        style={{ zIndex: 10, animation: 'home-slide-up 0.7s ease forwards', paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom))' }}>

        {/* PRIMARY: شروع بازی — single dominant CTA */}
        <div className="relative rounded-[22px] p-[2px]" style={{ overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%',
            background: 'conic-gradient(from 0deg, transparent 0deg, #CC2229 55deg, #ff6060 80deg, #ffaaaa 95deg, transparent 115deg)',
            animation: 'home-spin-border 1.8s linear infinite',
          }} />
          <button
            onClick={() => {
              if (setupCompleted) {
                setShowGameSheet(true)
              } else {
                setPlayMode('online')
                setStep('avatar-select')
              }
            }}
            className="btn-game relative w-full rounded-[20px] font-black text-white"
            style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg,#1e0305,#3a0608)',
              boxShadow: '0 6px 32px rgba(204,34,41,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
              zIndex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontSize: 20,
            }}>
            شروع بازی
          </button>
        </div>

        {/* SECONDARY row */}
        <div className="flex gap-2.5">
          <button onClick={onShowScores}
            className="btn-game flex-1 rounded-2xl font-bold text-sm"
            style={{
              padding: '13px 8px',
              background: 'rgba(255,214,10,0.08)',
              border: '1.5px solid rgba(255,214,10,0.22)',
              color: '#fde68a',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
            <span style={{ fontSize: 11 }}>جدول امتیازات</span>
          </button>
          <button onClick={onShowTutorial}
            className="btn-game flex-1 rounded-2xl font-bold text-sm text-white"
            style={{
              padding: '13px 8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(255,255,255,0.1)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>چطور بازی کنیم؟</span>
          </button>
          {canInstall && (
            <button onClick={triggerInstall}
              className="btn-game flex-1 rounded-2xl font-bold text-sm"
              style={{
                padding: '13px 8px',
                background: 'rgba(204,34,41,0.08)',
                border: '1.5px solid rgba(204,34,41,0.2)',
                color: '#e84249',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
              <span style={{ fontSize: 18 }}>📲</span>
              <span style={{ fontSize: 11 }}>نصب اپ</span>
            </button>
          )}
        </div>

        {/* Credits link */}
        <div className="flex justify-center">
          <button onClick={onShowCredits}
            className="btn-game text-xs font-bold flex items-center gap-1.5"
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.28)', padding: '4px 0' }}>
            <span style={{ fontSize: 12 }}>👥</span>
            تهیه‌کنندگان
          </button>
        </div>

        {/* Version */}
        <p className="text-center" style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em', fontFamily: 'monospace', paddingBottom: 2 }}>
          v{__APP_VERSION__}
        </p>
      </div>

      {/* ── Game mode bottom sheet ── */}
      {showGameSheet && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={() => setShowGameSheet(false)}
        >
          <div
            style={{
              width: '100%', maxWidth: 480,
              background: 'linear-gradient(160deg, #1c1024 0%, #0f0e14 100%)',
              borderRadius: '28px 28px 0 0',
              border: '1px solid rgba(255,255,255,0.09)',
              borderBottom: 'none',
              padding: '16px 20px max(32px, env(safe-area-inset-bottom))',
              animation: 'sheet-slide-up 0.32s cubic-bezier(0.16,1,0.3,1) forwards',
            }}
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 18px' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>
              نوع بازی رو انتخاب کن
            </p>

            {/* Online */}
            <button
              onClick={() => { setShowGameSheet(false); handleModeSelect('online') }}
              className="btn-game"
              style={{
                width: '100%', padding: '17px 18px', borderRadius: 20, marginBottom: 10,
                background: 'linear-gradient(135deg, rgba(168,85,247,0.22), rgba(99,102,241,0.15))',
                border: '1.5px solid rgba(168,85,247,0.4)',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                textAlign: 'right',
              }}>
              <span style={{ fontSize: 30 }}>🎮</span>
              <div>
                <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, margin: 0 }}>بازی آنلاین</p>
                <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, margin: '3px 0 0' }}>با هم‌تیمی‌ها بازی کن و رقابت کن.</p>
              </div>
            </button>

            {/* Solo */}
            <button
              onClick={() => { setShowGameSheet(false); handleModeSelect('offline') }}
              className="btn-game"
              style={{
                width: '100%', padding: '17px 18px', borderRadius: 20, marginBottom: 10,
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.08))',
                border: '1.5px solid rgba(34,197,94,0.32)',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                textAlign: 'right',
              }}>
              <span style={{ fontSize: 30 }}>🧩</span>
              <div>
                <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, margin: 0 }}>بازی تک‌نفره</p>
                <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, margin: '3px 0 0' }}>تنهایی تمرین کن، امتیاز بگیر و مهارتت را بالا ببر.</p>
              </div>
            </button>

            {/* Join with code */}
            <button
              onClick={() => { setShowGameSheet(false); handleModeSelect('join') }}
              className="btn-game"
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 18,
                background: 'rgba(255,214,10,0.07)',
                border: '1.5px solid rgba(255,214,10,0.22)',
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                textAlign: 'right',
              }}>
              <span style={{ fontSize: 22 }}>🔑</span>
              <p style={{ color: '#fde68a', fontWeight: 700, fontSize: 14, margin: 0 }}>ورود با کد اتاق</p>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  /* ════════════════════════════════════════════════
     STEP 1: Avatar Select
  ════════════════════════════════════════════════ */
  if (step === 'avatar-select') return (
    <div className="h-full flex flex-col relative overflow-hidden" dir="rtl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <CastleBg />
      <Particles />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
        <button onClick={() => setStep('home')} className="btn-game w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold text-white"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
          →
        </button>
        <img src={bmLogo} alt="بهسازان ملت" style={{ height: 34, objectFit: 'contain', opacity: 0.85 }} />
        <div className="flex gap-2">
          <button onClick={onShowCredits} className="btn-game w-9 h-9 rounded-xl flex items-center justify-center text-base"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
            👥
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 flex-shrink-0 text-center px-5 pt-4 pb-1">
        <h1 className="font-black text-white leading-tight"
          style={{ fontSize: 'clamp(1.6rem,7vw,2.2rem)', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
          {GAME_NAME}
        </h1>
        <p className="text-sm font-bold mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
          آماده‌ای؟ اول آواتارت رو انتخاب کن
        </p>
      </div>

      {/* Hero character — flex-1 to fill center */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-0 pb-2">
        <HeroChar charIdx={charIdx} size={220} />
        {/* Character name badge */}
        <div className="mt-3 px-4 py-1.5 rounded-full font-black text-sm"
          style={{
            background: `${currentChar.accent}22`,
            border: `1.5px solid ${currentChar.accent}55`,
            color: currentChar.accent,
            animation: 'fade-up 0.3s ease forwards',
          }}>
          {currentChar.name}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative z-10 flex-shrink-0 pb-3">
        <p className="text-center text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {charIdx + 1} از {CHARS.length}
        </p>
        <CharCarousel selected={charIdx} onSelect={setCharIdx} />
      </div>

      {/* CTA */}
      <div className="relative z-10 flex-shrink-0 px-5 flex flex-col gap-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <CtaBtn onClick={handleAvatarConfirm} accent={currentChar.accent}>
          انتخاب شد ✓
        </CtaBtn>
        <button onClick={onShowTutorial}
          className="btn-game w-full py-2 text-sm font-bold"
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.28)' }}>
          چطور بازی کنیم؟
        </button>
      </div>
    </div>
  )

  /* ════════════════════════════════════════════════
     STEP 2: Name + Mode
  ════════════════════════════════════════════════ */
  if (step === 'name-mode') {
    const modeAccent = playMode === 'online' ? '#a855f7' : playMode === 'join' ? '#ffd60a' : '#22c55e'
    const canProceed = name.trim().length >= 2 &&
      (playMode !== 'join' || roomCode.replace('-', '').length >= 4)

    return (
      <div className="h-full flex flex-col relative overflow-hidden" dir="rtl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <CastleBg />

        {/* Header */}
        <div className="relative z-10 flex-shrink-0">
          <MobileHeader title="انتخاب شخصیت" onBack={() => goHome()} />
        </div>

        {/* Scrollable body */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 px-5 pt-3 pb-6 max-w-md mx-auto">

            {/* Mini hero */}
            <div className="flex flex-col items-center pt-2 pb-0">
              <HeroChar charIdx={charIdx} size={160} />
              <p className="text-center font-black text-sm mt-2" style={{ color: currentChar.accent }}>
                {currentChar.name}
              </p>
              <button
                onClick={() => setStep('avatar-select')}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
                ✏️ تغییر شخصیت
              </button>
            </div>

            {/* Username */}
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>نام کاربری</p>
              <FancyInput
                value={name}
                onChange={v => { setName(v); setError('') }}
                placeholder="اسمت رو بنویس..."
                autoFocus
                onEnter={() => canProceed && handleCta()}
              />
              {name.trim().length > 0 && name.trim().length < 2 && (
                <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>حداقل ۲ حرف</p>
              )}
            </div>

            {/* Mode cards */}
            <div>
              <p className="text-xs font-bold mb-2.5" style={{ color: 'rgba(255,255,255,0.45)' }}>نوع بازی رو انتخاب کن</p>
              <div className="flex gap-2">
                <ModeCard
                  icon="🌐" title="ساخت اتاق" desc="آنلاین با دوستان"
                  selected={playMode === 'online'} accent="#a855f7"
                  onClick={() => { setPlayMode('online'); setError('') }}
                />
                <ModeCard
                  icon="🔑" title="ورود با کد" desc="پیوستن به اتاق"
                  selected={playMode === 'join'} accent="#ffd60a"
                  onClick={() => { setPlayMode('join'); setError('') }}
                />
                <ModeCard
                  icon="🎮" title="بازی تک نفره" desc="بدون اینترنت"
                  selected={playMode === 'offline'} accent="#22c55e"
                  onClick={() => { setPlayMode('offline'); setError('') }}
                />
              </div>
            </div>

            {/* Room code (join mode) */}
            {playMode === 'join' && (
              <div style={{ animation: 'slide-up 0.3s ease forwards' }}>
                <p className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>کد اتاق</p>
                <FancyInput
                  value={roomCode} onChange={handleCode}
                  placeholder="XX-XXXX" dir="ltr" large
                  onEnter={() => canProceed && handleCta()}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-center font-bold animate-slide-up" style={{ color: '#ef4444' }}>
                {error}
              </p>
            )}

            {/* CTA */}
            <CtaBtn onClick={handleCta} disabled={!canProceed} loading={loading} accent={modeAccent}>
              {loading ? '⏳ در حال اتصال...' :
               playMode === 'online'  ? '→ انتخاب بازی‌ها' :
               playMode === 'join'    ? 'ورود به اتاق →' :
                                        '→ انتخاب بازی‌ها'}
            </CtaBtn>

            {/* Extra links */}
            {canInstall && (
              <div className="flex justify-center pt-1">
                <button onClick={triggerInstall}
                  className="btn-game text-xs font-bold py-2 px-3 rounded-xl"
                  style={{ background: 'rgba(204,34,41,0.1)', border: '1px solid #CC222930', color: '#e84249' }}>
                  📲 نصب اپ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ════════════════════════════════════════════════
     STEP 3: Game Config — 16 Games, 2 Tabs
  ════════════════════════════════════════════════ */
  const adminDisabled = loadAdminSettings().disabledGames
  const tabGames  = GAMES_DATA.filter(g => {
    if (adminDisabled.includes(g.key)) return false
    if (configMode === 'local') {
      // Solo standalone games (soloGameId) are allowed regardless of tab
      if (g.soloGameId) return g.tab === gameTab
      // Other behsazan games need lobby — skip for offline mode
      if (g.tab === 'behsazan') return false
      const m = g.missionId ? MISSIONS_MAP[g.missionId] : null
      if (!m || m.minPlayers > 2) return false
    }
    return g.tab === gameTab
  })
  const canConfirm = selectedGameKeys.length >= 1

  return (
    <div className="h-full flex flex-col relative overflow-hidden" dir="rtl">
      <CastleBg />
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 2,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(168,85,247,0.12) 0%, transparent 70%)',
      }} />

      {/* ── Header ── */}
      <div className="relative z-10 flex-shrink-0 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep('name-mode')} className="btn-game w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
            →
          </button>
          <div className="text-center flex-1 px-3">
            <p className="text-xs font-bold" style={{ color: 'rgba(168,85,247,0.8)' }}>🎮 انتخاب بازی</p>
            <p className="font-black text-white text-sm leading-tight mt-0.5">یک ماجراجویی انتخاب کن!</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl px-2.5 py-1.5"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <img src={currentChar.src} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <span className="text-xs font-black text-white">{name || 'بازیکن'}</span>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="relative z-10 flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <div className="flex flex-col gap-4 px-4 pb-4 max-w-md mx-auto">

          {/* ── Category Tabs ── */}
          <div className="flex gap-2 p-1 rounded-2xl" style={{ background: 'rgba(20,20,24,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {([
              { id: 'general',  label: 'بازی‌های عمومی',    icon: '🎮' },
              ...(configMode === 'local' ? [] : [{ id: 'behsazan', label: 'بازی‌های بهسازانی', icon: '👑' }] as const),
            ] as const).map(tab => {
              const active = gameTab === tab.id
              return (
                <button key={tab.id} onClick={() => setGameTab(tab.id)}
                  className="btn-game flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm"
                  style={{
                    background: active ? 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(99,102,241,0.4))' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                    border: active ? '1px solid rgba(168,85,247,0.5)' : '1px solid transparent',
                    boxShadow: active ? '0 0 16px rgba(168,85,247,0.3)' : 'none',
                    transition: 'all 0.22s',
                  }}>
                  <span style={{ filter: active ? 'none' : 'grayscale(1) opacity(0.5)', fontSize: 16 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* ── Difficulty (local mode only) ── */}
          {configMode === 'local' && (
            <button onClick={() => setDifficulty(d => d === 'easy' ? 'hard' : 'easy')}
              className="btn-game rounded-2xl px-3 py-2 text-xs font-black"
              style={{
                background: difficulty === 'hard' ? 'rgba(204,34,41,0.2)' : 'rgba(34,197,94,0.15)',
                border: `1.5px solid ${difficulty === 'hard' ? '#CC2229' : '#22c55e'}`,
                color: difficulty === 'hard' ? '#e84249' : '#4ade80',
              }}>
              {difficulty === 'hard' ? '🔴 سخت' : '🟢 آسان'}
            </button>
          )}

          {/* ── Game cards — 2-column grid ── */}
          <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {tabGames.map(g => {
              const sel      = selectedGameKeys.includes(g.key)
              const disabled = !sel && selectedGameKeys.length >= MAX_MISSIONS
              return (
                <button
                  key={g.key}
                  onClick={() => !disabled && toggleGame(g.key)}
                  className="btn-game w-full text-right"
                  style={{ opacity: disabled ? 0.45 : 1 }}
                >
                  <div className="flex flex-col items-center gap-2 p-3 rounded-2xl h-full"
                    style={{
                      background: sel ? `linear-gradient(160deg, ${g.color}22, ${g.color}08)` : 'rgba(22,22,26,0.85)',
                      border: `1.5px solid ${sel ? g.color + '70' : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: sel ? `0 0 22px ${g.color}28, inset 0 0 12px ${g.color}08` : 'none',
                      backdropFilter: 'blur(12px)',
                      transition: 'all 0.22s',
                      minHeight: 140,
                      position: 'relative',
                    }}>

                    {/* Selection check badge */}
                    {sel && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: g.color, boxShadow: `0 0 8px ${g.color}88` }}>
                        <span style={{ fontSize: 10, color: '#fff', fontWeight: 900 }}>✓</span>
                      </div>
                    )}

                    {/* Art image */}
                    <div className="rounded-xl overflow-hidden"
                      style={{
                        width: '100%', aspectRatio: '1 / 1',
                        background: `${g.color}14`,
                        border: `1px solid ${sel ? g.color + '44' : 'rgba(255,255,255,0.06)'}`,
                        boxShadow: sel ? `0 0 16px ${g.color}40` : 'none',
                        transition: 'all 0.22s',
                      }}>
                      <img
                        src={g.art} alt={g.name}
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'contain',
                          transform: sel ? 'scale(1.06)' : 'scale(1)',
                          transition: 'transform 0.25s',
                        }}
                        loading="lazy" decoding="async"
                      />
                    </div>

                    {/* Name */}
                    <div className="font-black text-white text-center leading-tight"
                      style={{ fontSize: 12, width: '100%' }}>
                      {g.name}
                    </div>

                    {/* Type badge */}
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: `${g.color}22`, color: g.color,
                        border: `1px solid ${g.color}44`, fontSize: 10,
                      }}>
                      {g.type}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* ── Selected strip ── */}
          {selectedGameKeys.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap rounded-2xl px-3 py-2.5"
              style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
              <span className="text-xs font-bold flex-shrink-0" style={{ color: 'rgba(168,85,247,0.7)' }}>انتخاب‌ها:</span>
              {selectedGameKeys.map((key, i) => {
                const g = GAMES_DATA.find(x => x.key === key)!
                return (
                  <span key={key} className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${g.color}22`, color: g.color, border: `1px solid ${g.color}44` }}>
                    {i + 1}. {g.name}
                  </span>
                )
              })}
            </div>
          )}

        </div>
      </div>

      {/* ── Sticky CTA footer ── */}
      <div className="relative z-10 flex-shrink-0 flex flex-col gap-2 px-4 pt-2 pb-4"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))', background: 'linear-gradient(to top, rgba(10,10,14,0.95) 60%, transparent)' }}>
        {error && <p className="text-sm text-center font-bold animate-slide-up" style={{ color: '#ef4444' }}>{error}</p>}
        <CtaBtn
          onClick={handleConfirmConfig}
          disabled={!canConfirm || loading}
          loading={loading}
          accent={configMode === 'online' ? '#a855f7' : '#22c55e'}
        >
          {loading ? '⏳ در حال ساخت...' : getSelectedBehsazaniId() ? '🎮 ورود به بازی' : configMode === 'online' ? '🚀 ساختن اتاق آنلاین' : '🚀 شروع ماجراجویی'}
        </CtaBtn>
      </div>
    </div>
  )
}
