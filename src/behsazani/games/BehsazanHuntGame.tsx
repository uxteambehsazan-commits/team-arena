/**
 * شکار بهسازانی — Multiplayer Role-Based Hide & Seek
 * True online multiplayer: Seekers vs Hiders
 * Roles, locations, and hints are isolated per player via private channels.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { usePrivateChannel } from '../../lib/multiplayer/usePrivateChannel'
import { BUILDINGS } from '../../lib/behsazanHunt'
import type { BuildingId, Building } from '../../lib/behsazanHunt'
import type { BehsazaniPlayer } from '../BehsazaniHub'
import { avatarSrc } from '../../lib/avatars'

// ── Constants ─────────────────────────────────────────────────────────────────
const HIDE_SECONDS = 60
const HUNT_SECONDS = 120
const SCAN_COOLDOWN = 30_000
const DECOY_COOLDOWN = 25_000
const SILENT_MOVE_COOLDOWN = 40_000

function seekerCount(total: number): number {
  if (total <= 5)  return 1
  if (total <= 8)  return 2
  return Math.min(3, Math.ceil(total * 0.25))
}

// ── Building floor helpers ────────────────────────────────────────────────────
function allFloors(b: Building): number[] {
  const floors: number[] = []
  for (let f = -b.undergroundFloors; f <= b.officeFloors; f++) floors.push(f)
  if (b.hasRooftop) floors.push(99)
  return floors
}
function floorLabel(f: number): string {
  if (f === 99) return 'بام'
  if (f === 0)  return 'همکف'
  if (f < 0)   return `پارکینگ ${Math.abs(f)}`
  return `طبقه ${f}`
}

// ── Types ─────────────────────────────────────────────────────────────────────
type HuntPhase = 'lobby' | 'role_reveal' | 'hide' | 'hunt' | 'round_end' | 'match_end'
type HuntRole  = 'seeker' | 'hider' | 'observer'

interface HuntHint {
  id: string
  buildingId: BuildingId
  floorApprox: number
  strength: number
  isDecoy: boolean
  timestamp: number
}

interface PlayerScore {
  playerId: string
  name: string
  survivalTime: number
  hidersFound: number
  decoys: number
  total: number
}

interface HuntPublicState {
  phase: HuntPhase
  round: number
  totalRounds: number
  timerStart: number
  timerDuration: number
  seekerIds: string[]
  hiderIds: string[]
  hidersAlive: string[]
  hidersFound: string[]
  hints: HuntHint[]
  scores: Record<string, PlayerScore>
  selectedBuilding: BuildingId
  settings: { rounds: number; hideTime: number; huntTime: number }
  roleHistory: Record<string, number>
}

interface HiderPrivate {
  locationId: string
  buildingId: BuildingId
  floor: number
  locationName: string
  description: string
  noiseLevel: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function noiseLabel(n: number): { icon: string; label: string; color: string } {
  if (n < 30) return { icon: '🟢', label: 'آرام', color: '#22c55e' }
  if (n < 65) return { icon: '🟡', label: 'مشکوک', color: '#ffd60a' }
  return { icon: '🔴', label: 'پرریسک', color: '#CC2229' }
}

async function broadcastMsg(roomCode: string, channel: string, event: string, payload: unknown) {
  const ch = supabase.channel(`beh-${roomCode}-${channel}`, {
    config: { broadcast: { self: true, ack: false } },
  })
  await new Promise<void>(res => {
    ch.subscribe(async s => {
      if (s === 'SUBSCRIBED') {
        await ch.send({ type: 'broadcast', event, payload }).catch(() => {})
        await supabase.removeChannel(ch)
        res()
      }
    })
  })
}

function useTimer(pub: HuntPublicState | null): number {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!pub || (pub.phase !== 'hide' && pub.phase !== 'hunt')) { setSecs(0); return }
    const tick = () => setSecs(Math.max(0, Math.ceil((pub.timerStart + pub.timerDuration - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [pub])
  return secs
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  players?: BehsazaniPlayer[]
  myPlayer?: BehsazaniPlayer
  isHost?: boolean
  isOnline?: boolean
  roomCode?: string
  onExit: () => void
}

const DEFAULT_PLAYER: BehsazaniPlayer = { id: 'solo', name: 'بازیکن', avatar: '1', colorIndex: 0 }

// ─────────────────────────────────────────────────────────────────────────────
// SEEKER VIEW — Building floor map with hints
// ─────────────────────────────────────────────────────────────────────────────
function SeekerView({ pub, myPlayer, roomCode }: {
  pub: HuntPublicState; myPlayer: BehsazaniPlayer; roomCode: string
}) {
  const building = BUILDINGS.find(b => b.id === pub.selectedBuilding)!
  const floors = allFloors(building)
  const [selectedFloor, setSelectedFloor] = useState<number>(1)
  const [scanning, setScanning] = useState(false)
  const [scanCooldown, setScanCooldown] = useState(0)
  const secs = useTimer(pub)

  useEffect(() => { setSelectedFloor(building.officeFloors > 0 ? 1 : 0) }, [pub.selectedBuilding, building.officeFloors])

  async function doScan() {
    if (scanCooldown > 0) return
    setScanning(true)
    await broadcastMsg(roomCode, 'hunt-actions', 'action', {
      type: 'scan', playerId: myPlayer.id, floor: selectedFloor, buildingId: pub.selectedBuilding,
    })
    setTimeout(() => setScanning(false), 2000)
    setScanCooldown(SCAN_COOLDOWN)
    const t = setInterval(() => setScanCooldown(p => { if (p <= 1000) { clearInterval(t); return 0 } return p - 1000 }), 1000)
  }

  const activeHints = pub.hints.filter(h =>
    h.buildingId === pub.selectedBuilding &&
    Math.abs(h.floorApprox - selectedFloor) <= 1 &&
    (Date.now() - h.timestamp) < 30000
  )
  const urgency = secs < 30 ? 'critical' : secs < 60 ? 'pressure' : 'normal'

  return (
    <div className="h-full flex flex-col" dir="rtl"
      style={{ background: urgency === 'critical' ? '#120608' : '#0d0d10' }}>
      <div className="flex-shrink-0 px-3 pt-2 pb-2 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
        <div>
          <p className="text-xs font-black" style={{ color: '#CC2229' }}>🔍 پیداکننده</p>
          <p className="text-xs" style={{ color: '#6D6E71' }}>{building.name} — {floorLabel(selectedFloor)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>دور {pub.round}/{pub.totalRounds}</p>
          <p className="text-xs" style={{ color: '#6D6E71' }}>{pub.hidersAlive.length} زنده / {pub.hidersFound.length} پیدا</p>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
          style={{ background: urgency === 'critical' ? '#CC2229' : urgency === 'pressure' ? '#ffd60a' : '#22c55e', color: '#fff', animation: urgency === 'critical' ? 'ctaBreathe 0.8s ease-in-out infinite' : undefined }}>
          {secs}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <div className="flex-shrink-0 flex flex-col items-center py-2 px-1 gap-1 overflow-y-auto"
          style={{ width: 54, background: 'rgba(0,0,0,0.4)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-black mb-1" style={{ color: '#6D6E71' }}>طبقات</p>
          {[...floors].reverse().map(f => {
            const hasHint = pub.hints.some(h => h.buildingId === pub.selectedBuilding && Math.abs(h.floorApprox - f) <= 1 && (Date.now() - h.timestamp) < 30000)
            const isSel = f === selectedFloor
            return (
              <button key={f} onClick={() => setSelectedFloor(f)}
                className="btn-game w-10 h-8 rounded-lg text-xs font-bold flex-shrink-0 relative"
                style={{ background: isSel ? '#CC2229' : hasHint ? 'rgba(204,34,41,0.15)' : 'rgba(255,255,255,0.04)', color: isSel ? '#fff' : hasHint ? '#f87171' : '#6D6E71', border: isSel ? '1.5px solid #CC2229' : hasHint ? '1px solid #CC222944' : '1px solid transparent' }}>
                {f === 99 ? 'بام' : f === 0 ? 'هم' : f < 0 ? `P${Math.abs(f)}` : f}
                {hasHint && !isSel && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />}
              </button>
            )
          })}
        </div>

        <div className="flex-1 relative overflow-hidden">
          <FloorMap building={building} floor={selectedFloor} hints={activeHints} scanning={scanning} />
          {activeHints.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3">
              {activeHints.slice(-2).map(h => (
                <div key={h.id} className="mb-1 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: h.isDecoy ? 'rgba(168,85,247,0.15)' : 'rgba(204,34,41,0.15)', border: `1px solid ${h.isDecoy ? 'rgba(168,85,247,0.3)' : 'rgba(204,34,41,0.3)'}`, color: h.isDecoy ? '#c084fc' : '#f87171' }}>
                  🔊 {h.isDecoy ? 'سیگنال مشکوک' : 'صدای مشکوک'} — {floorLabel(h.floorApprox)} (قدرت: {h.strength}%)
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 px-3 py-2 flex gap-2 items-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
        <button onClick={doScan} disabled={scanCooldown > 0 || scanning}
          className="btn-game flex-1 py-3 rounded-xl font-black text-white text-sm"
          style={{ background: scanCooldown > 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', opacity: scanCooldown > 0 ? 0.5 : 1 }}>
          {scanning ? '📡 اسکن...' : scanCooldown > 0 ? `⏱ ${Math.ceil(scanCooldown / 1000)}ث` : '📡 اسکن'}
        </button>
        <div className="text-xs text-center" style={{ color: '#6D6E71' }}>
          <p>{pub.hidersAlive.length} زنده</p>
          <p className="font-black" style={{ color: '#22c55e' }}>{pub.hidersFound.length} پیدا</p>
        </div>
      </div>
    </div>
  )
}

function FloorMap({ building, floor, hints, scanning }: { building: Building; floor: number; hints: HuntHint[]; scanning: boolean }) {
  const isParking = floor < 0
  const isRooftop = floor === 99
  return (
    <svg viewBox="0 0 320 240" className="w-full h-full" style={{ background: '#111115' }}>
      <defs>
        <radialGradient id="fg-bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#16161e" /><stop offset="100%" stopColor="#0a0a0e" />
        </radialGradient>
      </defs>
      <rect x="10" y="10" width="300" height="220" rx="6" fill="url(#fg-bg)" stroke="#2e2e38" strokeWidth="1.5" />
      <text x="160" y="28" textAnchor="middle" fontSize="10" fill="#3a3a42" fontFamily="sans-serif">{floorLabel(floor)} — {building.name}</text>

      {isParking ? (
        <>
          <rect x="30" y="40" width="260" height="165" rx="4" fill="#141418" stroke="#2e2e38" strokeWidth="0.5" />
          {[0,1,2,3,4].map(i => (
            <g key={i}>
              <rect x={38 + i * 46} y="55" width="38" height="65" rx="2" fill="#1a1a20" stroke="#2e2e38" strokeWidth="0.5" />
              <rect x={38 + i * 46} y="135" width="38" height="60" rx="2" fill="#1a1a20" stroke="#2e2e38" strokeWidth="0.5" />
              <text x={57 + i * 46} y="94" textAnchor="middle" fontSize="16">🚗</text>
            </g>
          ))}
        </>
      ) : isRooftop ? (
        <>
          <rect x="30" y="40" width="260" height="165" rx="8" fill="#141418" stroke="#2e2e38" strokeWidth="0.5" />
          <text x="160" y="120" textAnchor="middle" fontSize="36">🏙️</text>
          <text x="160" y="148" textAnchor="middle" fontSize="10" fill="#3a3a42" fontFamily="sans-serif">{building.rooftopDescription ?? 'بام'}</text>
        </>
      ) : (
        <>
          <rect x="30" y="118" width="260" height="20" fill="#16161c" stroke="#2e2e38" strokeWidth="0.5" />
          <text x="160" y="130" textAnchor="middle" fontSize="7" fill="#2e2e38" fontFamily="sans-serif">راهرو</text>
          <rect x="290" y="40" width="18" height="165" rx="3" fill="#141418" stroke="#2e2e38" strokeWidth="0.5" />
          <text x="299" y="130" textAnchor="middle" fontSize="6" fill="#2e2e38" fontFamily="sans-serif" transform="rotate(-90 299 130)">آسانسور</text>
          <rect x="12" y="40" width="16" height="165" rx="2" fill="#141418" stroke="#2e2e38" strokeWidth="0.5" />
          {[0,1,2,3].map(i => <line key={i} x1="13" y1={50 + i * 40} x2="27" y2={50 + i * 40} stroke="#2e2e38" strokeWidth="0.5" />)}
          {Array.from({ length: Math.min(building.unitsPerFloor, 4) }).map((_, i) => {
            const w = Math.min(220 / Math.min(building.unitsPerFloor, 4), 64)
            const x = 30 + i * (w + 4)
            const loc = building.locations.filter(l => l.floor === floor)[i]
            return (
              <g key={i}>
                <rect x={x} y="42" width={w} height="73" rx="3" fill="#1a1a22" stroke="#2e2e38" strokeWidth="1" />
                <text x={x + w / 2} y="82" textAnchor="middle" fontSize="7" fill="#3a3a42" fontFamily="sans-serif">{loc ? loc.unit.slice(0, 7) : `واحد ${i + 1}`}</text>
                <rect x={x + w / 2 - 5} y="112" width="10" height="3" rx="1" fill="#3b82f6" opacity="0.4" />
                <rect x={x} y="142" width={w} height="73" rx="3" fill="#1a1a22" stroke="#2e2e38" strokeWidth="1" />
                <rect x={x + w / 2 - 5} y="139" width="10" height="3" rx="1" fill="#3b82f6" opacity="0.4" />
              </g>
            )
          })}
        </>
      )}

      {hints.map((h, i) => (
        <circle key={h.id} cx={100 + i * 50} cy="120" r="18" fill="none"
          stroke={h.isDecoy ? '#a855f7' : '#CC2229'} strokeWidth="1.5" opacity="0.5"
          style={{ animation: 'ctaBreathe 1s ease-in-out infinite', animationDelay: `${i * 0.3}s` }} />
      ))}

      {scanning && <rect x="10" y="10" width="300" height="220" rx="6" fill="#3b82f622" stroke="#3b82f6" strokeWidth="2" style={{ animation: 'ctaBreathe 0.5s ease-in-out 4' }} />}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HIDER VIEW
// ─────────────────────────────────────────────────────────────────────────────
function HiderView({ pub, myPlayer, privateInfo, roomCode }: {
  pub: HuntPublicState; myPlayer: BehsazaniPlayer; privateInfo: HiderPrivate | null; roomCode: string
}) {
  const secs = useTimer(pub)
  const [noiseLevel, setNoiseLevel] = useState(privateInfo?.noiseLevel ?? 20)
  const [decoyCooldown, setDecoyCooldown] = useState(0)
  const [silentCooldown, setSilentCooldown] = useState(0)
  const [silentActive, setSilentActive] = useState(false)
  const [lastAction, setLastAction] = useState('')
  const noise = noiseLabel(noiseLevel)
  const urgency = secs < 30 ? 'critical' : secs < 60 ? 'pressure' : 'normal'
  const building = BUILDINGS.find(b => b.id === (privateInfo?.buildingId ?? pub.selectedBuilding))!

  useEffect(() => {
    if (pub.phase !== 'hunt') return
    const id = setInterval(() => setNoiseLevel(p => Math.min(100, p + (silentActive ? 0 : 0.5))), 3000)
    return () => clearInterval(id)
  }, [pub.phase, silentActive])

  async function doDecoy() {
    if (decoyCooldown > 0) return
    setLastAction('دیکوی فعال — سیگنال جعلی ارسال شد!')
    setNoiseLevel(p => Math.min(100, p + 15))
    await broadcastMsg(roomCode, 'hunt-actions', 'action', { type: 'decoy', playerId: myPlayer.id })
    setDecoyCooldown(DECOY_COOLDOWN)
    const t = setInterval(() => setDecoyCooldown(p => { if (p <= 1000) { clearInterval(t); return 0 } return p - 1000 }), 1000)
  }

  async function doSilentMove() {
    if (silentCooldown > 0) return
    setLastAction('حرکت خاموش فعال!')
    setSilentActive(true)
    await broadcastMsg(roomCode, 'hunt-actions', 'action', { type: 'silent_move', playerId: myPlayer.id })
    setSilentCooldown(SILENT_MOVE_COOLDOWN)
    setTimeout(() => setSilentActive(false), 8000)
    const t = setInterval(() => setSilentCooldown(p => { if (p <= 1000) { clearInterval(t); return 0 } return p - 1000 }), 1000)
  }

  async function doMove() {
    if (silentActive) return
    setNoiseLevel(p => Math.min(100, p + 20))
    setLastAction('حرکت — صدا افزایش یافت!')
    await broadcastMsg(roomCode, 'hunt-actions', 'action', { type: 'move', playerId: myPlayer.id })
  }

  return (
    <div className="h-full flex flex-col" dir="rtl"
      style={{ background: urgency === 'critical' ? '#090508' : '#0e0d10' }}>
      <div className="flex-shrink-0 px-3 pt-2 pb-2 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <p className="text-xs font-black" style={{ color: '#22c55e' }}>🥷 مخفی‌شونده</p>
          {privateInfo && <p className="text-xs" style={{ color: '#6D6E71' }}>{building.name} — {floorLabel(privateInfo.floor)}</p>}
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
          style={{ background: urgency === 'critical' ? '#CC2229' : urgency === 'pressure' ? '#ffd60a' : '#1e1e24', color: '#fff', animation: urgency === 'critical' ? 'ctaBreathe 0.8s ease-in-out infinite' : undefined }}>
          {secs}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <HiderEnvironment building={building} privateInfo={privateInfo} noiseLevel={noiseLevel} urgency={urgency} />
      </div>

      <div className="flex-shrink-0 px-3 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">{noise.icon}</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${noiseLevel}%`, background: noiseLevel < 30 ? '#22c55e' : noiseLevel < 65 ? '#ffd60a' : '#CC2229' }} />
          </div>
          <span className="text-xs font-bold" style={{ color: noise.color }}>{noise.label}</span>
        </div>
        {lastAction && <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>{lastAction}</p>}
      </div>

      <div className="flex-shrink-0 px-3 py-3 flex gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
        <button onClick={doDecoy} disabled={decoyCooldown > 0}
          className="btn-game flex-1 py-3 rounded-xl text-xs font-black text-white"
          style={{ background: decoyCooldown > 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#a855f7,#7c3aed)', opacity: decoyCooldown > 0 ? 0.5 : 1 }}>
          {decoyCooldown > 0 ? `🎭 ${Math.ceil(decoyCooldown / 1000)}ث` : '🎭 دیکوی'}
        </button>
        <button onClick={doSilentMove} disabled={silentCooldown > 0}
          className="btn-game flex-1 py-3 rounded-xl text-xs font-black text-white"
          style={{ background: silentCooldown > 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#22c55e,#16a34a)', opacity: silentCooldown > 0 ? 0.5 : 1 }}>
          {silentCooldown > 0 ? `🤫 ${Math.ceil(silentCooldown / 1000)}ث` : '🤫 خاموش'}
        </button>
        <button onClick={doMove}
          className="btn-game flex-1 py-3 rounded-xl text-xs font-black text-white"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          🚶 حرکت
        </button>
      </div>
    </div>
  )
}

function HiderEnvironment({ building, privateInfo, noiseLevel, urgency }: {
  building: Building; privateInfo: HiderPrivate | null; noiseLevel: number; urgency: string
}) {
  const floor = privateInfo?.floor ?? 1
  const isParking = floor < 0
  const isRooftop = floor === 99
  return (
    <div className="w-full h-full relative flex items-center justify-center"
      style={{ boxShadow: urgency === 'critical' ? '0 0 40px rgba(204,34,41,0.3) inset' : 'none' }}>
      <svg viewBox="0 0 320 200" className="w-full h-full max-h-56">
        <defs>
          <radialGradient id="he-grad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor={urgency === 'critical' ? '#1a0a0a' : '#14141a'} />
            <stop offset="100%" stopColor="#0a0a0e" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="url(#he-grad)" />
        <rect x="0" y="155" width="320" height="45" fill="#111118" />
        <line x1="0" y1="30" x2="320" y2="30" stroke="#1e1e28" strokeWidth="1" />
        {isParking ? (
          <text x="160" y="105" textAnchor="middle" fontSize="40">🚗</text>
        ) : isRooftop ? (
          <text x="160" y="90" textAnchor="middle" fontSize="40">🏙️</text>
        ) : (
          <>
            <rect x="220" y="48" width="70" height="50" rx="3" fill="#0d1218" stroke="#1e2838" strokeWidth="1.5" />
            <line x1="255" y1="48" x2="255" y2="98" stroke="#1e2838" strokeWidth="1" />
            <line x1="220" y1="73" x2="290" y2="73" stroke="#1e2838" strokeWidth="1" />
            <rect x="25" y="118" width="120" height="10" rx="2" fill="#2a2030" stroke="#3a3040" strokeWidth="0.5" />
            <rect x="35" y="128" width="8" height="24" fill="#2a2030" />
            <rect x="127" y="128" width="8" height="24" fill="#2a2030" />
            <rect x="60" y="98" width="40" height="5" rx="2" fill="#1e1a2a" />
            <rect x="70" y="103" width="25" height="18" rx="2" fill="#1e1a2a" />
            <rect x="270" y="98" width="35" height="57" rx="2" fill="#1c1c24" stroke="#2e2e38" strokeWidth="0.5" />
            <circle cx="283" cy="125" r="2" fill="#3a3a42" />
            <rect x="5" y="80" width="28" height="72" rx="1" fill="#191922" stroke="#2e2e38" strokeWidth="0.5" />
            <circle cx="29" cy="116" r="2.5" fill="#3a3a42" />
          </>
        )}
        <g opacity="0.65">
          <circle cx="160" cy="112" r="10" fill="#22c55e44" />
          <circle cx="160" cy="100" r="8" fill="#22c55e" opacity="0.5" />
          <rect x="153" y="108" width="14" height="18" rx="4" fill="#22c55e" opacity="0.45" />
        </g>
        {noiseLevel > 60 && (
          <>
            <circle cx="160" cy="100" r={20 + noiseLevel / 5} fill="none" stroke="#CC222444" strokeWidth="1" style={{ animation: 'ctaBreathe 1s ease-in-out infinite' }} />
            <circle cx="160" cy="100" r={35 + noiseLevel / 5} fill="none" stroke="#CC222222" strokeWidth="0.5" style={{ animation: 'ctaBreathe 1.5s ease-in-out infinite' }} />
          </>
        )}
      </svg>
      {privateInfo && (
        <div className="absolute top-2 right-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(34,197,94,0.3)', backdropFilter: 'blur(8px)' }}>
          <p className="text-xs font-black" style={{ color: '#22c55e' }}>{privateInfo.locationName}</p>
          <p className="text-xs" style={{ color: '#6D6E71' }}>{building.name} / {floorLabel(privateInfo.floor)}</p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION PICKER
// ─────────────────────────────────────────────────────────────────────────────
function LocationPicker({ building, onPick }: {
  building: Building
  onPick: (loc: { id: string; name: string; floor: number; description: string }) => void
}) {
  const locs = building.locations.filter(l => l.active)
  const [selected, setSelected] = useState<string | null>(null)

  function riskIcon(floor: number, locType: string): { icon: string; label: string; color: string } {
    if (floor < 0 || locType === 'parking') return { icon: '🟢', label: 'آرام', color: '#22c55e' }
    if (locType === 'prayer' || floor === 99) return { icon: '🟡', label: 'مشکوک', color: '#ffd60a' }
    if (locType === 'food') return { icon: '🔴', label: 'پرریسک', color: '#CC2229' }
    return floor <= 2 ? { icon: '🟢', label: 'آرام', color: '#22c55e' } : { icon: '🟡', label: 'مشکوک', color: '#ffd60a' }
  }

  return (
    <div className="h-full flex flex-col" dir="rtl" style={{ background: '#0d0d10' }}>
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <h2 className="font-black text-white text-lg">کجا مخفی می‌شوی؟</h2>
        <p className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>{building.name}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {locs.map(l => {
          const risk = riskIcon(l.floor, l.locationType)
          const isSel = selected === l.id
          return (
            <button key={l.id} onClick={() => setSelected(l.id)}
              className="btn-game w-full text-right px-4 py-3 rounded-2xl"
              style={{ background: isSel ? 'rgba(34,197,94,0.1)' : 'rgba(26,26,28,0.9)', border: `1.5px solid ${isSel ? '#22c55e66' : 'rgba(255,255,255,0.06)'}` }}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{risk.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{l.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>{floorLabel(l.floor)} • <span style={{ color: risk.color }}>{risk.label}</span></p>
                  <p className="text-xs mt-1" style={{ color: '#4a4a52' }}>{l.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      <div className="flex-shrink-0 px-4 pb-5 pt-2">
        <button disabled={!selected}
          onClick={() => {
            if (!selected) return
            const l = locs.find(x => x.id === selected)!
            onPick({ id: l.id, name: l.name, floor: l.floor, description: l.description })
          }}
          className="btn-game w-full py-4 rounded-2xl font-black text-white text-lg"
          style={{ background: selected ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.06)', opacity: selected ? 1 : 0.4 }}>
          اینجا مخفی می‌شم! 🥷
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE REVEAL
// ─────────────────────────────────────────────────────────────────────────────
function RoleRevealScreen({ role, onDone }: { role: HuntRole; onDone: () => void }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 600)
    const t2 = setTimeout(() => setStep(2), 1800)
    const t3 = setTimeout(() => onDone(), 3800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6"
      style={{ background: role === 'seeker' ? 'linear-gradient(135deg,#0a0612,#120824)' : 'linear-gradient(135deg,#060e0a,#0a1a0e)' }}>
      <div style={{ opacity: step >= 1 ? 1 : 0, transition: 'opacity 0.6s, transform 0.6s', transform: step >= 1 ? 'scale(1)' : 'scale(0.5)' }} className="text-center">
        <div className="text-8xl mb-3">{role === 'seeker' ? '🔍' : '🥷'}</div>
        <h1 className="font-black text-4xl text-white">{role === 'seeker' ? 'پیداکننده' : 'مخفی‌شونده'}</h1>
      </div>
      {step >= 2 && (
        <div className="px-6 py-3 rounded-2xl text-center animate-fade-up"
          style={{ background: role === 'seeker' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${role === 'seeker' ? '#3b82f644' : '#22c55e44'}` }}>
          <p className="text-sm" style={{ color: role === 'seeker' ? '#93c5fd' : '#86efac' }}>
            {role === 'seeker' ? 'همه Hiderها را قبل از پایان زمان پیدا کن!' : 'تا پایان زمان مخفی بمان!'}
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OBSERVER VIEW
// ─────────────────────────────────────────────────────────────────────────────
function ObserverView({ pub, players }: { pub: HuntPublicState; players: BehsazaniPlayer[] }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-6" dir="rtl" style={{ background: '#0a0a0e' }}>
      <div className="text-5xl">👁️</div>
      <h2 className="font-black text-white text-xl">حالت تماشاچی</h2>
      <p className="text-sm" style={{ color: '#6D6E71' }}>پیدا شدی — تماشا کن</p>
      <div className="w-full max-w-xs flex flex-col gap-2">
        {pub.hidersAlive.map(id => {
          const p = players.find(x => x.id === id)
          return p ? (
            <div key={id} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span>🥷</span><span className="font-bold text-white text-sm flex-1">{p.name}</span>
              <span className="text-xs" style={{ color: '#22c55e' }}>زنده</span>
            </div>
          ) : null
        })}
        {pub.hidersFound.map(id => {
          const p = players.find(x => x.id === id)
          return p ? (
            <div key={id} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{ background: 'rgba(204,34,41,0.05)', border: '1px solid rgba(204,34,41,0.15)' }}>
              <span className="opacity-40">🥷</span><span className="font-bold text-sm flex-1" style={{ color: '#6D6E71' }}>{p.name}</span>
              <span className="text-xs" style={{ color: '#CC2229' }}>پیدا شد</span>
            </div>
          ) : null
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUND RESULT
// ─────────────────────────────────────────────────────────────────────────────
function RoundResultScreen({ pub, players, isHost, onNext }: {
  pub: HuntPublicState; players: BehsazaniPlayer[]; isHost: boolean; onNext: () => void
}) {
  const seekersWon = pub.hidersAlive.length === 0
  const sorted = players.map(p => pub.scores[p.id] ?? { playerId: p.id, name: p.name, survivalTime: 0, hidersFound: 0, decoys: 0, total: 0 }).sort((a, b) => b.total - a.total)
  return (
    <div className="h-full flex flex-col" dir="rtl" style={{ background: '#0d0d10' }}>
      <div className="flex-shrink-0 px-6 pt-6 pb-4 text-center">
        <div className="text-5xl mb-2">{seekersWon ? '🔍' : '🥷'}</div>
        <h2 className="font-black text-white text-2xl">{seekersWon ? 'پیداکننده‌ها بردند!' : 'مخفی‌شونده‌ها بردند!'}</h2>
        <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>دور {pub.round} از {pub.totalRounds}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-2">
        {sorted.map((s, i) => {
          const p = players.find(x => x.id === s.playerId)
          const wasSeekerThisRound = pub.seekerIds.includes(s.playerId)
          return (
            <div key={s.playerId} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: i === 0 ? 'rgba(249,115,22,0.1)' : 'rgba(26,26,28,0.8)', border: i === 0 ? '1.5px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-lg font-black">{['🥇','🥈','🥉'][i] ?? `${i+1}.`}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{p?.name ?? s.name}</p>
                <p className="text-xs" style={{ color: '#6D6E71' }}>{wasSeekerThisRound ? '🔍' : '🥷'}</p>
              </div>
              <span className="font-black" style={{ color: '#f97316' }}>{s.total}</span>
            </div>
          )
        })}
      </div>
      <div className="flex-shrink-0 px-4 pb-6 pt-3">
        {isHost ? (
          <button onClick={onNext} className="btn-game w-full py-4 rounded-2xl font-black text-white text-lg"
            style={{ background: 'linear-gradient(135deg, #CC2229, #e84249)', boxShadow: '0 4px 24px #CC222966' }}>
            {pub.round >= pub.totalRounds ? 'نتیجه نهایی' : 'دور بعدی →'}
          </button>
        ) : (
          <p className="text-center text-sm" style={{ color: '#6D6E71' }}>منتظر میزبان...</p>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MATCH END
// ─────────────────────────────────────────────────────────────────────────────
function MatchEndScreen({ pub, players, onExit }: { pub: HuntPublicState; players: BehsazaniPlayer[]; onExit: () => void }) {
  const sorted = players.map(p => pub.scores[p.id] ?? { playerId: p.id, name: p.name, total: 0 }).sort((a, b) => (b as any).total - (a as any).total)
  const mvpPlayer = players.find(p => p.id === sorted[0]?.playerId)
  return (
    <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl" style={{ background: 'linear-gradient(135deg, #0e0e0f, #181018)' }}>
      <div className="text-6xl">🏆</div>
      <h2 className="font-black text-white text-2xl">نتیجه نهایی</h2>
      {mvpPlayer && (
        <div className="px-5 py-3 rounded-2xl text-center" style={{ background: 'rgba(255,214,10,0.1)', border: '1.5px solid rgba(255,214,10,0.3)' }}>
          <p className="text-xs" style={{ color: '#ffd60a' }}>MVP بازی</p>
          <p className="font-black text-xl text-white">{mvpPlayer.name}</p>
        </div>
      )}
      <div className="w-full max-w-xs flex flex-col gap-2">
        {sorted.map((s, i) => {
          const p = players.find(x => x.id === (s as any).playerId)
          return (
            <div key={(s as any).playerId} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{ background: i === 0 ? 'rgba(249,115,22,0.12)' : 'rgba(26,26,28,0.8)', border: i === 0 ? '1.5px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
              <span className="font-black text-lg">{['🥇','🥈','🥉'][i] ?? `${i+1}.`}</span>
              <span className="flex-1 font-bold text-white text-sm">{p?.name ?? (s as any).name}</span>
              <span className="font-black" style={{ color: '#f97316' }}>{(s as any).total}</span>
            </div>
          )
        })}
      </div>
      <button onClick={onExit} className="btn-game px-10 py-4 rounded-2xl font-black text-white" style={{ background: 'rgba(255,255,255,0.08)' }}>خروج</button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOBBY
// ─────────────────────────────────────────────────────────────────────────────
function HuntLobby({ players, myPlayer, isHost, roomCode, onStart, onExit }: {
  players: BehsazaniPlayer[]; myPlayer: BehsazaniPlayer; isHost: boolean; roomCode: string
  onStart: (s: { rounds: number; hideTime: number; huntTime: number; building: BuildingId }) => void
  onExit: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [rounds, setRounds] = useState(3)
  const [building, setBuilding] = useState<BuildingId>('eram')
  const canStart = players.length >= 4 && isHost

  return (
    <div className="h-full flex flex-col" dir="rtl" style={{ background: 'linear-gradient(160deg, #0e0e0f 0%, #16101a 50%, #0e1214 100%)' }}>
      <div className="flex-shrink-0 px-4 pt-5 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between">
          <button onClick={onExit} className="btn-game w-9 h-9 rounded-xl flex items-center justify-center font-black text-white" style={{ background: 'rgba(255,255,255,0.07)' }}>→</button>
          <div className="text-center">
            <p className="text-2xl">🏢</p>
            <h1 className="font-black text-white text-sm">شکار بهسازانی</h1>
            <p className="text-xs" style={{ color: '#9a9b9e' }}>اتاق انتظار</p>
          </div>
          <div className="w-9" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(168,85,247,0.07)', border: '1.5px solid rgba(168,85,247,0.25)' }}>
          <p className="text-xs font-bold mb-2" style={{ color: '#9a9b9e' }}>کد اتاق</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-black text-3xl tracking-widest" style={{ color: '#a855f7', letterSpacing: '0.18em', fontFamily: 'monospace' }}>{roomCode}</span>
            <button onClick={() => { navigator.clipboard.writeText(roomCode).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="btn-game px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(168,85,247,0.2)', color: copied ? '#22c55e' : '#a855f7', border: `1px solid ${copied ? '#22c55e44' : 'rgba(168,85,247,0.3)'}` }}>
              {copied ? '✓' : 'کپی'}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: '#6D6E71' }}>حداقل ۴ بازیکن — {players.length} نفر حاضر</p>
        </div>

        <div className="flex flex-col gap-2">
          {players.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl" style={{ background: 'rgba(26,26,28,0.85)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"><img src={avatarSrc(p.avatar)} alt={p.name} className="w-full h-full object-contain" /></div>
              <span className="flex-1 font-bold text-white text-sm">{p.name}</span>
              {p.id === myPlayer.id && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#ffd60a18', color: '#ffd60a' }}>{isHost ? '👑' : 'شما'}</span>}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
              <span className="text-sm" style={{ color: '#3a3a3e' }}>منتظر بازیکن...</span>
            </div>
          ))}
        </div>

        {isHost && (
          <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'rgba(26,26,28,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-black" style={{ color: '#CC2229' }}>تنظیمات</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white">تعداد دور</span>
              <div className="flex items-center gap-2">
                {[2,3,5].map(n => (
                  <button key={n} onClick={() => setRounds(n)} className="btn-game w-8 h-8 rounded-lg text-xs font-black text-white"
                    style={{ background: rounds === n ? '#CC2229' : 'rgba(255,255,255,0.06)' }}>{n}</button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-white block mb-1.5">ساختمان</span>
              <div className="flex flex-col gap-1.5">
                {BUILDINGS.map(b => (
                  <button key={b.id} onClick={() => setBuilding(b.id as BuildingId)}
                    className="btn-game flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: building === b.id ? 'rgba(204,34,41,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${building === b.id ? '#CC222955' : 'transparent'}` }}>
                    <span className="font-bold text-white text-sm">{b.name}</span>
                    <span className="text-xs mr-auto" style={{ color: '#6D6E71' }}>{b.address}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-4 pb-6 pt-2">
        {players.length < 4 && <p className="text-center text-xs mb-2" style={{ color: '#9a9b9e' }}>برای شروع شکار بهسازانی حداقل ۴ هم‌تیمی لازم است.</p>}
        {isHost ? (
          <button disabled={!canStart}
            onClick={() => onStart({ rounds, hideTime: HIDE_SECONDS, huntTime: HUNT_SECONDS, building })}
            className="btn-game w-full py-4 rounded-2xl font-black text-white text-lg"
            style={{ background: canStart ? 'linear-gradient(135deg, #CC2229, #e84249)' : 'rgba(255,255,255,0.06)', opacity: canStart ? 1 : 0.4, boxShadow: canStart ? '0 4px 24px #CC222966' : 'none' }}>
            {canStart ? '🚀 شروع شکار!' : `⏳ منتظر ${4 - players.length} بازیکن...`}
          </button>
        ) : (
          <p className="text-center py-3 text-sm" style={{ color: '#6D6E71' }}>منتظر شروع توسط میزبان...</p>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BehsazanHuntGame({ players: playersProp, myPlayer: myPlayerProp, isHost = false, isOnline = false, roomCode: roomCodeProp, onExit }: Props) {
  const players = playersProp ?? [DEFAULT_PLAYER]
  const myPlayer = myPlayerProp ?? DEFAULT_PLAYER
  const roomCode = roomCodeProp ?? 'LOCAL'
  const [pub, setPub] = useState<HuntPublicState | null>(null)
  const [myRole, setMyRole] = useState<HuntRole | null>(null)
  const [myPrivate, setMyPrivate] = useState<HiderPrivate | null>(null)
  const [roleRevealDone, setRoleRevealDone] = useState(false)
  const [locationPicked, setLocationPicked] = useState(false)
  const pubRef = useRef<HuntPublicState | null>(null)
  pubRef.current = pub

  const { sendPrivate } = usePrivateChannel(
    roomCode, myPlayer.id,
    useCallback((msg) => {
      if (msg.type === 'hunt_role') {
        const d = msg.data as { role: HuntRole }
        setMyRole(d.role)
        setRoleRevealDone(false)
        setLocationPicked(false)
        setMyPrivate(null)
      }
      if (msg.type === 'hunt_location_confirm') {
        setMyPrivate(msg.data as HiderPrivate)
      }
    }, []),
  )

  useEffect(() => {
    const ch = supabase.channel(`beh-${roomCode}-hunt-pub`, { config: { broadcast: { self: true, ack: false } } })
    ch.on('broadcast', { event: 'hunt_pub' }, ({ payload }: any) => {
      if (payload?.state) setPub(payload.state as HuntPublicState)
    }).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [roomCode])

  useEffect(() => {
    if (!isHost) return
    const ch = supabase.channel(`beh-${roomCode}-hunt-actions`, { config: { broadcast: { self: false, ack: false } } })
    ch.on('broadcast', { event: 'action' }, ({ payload }: any) => { handleAction(payload) }).subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, roomCode])

  useEffect(() => {
    if (!isHost || !pub || (pub.phase !== 'hunt' && pub.phase !== 'hide')) return
    const remaining = (pub.timerStart + pub.timerDuration) - Date.now()
    if (remaining <= 0) { endPhase(pub); return }
    const t = setTimeout(() => endPhase(pubRef.current!), remaining)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, pub?.phase, pub?.round])

  async function bcast(state: HuntPublicState) {
    setPub(state)
    await broadcastMsg(roomCode, 'hunt-pub', 'hunt_pub', { state })
  }

  async function startGame(settings: { rounds: number; hideTime: number; huntTime: number; building: BuildingId }) {
    const roleHistory: Record<string, number> = Object.fromEntries(players.map(p => [p.id, 0]))
    const initScores: Record<string, PlayerScore> = Object.fromEntries(
      players.map(p => [p.id, { playerId: p.id, name: p.name, survivalTime: 0, hidersFound: 0, decoys: 0, total: 0 }])
    )
    const state: HuntPublicState = {
      phase: 'role_reveal', round: 1, totalRounds: settings.rounds,
      timerStart: 0, timerDuration: settings.hideTime * 1000,
      seekerIds: [], hiderIds: [], hidersAlive: [], hidersFound: [],
      hints: [], scores: initScores,
      selectedBuilding: settings.building,
      settings: { rounds: settings.rounds, hideTime: settings.hideTime, huntTime: settings.huntTime },
      roleHistory,
    }
    await assignRoles(state)
  }

  async function assignRoles(state: HuntPublicState) {
    const nSeekers = seekerCount(players.length)
    const history  = state.roleHistory
    const maxHist  = Math.max(...Object.values(history), 1)
    const weights  = players.map(p => maxHist - (history[p.id] ?? 0) + 1)
    const seekers: string[] = []
    const pool = [...players]
    for (let i = 0; i < nSeekers && pool.length > 0; i++) {
      const poolWeights = pool.map(p => weights[players.indexOf(p)])
      const totalW = poolWeights.reduce((a, b) => a + b, 0)
      let rand = Math.random() * totalW
      let idx = 0
      for (let j = 0; j < pool.length; j++) { rand -= poolWeights[j]; if (rand <= 0) { idx = j; break } }
      seekers.push(pool[idx].id)
      pool.splice(idx, 1)
    }
    const hiders = players.map(p => p.id).filter(id => !seekers.includes(id))
    const newHistory = { ...history }
    seekers.forEach(id => { newHistory[id] = (newHistory[id] ?? 0) + 1 })

    const newState: HuntPublicState = {
      ...state, phase: 'role_reveal',
      seekerIds: seekers, hiderIds: hiders, hidersAlive: hiders, hidersFound: [],
      roleHistory: newHistory, hints: [],
    }

    for (const p of players) {
      const role: HuntRole = seekers.includes(p.id) ? 'seeker' : 'hider'
      if (p.id === myPlayer.id) { setMyRole(role); setRoleRevealDone(false); setLocationPicked(false) }
      await sendPrivate(p.id, { type: 'hunt_role', data: { role } })
    }
    await bcast(newState)
  }

  async function handleAction(payload: any) {
    const cur = pubRef.current
    if (!cur) return

    if (payload.type === 'hider_location') {
      const { playerId, locationId, buildingId, floor, locationName, description } = payload
      const hiderPrivate: HiderPrivate = { locationId, buildingId, floor, locationName, description, noiseLevel: 20 }
      await sendPrivate(playerId, { type: 'hunt_location_confirm', data: hiderPrivate })
      if (cur.phase === 'role_reveal') {
        await bcast({ ...cur, phase: 'hide', timerStart: Date.now(), timerDuration: cur.settings.hideTime * 1000 })
      }
    }

    if (payload.type === 'scan' && cur.phase === 'hunt') {
      const hint: HuntHint = {
        id: `hint-${Date.now()}`,
        buildingId: payload.buildingId,
        floorApprox: payload.floor + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0),
        strength: Math.floor(30 + Math.random() * 50),
        isDecoy: false, timestamp: Date.now(),
      }
      await bcast({ ...cur, hints: [...cur.hints.slice(-5), hint] })
    }

    if (payload.type === 'decoy' && cur.phase === 'hunt') {
      const b = BUILDINGS.find(bld => bld.id === cur.selectedBuilding)!
      const fakeFloor = Math.floor(Math.random() * (b.officeFloors + b.undergroundFloors)) - b.undergroundFloors
      const hint: HuntHint = {
        id: `decoy-${Date.now()}`, buildingId: cur.selectedBuilding,
        floorApprox: fakeFloor, strength: Math.floor(60 + Math.random() * 40),
        isDecoy: true, timestamp: Date.now(),
      }
      const scores = { ...cur.scores }
      if (scores[payload.playerId]) scores[payload.playerId] = { ...scores[payload.playerId], decoys: scores[payload.playerId].decoys + 1, total: scores[payload.playerId].total + 30 }
      await bcast({ ...cur, hints: [...cur.hints.slice(-5), hint], scores })
    }

    if (payload.type === 'catch_attempt' && cur.hidersAlive.includes(payload.targetId)) {
      const hidersAlive = cur.hidersAlive.filter(id => id !== payload.targetId)
      const hidersFound = [...cur.hidersFound, payload.targetId]
      const scores = { ...cur.scores }
      if (scores[payload.seekerId]) scores[payload.seekerId] = { ...scores[payload.seekerId], hidersFound: scores[payload.seekerId].hidersFound + 1, total: scores[payload.seekerId].total + 150 }
      const allFound = hidersAlive.length === 0
      await bcast({ ...cur, hidersAlive, hidersFound, scores, phase: allFound ? 'round_end' : cur.phase })
    }
  }

  async function endPhase(state: HuntPublicState) {
    if (state.phase === 'hide') {
      await bcast({ ...state, phase: 'hunt', timerStart: Date.now(), timerDuration: state.settings.huntTime * 1000 })
    } else if (state.phase === 'hunt') {
      const scores = { ...state.scores }
      state.hidersAlive.forEach(id => {
        if (scores[id]) scores[id] = { ...scores[id], survivalTime: scores[id].survivalTime + state.settings.huntTime, total: scores[id].total + 100 }
      })
      await bcast({ ...state, phase: 'round_end', scores })
    }
  }

  async function nextRound() {
    if (!pub) return
    if (pub.round >= pub.totalRounds) await bcast({ ...pub, phase: 'match_end' })
    else await assignRoles({ ...pub, round: pub.round + 1 })
  }

  async function hiderPickLocation(loc: { id: string; name: string; floor: number; description: string }) {
    setLocationPicked(true)
    await broadcastMsg(roomCode, 'hunt-actions', 'action', {
      type: 'hider_location', playerId: myPlayer.id,
      locationId: loc.id, buildingId: pub?.selectedBuilding ?? 'eram',
      floor: loc.floor, locationName: loc.name, description: loc.description,
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (!pub) return <HuntLobby players={players} myPlayer={myPlayer} isHost={isHost} roomCode={roomCode} onStart={startGame} onExit={onExit} />

  if (pub.phase === 'role_reveal' && myRole && !roleRevealDone) return <RoleRevealScreen role={myRole} onDone={() => setRoleRevealDone(true)} />

  if (pub.phase === 'role_reveal' && myRole === 'hider' && roleRevealDone && !locationPicked) {
    const building = BUILDINGS.find(b => b.id === pub.selectedBuilding)!
    return <LocationPicker building={building} onPick={hiderPickLocation} />
  }

  if (pub.phase === 'round_end') return <RoundResultScreen pub={pub} players={players} isHost={isHost} onNext={nextRound} />
  if (pub.phase === 'match_end') return <MatchEndScreen pub={pub} players={players} onExit={onExit} />

  if (myRole === 'observer' || (myRole === 'hider' && pub.hidersFound.includes(myPlayer.id))) return <ObserverView pub={pub} players={players} />

  if (pub.phase === 'hide' && myRole === 'seeker') {
    const secs = Math.max(0, Math.ceil((pub.timerStart + pub.timerDuration - Date.now()) / 1000))
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl" style={{ background: '#0d0d10' }}>
        <div className="text-6xl" style={{ animation: 'home-dot-float 2s ease-in-out infinite' }}>🔍</div>
        <h2 className="font-black text-white text-xl">مخفی‌شونده‌ها پنهان می‌شوند...</h2>
        <p className="text-sm" style={{ color: '#6D6E71' }}>شروع شکار در {secs} ثانیه</p>
      </div>
    )
  }

  if (pub.phase === 'hide' && myRole === 'hider') {
    const secs = Math.max(0, Math.ceil((pub.timerStart + pub.timerDuration - Date.now()) / 1000))
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl" style={{ background: '#0a0e0a' }}>
        <div className="text-6xl">🥷</div>
        <h2 className="font-black text-white text-xl">مخفی شدی!</h2>
        {myPrivate && <p className="text-sm" style={{ color: '#22c55e' }}>{myPrivate.locationName}</p>}
        <p className="text-sm" style={{ color: '#6D6E71' }}>شکار شروع می‌شود در {secs} ثانیه...</p>
      </div>
    )
  }

  if (pub.phase === 'hunt' && myRole === 'seeker') return <SeekerView pub={pub} myPlayer={myPlayer} roomCode={roomCode} />
  if (pub.phase === 'hunt' && myRole === 'hider') return <HiderView pub={pub} myPlayer={myPlayer} privateInfo={myPrivate} roomCode={roomCode} />

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl" style={{ background: '#0d0d10' }}>
      <div className="text-4xl animate-spin" style={{ animationDuration: '1.5s' }}>⏳</div>
      <p className="font-black text-white">در حال آماده‌سازی...</p>
    </div>
  )
}
