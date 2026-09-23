import { useState, useRef } from 'react'
import {
  loadProfile, saveProfile,
  ACHIEVEMENTS, UNLOCK_RULES, RANK_META, calcRank,
  getLevelProgress, winRate, isUnlocked,
  TITLES, getActiveTitle, getUnlockedTitles,
  type PlayerProfile, type FrameId, type AuraId, type TitleId,
} from '../lib/playerProfile'
import { AVATAR_IMGS, AVATAR_NAMES } from '../lib/avatars'
import { loadScores } from '../lib/scores'
import { getDailyMissions, getWeeklyMissions } from '../lib/missions'

const CHAR_ACCENTS = [
  '#e84249', '#3b82f6', '#a855f7', '#06b6d4', '#94a3b8',
  '#f97316', '#22c55e', '#a855f7', '#ffd60a', '#ef4444',
]

type Tab = 'avatar' | 'achievements' | 'stats' | 'missions'

interface Props {
  onClose: () => void
}

function XPBar({ pct }: { pct: number }) {
  return (
    <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 4,
        background: 'linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)',
        width: `${Math.round(pct * 100)}%`,
        transition: 'width 1s cubic-bezier(.16,1,.3,1)',
        boxShadow: '0 0 8px rgba(168,85,247,0.6)',
      }} />
    </div>
  )
}

/* ── Full-body character stage ── */
function CharacterStage({ idx }: { idx: number }) {
  const accent = CHAR_ACCENTS[idx] ?? '#a855f7'
  const src = AVATAR_IMGS[idx]
  const name = AVATAR_NAMES[idx]
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 180, height: 180, borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}30 0%, ${accent}10 55%, transparent 75%)`,
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />
      {/* Character image — floating */}
      <div style={{ animation: 'char-stage-float 3.5s ease-in-out infinite', willChange: 'transform' }}>
        <img
          src={src}
          alt={name}
          style={{
            width: 200,
            height: 200,
            objectFit: 'contain',
            filter: `drop-shadow(0 14px 36px ${accent}55) drop-shadow(0 0 50px ${accent}22)`,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      </div>
      {/* Pedestal glow */}
      <div style={{
        width: 140, height: 16, borderRadius: '50%',
        background: `radial-gradient(ellipse at 50% 100%, ${accent}40 0%, transparent 80%)`,
        marginTop: -8,
        filter: 'blur(4px)',
      }} />
    </div>
  )
}

/* ── Character carousel ── */
function CharCarousel({
  selected,
  onSelect,
}: {
  selected: number
  onSelect: (i: number) => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const charCount = Math.min(AVATAR_IMGS.length - 1, 10) // skip AI avatar at end

  function pick(i: number) {
    onSelect(i)
    const el = rowRef.current?.children[i] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <div
      ref={rowRef}
      style={{
        display: 'flex', gap: 10, overflowX: 'auto', padding: '8px 20px',
        scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {Array.from({ length: charCount }).map((_, i) => {
        const sel = i === selected
        const accent = CHAR_ACCENTS[i] ?? '#a855f7'
        return (
          <button
            key={i}
            onClick={() => pick(i)}
            style={{
              flexShrink: 0,
              scrollSnapAlign: 'center',
              width: sel ? 80 : 64,
              height: sel ? 80 : 64,
              borderRadius: 20,
              overflow: 'hidden',
              background: sel ? `${accent}22` : 'rgba(26,26,28,0.8)',
              border: `2.5px solid ${sel ? accent : 'rgba(255,255,255,0.07)'}`,
              boxShadow: sel ? `0 0 18px ${accent}66, 0 0 6px ${accent}33` : 'none',
              transform: sel ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.25s',
              padding: 0, cursor: 'pointer',
              position: 'relative',
            }}
          >
            <img
              src={AVATAR_IMGS[i]}
              alt={AVATAR_NAMES[i]}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            {sel && (
              <div style={{
                position: 'absolute', bottom: 3, right: 3,
                width: 16, height: 16, borderRadius: '50%',
                background: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 900, color: '#fff',
              }}>✓</div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default function ProfilePage({ onClose }: Props) {
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile)
  const [tab, setTab] = useState<Tab>('avatar')
  const [selectedAvatar, setSelectedAvatar] = useState(parseInt(profile.avatarId, 10))
  const [selectedFrame, setSelectedFrame] = useState<FrameId>(profile.frameId)
  const [selectedAura, setSelectedAura] = useState<AuraId>(profile.auraId)
  const [selectedTitle, setSelectedTitle] = useState<TitleId>(profile.titleId)
  const [saved, setSaved] = useState(false)

  const daily = getDailyMissions()
  const weekly = getWeeklyMissions()
  const unlockedTitles = getUnlockedTitles(profile)
  const rank = calcRank(profile.wins)
  const rankMeta = RANK_META[rank]
  const progress = getLevelProgress(profile)
  const wr = winRate(profile)

  const scores = loadScores()
  const gameStats = scores.reduce<Record<string, { matches: number; wins: number }>>((acc, s) => {
    const key = s.gameId ?? 'عمومی'
    if (!acc[key]) acc[key] = { matches: 0, wins: 0 }
    acc[key].matches++
    if (s.rank === 1) acc[key].wins++
    return acc
  }, {})

  function handleSave() {
    const updated = { ...profile, avatarId: String(selectedAvatar), frameId: selectedFrame, auraId: selectedAura, titleId: selectedTitle }
    saveProfile(updated)
    setProfile(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const accent = CHAR_ACCENTS[selectedAvatar] ?? '#a855f7'
  const frameOptions: FrameId[] = ['default', 'bronze', 'silver', 'gold', 'champion', 'event']
  const auraOptions: AuraId[] = ['none', 'fire', 'champion', 'ice', 'galaxy']

  const FRAME_LABELS: Record<FrameId, string> = {
    default: 'ساده', bronze: 'برنز', silver: 'نقره', gold: 'طلا', champion: 'قهرمان', event: 'رویداد',
  }
  const AURA_LABELS: Record<AuraId, string> = {
    none: 'بدون', fire: 'آتش', champion: 'قهرمان', ice: 'یخ', galaxy: 'کهکشان',
  }

  const activeTitle = getActiveTitle(profile)

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'linear-gradient(160deg, #0e0e0f 0%, #180f1e 50%, #0e1214 100%)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, color: '#fff',
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, cursor: 'pointer',
        }}>→</button>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>شخصیت من</span>
        <button onClick={handleSave} style={{
          background: saved ? 'rgba(34,197,94,0.2)' : 'rgba(168,85,247,0.18)',
          border: `1px solid ${saved ? '#22c55e' : '#a855f7'}`,
          borderRadius: 10, color: saved ? '#22c55e' : '#a855f7',
          padding: '6px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.3s',
        }}>
          {saved ? '✓ ذخیره شد' : 'ذخیره'}
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '0 16px', gap: 0, position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(14,14,15,0.92)', backdropFilter: 'blur(12px)',
        }}>
          {([['avatar', 'شخصیت'], ['missions', 'ماموریت‌ها'], ['achievements', 'افتخارات'], ['stats', 'آمار']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '12px 4px',
              background: 'transparent', border: 'none',
              borderBottom: tab === id ? '2px solid #a855f7' : '2px solid transparent',
              color: tab === id ? '#a855f7' : 'rgba(255,255,255,0.4)',
              fontWeight: tab === id ? 800 : 600,
              fontSize: 12, cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: "'IranSans', sans-serif",
            }}>{label}</button>
          ))}
        </div>

        {/* ── Character Stage — only on شخصیت tab ── */}
        {tab === 'avatar' && <div style={{
          position: 'relative',
          padding: '20px 16px 8px',
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${accent}18 0%, transparent 70%)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <CharacterStage idx={selectedAvatar} />

          {/* Identity: name + title */}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 18, margin: 0 }}>
              {profile.name || 'بازیکن'}
            </p>
            <p style={{ color: accent, fontWeight: 700, fontSize: 13, margin: '4px 0 0', opacity: 0.85 }}>
              {activeTitle.label}
            </p>
          </div>

          {/* Level + rank row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <div style={{
              background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)',
              borderRadius: 20, padding: '4px 14px', color: '#a855f7', fontWeight: 900, fontSize: 14,
            }}>
              ✨ Level {profile.level}
            </div>
            <div style={{
              background: `${rankMeta.color}18`, border: `1px solid ${rankMeta.color}55`,
              borderRadius: 20, padding: '4px 14px', color: rankMeta.color, fontWeight: 800, fontSize: 13,
            }}>
              {rankMeta.icon} {rankMeta.label}
            </div>
            {profile.currentStreak >= 3 && (
              <div style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 20, padding: '4px 12px', color: '#f87171', fontWeight: 800, fontSize: 13,
              }}>
                🔥 {profile.currentStreak}
              </div>
            )}
          </div>

          {/* XP bar */}
          <div style={{ width: '100%', maxWidth: 300, marginTop: 14 }}>
            <XPBar pct={progress.pct} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                {progress.current.toLocaleString()} / {progress.needed.toLocaleString()} XP
              </span>
              <span style={{ color: 'rgba(168,85,247,0.7)', fontSize: 11, fontWeight: 700 }}>
                Level {profile.level + 1} →
              </span>
            </div>
          </div>

          {/* Compact stat row */}
          <div style={{ display: 'flex', gap: 6, marginTop: 14, width: '100%', maxWidth: 340 }}>
            {[
              { label: 'بازی', value: profile.matches, color: '#60a5fa' },
              { label: 'برد', value: profile.wins, color: '#4ade80' },
              { label: 'نرخ برد', value: `${wr}%`, color: '#fb923c' },
              { label: 'امتیاز', value: profile.totalScore.toLocaleString(), color: '#ffd700' },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '8px 4px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>}

        {/* ── Tab content ── */}
        <div style={{ padding: '20px 16px 60px' }}>

          {/* ── شخصیت tab ── */}
          {tab === 'avatar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Carousel */}
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, marginBottom: 8, paddingRight: 4 }}>
                  انتخاب شخصیت
                </p>
                <CharCarousel selected={selectedAvatar} onSelect={setSelectedAvatar} />
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, textAlign: 'center', marginTop: 6 }}>
                  {AVATAR_NAMES[selectedAvatar]} — {selectedAvatar + 1} از 10
                </p>
              </div>

              {/* Frame selection */}
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>قاب‌ها</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {frameOptions.map(fId => {
                    const rule = UNLOCK_RULES.find(r => r.itemId === fId && r.itemType === 'frame')
                    const unlocked = !rule || isUnlocked(rule, profile)
                    return (
                      <button key={fId} onClick={() => unlocked && setSelectedFrame(fId)}
                        style={{
                          padding: '8px 14px', borderRadius: 10, cursor: unlocked ? 'pointer' : 'default',
                          background: selectedFrame === fId ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${selectedFrame === fId ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
                          color: unlocked ? '#fff' : 'rgba(255,255,255,0.3)',
                          fontSize: 12, fontWeight: 700,
                          opacity: unlocked ? 1 : 0.6,
                        }}>
                        {!unlocked && '🔒 '}{FRAME_LABELS[fId]}
                        {!unlocked && rule && (
                          <span style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                            {rule.description}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Aura selection */}
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>هاله‌ها</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {auraOptions.map(aId => {
                    const rule = UNLOCK_RULES.find(r => r.itemId === aId && r.itemType === 'aura')
                    const unlocked = !rule || isUnlocked(rule, profile)
                    return (
                      <button key={aId} onClick={() => unlocked && setSelectedAura(aId)}
                        style={{
                          padding: '8px 14px', borderRadius: 10, cursor: unlocked ? 'pointer' : 'default',
                          background: selectedAura === aId ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${selectedAura === aId ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
                          color: unlocked ? '#fff' : 'rgba(255,255,255,0.3)',
                          fontSize: 12, fontWeight: 700,
                          opacity: unlocked ? 1 : 0.6,
                        }}>
                        {!unlocked && '🔒 '}{AURA_LABELS[aId]}
                        {!unlocked && rule && (
                          <span style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                            {rule.description}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Titles */}
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>عنوان‌ها</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TITLES.map(t => {
                    const unlocked = unlockedTitles.some(u => u.id === t.id)
                    const isActive = selectedTitle === t.id
                    return (
                      <button key={t.id} onClick={() => unlocked && setSelectedTitle(t.id)}
                        style={{
                          padding: '8px 14px', borderRadius: 20, cursor: unlocked ? 'pointer' : 'default',
                          background: isActive ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isActive ? '#a855f7' : 'rgba(255,255,255,0.08)'}`,
                          color: unlocked ? (isActive ? '#a855f7' : '#fff') : 'rgba(255,255,255,0.25)',
                          fontSize: 12, fontWeight: 700,
                          opacity: unlocked ? 1 : 0.5,
                        }}>
                        {unlocked ? '' : '🔒 '}{t.label}
                        {!unlocked && (
                          <span style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{t.description}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── ماموریت‌ها tab ── */}
          {tab === 'missions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>🎯 ماموریت‌های امروز</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {daily.map(({ def, progress: prog }) => {
                    const pct = Math.min(1, prog.progress / def.target)
                    return (
                      <div key={def.id} style={{
                        background: prog.completed ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${prog.completed ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 14, padding: '14px 16px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{def.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>{def.title}</span>
                              <span style={{ color: '#a855f7', fontWeight: 800, fontSize: 12 }}>+{def.rewardXP} XP</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '3px 0 6px' }}>{def.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 3, background: prog.completed ? '#22c55e' : '#a855f7', width: `${pct * 100}%`, transition: 'width 0.6s' }} />
                              </div>
                              <span style={{ color: prog.completed ? '#4ade80' : 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                {prog.completed ? '✓ انجام شد' : `${prog.progress} / ${def.target}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>📅 ماموریت‌های هفتگی</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {weekly.map(({ def, progress: prog }) => {
                    const pct = Math.min(1, prog.progress / def.target)
                    return (
                      <div key={def.id} style={{
                        background: prog.completed ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${prog.completed ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 14, padding: '14px 16px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{def.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>{def.title}</span>
                              <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: 12 }}>+{def.rewardXP} XP</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '3px 0 6px' }}>{def.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 3, background: prog.completed ? '#22c55e' : '#fbbf24', width: `${pct * 100}%`, transition: 'width 0.6s' }} />
                              </div>
                              <span style={{ color: prog.completed ? '#4ade80' : 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                {prog.completed ? '✓ انجام شد' : `${prog.progress} / ${def.target}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── افتخارات tab ── */}
          {tab === 'achievements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ACHIEVEMENTS.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}>
                  <p style={{ fontSize: 36, margin: '0 0 12px' }}>🏅</p>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>هنوز افتخاری باز نکردی</p>
                  <p style={{ fontSize: 12, marginTop: 8 }}>با بازی کردن اولین افتخارت را به دست بیاور.</p>
                </div>
              )}
              {ACHIEVEMENTS.map(a => {
                const unlocked = a.unlockCondition(profile)
                return (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: unlocked ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${unlocked ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 14, padding: '14px 16px',
                    opacity: unlocked ? 1 : 0.5,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: unlocked ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, flexShrink: 0,
                      filter: unlocked ? 'none' : 'grayscale(1)',
                    }}>
                      {unlocked ? a.icon : '🔒'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: unlocked ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: 14, margin: 0 }}>{a.title}</p>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '3px 0 0' }}>{a.description}</p>
                    </div>
                    {unlocked && <span style={{ color: '#4ade80', fontSize: 18 }}>✓</span>}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── آمار tab ── */}
          {tab === 'stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '16px',
              }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>آمار کلی</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['سطح', `Level ${profile.level}`, '#a855f7'],
                    ['امتیاز کل', profile.totalScore.toLocaleString(), '#ffd700'],
                    ['تعداد بازی', profile.matches.toString(), '#60a5fa'],
                    ['برد', profile.wins.toString(), '#4ade80'],
                    ['باخت', profile.losses.toString(), '#f87171'],
                    ['نرخ برد', `${wr}%`, '#fb923c'],
                    ['بهترین استریک', `🔥${profile.bestStreak}`, '#f97316'],
                    ['استریک فعلی', `🔥${profile.currentStreak}`, profile.currentStreak >= 3 ? '#ef4444' : '#6b7280'],
                    ['رتبه', `${rankMeta.icon} ${rankMeta.label}`, rankMeta.color],
                  ].map(([label, value, color]) => (
                    <div key={label as string} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8,
                    }}>
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{label}</span>
                      <span style={{ color: color as string, fontWeight: 800, fontSize: 14 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {Object.keys(gameStats).length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 20px', color: 'rgba(255,255,255,0.3)' }}>
                  <p style={{ fontSize: 30, margin: '0 0 8px' }}>📊</p>
                  <p style={{ fontWeight: 700, fontSize: 13 }}>هنوز بازی ای انجام نداده‌ای</p>
                </div>
              )}

              {Object.keys(gameStats).length > 0 && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>آمار بازی‌ها</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(gameStats).map(([gameId, gs]) => (
                      <div key={gameId} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12, padding: '12px 14px',
                      }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{gameId}</span>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{gs.matches} بازی</span>
                          <span style={{ color: '#4ade80', fontWeight: 800, fontSize: 12 }}>{gs.wins} برد</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
