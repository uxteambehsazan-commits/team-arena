import { useState, useEffect, useRef } from 'react'
import type { GameState, GameAction } from '../types'
import { PLAYER_COLORS } from '../constants'
import PlayerAvatar from '../components/PlayerAvatar'
import Confetti from '../components/Confetti'
import MobileHeader from '../components/MobileHeader'
import { saveGameScores } from '../lib/scores'
import { isFeedbackEnabled } from '../lib/adminSettings'
import { addGameResult, ACHIEVEMENTS, loadProfile } from '../lib/playerProfile'
import { updateMissionsAfterGame } from '../lib/missions'
const bgImage = `${import.meta.env.BASE_URL}imgs/Bg-1.jpg`

interface Props {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  onShowScores: () => void
  onShowFeedback?: () => void
  onXPEarned?: (xp: number, leveledUp: boolean, newLevel: number, missionXP: number, achievements: string[]) => void
}

export default function WinnerCeremony({ state, dispatch, onShowScores, onShowFeedback, onXPEarned }: Props) {
  const [reveal, setReveal] = useState(0)
  const savedRef = useRef(false)
  const xpRef = useRef(false)

  const ranked = [...state.players].sort((a, b) => b.score - a.score || a.totalResponseTime - b.totalResponseTime)
  const winner = ranked[0]
  const second = ranked[1]
  const third = ranked[2]
  const winnerColor = winner ? PLAYER_COLORS[winner.colorIndex % PLAYER_COLORS.length] : null

  useEffect(() => {
    const timings = [1200, 2800, 4800]
    const timers = timings.map((t, i) => setTimeout(() => setReveal(i + 1), t))
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (!savedRef.current && state.players.length > 0) {
      savedRef.current = true
      const gameId = `game-${Date.now()}`
      saveGameScores(state.players.map(p => ({ name: p.name, score: p.score })), gameId)
    }
  }, [state.players])

  useEffect(() => {
    if (!xpRef.current && winner && onXPEarned) {
      xpRef.current = true
      const isWin = true // local single player — treat as win
      const prevProfile = loadProfile()
      const prevUnlocked = new Set(prevProfile.unlockedAchievements)
      const result = addGameResult(isWin, winner.score)
      const missionXP = updateMissionsAfterGame({
        won: isWin,
        gameId: `game-${Date.now()}`,
        newStreak: (prevProfile.currentStreak ?? 0) + 1,
      })
      const newProfile = loadProfile()
      const newAchievements = ACHIEVEMENTS
        .filter(a => !prevUnlocked.has(a.id) && a.unlockCondition(newProfile))
        .map(a => a.title)
      onXPEarned(result.xpGained, result.leveledUp, result.newLevel, missionXP, newAchievements)
    }
  }, [winner])

  return (
    <div className="h-full flex flex-col items-center overflow-hidden relative">
      <Confetti active={reveal >= 3} />

      {/* Castle background */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={bgImage}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.55 }}
          alt=""
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,12,0.5) 0%, rgba(10,10,12,0.2) 40%, rgba(10,10,12,0.75) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, #ffd60a0d 0%, transparent 55%)' }} />
      </div>

      {/* Header */}
      <div className="w-full z-10">
        <MobileHeader title="🏆 دورهمی تموم شد!" />
      </div>

      {/* Podium */}
      <div className="flex-1 w-full overflow-y-auto flex flex-col items-center justify-center z-10 px-4 py-2">
        <div className="flex items-end justify-center gap-3 w-full max-w-md">
          {/* 2nd */}
          <div className={`flex flex-col items-center gap-1.5 transition-all duration-700 ${reveal >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {second && (<>
              <div className="text-3xl">🥈</div>
              <PlayerAvatar avatar={second.avatar} colorIndex={second.colorIndex} size="md" />
              <div className="text-xs font-black text-center leading-tight max-w-[72px] break-words" style={{ color: '#c0c0c0' }}>{second.name}</div>
              <div className="font-display text-lg font-black text-white">{second.score}</div>
              <div className="w-20 h-16 glass-panel rounded-t-xl flex items-center justify-center" style={{ borderColor: '#c0c0c033' }}>
                <span className="font-display text-xl font-black" style={{ color: '#c0c0c0' }}>2</span>
              </div>
            </>)}
          </div>

          {/* 1st */}
          <div className={`flex flex-col items-center gap-1.5 transition-all duration-700 ${reveal >= 3 ? 'opacity-100 translate-y-0 scale-110' : 'opacity-0 translate-y-8'}`}>
            {winner && winnerColor && (<>
              <div className="text-4xl animate-bounce">👑</div>
              <PlayerAvatar avatar={winner.avatar} colorIndex={winner.colorIndex} size="xl" isActive />
              <div className="font-display text-xl font-black text-center max-w-[88px] break-words" style={{ color: winnerColor.light, textShadow: `0 0 20px ${winnerColor.bg}` }}>{winner.name}</div>
              <div className="font-display text-2xl font-black" style={{ color: '#ffd60a', textShadow: '0 0 16px #ffd60a' }}>{winner.score}</div>
              <div className="w-24 h-24 glass-panel rounded-t-xl flex items-center justify-center" style={{ borderColor: '#ffd60a44', boxShadow: '0 0 24px #ffd60a22' }}>
                <span className="font-display text-2xl font-black" style={{ color: '#ffd60a' }}>1</span>
              </div>
            </>)}
          </div>

          {/* 3rd */}
          <div className={`flex flex-col items-center gap-1.5 transition-all duration-700 ${reveal >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {third && (<>
              <div className="text-3xl">🥉</div>
              <PlayerAvatar avatar={third.avatar} colorIndex={third.colorIndex} size="md" />
              <div className="text-xs font-black text-center leading-tight max-w-[72px] break-words" style={{ color: '#cd7f32' }}>{third.name}</div>
              <div className="font-display text-lg font-black text-white">{third.score}</div>
              <div className="w-16 h-12 glass-panel rounded-t-xl flex items-center justify-center" style={{ borderColor: '#cd7f3233' }}>
                <span className="font-display text-xl font-black" style={{ color: '#cd7f32' }}>3</span>
              </div>
            </>)}
          </div>
        </div>

        {/* Winner label */}
        {reveal >= 3 && winner && (
          <div className="animate-pop-in text-center mt-5">
            <div className="font-display text-2xl font-black text-yellow-400" style={{ textShadow: '0 0 24px #ffd60a' }}>
              قهرمان دورهمی! 👑
            </div>
            <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>مهم‌تر از امتیاز، لحظه‌هایی بود که کنار هم ساختیم 🤝</p>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {reveal >= 3 && (
        <div className="w-full px-5 pt-3 flex-shrink-0 z-10 flex flex-col gap-3 max-w-lg mx-auto" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <button
            onClick={() => dispatch({ type: 'REPLAY' })}
            className="btn-game w-full py-4 rounded-2xl font-black text-white text-base"
            style={{ background: 'linear-gradient(135deg,#CC2229,#e84249)', boxShadow: '0 0 20px #CC222966' }}>
            🔥 دوباره بازی
          </button>
          <div className="flex gap-2.5">
            <button
              onClick={() => dispatch({ type: 'NEW_PLAYERS' })}
              className="btn-game flex-1 py-3.5 rounded-2xl font-black text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#c0c0c0', backdropFilter: 'blur(8px)' }}>
              👥 دورهمی جدید
            </button>
            {onShowFeedback && isFeedbackEnabled() && (
              <button
                onClick={onShowFeedback}
                className="btn-game flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.35)', color: '#c084fc', backdropFilter: 'blur(8px)' }}>
                📝 نظرسنجی
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
