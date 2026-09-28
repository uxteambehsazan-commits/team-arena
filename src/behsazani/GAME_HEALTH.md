# Game Health Report — v3.2.0 (2026-09-28)
## PHASE 25: Game Flow Matrix + PHASE 28: Final Health Report

---

## Game Flow Matrix

| Game | Phases | Single Device | Online Multi | Private State | Reconnect | Status |
|------|--------|--------------|-------------|--------------|-----------|--------|
| Mafia | waiting_role → role_reveal → day → night → result | ✅ | ✅ | roles via private channel | ✅ retryKey | READY |
| Spy | setup → playing → result | ✅ | ✅ | spy identity | ✅ | READY |
| Project Council | lobby → nominate → vote → mission → result | ✅ | ✅ | traitor identity | ✅ | READY |
| Code Breakers | lobby → clue → guess → result | ✅ | ✅ | word grid | ✅ | READY |
| Project Code | lobby → guess → result | ✅ | ✅ | secret code | ✅ | READY |
| One Word | lobby → clue → guess → result | ✅ | ✅ | none | ✅ | READY |
| IT Quiz | lobby → question → answer → leaderboard | ✅ | ✅ | none | ✅ | READY |
| Behsazan Hunt | lobby → playing → result | ❌ online-only | ✅ | roles | ✅ | IMPROVING |
| Naghghashi | lobby → word_choice → drawing → guessing → round_result → game_over | ❌ online-only | ✅ | word via hostRef | ✅ | DEVELOPING |

---

## PHASE 28: Final Health Report

### Architecture

| Category | Status | Notes |
|----------|--------|-------|
| Type system (gameTypes.ts) | ✅ PASS | PlayMode, GameCapabilityManifest, GameCommand, GameEvent all defined |
| Registry (GameCapabilityManifest) | ✅ PASS | All 9 games with full specs |
| useHostBroadcast (persistent channel) | ✅ PASS | subscribe-before-send, no channel churn |
| GameEngine contract (GameEngine.ts) | ✅ PASS | Full interface + assertNoPrivateFields helper |
| SharedGameComponents | ✅ PASS | GameConnecting, GameError, GameWaiting |
| retryKey reconnect in useBehsazaniRoom | ✅ PASS | Increments on reconnect, channel renamed |

### Security Audit

| Game | Private Fields | Leak Risk | Status |
|------|----------------|-----------|--------|
| Mafia | player roles | NONE — roles only in local state + private channel; `revealedRoles` only in `result` phase | ✅ PASS |
| Naghghashi | correct word | NONE — `hostWordRef` never broadcast; `correctWord` = '' until `round_result` | ✅ PASS |
| Spy | spy identity | delivered via private channel at game start | ✅ PASS |
| Others | none | no secret state | ✅ PASS |

### Realtime Channels

| Game | Channels | Pattern |
|------|---------|---------|
| Mafia | `beh-{code}-r{retry}` (presence+pub), `beh-{code}-pvt-{pid}` (private) | ✅ persistent |
| Naghghashi | `beh-{code}-nagh-pub` (pub), `beh-{code}-nagh-strokes-r{round}` (strokes), `beh-{code}-nagh-cmd` (commands) | ✅ persistent pub + per-round strokes |
| Others | `beh-{code}-r{retry}` | ✅ |

### Performance

| Area | Status | Notes |
|------|--------|-------|
| Timer rerenders | ✅ PASS | Naghghashi uses conditional update `t => left !== t ? left : t` |
| Stroke throttle | ✅ PASS | 40ms debounce on mousemove, pending flush on mouseup |
| Canvas | ✅ PASS | Direct 2D context mutations, no React state for strokes |
| Pub state seq | ✅ PASS | Stale/reordered packets rejected via `lastSeqRef` |
| Fog panels | ✅ PASS | CSS transitions, no JS animation loop |

### Pending / BLOCKED

| Phase | Status | Notes |
|-------|--------|-------|
| PHASE 15 player profile isolation | ✅ N/A | Online games use separate devices; single-device games are turn-based |
| PHASE 18 payload optimization | ✅ PASS | Compact stroke events `{t,x,y,c,w}`, candidates only when revealed |
| Naghghashi scoring speed bonus | 🟡 PARTIAL | Formula implemented; `guessSubmitTime` uses local clock; cross-device clock drift possible |
| Mafia event log persistence | ✅ PASS | `eventLogRef` maintained host-side, included in pub state |
| Version sync | ✅ PASS | All in-app displays use `__APP_VERSION__` from package.json (v3.2.0) |
