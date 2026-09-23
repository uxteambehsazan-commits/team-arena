// @refresh reset
import { useReducer, useEffect, useCallback } from 'react'
import type { GameState, GameAction, Player, TeamState, NameFamilyState, OneWordState } from './types'
import { MISSIONS, LOGIC_PUZZLES, SPEED_EMOJIS, PERSIAN_LETTERS, NAME_FAMILY_CATEGORIES, ONE_WORD_QUESTIONS, DEFAULT_ENABLED_MISSIONS, generateRoomCode } from './constants'

let _nextId = 1
const makeId = () => `p${_nextId++}`

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateSpeedTargets() {
  const set = SPEED_EMOJIS[Math.floor(Math.random() * SPEED_EMOJIS.length)]
  const shuffled = shuffleArray([...set]).slice(0, 9)
  const targetIdx = Math.floor(Math.random() * shuffled.length)
  return shuffled.map((emoji, i) => ({
    id: i, emoji, isTarget: i === targetIdx,
    x: (i % 3) * 30 + 10, y: Math.floor(i / 3) * 30 + 10,
  }))
}

function buildTurnOrder(players: Player[], offset: number): string[] {
  const active = players.filter(p => p.connected)
  if (!active.length) return []
  const start = offset % active.length
  return [...active.slice(start), ...active.slice(0, start)].map(p => p.id)
}

function calcRankings(players: Player[]): Player[] {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.totalResponseTime !== b.totalResponseTime) return a.totalResponseTime - b.totalResponseTime
    return a.joinedAt - b.joinedAt
  })
  return players.map(p => ({ ...p, rank: sorted.findIndex(s => s.id === p.id) + 1 }))
}

function applyResults(
  players: Player[],
  results: GameState['playerResults']
): Player[] {
  const updated = players.map(p => {
    const r = results[p.id]
    if (!r) return p
    return { ...p, score: p.score + r.missionScore, missionScore: r.missionScore, totalResponseTime: p.totalResponseTime + r.responseTime }
  })
  return calcRankings(updated)
}

const initial: GameState = {
  phase: 'HOME', players: [], hostId: '',
  currentMissionIndex: 0, missionStartOffset: 0,
  turnOrder: [], currentTurnIndex: 0, timeLeft: 0,
  submitted: {}, playerResults: {},
  goSignalTime: null, teamState: null,
  finalClicks: {}, dozState: null, logicQuestion: null, speedTargets: null,
  showCountdownValue: 3, missionIntroCountdown: 3, memoryBoards: {},
  enabledMissions: DEFAULT_ENABLED_MISSIONS,
  nameFamilyState: null, oneWordState: null,
  aiDifficulty: 'easy' as const,
  lobbyCountdown: 0,
}

function getEnabledMissionsList(state: GameState) {
  return MISSIONS.filter(m => state.enabledMissions.includes(m.id))
}

function startMissionPhase(state: GameState): GameState {
  const enabledList = getEnabledMissionsList(state)
  const mi = state.currentMissionIndex
  const mission = enabledList[mi]
  if (!mission) return { ...state, phase: 'WINNER_CEREMONY' }

  const turnOrder = buildTurnOrder(state.players, state.missionStartOffset)

  let extra: Partial<GameState> = {
    nameFamilyState: null, oneWordState: null, teamState: null,
    speedTargets: null, logicQuestion: null, dozState: null,
  }
  if (mission.id === 'FINAL') {
    const activePlayers = state.players.filter(p => p.connected)
    const firstPlayer = activePlayers[0]
    if (firstPlayer) {
      extra.dozState = {
        board: Array(9).fill(null),
        currentPlayerId: firstPlayer.id,
        scores: Object.fromEntries(activePlayers.map(p => [p.id, 0])),
        draws: 0,
        roundWinner: null,
        winLine: null,
      }
    }
  } else if (mission.id === 'LOGIC') {
    extra.logicQuestion = LOGIC_PUZZLES[Math.floor(Math.random() * LOGIC_PUZZLES.length)]
  } else if (mission.id === 'SPEED') {
    extra.speedTargets = generateSpeedTargets()
  } else if (mission.type === 'cooperative') {
    const seq = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7])
    extra.teamState = { sequence: seq, activated: [], success: false, failed: false }
  } else if (mission.id === 'NAME_FAMILY') {
    const letter = PERSIAN_LETTERS[Math.floor(Math.random() * PERSIAN_LETTERS.length)]
    extra.nameFamilyState = { letter, answers: {}, locked: {} }
  } else if (mission.id === 'ONE_WORD') {
    const qIdx = Math.floor(Math.random() * ONE_WORD_QUESTIONS.length)
    extra.oneWordState = { questionIndex: qIdx, revealedClues: 1, winner: null, wrongGuesses: {} }
  }

  return {
    ...state, ...extra,
    phase: 'MISSION_INTRO',
    turnOrder, currentTurnIndex: 0,
    timeLeft: 3,
    submitted: {}, playerResults: {},
    goSignalTime: null, finalClicks: {},
    missionIntroCountdown: 3, dozState: extra.dozState ?? null,
  }
}

function startCurrentTurn(state: GameState): GameState {
  const enabledList = getEnabledMissionsList(state)
  const mission = enabledList[state.currentMissionIndex]
  if (!mission) return { ...state, phase: 'WINNER_CEREMONY' }
  return { ...state, phase: 'PLAYING', timeLeft: mission.timer }
}

function doEndMission(state: GameState): GameState {
  const enabledList = getEnabledMissionsList(state)
  const mission = enabledList[state.currentMissionIndex]
  const players = applyResults(state.players, state.playerResults)
  return { ...state, players, phase: 'MISSION_RESULT' }
}

function doNameFamilyEnd(state: GameState): GameState {
  const nf = state.nameFamilyState
  if (!nf) return doEndMission(state)
  const activePlayers = state.players.filter(p => p.connected)
  const results: GameState['playerResults'] = {}

  const letter = nf.letter
  NAME_FAMILY_CATEGORIES.forEach(cat => {
    // collect all answers for this category that actually start with the correct letter
    const allAnswers: Record<string, string> = {}
    activePlayers.forEach(p => {
      const ans = (nf.answers[p.id]?.[cat.id] ?? '').trim()
      if (ans && ans[0] === letter) allAnswers[p.id] = ans.toLowerCase()
    })
    // count occurrences
    const freq: Record<string, number> = {}
    Object.values(allAnswers).forEach(v => { freq[v] = (freq[v] ?? 0) + 1 })
    activePlayers.forEach(p => {
      const ans = allAnswers[p.id]
      if (!ans) return
      const score = freq[ans] === 1 ? 150 : 50
      const prev = results[p.id]
      results[p.id] = {
        playerId: p.id,
        missionScore: (prev?.missionScore ?? 0) + score,
        detail: prev?.detail ? `${prev.detail} | ${cat.label}: +${score}` : `${cat.label}: +${score}`,
        responseTime: 0,
      }
    })
  })

  activePlayers.forEach(p => {
    if (!results[p.id]) {
      results[p.id] = { playerId: p.id, missionScore: 0, detail: 'بدون جواب', responseTime: 0 }
    }
  })

  return doEndMission({ ...state, playerResults: results })
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'CREATE_GAME': {
      if (state.players.length >= 8) return state
      const id = makeId()
      const player: Player = {
        id, name: action.name, avatar: action.avatar, colorIndex: action.colorIndex,
        score: 0, missionScore: 0, rank: 0, ready: true,
        connected: true, totalResponseTime: 0, joinedAt: Date.now(),
      }
      return { ...state, phase: 'LOBBY', players: [player], hostId: id }
    }

    case 'ADD_PLAYER': {
      if (state.players.length >= 8) return state
      const id = makeId()
      const player: Player = {
        id, name: action.name, avatar: action.avatar, colorIndex: action.colorIndex,
        score: 0, missionScore: 0, rank: 0, ready: false,
        connected: true, totalResponseTime: 0, joinedAt: Date.now(),
      }
      return { ...state, players: [...state.players, player], hostId: state.hostId || id }
    }

    case 'REMOVE_PLAYER': {
      const players = state.players.filter(p => p.id !== action.id)
      return { ...state, players, hostId: state.hostId === action.id ? (players[0]?.id || '') : state.hostId }
    }

    case 'TOGGLE_READY': {
      return { ...state, players: state.players.map(p => p.id === action.id ? { ...p, ready: !p.ready } : p) }
    }

    case 'START_GAME': {
      return { ...state, lobbyCountdown: 3 }
    }

    case 'LOBBY_COUNTDOWN_TICK': {
      const next = state.lobbyCountdown - 1
      if (next <= 0) return startMissionPhase({ ...state, lobbyCountdown: 0 })
      return { ...state, lobbyCountdown: next }
    }

    case 'OPEN_GAME_CONFIG': {
      return { ...state, phase: 'GAME_CONFIG' }
    }

    case 'TOGGLE_MISSION': {
      const { id } = action
      const enabled = state.enabledMissions.includes(id)
        ? state.enabledMissions.filter(x => x !== id)
        : [...state.enabledMissions, id]
      return { ...state, enabledMissions: enabled }
    }

    case 'SET_ENABLED_MISSIONS': {
      return { ...state, enabledMissions: action.ids }
    }
    case 'SET_DIFFICULTY': {
      return { ...state, aiDifficulty: action.difficulty }
    }

    case 'CONFIRM_CONFIG': {
      const enabled = state.enabledMissions
      if (enabled.length === 0) return state
      return { ...state, phase: 'COUNTDOWN', showCountdownValue: 3, timeLeft: 0,
        currentMissionIndex: 0, missionStartOffset: 0 }
    }

    case 'COUNTDOWN_TICK': {
      const v = state.showCountdownValue - 1
      if (v <= 0) return startMissionPhase(state)
      return { ...state, showCountdownValue: v }
    }

    case 'REVEAL_CLUE': {
      if (!state.oneWordState) return state
      const maxClues = ONE_WORD_QUESTIONS[state.oneWordState.questionIndex]?.clues.length ?? 4
      if (state.oneWordState.revealedClues >= maxClues) return state
      return { ...state, oneWordState: { ...state.oneWordState, revealedClues: state.oneWordState.revealedClues + 1 } }
    }

    case 'TIMER_TICK': {
      const t = state.timeLeft - 1

      if (state.phase === 'MISSION_INTRO') {
        if (t <= 0) return startCurrentTurn(state)
        return { ...state, timeLeft: t, missionIntroCountdown: t }
      }

      if (state.phase === 'PLAYING') {
        if (t <= 0) {
          const enabledList = getEnabledMissionsList(state)
          const mission = enabledList[state.currentMissionIndex]
          if (!mission) return doEndMission({ ...state, timeLeft: 0 })
          if (mission.type === 'turn') {
            const pid = state.turnOrder[state.currentTurnIndex]
            const sub = { ...state.submitted, [pid]: true }
            const res = {
              ...state.playerResults,
              [pid]: state.playerResults[pid] || { playerId: pid, missionScore: 0, detail: 'زمان تمام شد', responseTime: mission.timer },
            }
            const s2 = { ...state, submitted: sub, playerResults: res, timeLeft: 0 }
            if (state.currentTurnIndex + 1 >= state.turnOrder.length) {
              return doEndMission(s2)
            }
            return { ...s2, phase: 'TURN_TRANSITION' }
          }
          if (mission.type === 'cooperative') {
            const ts = state.teamState!
            if (!ts.success) {
              const res: GameState['playerResults'] = {}
              state.players.forEach(p => { res[p.id] = { playerId: p.id, missionScore: 0, detail: 'تیم شکست خورد!', responseTime: 0 } })
              const players = applyResults(state.players, res)
              return { ...state, players, playerResults: res, teamState: { ...ts, failed: true }, phase: 'MISSION_RESULT', timeLeft: 0 }
            }
          }
          if (mission.id === 'FINAL' && state.dozState) {
            const doz = state.dozState
            const activePlayers = state.players.filter(p => p.connected)
            const playerResults: GameState['playerResults'] = {}
            for (const p of activePlayers) {
              const wins = doz.scores[p.id] || 0
              playerResults[p.id] = { playerId: p.id, missionScore: wins * 400 + doz.draws * 100, detail: `${wins} برد`, responseTime: 0 }
            }
            return doEndMission({ ...state, playerResults, timeLeft: 0 })
          }
          if (mission.id === 'NAME_FAMILY') {
            // Time up — score whatever is filled
            return doNameFamilyEnd({ ...state, timeLeft: 0 })
          }
          if (mission.id === 'ONE_WORD') {
            // Time up — no more answers
            const res: GameState['playerResults'] = {}
            state.players.filter(p => p.connected).forEach(p => {
              if (!state.submitted[p.id]) {
                res[p.id] = { playerId: p.id, missionScore: 0, detail: 'زمان تمام شد', responseTime: mission.timer }
              }
            })
            return doEndMission({ ...state, playerResults: { ...state.playerResults, ...res }, timeLeft: 0 })
          }
          return doEndMission({ ...state, timeLeft: 0 })
        }
        return { ...state, timeLeft: t }
      }

      return { ...state, timeLeft: Math.max(0, t) }
    }

    case 'GO_SIGNAL':
      return { ...state, goSignalTime: Date.now() }

    case 'SPEED_HIT': {
      if (state.submitted[action.playerId]) return state
      const base = action.isCorrect ? 100 : -25
      const enabledList2 = getEnabledMissionsList(state)
      const m2 = enabledList2[state.currentMissionIndex]
      const timerLen = m2?.timer ?? 15
      const bonus = action.isCorrect ? Math.round(Math.max(0, 100 * (1 - action.responseTime / timerLen))) : 0
      const ms = base + bonus
      const res = { ...state.playerResults, [action.playerId]: { playerId: action.playerId, missionScore: ms, detail: action.isCorrect ? `درست! +${base} بونوس+${bonus}` : `اشتباه`, responseTime: action.responseTime } }
      const sub = { ...state.submitted, [action.playerId]: true }
      const s2 = { ...state, submitted: sub, playerResults: res }
      if (state.currentTurnIndex + 1 >= state.turnOrder.length) return doEndMission(s2)
      return { ...s2, phase: 'TURN_TRANSITION' }
    }

    case 'NAME_FAMILY_TYPE': {
      if (!state.nameFamilyState) return state
      const nf = state.nameFamilyState
      if (nf.locked[action.playerId]) return state
      const playerAnswers = { ...(nf.answers[action.playerId] ?? {}), [action.categoryId]: action.value }
      return { ...state, nameFamilyState: { ...nf, answers: { ...nf.answers, [action.playerId]: playerAnswers } } }
    }

    case 'NAME_FAMILY_SUBMIT': {
      if (!state.nameFamilyState) return state
      const nf = state.nameFamilyState
      if (nf.locked[action.playerId]) return state
      const newLocked = { ...nf.locked, [action.playerId]: true }
      const activePlayers = state.players.filter(p => p.connected)
      const allDone = activePlayers.every(p => newLocked[p.id])
      const newNf = { ...nf, locked: newLocked }
      if (allDone) return doNameFamilyEnd({ ...state, nameFamilyState: newNf })
      return { ...state, nameFamilyState: newNf }
    }

    case 'ONE_WORD_GUESS': {
      if (!state.oneWordState || state.submitted[action.playerId]) return state
      const ow = state.oneWordState
      const q = ONE_WORD_QUESTIONS[ow.questionIndex % ONE_WORD_QUESTIONS.length]
      const correct = action.guess.trim().toLowerCase() === q.answer.toLowerCase()
      const activePlayers = state.players.filter(p => p.connected)

      if (correct) {
        const scoresByClue = [300, 200, 100, 50]
        const ms = scoresByClue[Math.min(ow.revealedClues - 1, scoresByClue.length - 1)]
        const res = { ...state.playerResults, [action.playerId]: { playerId: action.playerId, missionScore: ms, detail: `+${ms} — سرنخ ${ow.revealedClues}`, responseTime: 0 } }
        const sub = { ...state.submitted, [action.playerId]: true }
        const newOw = { ...ow, winner: ow.winner ?? action.playerId }
        const s2 = { ...state, playerResults: res, submitted: sub, oneWordState: newOw }
        // End only when ALL active players have either submitted or exhausted 3 wrong guesses
        const allDone = activePlayers.every(p =>
          sub[p.id] || (newOw.wrongGuesses[p.id] ?? 0) >= 3
        )
        return allDone ? doEndMission(s2) : s2
      } else {
        const newWrong = (ow.wrongGuesses[action.playerId] ?? 0) + 1
        const wrong = { ...ow.wrongGuesses, [action.playerId]: newWrong }
        const newOw = { ...ow, wrongGuesses: wrong }
        const s2 = { ...state, oneWordState: newOw }
        // If this player has now used all 3 attempts, auto-submit them with 0 score
        if (newWrong >= 3) {
          const res = { ...state.playerResults, [action.playerId]: { playerId: action.playerId, missionScore: 0, detail: '۳ اشتباه — ۰', responseTime: 0 } }
          const sub = { ...state.submitted, [action.playerId]: true }
          const s3 = { ...s2, playerResults: res, submitted: sub }
          const allDone = activePlayers.every(p =>
            sub[p.id] || (newOw.wrongGuesses[p.id] ?? 0) >= 3
          )
          return allDone ? doEndMission(s3) : s3
        }
        return s2
      }
    }

    case 'PLAYER_SUBMIT': {
      if (state.submitted[action.playerId]) return state
      let ms = 0; let detail = ''
      const enabledList = getEnabledMissionsList(state)
      const mission = enabledList[state.currentMissionIndex]
      if (!mission) return state
      if (mission.id === 'LOGIC') {
        const ok = state.logicQuestion?.answer === action.answer
        ms = ok ? 150 : 0; detail = ok ? 'درست! +۱۵۰' : 'اشتباه'
      } else if (mission.id === 'MEMORY') {
        ms = action.answer as number; detail = `${ms} امتیاز`
      } else if (mission.id === 'FINAL') {
        ms = action.answer as number; detail = `${ms} امتیاز`
      }
      const res = { ...state.playerResults, [action.playerId]: { playerId: action.playerId, missionScore: ms, detail, responseTime: action.responseTime } }
      const sub = { ...state.submitted, [action.playerId]: true }
      const s2 = { ...state, submitted: sub, playerResults: res }
      if (mission.type === 'simultaneous') {
        const activePlayers2 = state.players.filter(p => p.connected)
        const allDone2 = activePlayers2.every(p => sub[p.id])
        return allDone2 ? doEndMission(s2) : s2
      }
      if (state.currentTurnIndex + 1 >= state.turnOrder.length) return doEndMission(s2)
      return { ...s2, phase: 'TURN_TRANSITION' }
    }

    case 'FASTEST_PRESS': {
      if (state.submitted[action.playerId]) return state
      const sub = { ...state.submitted, [action.playerId]: true }
      if (!state.goSignalTime) {
        const res = { ...state.playerResults, [action.playerId]: { playerId: action.playerId, missionScore: -50, detail: 'استارت زود! ۵۰-', responseTime: 0 } }
        const s2 = { ...state, submitted: sub, playerResults: res }
        const allDone = state.players.filter(p => p.connected).every(p => sub[p.id])
        return allDone ? doEndMission(s2) : s2
      }
      const rt = (action.timestamp - state.goSignalTime) / 1000
      const prevCount = Object.values(state.playerResults).filter(r => r.missionScore > 0).length
      const scoreArr = [300, 200, 100]; const ms = scoreArr[prevCount] ?? 50
      const detail = prevCount === 0 ? '🥇 اول! +۳۰۰' : prevCount === 1 ? '🥈 دوم! +۲۰۰' : prevCount === 2 ? '🥉 سوم! +۱۰۰' : '+۵۰'
      const res = { ...state.playerResults, [action.playerId]: { playerId: action.playerId, missionScore: ms, detail, responseTime: rt } }
      const s2 = { ...state, submitted: sub, playerResults: res }
      const allDone = state.players.filter(p => p.connected).every(p => sub[p.id])
      return allDone ? doEndMission(s2) : s2
    }

    case 'TEAM_CLICK': {
      const ts = state.teamState
      if (!ts || ts.success || ts.failed) return state
      const expected = ts.sequence[ts.activated.length]
      if (action.componentId !== expected) return state
      const activated = [...ts.activated, action.componentId]
      const success = activated.length === ts.sequence.length
      const newTs: TeamState = { ...ts, activated, success }
      if (success) {
        const res: GameState['playerResults'] = {}
        state.players.forEach(p => { res[p.id] = { playerId: p.id, missionScore: 300, detail: 'تیم برنده! +۳۰۰', responseTime: 0 } })
        return { ...state, teamState: newTs, players: applyResults(state.players, res), playerResults: res, phase: 'MISSION_RESULT' }
      }
      return { ...state, teamState: newTs }
    }

    case 'FINAL_CLICK': {
      if (state.phase !== 'PLAYING') return state
      return { ...state, finalClicks: { ...state.finalClicks, [action.playerId]: (state.finalClicks[action.playerId] || 0) + 1 } }
    }

    case 'DOZ_RESET_ROUND': {
      if (!state.dozState || state.phase !== 'PLAYING') return state
      const activePlayers = state.players.filter(p => p.connected)
      // Find who goes next: winner of last round goes second (loser goes first)
      const lastWinner = state.dozState.roundWinner
      const nextFirst = lastWinner && lastWinner !== 'draw'
        ? (activePlayers.find(p => p.id !== lastWinner) ?? activePlayers[0])
        : activePlayers[0]
      return {
        ...state,
        dozState: {
          ...state.dozState,
          board: Array(9).fill(null),
          currentPlayerId: nextFirst?.id ?? state.dozState.currentPlayerId,
          roundWinner: null,
          winLine: null,
        },
      }
    }

    case 'DOZ_PLACE_CELL': {
      if (state.phase !== 'PLAYING' || !state.dozState) return state
      const doz = state.dozState
      const { playerId, cellIndex } = action
      // Validate: must be this player's turn, cell must be empty
      if (doz.currentPlayerId !== playerId) return state
      if (doz.board[cellIndex] !== null) return state
      if (doz.roundWinner !== null) return state

      const newBoard = [...doz.board]
      newBoard[cellIndex] = playerId

      const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
      let winner: string | null = null
      let winLine: number[] | null = null
      for (const line of WIN_LINES) {
        const [a, b, c] = line
        if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
          winner = newBoard[a] as string
          winLine = line
          break
        }
      }
      const isDraw = !winner && newBoard.every(c => c !== null)

      const activePlayers = state.players.filter(p => p.connected)
      const currentIdx = activePlayers.findIndex(p => p.id === playerId)
      const nextPlayer = activePlayers[(currentIdx + 1) % activePlayers.length] ?? activePlayers[0]

      if (winner || isDraw) {
        const newScores = { ...doz.scores }
        if (winner) newScores[winner] = (newScores[winner] || 0) + 1
        const newDoz: typeof doz = {
          ...doz, board: newBoard, scores: newScores,
          draws: isDraw ? doz.draws + 1 : doz.draws,
          roundWinner: winner ?? 'draw', winLine,
        }
        // Check if any player reached 2 wins → end mission
        const topWins = Math.max(...Object.values(newScores))
        if (topWins >= 2 || state.timeLeft <= 0) {
          const playerResults: GameState['playerResults'] = {}
          for (const p of activePlayers) {
            const wins = newScores[p.id] || 0
            const score = wins * 400 + newDoz.draws * 100
            playerResults[p.id] = { playerId: p.id, missionScore: score, detail: `${wins} برد`, responseTime: 0 }
          }
          return doEndMission({ ...state, dozState: newDoz, playerResults })
        }
        // Round over but game continues — reset board after a short delay handled in component
        return { ...state, dozState: newDoz }
      }

      return { ...state, dozState: { ...doz, board: newBoard, currentPlayerId: nextPlayer.id } }
    }

    case 'ADVANCE_TURN': {
      const nextIdx = state.currentTurnIndex + 1
      if (nextIdx >= state.turnOrder.length) return doEndMission(state)
      const advList = getEnabledMissionsList(state)
      const advMission = advList[state.currentMissionIndex]
      if (!advMission) return doEndMission(state)
      let extra: Partial<GameState> = {}
      if (advMission.id === 'SPEED') extra.speedTargets = generateSpeedTargets()
      if (advMission.id === 'LOGIC') extra.logicQuestion = LOGIC_PUZZLES[Math.floor(Math.random() * LOGIC_PUZZLES.length)]
      return { ...state, ...extra, currentTurnIndex: nextIdx, phase: 'PLAYING', timeLeft: advMission.timer }
    }

    case 'MEMORY_SCORE_UPDATE': {
      // Keep playerResults in sync with the live board score so TIMER_TICK can use it on timeout
      if (state.submitted[action.playerId]) return state
      const res = {
        ...state.playerResults,
        [action.playerId]: { playerId: action.playerId, missionScore: action.score, detail: `${action.score} امتیاز`, responseTime: 0 },
      }
      return { ...state, playerResults: res }
    }

    case 'END_MISSION': return doEndMission(state)

    case 'SHOW_LEADERBOARD': return { ...state, phase: 'LEADERBOARD' }

    case 'NEXT_MISSION': {
      const nextIdx = state.currentMissionIndex + 1
      const enabledList = getEnabledMissionsList(state)
      if (nextIdx >= enabledList.length) return { ...state, phase: 'WINNER_CEREMONY' }
      return startMissionPhase({ ...state, currentMissionIndex: nextIdx, missionStartOffset: state.missionStartOffset + 1, submitted: {}, playerResults: {}, goSignalTime: null, teamState: null, finalClicks: {}, memoryBoards: {}, nameFamilyState: null, oneWordState: null })
    }

    case 'REPLAY': {
      const players = state.players.map(p => ({ ...p, score: 0, missionScore: 0, rank: 0, ready: false, totalResponseTime: 0 }))
      return { ...initial, phase: 'LOBBY', players, hostId: state.hostId, enabledMissions: state.enabledMissions }
    }

    case 'NEW_PLAYERS':
      return { ...initial, phase: 'HOME' }

    case 'LOAD_REMOTE_STATE':
      return { ...(action as any).state }

    default: return state
  }
}

export function useGameEngine() {
  const [state, dispatch] = useReducer(reducer, initial)

  useEffect(() => {
    if (state.phase === 'COUNTDOWN') {
      const t = setInterval(() => dispatch({ type: 'COUNTDOWN_TICK' }), 1000)
      return () => clearInterval(t)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === 'MISSION_INTRO' || state.phase === 'PLAYING') {
      const t = setInterval(() => dispatch({ type: 'TIMER_TICK' }), 1000)
      return () => clearInterval(t)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === 'PLAYING') {
      const enabledListEff = getEnabledMissionsList(state)
      const mission = enabledListEff[state.currentMissionIndex]
      if (mission?.id === 'FASTEST' && !state.goSignalTime) {
        const delay = 2000 + Math.random() * 4000
        const t = setTimeout(() => dispatch({ type: 'GO_SIGNAL' }), delay)
        return () => clearTimeout(t)
      }
    }
  }, [state.phase, state.currentMissionIndex, state.goSignalTime])

  useEffect(() => {
    if (state.phase === 'TURN_TRANSITION') {
      const t = setTimeout(() => dispatch({ type: 'ADVANCE_TURN' }), 1400)
      return () => clearTimeout(t)
    }
  }, [state.phase, state.currentTurnIndex])

  useEffect(() => {
    if (state.phase === 'MISSION_RESULT') {
      const t = setTimeout(() => dispatch({ type: 'SHOW_LEADERBOARD' }), 3500)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === 'LEADERBOARD') {
      const t = setTimeout(() => dispatch({ type: 'NEXT_MISSION' }), 4500)
      return () => clearTimeout(t)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.lobbyCountdown > 0) {
      const t = setTimeout(() => dispatch({ type: 'LOBBY_COUNTDOWN_TICK' }), 1000)
      return () => clearTimeout(t)
    }
  }, [state.lobbyCountdown])

  const currentPlayer = useCallback(() => {
    if (state.turnOrder.length === 0) return null
    const id = state.turnOrder[state.currentTurnIndex]
    return state.players.find(p => p.id === id) || null
  }, [state.turnOrder, state.currentTurnIndex, state.players])

  const getPlayer = useCallback((id: string) => state.players.find(p => p.id === id), [state.players])

  return { state, dispatch, currentPlayer, getPlayer }
}
