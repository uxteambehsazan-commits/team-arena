import { useEffect, useRef, useState } from 'react'
import type { GameState } from '../types'
import { MISSIONS, PLAYER_COLORS } from '../constants'
import PlayerAvatar from '../components/PlayerAvatar'

interface Props { state: GameState }

export default function Leaderboard({ state }: Props) {
  const ranked = [...state.players].sort((a, b) => b.score - a.score || a.totalResponseTime - b.totalResponseTime)
  const enabledList = MISSIONS.filter(m => state.enabledMissions.includes(m.id))
  const mission = enabledList[state.currentMissionIndex]
  const isLast = state.currentMissionIndex >= enabledList.length - 1

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-4 relative overflow-hidden">
      <div className="absolute w-full h-full pointer-events-none">
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(ellipse at 50% 0%, #a855f7 0%, transparent 60%)' }} />
      </div>

      <div className="animate-pop-in text-center">
        <div className="text-sm font-bold mb-1" style={{ color: '#CC2229' }}>
          {isLast ? '🏆 جدول نهایی رقابت' : `بعد از بازی ${state.currentMissionIndex + 1}`}
        </div>
        <h2 className="font-display text-3xl font-black text-white">جدول رقابت</h2>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-lg">
        {ranked.map((p, i) => {
          const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
          const result = state.playerResults[p.id]
          const ms = result?.missionScore ?? 0
          const medal = ['🥇','🥈','🥉'][i]
          return (
            <div key={p.id}
              className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3 animate-slide-up animate-rank-move"
              style={{
                animationDelay: `${i * 0.1}s`,
                borderColor: i === 0 ? '#ffd60a44' : i === 1 ? '#c0c0c033' : i === 2 ? '#cd7f3233' : `${color.bg}28`,
              }}>
              <div className="font-display text-xl font-black w-7 text-center flex-shrink-0">
                {medal ?? <span style={{ color: '#6D6E71' }}>{i + 1}</span>}
              </div>
              <PlayerAvatar avatar={p.avatar} colorIndex={p.colorIndex} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="font-black text-white text-sm truncate">{p.name}</div>
                {ms !== 0 && (
                  <div className="text-xs font-bold" style={{ color: ms > 0 ? '#4ade80' : '#CC2229' }}>
                    این راند: {ms > 0 ? '+' : ''}{ms}
                  </div>
                )}
                {i > 0 && ranked[0] && (
                  <div className="text-xs" style={{ color: '#6D6E71' }}>
                    فقط {(ranked[0].score - p.score).toLocaleString('fa-IR')} امتیاز تا صدر
                  </div>
                )}
              </div>
              <div className="text-left flex-shrink-0">
                <div className="font-display text-2xl font-black text-white">{p.score}</div>
                <div className="text-xs text-left" style={{ color: '#6D6E71' }}>امتیاز</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-sm animate-pulse" style={{ color: '#CC2229' }}>
        {isLast ? '🏆 قهرمان دورهمی در راهه...' : `بازی بعدی: ${enabledList[state.currentMissionIndex + 1]?.emoji} ${enabledList[state.currentMissionIndex + 1]?.name}`}
      </div>
    </div>
  )
}
