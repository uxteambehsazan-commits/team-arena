# 36. EXPLICIT MISSION SEQUENCE — MANDATORY

The game MUST follow this exact mission sequence.

DO NOT reorder missions.
DO NOT skip missions.
DO NOT randomly select missions.
DO NOT repeat a mission unless the player chooses "Replay".

The complete game consists of:

## ROUND 1 — ⚡ SPEED ATTACK

Type: TURN-BASED

Players:
3–8

Starting player:
Randomly selected at game start.

Turn order:

Player 1
→ Player 2
→ Player 3
→ ...
→ Last Player

Each player gets:

15 seconds

Objective:

Click the correct target as quickly as possible.

Scoring:

Correct = +100
Wrong = -25
Speed Bonus = up to +100

After ALL players complete their turn:

→ Calculate scores
→ Update rankings
→ Show Mission Result
→ Show Leaderboard
→ Start Round 2

IMPORTANT:

Do NOT start Round 2 before every active player has completed Round 1.

---

# ROUND 2 — 🧠 MEMORY MASTER

Type: TURN-BASED

Starting player:

Move the starting position forward by ONE player.

Example:

Round 1:
Sara → Ali → Maryam → Reza

Round 2:
Ali → Maryam → Reza → Sara

Each player gets:

20 seconds

Objective:

Find matching pairs in the memory grid.

Board:

12 cards
6 matching pairs

Scoring:

Correct Pair = +100
Wrong Pair = -20

After each player's turn:

→ Save score
→ Save moves
→ Lock player input
→ Move automatically to next player

After ALL players complete:

→ Calculate mission scores
→ Update leaderboard
→ Start Round 3

---

# ROUND 3 — 🧩 LOGIC BREAKER

Type: TURN-BASED

Starting player:

Move one position forward again.

Example:

Round 3:
Maryam → Reza → Sara → Ali

Each player gets:

15 seconds

Objective:

Solve a visual logic puzzle.

Example:

🟦 🟨 🟦 🟨 ?

Possible answers:

🟦
🟨
🟥
🟩

Scoring:

Correct = +150
Wrong = 0
Timeout = 0

IMPORTANT:

The correct answer must NOT be revealed until the current player's turn has ended.

After all players:

→ Calculate scores
→ Update leaderboard
→ Start Round 4

---

# ROUND 4 — 🎯 FASTEST FINGER

Type: SIMULTANEOUS

ALL players play at the same time.

There is NO individual turn order.

Sequence:

COUNTDOWN

3
2
1

↓

WAIT

↓

Random delay

↓

🔥 GO!

↓

Players press the button.

Record the exact response timestamp for every player.

Scoring:

🥇 1st = 300
🥈 2nd = 200
🥉 3rd = 100
Other players = 50

False start:

-50

After ALL players respond
OR
the timer expires:

→ Freeze the game
→ Calculate ranking
→ Show reaction-time results
→ Show leaderboard
→ Start Round 5

---

# ROUND 5 — 🤝 TEAM CHALLENGE

Type: COOPERATIVE

ALL players participate simultaneously.

There is NO individual turn.

All players share the same puzzle state.

Objective:

Solve a collaborative machine puzzle.

Example:

The machine contains:

8 components.

Players must activate the correct components in the correct sequence.

Each player controls specific components.

Time limit:

45 seconds.

Possible states:

WAITING
ACTIVE
SUCCESS
FAILED

SUCCESS:

+300 points for every active player.

FAILURE:

0 points.

If the team solves the puzzle before the timer reaches zero:

→ Immediately end the mission
→ Show TEAM SUCCESS
→ Award points
→ Show leaderboard
→ Start Round 6

If timer reaches zero:

→ Show TEAM FAILED
→ Award 0
→ Show leaderboard
→ Start Round 6

---

# ROUND 6 — 💥 FINAL MISSION

Type: SIMULTANEOUS

ALL remaining active players participate.

This is the FINAL round.

The leaderboard MUST be hidden during the mission.

Display:

🔥 FINAL MISSION

«همه چیز می‌تونه عوض بشه.»

Countdown:

3
2
1
GO!

Duration:

30 seconds

Score multiplier:

×2

Players compete simultaneously.

Every player's final mission score is multiplied by 2.

When the timer ends:

→ Freeze all inputs
→ Calculate final scores
→ Apply ×2 multiplier
→ Calculate final ranking
→ Transition to Winner Ceremony

---

# 37. EXACT GAME FLOW

The complete game flow MUST be:

LOBBY
↓
PLAYER READY
↓
HOST START
↓
3...2...1...GO
↓
ROUND 1 — SPEED ATTACK
↓
ALL PLAYERS FINISH
↓
ROUND 1 RESULTS
↓
LEADERBOARD
↓
ROTATE STARTING PLAYER
↓
ROUND 2 — MEMORY MASTER
↓
ALL PLAYERS FINISH
↓
ROUND 2 RESULTS
↓
LEADERBOARD
↓
ROTATE STARTING PLAYER
↓
ROUND 3 — LOGIC BREAKER
↓
ALL PLAYERS FINISH
↓
ROUND 3 RESULTS
↓
LEADERBOARD
↓
ROUND 4 — FASTEST FINGER
↓
ALL PLAYERS FINISH / TIMEOUT
↓
ROUND 4 RESULTS
↓
LEADERBOARD
↓
ROUND 5 — TEAM CHALLENGE
↓
TEAM SUCCESS / TIMEOUT
↓
ROUND 5 RESULTS
↓
LEADERBOARD
↓
ROUND 6 — FINAL MISSION
↓
FINAL SCORE CALCULATION
↓
FINAL RANKING
↓
🥉 THIRD PLACE
↓
🥈 SECOND PLACE
↓
🥇 WINNER
↓
WINNER CEREMONY
↓
REPLAY / NEW PLAYERS / EXIT

---

# 38. MISSION PROGRESSION RULES

The game MUST NEVER proceed to the next mission until the current mission has reached its completion condition.

## Turn-Based Missions

Completion condition:

ALL ACTIVE PLAYERS HAVE FINISHED THEIR TURN.

Then:

MISSION_RESULT
→ LEADERBOARD
→ NEXT MISSION

## Simultaneous Missions

Completion condition:

ALL ACTIVE PLAYERS HAVE RESPONDED

OR

TIMER = 0

Then:

MISSION_RESULT
→ LEADERBOARD
→ NEXT MISSION

## Team Mission

Completion condition:

TEAM SUCCESS

OR

TIMER = 0

Then:

MISSION_RESULT
→ LEADERBOARD
→ NEXT MISSION

---

# 39. STARTING PLAYER ROTATION

For turn-based missions ONLY:

Round 1:

Random starting player.

Round 2:

Starting player +1

Round 3:

Starting player +2

Then continue cyclically.

Example with 5 players:

Round 1:
Sara → Ali → Maryam → Reza → Negar

Round 2:
Ali → Maryam → Reza → Negar → Sara

Round 3:
Maryam → Reza → Negar → Sara → Ali

IMPORTANT:

Do NOT reset the starting player after each mission.

The rotation is part of the game rules.

---

# 40. MISSION PROGRESS INDICATOR

Always show the player where they are in the game.

Example:

●────●────●────●────●────●

⚡     🧠     🧩     🎯     🤝     💥
01     02     03     04     05     06

Current mission:

●

Completed missions:

✓

Future missions:

○

The current mission should be visually highlighted.

---

# 41. MISSION TRANSITION

After every mission:

1. Freeze gameplay
2. Show score animation
3. Show mission result
4. Animate leaderboard
5. Show "Next Mission"
6. Short transition
7. Introduce next mission
8. Start countdown
9. Begin next mission automatically

Transition duration:

approximately 1–2 seconds.

Do NOT require unnecessary manual clicks.

---

# 42. MISSION ID SYSTEM

Each mission must have a unique ID:

MISSION_01_SPEED
MISSION_02_MEMORY
MISSION_03_LOGIC
MISSION_04_FASTEST
MISSION_05_TEAM
MISSION_06_FINAL

The game engine should use these IDs to determine:

* mission type
* timer
* scoring
* interaction
* completion condition
* next mission

Example:

currentMission = "MISSION_02_MEMORY"

After completion:

currentMission = "MISSION_03_LOGIC"

Never determine mission progression only from visual screens.

Use actual game state.

---

# 43. NO RANDOM MISSION ORDER

The mission order is FIXED.

Never do:

random mission
random next mission
random number of missions

Always:

01 → 02 → 03 → 04 → 05 → 06

The only randomized element at the beginning is:

FIRST STARTING PLAYER.

---

# 44. GAME COMPLETION CONDITION

The game is complete ONLY after:

MISSION_06_FINAL

has finished and:

final scores have been calculated.

Then:

gameStatus = GAME_OVER

Display:

🏆 WINNER CEREMONY

The game must not show the winner before the final mission.

---

# 45. REPLAY LOGIC

If player selects:

«بازی دوباره»

Then:

Keep current players.

Reset:

scores = 0
missionScore = 0
rank = null
answers = {}
currentMission = MISSION_01_SPEED
currentRound = 1
gameStatus = LOBBY

Randomly select a NEW starting player.

Then return to:

LOBBY

If player selects:

«بازیکنان جدید»

Clear current player list.

Return to:

CREATE / JOIN ROOM

If player selects:

«خروج»

Return to:

HOME

---

# 46. ABSOLUTE IMPLEMENTATION PRIORITY

The following requirements have the HIGHEST priority:

1. Correct mission sequence
2. Correct turn rotation
3. Correct timer behavior
4. Correct player state
5. Correct score calculation
6. Correct mission completion
7. Correct leaderboard
8. Correct final winner
9. Replay functionality
10. Visual animation and polish

If there is a conflict between visual effects and game logic:

GAME LOGIC ALWAYS WINS.

The game must always know:

WHERE IT IS
WHOSE TURN IT IS
WHAT MISSION IS ACTIVE
WHO HAS FINISHED
WHO IS NEXT
HOW MANY POINTS EACH PLAYER HAS
WHEN THE MISSION ENDS
WHEN THE NEXT MISSION STARTS
WHO THE FINAL WINNER IS.
