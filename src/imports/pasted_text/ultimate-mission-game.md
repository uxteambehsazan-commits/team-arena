Create a REAL, FULLY PLAYABLE MULTIPLAYER PARTY GAME called:

# 🎮 «ماموریت نهایی»

## The Ultimate Mission

IMPORTANT:
This is NOT a sample.
This is NOT a static prototype.
This is NOT a showcase.
This is NOT a collection of disconnected UI screens.

Build a genuinely playable game with real game logic, player state, turn management, timers, scoring, missions, ranking and winner calculation.

The game must support 3–8 players.

Prioritize functionality and game logic FIRST.
Then add visual polish, animation and effects.

---

# 1. CORE GAME CONCEPT

«ماموریت نهایی» یک بازی گروهی سریع، رقابتی و سرگرم‌کننده برای 3 تا 8 بازیکن است.

Each game consists of multiple short missions.

Players earn points through individual and cooperative challenges.

The game contains:

1. ⚡ Speed
2. 🧠 Memory
3. 🧩 Logic
4. 🎯 Fastest Finger
5. 🤝 Team Challenge
6. 💥 Final Mission

The game must combine:

* Turn-based gameplay
* Simultaneous gameplay
* Cooperative gameplay
* Competitive scoring

This prevents players from waiting too long while still maintaining fair turn-based gameplay.

---

# 2. MULTIPLAYER MODES

Implement two modes.

## MODE A — SAME DEVICE

«بازی گروهی روی یک دستگاه»

3–8 players can play on the same laptop/tablet.

This mode MUST work without any backend.

Players take turns when the mission is turn-based.

For simultaneous missions, all players participate at the same time.

---

## MODE B — ONLINE ROOM

«بازی آنلاین»

One player creates a room.

Other players join using a unique room code.

Example:

UX-4821

If a realtime backend/database is available, implement actual realtime synchronization.

Synchronize:

* players
* ready state
* current mission
* turn
* timer
* answers
* scores
* rankings
* game status

If realtime infrastructure is NOT available:

DO NOT FAKE ONLINE MULTIPLAYER.

Clearly indicate:

«حالت آنلاین در این نسخه نیازمند اتصال سرور است.»

The local multiplayer mode must remain fully playable.

---

# 3. GAME ROOM

Each game has:

roomId
hostId
players
currentMission
currentRound
currentTurnIndex
turnOrder
scores
timer
answers
rankings
gameStatus

Each player contains:

id
name
avatar
score
rank
ready
status
missionScore
totalResponseTime
connected

Game states:

LOBBY
COUNTDOWN
ROUND_START
TURN_START
PLAYING
TURN_END
MISSION_RESULT
LEADERBOARD
NEXT_ROUND
FINAL
GAME_OVER

Do not create disconnected screens.

All screens must be driven by actual game state.

---

# 4. PLAYER LOBBY

Create a highly animated game lobby.

Show:

🎮 ماموریت نهایی

Room Code:

UX-4821

Players:

👤 3 / 8

Example:

🟣 علی        ✓ آماده
🟢 سارا       ✓ آماده
🟠 رضا        ✓ آماده
🔵 مریم       آماده نیست

Each player has:

* avatar
* name
* color
* ready status

Buttons:

[ آماده‌ام ]

[ شروع بازی ]

Only the HOST can start the game.

Start button remains disabled until:

minimum players = 3

AND

all connected players are ready.

---

# 5. EXACT TURN SYSTEM

This is a CRITICAL GAME RULE.

The turn system must be implemented as actual game logic.

## 5.1 INITIAL TURN ORDER

At the beginning of the game:

Randomly select one player as the first player.

Example:

🟣 Sara

The remaining players follow in the order they joined the room.

Example:

1. Sara
2. Ali
3. Maryam
4. Reza
5. Negar
6. Amir

Display:

👑 شروع‌کننده راند

The first player is only the starting player for ROUND 1.

---

# 6. ROUND-BASED ROTATING START

The first player MUST change between rounds.

This prevents the first player from receiving a permanent advantage.

If Round 1 starts with Sara:

ROUND 1:
Sara → Ali → Maryam → Reza → Negar → Amir

ROUND 2:
Ali → Maryam → Reza → Negar → Amir → Sara

ROUND 3:
Maryam → Reza → Negar → Amir → Sara → Ali

ROUND 4:
Reza → Negar → Amir → Sara → Ali → Maryam

ROUND 5:
Negar → Amir → Sara → Ali → Maryam → Reza

ROUND 6:
Amir → Sara → Ali → Maryam → Reza → Negar

After reaching the last player, cycle back to the first player.

The rotation must be calculated dynamically based on the active player list.

Do NOT hard-code names.

---

# 7. TURN RULES

For TURN-BASED missions:

Only one player is active at a time.

Example:

🎯 نوبت سارا

Show:

PLAYER TURN

🟢 Sara

TIME:

00:15

All other players see:

⏳ منتظر نوبت سارا باشید...

Non-active players MUST NOT be able to interact with the mission controls.

Disable their input.

---

# 8. TURN TIMER

Every turn-based challenge has:

15 seconds

Timer:

15
14
13
...
1
0

When timer reaches 0:

Automatically end the player's turn.

The player receives:

0 points

or the predefined timeout penalty.

Then automatically move to the next player.

No extra confirmation.

No manual transition.

---

# 9. TURN COMPLETION

A player's turn ends when ANY of these conditions happens:

1. Correct answer submitted
2. Wrong answer submitted
3. Player completes the task
4. Player presses «رد کردن»
5. Timer reaches zero

Once the turn ends:

LOCK THE PLAYER'S INPUT.

Calculate the score.

Save the result.

Animate the result.

Then automatically activate the next player.

---

# 10. NEXT PLAYER

After Sara finishes:

Sara → Ali

Display:

🎯 نوبت علی

with a short transition:

0.5–1 second

Then start Ali's timer.

Do NOT require the host to manually move to the next player.

---

# 11. PLAYER DISCONNECTION

If the active player disconnects:

1. Stop their timer.
2. Mark them as disconnected.
3. Give them 0 points for the turn.
4. Automatically move to the next connected player.

If a non-active player disconnects:

Remove them from future turns.

Do NOT stop the game.

---

# 12. TURN ORDER AFTER PLAYER LEAVES

Example:

Original:

Sara → Ali → Maryam → Reza → Negar

Reza leaves.

New active list:

Sara → Ali → Maryam → Negar

The system automatically skips Reza.

Never create an empty turn.

---

# 13. THREE TYPES OF MISSIONS

IMPORTANT:

Not every mission should be turn-based.

Use three gameplay types.

## TYPE A — TURN-BASED

Only one player acts at a time.

Use for:

🧠 Memory
🧩 Logic
🎯 Individual Speed

---

## TYPE B — SIMULTANEOUS

All players participate at the same time.

Use for:

⚡ Fastest Finger
💥 Final Mission

Every player has an independent input.

The server/game state records the exact response timestamp.

---

## TYPE C — COOPERATIVE

All players work together.

Use for:

🤝 Team Challenge

All players interact with the same shared puzzle state.

---

# 14. ROUND STRUCTURE

Each round must follow:

ROUND START
↓
Show round number
↓
Show mission intro
↓
Explain rules
↓
Countdown
↓
PLAY
↓
MISSION COMPLETE
↓
Calculate scores
↓
Show results
↓
Show leaderboard
↓
Rotate starting player
↓
Next round

---

# 15. MISSION 01 — SPEED ⚡

TYPE:

TURN-BASED

Each player gets one turn.

Turn duration:

15 seconds.

A target appears.

Player must click the correct target.

Scoring:

Correct = +100

Wrong = -25

Speed bonus:

Faster response = higher bonus.

Example:

Response time:
0.82 sec

Base:
100

Speed Bonus:
80

Total:
180

Each player gets exactly ONE turn.

After all players finish:

Show:

🎉 MISSION COMPLETE

Then leaderboard.

---

# 16. MISSION 02 — MEMORY 🧠

TYPE:

TURN-BASED

Create a real 12-card memory game.

6 matching pairs.

Each player gets a separate turn.

During the player's turn:

They can flip cards.

Rules:

Correct pair:
+100

Wrong pair:
-20

Turn ends when:

* player finds a pair
* player makes a wrong match
* timer expires

Track:

Pairs found
Moves
Response time
Score

After all players complete their turn:

Calculate mission scores.

---

# 17. MISSION 03 — LOGIC 🧩

TYPE:

TURN-BASED

Each player receives the same logic challenge.

Example:

🟦 🟨 🟦 🟨 ?

Options:

🟦
🟨
🟥
🟩

Player has:

15 seconds.

Correct:

+150

Wrong:

0

Do not reveal the correct answer until the player's turn ends.

Each player must independently answer.

---

# 18. MISSION 04 — FASTEST FINGER 🎯

TYPE:

SIMULTANEOUS

All players participate at the same time.

Countdown:

3
2
1

Then:

🔥 GO!

A large button appears.

The first player to press wins.

Record EXACT response timestamp.

Ranking:

🥇 First = 300
🥈 Second = 200
🥉 Third = 100

Remaining players:

50

Late click after timeout:

0

False start:

-50

This mission must be extremely fast and animated.

---

# 19. MISSION 05 — TEAM CHALLENGE 🤝

TYPE:

COOPERATIVE

All players participate simultaneously.

Create a shared puzzle.

Example:

A large machine contains multiple components.

Players must activate components in the correct sequence.

Each player can control specific elements.

All players see the same shared state.

Time:

45 seconds.

Success:

+300 to EVERY active player.

Failure:

0.

The UI should visually connect players.

Show:

👤 Sara
↕
👤 Ali
↕
👤 Maryam
↕
👤 Reza

Use animated lines and reactions to communicate teamwork.

---

# 20. FINAL MISSION 💥

TYPE:

SIMULTANEOUS

The final mission is available to all remaining players.

All players participate simultaneously.

Score multiplier:

×2

Hide the leaderboard during the final mission.

Show:

🔥 FINAL ROUND

«همه چیز می‌تونه عوض بشه.»

The final mission should have:

* dramatic countdown
* high energy
* faster animations
* bigger score rewards
* suspense

After the mission ends:

Reveal final scores.

---

# 21. SCORING ENGINE

Every player must have:

score
missionScore
rank

After every mission:

player.score += player.missionScore

Then dynamically sort:

score DESC

Tie breaker:

1. Higher score
2. Lower total response time
3. Earlier completion timestamp

Never manually define rankings.

---

# 22. LEADERBOARD

After each mission show:

🥇 Sara — 920
🥈 Ali — 870
🥉 Maryam — 740
4️⃣ Reza — 690

Include:

Avatar
Name
Rank
Total Score
Mission Score

Animate rank changes.

If a player moves:

#4 → #2

animate the entire player card moving upward.

---

# 23. LIVE PLAYER STATUS

Every player should always know:

WHO AM I?
MY SCORE
MY RANK
CURRENT MISSION
CURRENT TURN
TIME REMAINING
WHO IS ACTIVE?

For turn-based missions:

🎯 نوبت سارا

For simultaneous missions:

⚡ همه آماده باشید!

For cooperative missions:

🤝 با هم حلش کنید!

---

# 24. HOST

The creator of the room is the HOST.

Show:

👑 HOST

Host can:

* Start game
* Restart game
* End game
* Remove disconnected player

Host MUST NOT be required to manually advance ordinary turns.

The game engine controls turn progression automatically.

---

# 25. GAME STATE MACHINE

Implement this actual state machine:

LOBBY
↓
COUNTDOWN
↓
ROUND_START
↓
MISSION_INTRO
↓
TURN_START
↓
PLAYING
↓
TURN_END
↓
NEXT_TURN
↓
MISSION_RESULT
↓
LEADERBOARD
↓
NEXT_ROUND
↓
FINAL
↓
GAME_OVER

For simultaneous missions:

PLAYING
↓
ALL_PLAYERS_FINISHED
or
TIMER_EXPIRED
↓
MISSION_RESULT

For cooperative mission:

PLAYING
↓
TEAM_SUCCESS
or
TIMER_EXPIRED
↓
MISSION_RESULT

Do not bypass these states.

---

# 26. GAME START

When the host starts:

3

2

1

🚀 GO!

Then:

ROUND 1

«مأموریت اول»

Show the starting player.

---

# 27. VISUAL DESIGN

Make the game:

EXTREMELY COLORFUL
EXTREMELY ANIMATED
PLAYFUL
PREMIUM
MODERN
ENERGETIC

Visual inspiration:

Arcade
Game Show
Party Games
Modern Mobile Games

Use:

* vibrant gradients
* neon accents
* glowing elements
* colorful avatars
* floating shapes
* particles
* confetti
* dramatic typography
* large numbers
* depth
* shadows
* glass effects
* dynamic backgrounds

Do NOT make it look like:

* dashboard
* banking software
* enterprise SaaS
* boring corporate application

---

# 28. ANIMATION SYSTEM

Use animations extensively.

Buttons:
hover → scale
click → compress

Correct answer:
green glow + particles + score popup

Wrong answer:
shake + negative score

Turn transition:
slide + avatar highlight

Leaderboard:
players move smoothly between ranks

Mission complete:
large celebration

Winner:
confetti + particles + trophy + fireworks

Keep micro-interactions around:

150–300ms

Major transitions:

400–800ms

Winner animation:

1–2 seconds

---

# 29. TIMER VISUALIZATION

Timer must be functional AND visual.

Normal:

00:15

Warning:

00:05

Critical:

00:03

Use:

pulse
scale
visual urgency

At:

00:00

automatically trigger timeout.

---

# 30. WINNER CEREMONY

Never finish with a simple table.

Create a dramatic ceremony.

First:

FINAL SCORES

Then reveal:

🥉 THIRD PLACE

🥈 SECOND PLACE

Pause.

Then:

🥁 AND THE WINNER IS...

Then:

🏆

Winner Avatar

«قهرمان ماموریت نهایی»

Final Score:

2,480

Add:

confetti
particles
fireworks
celebration animation

---

# 31. REPLAY

After GAME_OVER:

«یک دور دیگه؟ 🔥»

Buttons:

[ بازی دوباره ]

[ بازیکنان جدید ]

[ خروج از اتاق ]

If «بازی دوباره»:

Keep same players.

Reset:

scores
ranks
mission states
answers
timers

Randomize the first player again.

Return to lobby.

---

# 32. RESPONSIVE

Desktop:

1440 × 900

Tablet:

1024 × 768

Mobile:

390 × 844

Optimize all controls for touch.

Buttons must be large enough for touch interaction.

Game elements must remain readable.

---

# 33. RTL PERSIAN

Entire interface must be RTL.

Use polished Persian copy.

Examples:

«ساخت بازی»
«ورود به بازی»
«کد اتاق»
«بازیکنان»
«آماده‌ام»
«شروع بازی»
«نوبت شماست»
«منتظر نوبت باشید»
«زمان باقی‌مانده»
«امتیاز»
«رتبه»
«مأموریت بعدی»
«مأموریت تمام شد»
«قهرمان مشخص شد!»
«دوباره بازی کنیم؟»

---

# 34. CRITICAL DEVELOPMENT RULES

DO NOT BUILD:

* static mockups
* fake buttons
* fake timers
* fake multiplayer
* predefined rankings
* hard-coded winners
* disconnected screens
* simulated transitions pretending to be game logic

BUILD:

REAL PLAYER STATE
REAL TURN MANAGEMENT
REAL TIMER
REAL SCORE CALCULATION
REAL RANKING
REAL MISSION LOGIC
REAL GAME STATE
REAL REPLAY

The user must be able to:

CREATE ROOM
→ ADD 3–8 PLAYERS
→ READY
→ START
→ PLAY ROUND 1
→ ROTATE TURNS
→ CALCULATE SCORES
→ SHOW LEADERBOARD
→ ROTATE STARTING PLAYER
→ PLAY ROUND 2
→ CONTINUE
→ PLAY SIMULTANEOUS MISSIONS
→ PLAY TEAM CHALLENGE
→ PLAY FINAL MISSION
→ REVEAL WINNER
→ REPLAY

---

# 35. MOST IMPORTANT RULE

The game must NEVER get stuck waiting for a manual action when the game engine can determine what happens next.

For example:

Player finishes turn
→ automatically calculate score
→ automatically lock input
→ automatically move to next player
→ automatically start next timer.

After last player finishes:
→ automatically end mission
→ calculate leaderboard
→ show results
→ rotate starting player
→ prepare next mission.

The game should feel like a professionally engineered party game.

FUNCTIONALITY FIRST.
GAME LOGIC SECOND.
VISUAL POLISH THIRD.

But the final result must deliver ALL THREE.

Make the final experience feel like:

# 🎮 «این واقعاً یک بازیه، نه یک Prototype.»
