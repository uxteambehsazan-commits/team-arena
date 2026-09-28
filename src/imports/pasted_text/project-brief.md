============================================================
PROJECT
============================================================

PROJECT NAME:
"میدان هم‌تیمی‌ها"

TASK:
Upgrade the EXISTING application by adding a complete
MULTI-GAME LEAGUE SYSTEM containing 8 playable games.

IMPORTANT:

This is an EXTENSION of the existing application.

DO NOT redesign or rebuild the application.

DO NOT replace the existing navigation.

DO NOT replace the existing room system.

DO NOT replace the existing participant system.

DO NOT replace the existing online/multiplayer architecture.

DO NOT modify unrelated screens.

REUSE the existing infrastructure wherever possible.

============================================================
CRITICAL EXISTING BUG — MUST FIX FIRST
============================================================

The current application has a critical game-routing bug.

Example:

User selects:
"Game X"

But:
"Game Y"

opens instead.

This is NOT acceptable.

The relationship between:

GAME CARD
→ GAME ID
→ ROUTE
→ GAME COMPONENT
→ GAME LOGIC
→ GAME RESULT

must be strictly 1-to-1.

A selected game MUST ALWAYS open the exact selected game.

Before implementing the new League System, identify and fix the root cause of this bug.

DO NOT patch individual buttons one by one.

Find the actual source of the mapping problem.

============================================================
1. SINGLE SOURCE OF TRUTH — GAME REGISTRY
============================================================

Create ONE centralized Game Registry.

Never identify games by:

- array index
- card position
- visual order
- translated title
- random component name
- route position
- list index

Every game must have a permanent unique ID.

Use exactly:

GAME_ID:
"mafia-behsazani"

TITLE:
"مافیای بهسازانی"

GAME_ID:
"spy"

TITLE:
"جاسوس"

GAME_ID:
"codenames-behsazan"

TITLE:
"رمزگشایان بهسازان"

GAME_ID:
"pictionary-behsazan"

TITLE:
"طراح ناشناس"

GAME_ID:
"it-quiz"

TITLE:
"مسابقه بزرگ IT"

GAME_ID:
"decrypto-project"

TITLE:
"رمز پروژه"

GAME_ID:
"just-one"

TITLE:
"یک کلمه"

GAME_ID:
"project-council"

TITLE:
"شورای پروژه"

============================================================
2. EXISTING SPY GAME — REPLACEMENT
============================================================

IMPORTANT:

The application ALREADY has a game called:

"جاسوس"

DO NOT create another game called:

"جاسوس در شرکت"

DO NOT create a second Spy card.

DO NOT create a duplicate Spy route.

DO NOT keep the old Spy gameplay beside the new gameplay.

The existing:

GAME_ID = "spy"

must remain the SAME.

Only its internal gameplay implementation must be replaced with
the new Spyfall-style gameplay.

Therefore:

Existing card:
"جاسوس"

Existing navigation:
"جاسوس"

Existing room entry:
"جاسوس"

Existing route:
MUST REMAIN COMPATIBLE

BUT:

Old Spy Logic
        ↓
REMOVE/REPLACE
        ↓
NEW SPYFALL-STYLE LOGIC

There must be exactly ONE Spy game in the application.

============================================================
3. GAME REGISTRY STRUCTURE
============================================================

Create a single source of truth similar to:

GameRegistry:

mafia-behsazani
spy
codenames-behsazan
pictionary-behsazan
it-quiz
decrypto-project
just-one
project-council

Each entry must contain:

id
title
description
icon/image
minPlayers
maxPlayers
estimatedDuration
gameType
component
route
rulesVersion
enabled
supportsLeague
supportsRematch

IMPORTANT:

The GAME ID must never change.

The UI title can change later without breaking game routing.

============================================================
4. GAME SELECTION MAPPING
============================================================

The game card MUST pass:

gameId

NOT:

index

NOT:

title

NOT:

array position

Example:

onClick:

startGameSelection("mafia-behsazani")

NOT:

startGameSelection(0)

The selected Game ID must be stored in the League state.

============================================================
5. GAME ROUTER
============================================================

Create a deterministic Game Router.

Pseudo logic:

selectedGameId
        ↓
GameRegistry[selectedGameId]
        ↓
game component
        ↓
game logic
        ↓
game result

Example:

"mafia-behsazani"
→ MafiaBehsazaniGame

"spy"
→ SpyfallGame

"codenames-behsazan"
→ CodenamesGame

"pictionary-behsazan"
→ PictionaryGame

"it-quiz"
→ ITQuizGame

"decrypto-project"
→ DecryptoGame

"just-one"
→ JustOneGame

"project-council"
→ ProjectCouncilGame

NEVER use:

if selectedIndex === 0

to determine a game.

NEVER rely on card ordering.

NEVER infer the game from title text.

============================================================
6. ROUTE VALIDATION
============================================================

Whenever a game opens:

Validate:

URL/route gameId
        ==
League selected gameId
        ==
Game Registry gameId
        ==
Loaded component gameId

If any mismatch occurs:

DO NOT start the wrong game.

Show a safe error:

"بازی انتخاب‌شده قابل شناسایی نیست."

Then return to the game selection screen.

Never silently load another game.

============================================================
7. ROOM / WAITING AREA
============================================================

Keep the existing waiting room.

Participants join the existing room.

The room must show:

عنوان:
"اتاق میدان هم‌تیمی‌ها"

Participant count:

مثلاً:

"۸ بازیکن آماده‌اند"

Player list:

- avatar
- name
- ready status

Host indicator:

"میزبان"

Each participant should have:

آماده
در انتظار

The host sees:

"شروع مسابقات"

Non-host players see:

"منتظر شروع مسابقات توسط میزبان..."

============================================================
8. HOST START FLOW
============================================================

When the HOST presses:

"شروع مسابقات"

DO NOT immediately launch a random game.

Open:

"انتخاب بازی‌های لیگ"

Only the HOST can configure the League.

Other participants see:

"میزبان در حال انتخاب بازی‌های لیگ است..."

============================================================
9. LEAGUE GAME SELECTION SCREEN
============================================================

Show all 8 games to the HOST.

Each card:

Game illustration
Game title
Short description
Player range
Estimated duration
Game type
Selection checkbox
Selection state

Example:

🕵️ مافیای بهسازانی

۶ تا ۱۵ نفر

۱۵–۳۰ دقیقه

بازی نقش مخفی

[انتخاب]

============================================================
10. PLAYER-COUNT VALIDATION
============================================================

The list of available games must dynamically depend on
the number of participants currently in the room.

Example:

If there are:

8 players

Then these are valid:

Mafia: 6–15
Spy: 4–10
Codenames: 4–12
Pictionary: 4–12
IT Quiz: 2–20
Decrypto: 4–8
Just One: 3–10
Project Council: 5–12

All 8 are available for 8 players.

If the participant count is outside a game's range:

Disable that game.

Example:

16 players:

Mafia 6–15
→ disabled

Show:

"برای ۱۶ نفر مناسب نیست"

Do NOT allow the host to accidentally start an invalid configuration.

============================================================
11. IMPORTANT — DO NOT SILENTLY CHANGE PLAYER COUNTS
============================================================

Never silently split players into teams/tables unless that game
explicitly supports table-based league play.

Never silently remove participants.

Never silently change the player count.

If a game does not support the current participant count:

disable it and explain why.

Example:

"حداکثر تعداد بازیکن: ۱۵ نفر"

============================================================
12. LEAGUE SELECTION
============================================================

The host may select:

ONE or MULTIPLE games.

The selected games become:

League Rounds.

Example:

ROUND 1:
جاسوس

ROUND 2:
مافیای بهسازانی

ROUND 3:
رمزگشایان بهسازان

ROUND 4:
مسابقه بزرگ IT

The host must be able to:

- select
- deselect
- reorder

selected games.

Use:

"ترتیب مسابقات"

with drag-and-drop if supported.

Otherwise provide:

↑
↓

buttons.

============================================================
13. LEAGUE SUMMARY
============================================================

Before starting the league show:

"خلاصه مسابقات"

Example:

🏆 لیگ میدان هم‌تیمی‌ها

بازیکنان:
۸ نفر

تعداد بازی:
۴

ترتیب:

1. جاسوس
2. رمزگشایان بهسازان
3. مافیای بهسازانی
4. مسابقه بزرگ IT

Estimated total duration:
approximately X minutes

Host button:

"شروع لیگ"

============================================================
14. LEAGUE LOCK
============================================================

Once host presses:

"شروع لیگ"

The selected game list becomes locked.

Participants cannot alter the selected games.

The League State must persist.

Example:

League:

leagueId
participants
hostId
selectedGameIds
currentRound
completedRounds
scores
status

============================================================
15. LEAGUE STATE MACHINE
============================================================

Use explicit states:

WAITING_ROOM

→ HOST_SELECTING_GAMES

→ LEAGUE_READY

→ ROUND_STARTING

→ ROUND_PLAYING

→ ROUND_RESULT

→ NEXT_ROUND

→ LEAGUE_COMPLETE

→ REMATCH / EXIT

Never skip states.

Never start ROUND 2 before ROUND 1 has completely ended.

============================================================
16. ROUND ENGINE
============================================================

The League Engine controls the games.

The League Engine does NOT contain game-specific rules.

It only controls:

- which game is active
- round number
- participants
- scoring
- start/end
- transition
- next game

Example:

currentGameId =
"spy"

After Spy ends:

currentGameId =
"codenames-behsazan"

The game component is loaded from the Registry.

============================================================
17. CRITICAL ROUND ISOLATION
============================================================

Each game MUST have isolated state.

When:

Game A ends

ALL Game A state must be cleaned before Game B starts.

Do NOT allow:

Spy state
to remain inside
Codenames.

Do NOT allow:

Mafia roles
to leak into
Spy.

Do NOT allow:

Codenames cards
to appear in
Decrypto.

Each game must have:

gameState

with its own namespace.

============================================================
18. LEAGUE SCORE SYSTEM
============================================================

Create one normalized League Score system.

Each game may have its own internal score.

But the League needs a common score.

Use:

WIN = 3 League Points

DRAW = 1 League Point

LOSS = 0 League Points

For cooperative/team games:

Every member of the winning team:
+3

Every member of the losing team:
+0

If a draw occurs:
+1 to each eligible participant.

For individual games:

Rank players according to the game's own scoring.

Recommended League conversion:

1st place = 3
2nd place = 2
3rd place = 1
others = 0

If the game has more than 3 players, do not show
a fake ranking if the game's result is team-based.

The game result must define whether the outcome is:

INDIVIDUAL
TEAM
COOPERATIVE
DRAW

============================================================
19. SCORE SAFETY
============================================================

Never calculate League Points from displayed UI text.

Use actual game result state.

Example:

gameResult:

{
gameId,
winnerIds,
loserIds,
draw,
placements
}

League engine converts this result into League Points.

Never allow a client-side player to manually modify League Points.

============================================================
20. BETWEEN-ROUND SCREEN
============================================================

After every game:

Show:

"پایان بازی"

Current result

League standings

Then:

"بازی بعدی"

Example:

بازی ۱ از ۴ تمام شد.

بازی بعدی:

🔐 رمزگشایان بهسازان

Button:

"ادامه مسابقات"

For non-host participants:

"میزبان در حال انتقال به بازی بعدی است..."

Do not immediately jump to the next game without a short
result/transition state.

============================================================
21. LEAGUE STANDINGS
============================================================

Show:

🏆 جدول لیگ

Columns:

رتبه
بازیکن
بازی‌های انجام‌شده
برد
امتیاز

Example:

1 — علی — 4 — 3 — 10
2 — سارا — 4 — 2 — 8
3 — رضا — 4 — 2 — 7

Do not rank players until a result is actually available.

Tie-breakers must be deterministic.

Recommended:

1. League Points
2. Number of Wins
3. Total game-specific score
4. If still tied:
   shared rank

Never use random tie-breaking.

============================================================
22. FINAL LEAGUE RESULT
============================================================

After the last selected game:

Show:

🏆
"پایان لیگ میدان هم‌تیمی‌ها"

Show:

- final standings
- total League Points
- games played
- wins
- game history

Each participant can see:

"عملکرد من"

and:

"جدول نهایی"

Host sees:

"شروع لیگ جدید"

"بازگشت به اتاق"

============================================================
23. GAME 1 — مافیای بهسازانی
============================================================

ID:
mafia-behsazani

PLAYERS:
6–15

TYPE:
Hidden-role social deduction.

THEME:
IT company / project team.

CITIZEN-SIDE ROLES:

- مدیر پروژه
- UX Designer
- UI Designer
- برنامه‌نویس
- QA
- تحلیلگر کسب‌وکار
- منابع انسانی
- کارشناس امنیت

HIDDEN SABOTEUR SIDE:

- خرابکار پروژه
- جاسوس
- باگ‌ساز

SPECIAL ROLES where valid:

- بازرس
- پزشک
- مدیر فنی

IMPORTANT:

Role distribution must be balanced according to player count.

Do not assign roles randomly without validating the resulting configuration.

FLOW:

ROLE ASSIGNMENT

→ NIGHT

→ DAY

→ DISCUSSION

→ VOTING

→ ELIMINATION

→ WIN CHECK

→ NEXT NIGHT

WIN:

Citizen team:
all hidden saboteur players eliminated.

Saboteur team:
reaches parity / cannot be outvoted according to configured rule.

Eliminated players:

- cannot vote
- cannot perform role action
- cannot influence active state

Private roles must never be exposed publicly.

============================================================
24. GAME 2 — جاسوس
============================================================

ID:
spy

THIS REPLACES THE EXISTING SPY GAME.

DO NOT CREATE:
"جاسوس در شرکت"

TITLE MUST REMAIN:
"جاسوس"

PLAYERS:
4–10

TYPE:
Spyfall-style social deduction.

One player is:

SPY

All other players receive:

same secret location.

Example locations:

- اتاق جلسه
- واحد UX
- اتاق سرور
- کافه شرکت
- اتاق مدیر
- منابع انسانی
- مرکز تماس
- اتاق تست
- شعبه بانک
- جلسه Sprint
- فضای کار تیمی

Spy receives:

"شما جاسوس هستید"

and DOES NOT receive the location.

FLOW:

ROLE ASSIGNMENT

→ QUESTION ROUND

→ ANSWER

→ NEXT PLAYER

→ SUSPICION

→ VOTE

→ RESULT

If group correctly identifies Spy:

group wins.

If group identifies wrong player:

Spy wins.

If configured:
Spy may receive a final location guess opportunity.

Private location must never be leaked.

============================================================
25. GAME 3 — رمزگشایان بهسازان
============================================================

ID:
codenames-behsazan

PLAYERS:
4–12

TWO TEAMS:

قرمز
آبی

Each team:

Spymaster
Operatives

BOARD:

5×5

25 words.

Card categories:

RED
BLUE
NEUTRAL
ASSASSIN

Only Spymasters can see the key.

OPERATIVES:

see only the word grid.

TURN:

Spymaster gives:

ONE WORD + NUMBER

Example:

"بانک — 3"

Operatives select cards.

Correct own-team card:
continue

Neutral:
turn ends

Opponent:
turn ends and opponent gains card

Assassin:
immediate loss

Winning condition:

A team identifies all required agents.

The key must NEVER be exposed to Operatives.

This structure follows the core Codenames setup: two teams, Spymasters, Operatives, 5×5 grid and hidden key with team/neutral/assassin identities. :contentReference[oaicite:2]{index=2}

============================================================
26. GAME 4 — طراح ناشناس
============================================================

ID:
pictionary-behsazan

PLAYERS:
4–12

One player:

DRAWER

Other players:

GUESSERS

FLOW:

private word assignment

→ drawing

→ guessing

→ correct answer / timeout

→ scoring

→ next drawer

Categories:

- UX/UI
- IT
- بانکداری
- فناوری
- شرکت
- فرهنگ سازمانی
- عمومی

Examples:

API
Firewall
جلسه
Deploy
داشبورد
سرور
بانک
موبایل
رمز عبور

Drawing must support:

- mouse
- touch
- clear
- undo if possible

The secret word must never be visible to Guessers.

============================================================
27. GAME 5 — مسابقه بزرگ IT
============================================================

ID:
it-quiz

PLAYERS:
2–20

CATEGORIES:

- برنامه‌نویسی
- UX/UI
- فناوری
- امنیت
- بانکداری
- هوش مصنوعی
- IT
- فرهنگ سازمانی
- اطلاعات عمومی

Each question:

4 options

One correct answer.

Timer.

One submission per player.

After submit:

answer becomes locked.

No answer changes.

Timer expiration:

automatic no-answer.

Show result after all players submit or timer ends.

Calculate:

correctness
+
optional speed bonus

Use deterministic scoring.

============================================================
28. GAME 6 — رمز پروژه
============================================================

ID:
decrypto-project

PLAYERS:
4–8

TWO TEAMS.

Each team receives:

4 secret concepts.

Example:

1 = بانک
2 = سرور
3 = مشتری
4 = پروژه

Each round:

Team leader gives clues.

A secret numeric sequence must be decoded.

Example:

2 – 4 – 1

Maintain:

- secret code
- clues
- current round
- team
- guesses
- score
- opponent deductions

Private code must never be exposed to opponents.

The game must have explicit success/failure rules.

============================================================
29. GAME 7 — یک کلمه
============================================================

ID:
just-one

PLAYERS:
3–10

TYPE:
Cooperative word guessing.

ONE active Guesser.

Other players submit:

ONE clue each.

Clues are submitted privately.

Then compare all clues.

If identical clues exist:

REMOVE ALL IDENTICAL DUPLICATE CLUES.

Only unique clues are shown to the Guesser.

Guesser gets one attempt.

Correct:

team gains point.

Wrong:

no point / configured penalty.

Then rotate Guesser.

This duplicate-clue mechanic is fundamental to Just One's rules. :contentReference[oaicite:3]{index=3}

============================================================
30. GAME 8 — شورای پروژه
============================================================

ID:
project-council

PLAYERS:
5–12

TYPE:
Hidden-role team mission game.

GOOD TEAM
vs
SABOTEUR TEAM

Company-themed roles.

GOOD:

- مدیر پروژه
- تحلیلگر
- UX Designer
- عضو تیم

BAD:

- خرابکار
- نفوذی

Optional:

- مدیر ارشد
- بازرس
- محافظ

FLOW:

ROLE ASSIGNMENT

→ LEADER

→ TEAM PROPOSAL

→ TEAM VOTE

→ MISSION

→ SECRET MISSION RESULT

→ RESULT

→ NEXT LEADER

→ WIN CHECK

Bad players can secretly sabotage valid missions.

Never reveal who submitted the sabotage.

Use player-count-specific team sizes.

Do not allow invalid team composition.

============================================================
31. PRIVATE STATE ARCHITECTURE
============================================================

This is one of the most important requirements.

Separate:

PUBLIC GAME STATE

from:

PRIVATE PLAYER STATE.

PUBLIC:

player names
scores
current phase
timer
round
revealed cards
eliminated players

PRIVATE:

Mafia role
Spy identity
Spy location
Codenames key
Decrypto secret code
Pictionary word
Council roles

NEVER:

render private data and hide it with CSS.

NEVER:

put private information into publicly synchronized state.

============================================================
32. GAME STATE ISOLATION
============================================================

Each game must have:

gameId
gameInstanceId
gameState
phase
round
currentPlayer
currentTeam
timer
result

Example:

gameInstanceId:

league-123-round-02

This prevents old game state from leaking into another round.

============================================================
33. NO GAME CROSSOVER
============================================================

This is specifically required because the current application
has a game-mapping problem.

Test all combinations.

Select:

MAFIA
→ Mafia loads

SPY
→ Spy loads

CODENAMES
→ Codenames loads

PICTIONARY
→ Pictionary loads

QUIZ
→ Quiz loads

DECRYPTO
→ Decrypto loads

JUST ONE
→ Just One loads

COUNCIL
→ Council loads

Then test:

Back
→ correct League screen

Next
→ correct next game

Refresh
→ same game instance where supported

Rematch
→ same game type

Exit
→ League state preserved

============================================================
34. AUTOMATED MAPPING TEST MATRIX
============================================================

Create a QA matrix:

Selected ID
Expected Component
Expected Title
Expected Route

mafia-behsazani
MafiaBehsazaniGame
مافیای بهسازانی

spy
SpyfallGame
جاسوس

codenames-behsazan
CodenamesGame
رمزگشایان بهسازان

pictionary-behsazan
PictionaryGame
طراح ناشناس

it-quiz
ITQuizGame
مسابقه بزرگ IT

decrypto-project
DecryptoGame
رمز پروژه

just-one
JustOneGame
یک کلمه

project-council
ProjectCouncilGame
شورای پروژه

EVERY ROW MUST PASS.

============================================================
35. USER FLOW TEST
============================================================

Simulate a real company session.

SCENARIO:

8 employees enter room.

Room shows:

"۸ بازیکن آماده‌اند"

Host clicks:

"شروع مسابقات"

Host sees:

"انتخاب بازی‌های لیگ"

Host selects:

1. جاسوس
2. مافیای بهسازانی
3. رمزگشایان بهسازان
4. مسابقه بزرگ IT

Host confirms:

"شروع لیگ"

ALL players see:

"لیگ شروع شد"

ROUND 1:

جاسوس

Play Spy.

Finish Spy.

Show:

ROUND RESULT

League standings.

Then:

"بازی بعدی"

ROUND 2:

مافیای بهسازانی

Play Mafia.

Finish Mafia.

Update League Score.

ROUND 3:

رمزگشایان بهسازان

ROUND 4:

مسابقه بزرگ IT

Finish.

Show:

FINAL LEAGUE RESULT.

============================================================
36. USER TEST — HOST
============================================================

Test host flow with real interaction.

Host must be able to:

1. Start competition
2. See participant count
3. See valid games
4. See disabled invalid games
5. Select multiple games
6. Reorder games
7. See estimated duration
8. Confirm league
9. Start league
10. See current round
11. Move to next game
12. See standings
13. Finish league
14. Start rematch/new league

Check that every action produces visible feedback.

============================================================
37. USER TEST — PARTICIPANT
============================================================

Test participant flow.

Participant:

joins room

→ waits

→ sees host status

→ receives league announcement

→ sees current game

→ enters game

→ plays

→ sees result

→ returns to league

→ sees standings

→ waits for next round

→ enters next game

→ sees final result.

Participants MUST NOT be able to:

- change league order
- select games
- start league
- modify score
- access private role information
- skip rounds

============================================================
38. USER TEST — MOBILE
============================================================

Test:

360×800
375×812
390×844
430×932

Check:

- Persian text
- game cards
- host selection
- selection checkbox
- reorder
- league summary
- timer
- game board
- voting
- score
- result
- next round

No:

text overlap
button clipping
horizontal overflow
hidden CTA
unreadable text
overlapping modal.

============================================================
39. DESKTOP TEST
============================================================

Test:

1280×800
1440×900
1920×1080

Ensure:

- game grid
- lobby
- player list
- league selection
- game boards
- scoreboards
- results

are properly aligned.

============================================================
40. TEST ALL GAME COUNTS
============================================================

Test valid minimum and maximum counts.

MAFIA:
6
15

SPY:
4
10

CODENAMES:
4
12

PICTIONARY:
4
12

IT QUIZ:
2
20

DECRYPTO:
4
8

JUST ONE:
3
10

PROJECT COUNCIL:
5
12

Also test:

one below minimum

one above maximum

The game must not start in invalid conditions.

============================================================
41. DOUBLE ACTION TEST
============================================================

For every game:

Double click.

Rapid tap.

Repeated submit.

Repeated vote.

Repeated answer.

Repeated start.

Repeated rematch.

Expected:

ONE valid action only.

Never:

two turns
two scores
two votes
two rounds
two timers.

============================================================
42. TIMER TEST
============================================================

Verify:

Timer starts once.

Timer updates correctly.

Timer ends once.

Timer cannot become negative.

Timer cannot restart unexpectedly.

When timer reaches zero:

correct state transition occurs.

After leaving game:

timer is destroyed.

After rematch:

new timer is created once.

============================================================
43. REFRESH / RECONNECT TEST
============================================================

Test refresh during:

Lobby
Game selection
Round
Voting
Result
Between rounds

Use existing reconnect architecture.

The player must return to the correct:

leagueId
round
gameId
gameInstanceId

Never reopen another game.

============================================================
44. HOST LEAVES
============================================================

Test host leaving:

during lobby

during game

between rounds

Use existing host-transfer behavior if already available.

Do NOT create a separate host system.

The League must not become corrupted.

============================================================
45. GAME RESULT CONTRACT
============================================================

Every game must return a standard result object.

Example:

{
  gameId,
  gameInstanceId,
  status,
  winnerIds,
  loserIds,
  draw,
  placements,
  gameScores,
  leaguePoints
}

The League Engine consumes this result.

This creates a clean separation:

GAME ENGINE
handles game rules.

LEAGUE ENGINE
handles tournament/league progression.

============================================================
46. NO GAME LOGIC IN GAME SELECTION
============================================================

The selection screen should NOT contain:

Mafia logic
Spy logic
Quiz logic
etc.

It only selects:

gameId.

Game rules belong to the selected Game Engine.

============================================================
47. NO LEAGUE LOGIC INSIDE GAME RULES
============================================================

Games should NOT know:

which round they are
what the next game is
what other games were played

They only report:

WIN
LOSS
DRAW
SCORE
PLACEMENT

League Engine decides:

next game.

============================================================
48. ERROR RECOVERY
============================================================

If a game crashes or enters an invalid state:

DO NOT load another random game.

Show:

"در اجرای بازی مشکلی ایجاد شد."

Options:

"تلاش مجدد"

"بازگشت به لیگ"

The correct gameId must be preserved.

============================================================
49. VISUAL STYLE
============================================================

Use the existing "میدان هم‌تیمی‌ها" visual identity.

Based on the existing artwork:

- 3D chibi characters
- fantasy adventure atmosphere
- dark background
- Behsazan-inspired red
- colorful game objects
- premium playful visuals
- rounded cards
- subtle glow
- cinematic game illustrations

New game artwork should use the same visual family.

Do NOT redesign the entire application.

Only the new game cards and game screens may receive
game-specific visual treatment.

============================================================
50. GAME CARD CONTENT
============================================================

Use:

MAFIA:
"مافیای بهسازانی"
"در تیم پروژه، چه کسی مخفیانه خرابکاری می‌کند؟"

SPY:
"جاسوس"
"سؤال بپرس، سرنخ پیدا کن و جاسوس را پیدا کن."

CODENAMES:
"رمزگشایان بهسازان"
"با یک کلمه، تیم خود را به سمت رمزهای درست هدایت کن."

PICTIONARY:
"طراح ناشناس"
"بکش، حدس بزن و امتیاز بگیر."

IT QUIZ:
"مسابقه بزرگ IT"
"دانش و سرعت خودت را به چالش بکش."

DECRYPTO:
"رمز پروژه"
"رمزهای تیم را کشف کن، قبل از اینکه رقبا متوجه شوند."

JUST ONE:
"یک کلمه"
"با یک سرنخ به هم‌تیمی‌ات کمک کن."

COUNCIL:
"شورای پروژه"
"به چه کسی اعتماد می‌کنی تا تیم پروژه را تشکیل دهد؟"

============================================================
51. ACCESSIBILITY
============================================================

Support:

keyboard navigation

focus states

touch targets

screen-reader labels where applicable

adequate contrast

clear status indicators

Never communicate important state using color alone.

============================================================
52. PERFORMANCE
============================================================

Check:

unnecessary renders
duplicate timers
duplicate listeners
stale closures
memory leaks
unnecessary network calls
unnecessary state updates

Especially inspect:

League Engine
Game Router
Game Registry
Timer Engine
Room State
Private State
Score Engine

============================================================
53. SECURITY / PRIVATE DATA
============================================================

Secret roles and game information must not be exposed to
players who should not see them.

Do not rely on:

CSS visibility
opacity
display:none

for security.

Private state must be separated logically.

============================================================
54. FULL REGRESSION TEST
============================================================

After implementing everything:

Test ALL EXISTING games.

Test ALL NEW games.

Test:

Home
Room
Lobby
Game selection
League
Round
Result
Score
Rematch
Exit

Existing functionality must continue working.

============================================================
55. MANDATORY GAME MAPPING TEST
============================================================

Run this exact test:

Select:

1. Mafia
Expected:
Mafia

2. Spy
Expected:
Spy

3. Codenames
Expected:
Codenames

4. Pictionary
Expected:
Pictionary

5. IT Quiz
Expected:
IT Quiz

6. Decrypto
Expected:
Decrypto

7. Just One
Expected:
Just One

8. Project Council
Expected:
Project Council

Repeat the test:

from Game Hub

from League Selection

from Next Round

from Rematch

from Refresh/Reconnect

Every test MUST open the correct game.

If ANY test opens a different game:

STOP.

Fix Game Registry / Game Router / State persistence.

Then rerun the entire matrix.

============================================================
56. LEAGUE TEST
============================================================

Create a test League:

Players:
8

Selected games:

1. Spy
2. Mafia
3. Codenames
4. IT Quiz

Verify:

Host selection
→ correct selected IDs

League start
→ Round 1 Spy

Spy end
→ Round Result

Next
→ Round 2 Mafia

Mafia end
→ Round Result

Next
→ Round 3 Codenames

Codenames end
→ Round Result

Next
→ Round 4 IT Quiz

IT Quiz end
→ Final League

Verify:

scores
standings
round numbers
game IDs
game instances
player participation.

============================================================
57. FAILURE TEST
============================================================

Intentionally test:

wrong gameId

missing gameId

invalid gameId

stale gameId

duplicate gameId

wrong route

old game state

Expected:

safe error or correct recovery.

NEVER silently load a different game.

============================================================
58. FINAL QUALITY GATE
============================================================

Do NOT consider the implementation complete until:

[ ] All 8 games exist.

[ ] Existing Spy game is replaced, not duplicated.

[ ] Exactly ONE "جاسوس" exists.

[ ] Game Registry exists.

[ ] Every game has permanent ID.

[ ] Selection uses gameId.

[ ] Routing uses gameId.

[ ] League uses gameId.

[ ] Game component uses gameId.

[ ] Results use gameId.

[ ] No game selection mismatch exists.

[ ] Host can select multiple games.

[ ] Host can reorder games.

[ ] Invalid games are disabled based on participant count.

[ ] League starts only after valid configuration.

[ ] Games run sequentially.

[ ] Scores accumulate across rounds.

[ ] Final standings work.

[ ] Rematch works.

[ ] Private information is protected.

[ ] Timers clean up.

[ ] Double actions are prevented.

[ ] Existing application functionality remains intact.

[ ] Desktop tested.

[ ] Mobile tested.

[ ] Minimum player count tested.

[ ] Maximum player count tested.

[ ] Disconnect tested.

[ ] Reconnect tested.

[ ] Host leaving tested.

[ ] Refresh tested.

[ ] Full regression completed.

============================================================
59. FINAL INSTRUCTION
============================================================

DO NOT optimize for visual completion.

Optimize for:

CORRECT GAME SELECTION
+
CORRECT GAME LOGIC
+
CORRECT LEAGUE FLOW
+
CORRECT PLAYER STATE
+
CORRECT PRIVATE INFORMATION
+
CORRECT SCORING
+
CORRECT ROUND TRANSITION
+
CORRECT RESPONSIVE UI
+
ZERO CROSS-GAME CONTAMINATION

The most important requirement is:

IF THE HOST SELECTS GAME X,
GAME X MUST ALWAYS OPEN.

NEVER GAME Y.

NEVER A RANDOM GAME.

NEVER A PREVIOUS GAME.

NEVER A GAME BASED ON ARRAY INDEX.

Use immutable Game IDs and a single Game Registry as the
single source of truth.

After implementation, execute the complete QA scenarios
described above and fix every discovered issue before
considering the task complete.