import { useState, useCallback, useRef } from 'react'
import { useGameEngine } from './useGameEngine'
import { useOnlineRoom, type JoinInfo } from './lib/useOnlineRoom'
import { useAI } from './lib/useAI'
import { MISSIONS, GAME_NAME } from './constants'
import type { GameState, GameAction } from './types'
import { isAdminLoggedIn } from './lib/adminAuth'
import Home from './screens/Home'
import BehsazaniHub, { type BehsazaniPlayer } from './behsazani/BehsazaniHub'
import HideSeekGame from './behsazani/games/HideSeekGame'
import Lobby from './screens/Lobby'
import GameConfig from './screens/GameConfig'
import GameCountdown from './screens/GameCountdown'
import MissionIntro from './screens/MissionIntro'
import TurnTransition from './screens/TurnTransition'
import SpeedAttack from './missions/SpeedAttack'
import MemoryMaster from './missions/MemoryMaster'
import LogicBreaker from './missions/LogicBreaker'
import FastestFinger from './missions/FastestFinger'
import TeamChallenge from './missions/TeamChallenge'
import FinalMission from './missions/FinalMission'
import NameFamily from './missions/NameFamily'
import OneWordClues from './missions/OneWordClues'
import MissionResult from './screens/MissionResult'
import Leaderboard from './screens/Leaderboard'
import WinnerCeremony from './screens/WinnerCeremony'
import HighScores from './screens/HighScores'
import Credits from './screens/Credits'
import Tutorial from './screens/Tutorial'
import Feedback from './screens/Feedback'
import AdminLogin from './screens/admin/AdminLogin'
import AdminDashboard from './screens/admin/AdminDashboard'
import ProfilePage from './screens/ProfilePage'
import XPToast, { type XPEvent } from './components/XPToast'

export interface OnlineSession {
  code: string
  playerId: string
  isHost: boolean
  joinInfo?: JoinInfo
}

function MissionRenderer({ state, dispatch, localPlayerId }: { state: GameState; dispatch: React.Dispatch<GameAction>; localPlayerId?: string }) {
  const enabledList = MISSIONS.filter(m => state.enabledMissions.includes(m.id))
  const mId = enabledList[state.currentMissionIndex]?.id
  const props = { state, dispatch }
  if (mId === 'SPEED') return <SpeedAttack {...props} />
  if (mId === 'MEMORY') return <MemoryMaster {...props} />
  if (mId === 'LOGIC') return <LogicBreaker {...props} />
  if (mId === 'FASTEST') return <FastestFinger {...props} />
  if (mId === 'TEAM') return <TeamChallenge {...props} />
  if (mId === 'FINAL') return <FinalMission {...props} localPlayerId={localPlayerId} />
  if (mId === 'NAME_FAMILY') return <NameFamily {...props} localPlayerId={localPlayerId} />
  if (mId === 'ONE_WORD') return <OneWordClues {...props} localPlayerId={localPlayerId} />
  return null
}

function OnlineGame({ session, localEngine, onShowScores, onLobbyExit }: {
  session: OnlineSession
  localEngine: ReturnType<typeof useGameEngine>
  onShowScores: () => void
  onLobbyExit: () => void
}) {
  const { state, dispatch } = localEngine
  const [remoteState, setRemoteState] = useState<GameState | null>(null)
  const phaseRef = useRef(state.phase)
  phaseRef.current = state.phase

  const handleRemoteState = useCallback((s: GameState) => {
    setRemoteState(s)
    if (!session.isHost && phaseRef.current === 'HOME') {
      dispatch({ type: 'LOAD_REMOTE_STATE', state: s } as any)
    }
  }, [session.isHost, dispatch])

  const { sendAction } = useOnlineRoom({
    code: session.code,
    isHost: session.isHost,
    state,
    dispatch,
    onRemoteState: handleRemoteState,
    joinInfo: session.joinInfo,
  })

  const displayState = session.isHost ? state : (remoteState ?? state)
  const effectiveDispatch = session.isHost ? dispatch : sendAction

  if (!session.isHost && displayState.phase === 'HOME') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 game-bg" dir="rtl">
        <div className="text-4xl animate-spin" style={{ animationDuration: '1.2s' }}>⚙️</div>
        <p className="font-display text-xl font-black text-white">در حال اتصال به اتاق...</p>
        <p className="text-sm" style={{ color: '#6D6E71' }}>کد: <span style={{ color: '#CC2229' }}>{session.code}</span></p>
      </div>
    )
  }

  return <GameScreen state={displayState} dispatch={effectiveDispatch} session={session} localPlayerId={session.playerId} onShowScores={onShowScores} onShowFeedback={undefined} onXPEarned={undefined} onLobbyExit={onLobbyExit} />
}

function GameScreen({
  state, dispatch, session, localPlayerId, onShowScores, onShowFeedback, onXPEarned, onLobbyExit,
}: {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  session?: OnlineSession
  localPlayerId?: string
  onShowScores: () => void
  onShowFeedback?: () => void
  onXPEarned?: (xp: number, leveledUp: boolean, newLevel: number, missionXP: number, achievements: string[]) => void
  onLobbyExit?: () => void
}) {
  return (
    <>
      {state.phase === 'LOBBY' && <Lobby state={state} dispatch={dispatch} session={session} onExit={onLobbyExit} />}
      {state.phase === 'GAME_CONFIG' && <GameConfig state={state} dispatch={dispatch} session={session} />}
      {state.phase === 'COUNTDOWN' && <GameCountdown value={state.showCountdownValue} />}
      {state.phase === 'MISSION_INTRO' && <MissionIntro state={state} />}
      {state.phase === 'TURN_TRANSITION' && <TurnTransition state={state} />}
      {state.phase === 'PLAYING' && <MissionRenderer state={state} dispatch={dispatch} localPlayerId={localPlayerId} />}
      {state.phase === 'MISSION_RESULT' && <MissionResult state={state} />}
      {state.phase === 'LEADERBOARD' && <Leaderboard state={state} />}
      {state.phase === 'WINNER_CEREMONY' && (
        <WinnerCeremony state={state} dispatch={dispatch} onShowScores={onShowScores} onShowFeedback={onShowFeedback}
          onXPEarned={onXPEarned ? (xp, leveledUp, newLevel, missionXP, achievements) =>
            onXPEarned(xp, leveledUp, newLevel, missionXP, achievements) : undefined}
        />
      )}
    </>
  )
}

interface BehsazaniSession {
  gameId?: string       // undefined for joiners
  hostPlayer: BehsazaniPlayer
  joinCode?: string     // defined for joiners
}

export default function App() {
  const localEngine = useGameEngine()
  const { state, dispatch } = localEngine
  const [session, setSession] = useState<OnlineSession | null>(null)
  const [behsazaniSession, setBehsazaniSession] = useState<BehsazaniSession | null>(null)
  const [soloGameId, setSoloGameId] = useState<string | null>(null)
  useAI(state, dispatch, !!session)
  const [overlay, setOverlay] = useState<'none' | 'scores' | 'credits' | 'tutorial' | 'admin-login' | 'admin-dashboard' | 'feedback' | 'profile'>('none')
  const [adminAuthed, setAdminAuthed] = useState(isAdminLoggedIn)
  const [xpEvent, setXPEvent] = useState<XPEvent | null>(null)

  /* Feedback context: set when WINNER_CEREMONY phase ends and we want feedback */
  const feedbackContext = useRef<{ playerName: string; playerId: string; gameId: string; sessionId: string } | null>(null)

  function handleOnlineJoin(sess: OnlineSession, _initialState: GameState | null) { setSession(sess) }
  function handleOnlineCreate(sess: OnlineSession) { setSession(sess) }

  function handleBehsazaniGame(gameId: string, playerName: string, avatar: string, colorIndex: number) {
    setBehsazaniSession({
      gameId,
      hostPlayer: { id: `host-${Date.now()}`, name: playerName, avatar, colorIndex },
    })
  }

  function handleBehsazaniJoin(code: string, playerName: string, avatar: string, colorIndex: number) {
    setBehsazaniSession({
      joinCode: code,
      hostPlayer: { id: `p-${Math.random().toString(36).slice(2, 8)}`, name: playerName, avatar, colorIndex },
    })
  }

  const showScores = () => setOverlay('scores')
  const showCredits = () => setOverlay('credits')
  const showTutorial = () => setOverlay('tutorial')
  const closeOverlay = () => setOverlay('none')

  function handleShowFeedback(playerName: string, playerId: string) {
    const ts = Date.now()
    feedbackContext.current = {
      playerName,
      playerId,
      gameId: `session-${ts}`,
      sessionId: `session-${ts}`,
    }
    setOverlay('feedback')
  }

  function handleAdminLoginSuccess() {
    setAdminAuthed(true)
    setOverlay('admin-dashboard')
  }

  function handleAdminClose() {
    setAdminAuthed(false)
    setOverlay('none')
  }

  /* Detect winner ceremony completion → show feedback prompt */
  const prevPhaseRef = useRef(state.phase)
  if (prevPhaseRef.current === 'WINNER_CEREMONY' && state.phase === 'HOME') {
    // Game ended → reset, handle feedback trigger via WinnerCeremony's own callback
  }
  prevPhaseRef.current = state.phase

  const isInGame = state.phase !== 'HOME' || !!session

  return (
    <div className="h-full overflow-hidden game-bg" dir="rtl">
      {/* ── Solo game overlay ── */}
      {soloGameId === 'hide_seek' && (
        <HideSeekGame onExit={() => setSoloGameId(null)} />
      )}

      {/* ── Behsazani game overlay — full screen, highest priority ── */}
      {!soloGameId && behsazaniSession && (
        <BehsazaniHub
          gameId={behsazaniSession.gameId}
          joinCode={behsazaniSession.joinCode}
          hostPlayer={behsazaniSession.hostPlayer}
          onExit={() => setBehsazaniSession(null)}
        />
      )}

      {/* ── Main screens (hidden when behsazani or solo is active) ── */}
      {!soloGameId && !behsazaniSession && state.phase === 'HOME' && !session && (
        <Home
          dispatch={dispatch}
          onOnlineCreate={handleOnlineCreate}
          onOnlineJoin={handleOnlineJoin}
          onShowScores={showScores}
          onShowCredits={showCredits}
          onShowTutorial={showTutorial}
          onShowAdmin={() => setOverlay(adminAuthed ? 'admin-dashboard' : 'admin-login')}
          onShowProfile={() => setOverlay('profile')}
          onBehsazaniGame={handleBehsazaniGame}
          onBehsazaniJoin={handleBehsazaniJoin}
          onSoloGame={(id) => setSoloGameId(id)}
        />
      )}
      {!soloGameId && !behsazaniSession && (state.phase !== 'HOME' || session) && session && (
        <OnlineGame session={session} localEngine={localEngine} onShowScores={showScores} onLobbyExit={() => { dispatch({ type: 'NEW_PLAYERS' }); setSession(null) }} />
      )}
      {!soloGameId && !behsazaniSession && state.phase !== 'HOME' && !session && (
        <GameScreen state={state} dispatch={dispatch} onShowScores={showScores}
          onShowFeedback={() => {
            const winner = [...state.players].sort((a, b) => b.score - a.score)[0]
            if (winner) handleShowFeedback(winner.name, winner.id)
          }}
          onXPEarned={(xp, leveledUp, newLevel, missionXP, achievements) =>
            setXPEvent({ xp, leveledUp, newLevel, missionXP, achievementNames: achievements })
          }
        />
      )}

      {/* ── Overlays ── */}
      {overlay === 'scores' && <HighScores onClose={closeOverlay} />}
      {overlay === 'credits' && <Credits onClose={closeOverlay} />}
      {overlay === 'tutorial' && <Tutorial onClose={closeOverlay} />}
      {overlay === 'admin-login' && (
        <AdminLogin onSuccess={handleAdminLoginSuccess} onClose={closeOverlay} />
      )}
      {overlay === 'admin-dashboard' && adminAuthed && (
        <AdminDashboard onClose={handleAdminClose} />
      )}
      <XPToast event={xpEvent} onDone={() => setXPEvent(null)} />
      {overlay === 'profile' && <ProfilePage onClose={closeOverlay} />}
      {overlay === 'feedback' && feedbackContext.current && (
        <Feedback
          playerName={feedbackContext.current.playerName}
          playerId={feedbackContext.current.playerId}
          gameName={GAME_NAME}
          gameId={feedbackContext.current.gameId}
          sessionId={feedbackContext.current.sessionId}
          onDone={() => { feedbackContext.current = null; closeOverlay() }}
        />
      )}

      {/* Admin icon moved into Home.tsx — shown only on main home step */}
    </div>
  )
}
