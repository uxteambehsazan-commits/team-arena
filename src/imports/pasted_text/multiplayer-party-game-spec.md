Build a REAL, FULLY PLAYABLE multiplayer party game called:

# 🎮 «ماموریت نهایی»

This is a REAL GAME, not a mockup, sample, showcase or static prototype.

Prioritize functional game logic first, then animation and visual polish.

## PLAYERS & MODES

Support 3–8 players.

Two modes:

1. SAME DEVICE — fully playable without backend.
2. ONLINE ROOM — use real realtime synchronization if backend is available. Never fake online multiplayer.

Players can:

* Create room
* Join with room code
* Enter name
* Select avatar
* Ready / unready
* See other players
* See host
* Start game

Minimum players: 3.

Only the host can start the game.

---

# GAME FLOW

The mission sequence is FIXED:

LOBBY
→ COUNTDOWN
→ 01 SPEED
→ RESULTS
→ LEADERBOARD
→ 02 MEMORY
→ RESULTS
→ LEADERBOARD
→ 03 LOGIC
→ RESULTS
→ LEADERBOARD
→ 04 FASTEST FINGER
→ RESULTS
→ LEADERBOARD
→ 05 TEAM CHALLENGE
→ RESULTS
→ LEADERBOARD
→ 06 FINAL MISSION
→ FINAL SCORE
→ WINNER CEREMONY
→ REPLAY

Never skip, reorder or randomly select missions.

---

# TURN SYSTEM

For turn-based missions:

Round 1 randomly selects the first player.

Example:

Sara → Ali → Maryam → Reza → Negar

Each following round rotates the starting player by one position:

Round 2:
Ali → Maryam → Reza → Negar → Sara

Round 3:
Maryam → Reza → Negar → Sara → Ali

Continue cyclically.

Each player gets ONE turn.

Turn timer:

15 seconds unless the mission specifies otherwise.

When a player:

* answers
* completes the task
* skips
* or timer reaches 0

their turn immediately ends.

Lock their input.

Calculate score.

Automatically move to the next active player.

Never require the host to advance turns manually.

Disconnected players are skipped automatically.

---

# MISSION TYPES

## 01 — ⚡ SPEED ATTACK

TURN-BASED

15 seconds per player.

Click the correct target.

Correct: +100
Wrong: -25
Speed bonus: up to +100

Mission ends only after ALL active players finish.

---

## 02 — 🧠 MEMORY MASTER

TURN-BASED

20 seconds per player.

12 cards / 6 pairs.

Correct pair: +100
Wrong pair: -20

Track moves, pairs and time.

Mission ends after all active players finish.

---

## 03 — 🧩 LOGIC BREAKER

TURN-BASED

15 seconds per player.

Show visual logic puzzles with multiple answers.

Correct: +150
Wrong: 0
Timeout: 0

Do not reveal the answer until the player's turn ends.

---

## 04 — 🎯 FASTEST FINGER

SIMULTANEOUS

All players play together.

Countdown:

3 → 2 → 1 → GO!

Wait a random amount of time before GO.

First response:

🥇 +300

Second:

🥈 +200

Third:

🥉 +100

Others:

+50

False start:

-50

Record exact response timestamps.

---

## 05 — 🤝 TEAM CHALLENGE

COOPERATIVE

All players play simultaneously.

Create one shared puzzle.

Example:

Activate machine components in the correct sequence.

Time:

45 seconds.

Team success:

+300 to every active player.

Failure:

0.

All players see the same shared game state.

---

## 06 — 💥 FINAL MISSION

SIMULTANEOUS

All active players compete simultaneously.

Duration:

30 seconds.

Leaderboard is hidden during the mission.

Score multiplier:

×2.

At the end:

freeze all inputs → calculate final scores → calculate ranking.

---

# SCORING

Every player has:

id
name
avatar
score
missionScore
rank
ready
status
connected
responseTime

After each mission:

score += missionScore

Ranking:

1. Highest score
2. Lowest total response time
3. Earlier completion timestamp

Never hard-code rankings or winners.

---

# GAME STATES

Implement a real state machine:

LOBBY
COUNTDOWN
MISSION_INTRO
TURN_START
PLAYING
TURN_END
MISSION_RESULT
LEADERBOARD
NEXT_MISSION
FINAL
GAME_OVER

The UI must always be generated from the current game state.

---

# TIMER

Timers must be functional, not decorative.

When timer reaches zero:

automatically end the turn/mission.

Prevent all further input.

Never allow double submission.

---

# PLAYER SAFETY & FAIRNESS

A player can submit only once per action.

After submission:

disable input.

Prevent:

* double click abuse
* answering after timeout
* answering outside the player's turn
* changing an already submitted answer
* receiving points twice

All scores must be calculated from actual game events.

---

# DISCONNECT / RECONNECT

If a player disconnects during their turn:

end their turn and continue.

If disconnected before their turn:

skip them.

If they reconnect:

restore their player state without duplicating score.

The game must never become stuck because of one player.

---

# LEADERBOARD

After every mission show:

🥇 Player
🥈 Player
🥉 Player

Display:

avatar
name
rank
mission score
total score

Animate ranking changes.

Example:

#4 → #2

The player card smoothly moves upward.

---

# PROGRESS

Always show:

MISSION 01 / 06

with:

✓ completed
● current
○ upcoming

Players must always know:

* current mission
* current round
* current turn
* their score
* their rank
* remaining time
* who is active

---

# WINNER CEREMONY

Never end with a simple table.

Reveal:

🥉 THIRD PLACE

then:

🥈 SECOND PLACE

then:

🥇 WINNER

Show:

🏆 trophy
avatar
final score
confetti
particles
fireworks

Text:

«قهرمان ماموریت نهایی!»

---

# REPLAY

«بازی دوباره»

Keep players but reset:

scores
ranks
answers
timers
mission state

Randomize a new starting player.

Return to lobby.

«بازیکنان جدید»

Clear players and return to room creation.

---

# VISUAL DESIGN

Make it feel like:

Arcade + Game Show + Modern Party Game.

Use:

* full-color vibrant gradients
* neon accents
* expressive avatars
* animated backgrounds
* particles
* confetti
* glow
* depth
* large typography
* dramatic transitions
* playful 3D-style game objects

DO NOT make it look like a dashboard, banking app or corporate SaaS.

Animations:

micro interactions: 150–300ms
major transitions: 400–800ms
winner celebration: 1–2 seconds

Use bounce, scale, shake, flip, slide, glow and particle effects.

---

# RTL & RESPONSIVE

Entire UI must be RTL Persian.

Use polished Persian copy.

Desktop:
1440×900

Tablet:
1024×768

Mobile:
390×844

Optimize all controls for touch.

---

# CRITICAL IMPLEMENTATION RULE

DO NOT BUILD FAKE FUNCTIONALITY.

DO NOT USE PREDEFINED WINNERS.

DO NOT USE FAKE TIMERS.

DO NOT USE FAKE MULTIPLAYER.

DO NOT USE STATIC LEADERBOARDS.

DO NOT CREATE DISCONNECTED SCREENS.

The user must genuinely be able to:

CREATE ROOM
→ ADD PLAYERS
→ READY
→ START
→ PLAY
→ TAKE TURNS
→ PLAY SIMULTANEOUS MISSIONS
→ COOPERATE
→ EARN POINTS
→ SEE RANKINGS
→ COMPLETE FINAL
→ GET A REAL WINNER
→ REPLAY

If a feature cannot technically be implemented in the current environment, implement the closest genuinely functional alternative and do not pretend it is realtime.

# FINAL PRIORITY

1. GAME LOGIC
2. MULTIPLAYER / PLAYER STATE
3. TURN MANAGEMENT
4. MISSION SEQUENCE
5. TIMER & SCORING
6. FAIRNESS & ERROR HANDLING
7. RESPONSIVE UX
8. ANIMATION
9. VISUAL POLISH

The final result must feel like:

# «این واقعاً یک بازیه، نه یک Prototype.»
