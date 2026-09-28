import type { GameState } from '../types'
import { MISSIONS, PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'

interface Props { state: GameState }

export default function TurnTransition({ state }: Props) {
  const nextIdx = state.currentTurnIndex + 1
  const isLast = nextIdx >= state.turnOrder.length
  const nextId = !isLast ? state.turnOrder[nextIdx] : null
  const nextPlayer = nextId ? state.players.find(p => p.id === nextId) : null
  const nextColor = nextPlayer ? PLAYER_COLORS[nextPlayer.colorIndex % PLAYER_COLORS.length] : null

  const prevId = state.turnOrder[state.currentTurnIndex]
  const prevPlayer = state.players.find(p => p.id === prevId)
  const prevResult = state.playerResults[prevId]

  return (
    <div className="h-full overflow-y-auto">
    <div className="min-h-full flex flex-col items-center justify-center gap-8 px-4 py-6">
      {/* Prev result */}
      {prevPlayer && prevResult && (
        <div className="animate-slide-up text-center glass-panel rounded-2xl px-8 py-4">
          <div className="flex items-center gap-3 justify-center mb-1">
            <img src={avatarSrc(prevPlayer.avatar)} alt="" className="w-10 h-10 rounded-full object-cover" />
            <span className="font-black text-white text-xl">{prevPlayer.name}</span>
          </div>
          <div className={`font-display text-3xl font-black ${prevResult.missionScore >= 0 ? 'text-green-400' : 'text-red-400'}`}
            style={{ textShadow: prevResult.missionScore >= 0 ? '0 0 20px #00ff88' : '0 0 20px #ff2d78' }}>
            {prevResult.missionScore >= 0 ? '+' : ''}{prevResult.missionScore}
          </div>
          <div className="text-xs text-gray-400 mt-1">{prevResult.detail}</div>
        </div>
      )}

      {/* Next player */}
      {isLast ? (
        <div className="animate-pop-in text-center">
          <div className="text-5xl mb-3">🎉</div>
          <div className="font-display text-3xl font-black text-green-400">همه تموم کردن!</div>
        </div>
      ) : nextPlayer && nextColor ? (
        <div className="animate-pop-in text-center">
          <img src={avatarSrc(nextPlayer.avatar)} alt="" className="w-16 h-16 rounded-full object-cover mb-2" />
          <div className="text-gray-400 font-bold mb-1">🎯 نوبت</div>
          <div className="font-display text-4xl font-black"
            style={{ color: nextColor.light, textShadow: `0 0 25px ${nextColor.bg}` }}>
            {nextPlayer.name}
          </div>
          <div className="text-purple-400 text-sm mt-2">آماده باش...</div>
        </div>
      ) : null}
    </div>
    </div>
  )
}
