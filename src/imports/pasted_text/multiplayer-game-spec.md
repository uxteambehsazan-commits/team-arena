Create a REAL, FULLY PLAYABLE MULTIPLAYER GAME — NOT A SAMPLE, NOT A STATIC PROTOTYPE, AND NOT A UI MOCKUP.

The application must behave like an actual game that people can play together.

# GAME: «ماموریت نهایی»

A fast, colorful, highly animated multiplayer party game for 3–8 players.

The primary goal is PLAYABILITY.

Do not spend the majority of the implementation on decorative screens.

Build the actual game loop, player state, turns, scoring, timers, missions and winner calculation.

---

# 1. MULTIPLAYER FIRST

This is NOT a single-player demo.

The game must support 3–8 real players.

Create a real multiplayer lobby.

Players should be able to:

1. Create a game
2. Join a game
3. Enter their name
4. Choose an avatar
5. See other players joining
6. See the current player count
7. See who is ready
8. Start the game when everyone is ready

Lobby example:

┌─────────────────────────────────┐

```
    🎮 ماموریت نهایی

 اتاق بازی: UX-4821

 👤 6 / 8 بازیکن

 🟣 علی        ✓ آماده
 🟢 سارا       ✓ آماده
 🟠 رضا        ✓ آماده
 🔵 مریم       ✓ آماده
 🟡 نگار       ✓ آماده
 🔴 امیر       آماده نیست

    [ آماده‌ام ]

    [ شروع بازی ]
```

└─────────────────────────────────┘

Player changes must immediately appear for all players.

---

# 2. GAME ROOM

Create a persistent game room.

Each game has a unique room code.

Example:

UX-4821

Players join using:

«کد ورود به بازی را وارد کنید»

The game must maintain:

* room ID
* players
* avatars
* ready state
* current mission
* scores
* timer
* answers
* rankings
* game status

Game states:

LOBBY
COUNTDOWN
PLAYING
MISSION_RESULT
LEADERBOARD
NEXT_MISSION
FINAL
GAME_OVER

Do NOT fake these states with separate disconnected screens.

They must be connected to actual game state.

---

# 3. REAL-TIME MULTIPLAYER

If realtime backend/database capabilities are available in the environment, implement them.

Use a realtime shared game state.

All players should see:

* players joining
* players leaving
* ready status
* game start
* countdown
* mission state
* scores
* timer
* leaderboard
* mission completion
* final winner

in real time.

If a true backend is not available, create a robust local multiplayer mode using multiple players on the same device rather than pretending that online multiplayer exists.

NEVER create fake multiplayer behavior.

---

# 4. TWO PLAY MODES

Create two modes:

## MODE A — SAME DEVICE

«بازی گروهی روی یک دستگاه»

3–8 people can play together using the same laptop/tablet.

Players take turns.

The active player is clearly displayed.

Example:

🎯 نوبت سارا

Everyone else sees:

«منتظر نوبت سارا باشید...»

This mode MUST be completely playable without a backend.

---

## MODE B — ONLINE ROOM

«بازی آنلاین»

One player creates a room.

Other players enter the room code.

If realtime infrastructure is available, synchronize players across devices.

If it is unavailable, do not pretend it works.

Instead show a clear disabled state:

«حالت آنلاین در این نسخه نیازمند اتصال سرور است.»

The Local Multiplayer mode must remain fully playable.

---

# 5. ACTUAL GAME LOOP

The game must follow this exact flow:

CREATE ROOM
↓
JOIN PLAYERS
↓
READY
↓
START
↓
COUNTDOWN
↓
MISSION 1
↓
MISSION RESULT
↓
LIVE LEADERBOARD
↓
MISSION 2
↓
MISSION RESULT
↓
MISSION 3
↓
MISSION RESULT
↓
MISSION 4
↓
MISSION RESULT
↓
FINAL MISSION
↓
FINAL SCORE
↓
WINNER

Every transition must actually update the game state.

---

# 6. REAL MISSIONS

Create at least 5 fully playable mini-games.

They must not be decorative screens.

## GAME 01 — SPEED ⚡

A target appears.

The player must click the correct target as quickly as possible.

Use a 20-second timer.

Every correct click:

+100 points

Wrong click:

-25 points

Speed bonus:

The faster the response, the higher the bonus.

Example:

Response time:
0.82 sec

Score:

+180

The score must be calculated dynamically.

---

# 7. GAME 02 — MEMORY 🧠

Create a real memory card game.

12 cards.

Cards are shuffled.

Players must find matching pairs.

Rules:

Correct pair:
+100

Wrong pair:
-20

The game ends when:

all pairs are found

OR

the timer reaches zero.

Track actual moves.

Show:

Pairs found: 4 / 6
Moves: 11
Time: 18 sec

---

# 8. GAME 03 — LOGIC 🧩

Generate multiple visual logic questions.

Example:

🟦 🟨 🟦 🟨 ?

Options:

🟦
🟨
🟥
🟩

Player selects one answer.

Correct:

+150

Wrong:

0

Each player gets their own answer state.

Do not reveal the correct answer until the answering period ends.

This prevents other players from copying.

---

# 9. GAME 04 — FASTEST FINGER 🎯

A countdown appears.

Players wait.

At a random moment:

🔥 GO!

The first player to press the button wins.

Scoring:

1st → 300
2nd → 200
3rd → 100

Late click:

-50

This mission should create excitement between players.

---

# 10. GAME 05 — TEAM CHALLENGE 🤝

This is a COOPERATIVE mission.

All players work together.

Create a shared puzzle.

Example:

A large machine has 8 components.

Each player controls one component.

Players must activate the correct components in the correct order.

The entire team has 45 seconds.

Everyone sees the same puzzle state.

Success:

+300 to EVERY player

Failure:

0

This mission should visually emphasize cooperation.

Show animated connections between players.

---

# 11. FINAL MISSION 💥

Final mission uses the current ranking.

Players can earn 2× points.

Display:

🔥 FINAL ROUND

«همه چیز می‌تونه عوض بشه.»

The leaderboard should remain hidden during the final challenge.

This creates suspense.

After completion:

Reveal rankings dramatically.

---

# 12. REAL SCORING ENGINE

Create a central scoring system.

Every player object must contain:

id
name
avatar
score
rank
ready
status
missionScore

Example:

Player {
id
name
avatar
score
ready
status
missionScore
}

After every mission:

score = score + missionScore

Then dynamically calculate ranking.

If two players have the same score:

use mission completion time as tie breaker.

---

# 13. REAL TIMER

Implement actual countdown timers.

Example:

20
19
18
17
...

When timer reaches 0:

automatically end the mission.

Players cannot continue answering.

Do not use a fake animated timer.

The timer must control game logic.

---

# 14. REAL LEADERBOARD

After every mission calculate:

Rank
Player
Score
Difference

Example:

🥇 سارا       920
🥈 علی        870   -50
🥉 مریم       740   -180
4️⃣ رضا       690   -230

Animate ranking changes.

If a player moves from #4 to #2:

animate the card physically moving upward.

---

# 15. PLAYER EXPERIENCE

Each player must always know:

WHO AM I?

MY SCORE

MY RANK

WHO IS PLAYING?

WHOSE TURN IS IT?

HOW MUCH TIME IS LEFT?

WHAT DO I NEED TO DO?

Do not make players search for this information.

---

# 16. GAME HOST

The room creator is the HOST.

Host can:

* start game
* restart mission
* end game
* kick disconnected players
* restart entire game

Host has a small crown:

👑 HOST

Do not give host excessive controls during active missions.

---

# 17. CONNECTION STATES

Handle:

Player joined
Player left
Player disconnected
Player reconnecting

Show:

«سارا دوباره به بازی برگشت! 🎉»

If someone leaves:

«رضا از بازی خارج شد.»

Do not crash the game.

---

# 18. VISUAL DESIGN

The visual style must be:

EXTREMELY COLORFUL
EXTREMELY ANIMATED
PLAYFUL
PREMIUM
MODERN
ENERGETIC

Think:

Arcade + Game Show + Party Game.

Use:

gradient backgrounds
neon highlights
glowing buttons
animated particles
3D-looking objects
expressive avatars
floating shapes
confetti
dynamic typography
large numbers
dramatic transitions

Do not make it look like a corporate dashboard.

---

# 19. ANIMATION

Animations are essential.

Use:

button press
hover
bounce
shake
flip
scale
slide
fade
particle burst
confetti
score popups
counting numbers
leaderboard movement
avatar reactions

Correct answer:

✨ +100

Wrong:

💥 -25

Mission completed:

🎉 MISSION COMPLETE

Winner:

🏆 CHAMPION

---

# 20. GAME START

When all players are ready:

3

2

1

🚀 GO!

Screen should dramatically transition into the first mission.

---

# 21. WINNER EXPERIENCE

At the end:

DO NOT simply show a table.

Create a dramatic winner ceremony.

First show:

FINAL SCORES

Then reveal:

🥉 THIRD PLACE

🥈 SECOND PLACE

Pause.

Then:

🥇 AND THE WINNER IS...

Large animation.

Winner avatar appears.

Huge trophy.

Confetti.

Fireworks.

Text:

🏆 قهرمان ماموریت نهایی

Score:

2,480

---

# 22. REPLAY

After the game:

«یک دور دیگه؟ 🔥»

Options:

[ بازی دوباره ]

[ بازیکنان جدید ]

[ خروج از اتاق ]

If replay is selected:

Reset scores.

Keep the same players.

Return to lobby.

The game must actually restart.

---

# 23. RESPONSIVE

Desktop:
1440×900

Tablet:
1024×768

Mobile:
390×844

For mobile, optimize controls for touch.

Buttons must be large.

Game interactions must be comfortable with one hand.

---

# 24. RTL PERSIAN

Entire interface must be RTL.

Use Persian UI text.

Examples:

«ساخت بازی»

«ورود به بازی»

«کد اتاق»

«بازیکنان»

«آماده‌ام»

«شروع بازی»

«نوبت شماست»

«زمان باقی‌مانده»

«امتیاز»

«رتبه»

«مأموریت بعدی»

«دوباره بازی کنیم؟»

---

# 25. CRITICAL REQUIREMENT

DO NOT BUILD A SHOWCASE.

DO NOT BUILD A DESIGN CONCEPT.

DO NOT BUILD STATIC SCREENS.

DO NOT BUILD FAKE BUTTONS.

DO NOT SIMULATE THE GAME WITH PREDEFINED SCREEN TRANSITIONS.

BUILD A REAL PLAYABLE GAME.

The user must be able to:

CREATE A ROOM
→ ADD 3–8 PLAYERS
→ START
→ PLAY
→ ANSWER
→ EARN POINTS
→ COMPETE
→ SEE LIVE RANKINGS
→ PLAY MULTIPLE MISSIONS
→ PLAY THE FINAL ROUND
→ GET A WINNER
→ REPLAY

The application should feel like a real party game, not a Figma prototype.

Prioritize GAME LOGIC and PLAYABILITY first.

Then add the visual polish, animations and effects.

If a technical feature cannot be implemented in the current environment, do not fake it. Implement the closest genuinely functional alternative and clearly separate it from unavailable online functionality.
