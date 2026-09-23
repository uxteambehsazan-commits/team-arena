MASTER QA & FULL GAME TESTING PROMPT
«میدان هم‌تیمی‌ها»
ZERO-TO-100 END-TO-END GAME TEST

ROLE:

Act as a Senior QA Engineer + Game QA Engineer + Multiplayer Systems Engineer + Frontend Engineer + UX QA Engineer + State Management Engineer.

Your task is NOT to visually inspect the application only.

You must aggressively test the ENTIRE GAME PLATFORM from 0 to 100.

Your goal is to find, reproduce, diagnose and FIX every functional, logical, multiplayer, scoring, state-management, UI, animation, timing, navigation and edge-case bug.

IMPORTANT:

DO NOT assume that the existing implementation is correct.

DO NOT trust the current game logic.

DO NOT only test the happy path.

Act as if this product is about to be released to hundreds of real colleagues.

Test it as a REAL PRODUCT.

--------------------------------------------------
PHASE 0 — PRE-TEST AUDIT
--------------------------------------------------

Before testing gameplay, inspect the entire application architecture.

Review:

- Components
- Game engine
- State management
- Game state transitions
- Timer implementation
- Multiplayer synchronization
- Room management
- Player management
- Scoring
- Game configuration
- Game selection
- Navigation
- Result calculation
- Leaderboard
- Winner calculation
- Reconnection
- Persistence
- Event listeners
- Subscriptions
- Animations
- Loading states
- Error handling

Identify:

- Dead code
- Duplicate logic
- Conflicting state
- Race conditions
- Unused states
- Missing states
- Inconsistent naming
- Hardcoded assumptions
- Client-only authority
- Duplicate event handlers
- Memory leaks
- Timer leaks
- State synchronization problems

DO NOT modify unrelated functionality unnecessarily.

--------------------------------------------------
PHASE 1 — APPLICATION SMOKE TEST
--------------------------------------------------

Start from a completely fresh session.

Test:

1. Application loads
2. Homepage renders
3. No console errors
4. No broken assets
5. Navigation works
6. Main CTA works
7. «شروع بازی تیمی» works
8. «بازی تک نفره» works
9. Guide icon works
10. Game selection works
11. Game artwork loads
12. Game slider works
13. Game preview works
14. Room creation works

Expected result:

No blocking error.

--------------------------------------------------
PHASE 2 — ROOM CREATION
--------------------------------------------------

Test room creation from scratch.

Test:

- Create room
- Empty room name
- Very long room name
- Special characters
- Duplicate room
- Minimum players
- Maximum players
- Invalid configuration
- No games selected
- One game selected
- Multiple games selected
- All games selected
- Game ordering
- Game removal
- Game re-addition
- Game configuration
- Start button state

Verify:

The room cannot start if the minimum required conditions are not satisfied.

The UI must clearly explain why.

Never allow an invalid room configuration to start.

--------------------------------------------------
PHASE 3 — PLAYER JOIN
--------------------------------------------------

Test:

Player A creates room.

Player B joins.

Player C joins.

Continue until maximum capacity.

Test:

- Valid room code
- Invalid room code
- Expired room
- Full room
- Duplicate player
- Same user opening multiple tabs
- Refresh during lobby
- Browser close
- Reconnect
- Late join

Verify:

Player list remains synchronized.

Every player has:

- Unique identity
- Correct avatar
- Correct name
- Correct connection status

No duplicated player entries.

--------------------------------------------------
PHASE 4 — HOST TESTING
--------------------------------------------------

Test host-specific behavior.

Host can:

- Create room
- Configure games
- Reorder games
- Start game
- Continue to next game
- End session

Test:

HOST LEAVES.

Expected behavior must be deterministic.

Either:

- Transfer host to another player

OR

- Gracefully terminate the room

Choose one consistent behavior and implement it correctly.

Never leave the room in a broken state.

--------------------------------------------------
PHASE 5 — LOBBY SYNCHRONIZATION
--------------------------------------------------

Test:

- Player joins
- Player leaves
- Player becomes ready
- Player becomes unready
- Host starts game
- Multiple players click Ready simultaneously
- Players refresh
- Network delay
- Temporary disconnect

Verify every client receives the same authoritative state.

No player should see:

«Ready»

while another player sees:

«Not Ready»

for the same state.

--------------------------------------------------
PHASE 6 — GAME ENGINE STATE MACHINE
--------------------------------------------------

Validate every state transition.

Expected lifecycle:

LOBBY
→ GAME_CONFIGURATION
→ GAME_START
→ PLAYERS_READY
→ GAME_INTRO
→ COUNTDOWN
→ ROUND_ACTIVE
→ PLAYER_ACTION
→ ANSWERING
→ ROUND_LOCKED
→ CALCULATE_RESULT
→ SHOW_ROUND_RESULT
→ UPDATE_LEADERBOARD
→ NEXT_ROUND
→ NEXT_GAME
→ GAME_RESULT
→ WINNER_CEREMONY

Test every transition.

Test:

- Normal transition
- Delayed transition
- Duplicate transition
- User refresh
- User disconnect
- Browser background
- Timer expiration
- Network delay

No state should be skipped accidentally.

No state should repeat unintentionally.

No user should become permanently stuck.

--------------------------------------------------
PHASE 7 — TIMER TEST
--------------------------------------------------

Timers are CRITICAL.

Test:

- Countdown
- Game timer
- Round timer
- Submission timer
- Result timer

Test:

- 10 seconds
- 5 seconds
- 1 second
- 0 seconds
- Exact expiration
- Submission at 0.001 seconds before expiration
- Submission exactly at expiration
- Submission after expiration

Define one authoritative rule for the boundary.

The same rule must apply to every player.

Prevent:

- Negative timers
- Timer duplication
- Timer acceleration
- Timer freezing
- Timer restarting
- Multiple timers
- Client/server timer disagreement

After leaving the game:

NO old timer may continue running.

--------------------------------------------------
PHASE 8 — SIMULTANEOUS ACTION TEST
--------------------------------------------------

This is mandatory.

Simulate:

Player A submits.

Player B submits at exactly the same time.

Player C submits immediately afterward.

Verify:

- All valid submissions are processed
- Ordering is deterministic
- Scores are correct
- No submission is lost
- No submission is duplicated

Never rely on UI arrival order alone.

--------------------------------------------------
PHASE 9 — GAME 1 TEST
«حدس بزن»
--------------------------------------------------

Test:

- Image loads
- Blur/progressive reveal works
- Guess submission
- Correct guess
- Incorrect guess
- Empty guess
- Duplicate guess
- Case differences
- Persian spacing
- Similar answers
- Multiple players guessing simultaneously
- Correct answer at same time
- Timeout
- Early completion

Verify:

Earlier correct answers receive the correct score.

No player can score twice from one correct answer.

Round ends correctly.

Result is synchronized for all players.

--------------------------------------------------
PHASE 10 — GAME 2 TEST
«اسم‌فامیل سرعتی»
--------------------------------------------------

Test:

- Letter selection
- Category loading
- Answer submission
- Empty answer
- Duplicate answer
- Same answer by multiple players
- Invalid answer
- Timeout
- Simultaneous submission
- Editing answer
- Submission after timer
- Refresh
- Disconnect

Verify scoring rules are deterministic.

Test all categories.

Test Persian text normalization.

Handle:

- نیم‌فاصله
- فاصله اضافی
- ی/ي
- ک/ك
- اعداد
- punctuation

Do not incorrectly reject valid Persian answers because of superficial formatting differences.

--------------------------------------------------
PHASE 11 — GAME 3 TEST
«قایم‌باشک»
--------------------------------------------------

Test:

- Hidden target selection
- Clue generation
- Clue progression
- Guess
- Wrong guess
- Correct guess
- Duplicate guess
- Multiple simultaneous guesses
- Timeout

Verify hidden information is never leaked.

--------------------------------------------------
PHASE 12 — GAME 4 TEST
«کلمه ممنوعه»
--------------------------------------------------

Test:

- Target word
- Forbidden words
- Explanation
- Correct guess
- Incorrect guess
- Forbidden word detection
- Skip
- Timeout
- Duplicate submission

Verify:

Forbidden words cannot accidentally be bypassed through normalization.

Test:

- Upper/lower case where applicable
- Persian spacing
- Half-space
- punctuation
- word variations

--------------------------------------------------
PHASE 13 — GAME 5 TEST
«دوز — نبرد قلمرو»
--------------------------------------------------

This game requires deep state testing.

Test:

- Board initialization
- Player turn
- Cell selection
- Occupied cell
- Invalid cell
- Simultaneous cell selection
- Special cells
- Four-in-a-row
- Territory calculation
- Round completion
- Tie
- Winner
- Score

Attempt:

Two players selecting the same cell simultaneously.

Only one authoritative result must be accepted.

Never allow:

- Duplicate ownership
- Impossible board state
- Invalid turn
- Double move

--------------------------------------------------
PHASE 14 — GAME 6 TEST
«یک کلمه، چند سرنخ»
--------------------------------------------------

Test:

- Clue sequence
- Clue timing
- Guess
- Wrong guess
- Correct guess
- Multiple guesses
- Duplicate guesses
- Score calculation
- Timeout
- Simultaneous correct answers

Verify earlier guesses receive the correct score.

--------------------------------------------------
PHASE 15 — GAME 7 TEST
«چشمک»
--------------------------------------------------

CRITICAL SECRET-STATE TEST.

Exactly 8 players.

Select exactly one wink player.

Test:

- Secret role assignment
- Private role visibility
- Wink action
- Target notification
- Accusation
- Wrong accusation
- Correct accusation
- Limited accusation count
- Multiple accusations
- Timeout

CRITICAL:

The wink player's identity must NEVER be visible to unauthorized players.

Check:

- DOM
- UI
- network state
- client state
- animations
- leaderboard
- debug information
- browser console

Do not expose secret role information through client-visible state.

--------------------------------------------------
PHASE 16 — GAME 8 TEST
«جاسوس»
--------------------------------------------------

CRITICAL SECRET-STATE TEST.

6–8 players.

Select exactly one spy.

Verify:

- All normal players see topic
- Spy does NOT see topic
- Spy sees only information intended for spy
- Voting works
- Vote counting works
- Tie handling works
- Spy identification works
- Final spy guess works

Test:

Spy guesses correctly.

Spy guesses incorrectly.

Verify the final winner calculation.

No secret topic may leak through:

- HTML
- DOM
- network payload
- state
- animations
- console
- result preview

--------------------------------------------------
PHASE 17 — FINAL SPEED GAME
«بازی سرعتی نهایی»
--------------------------------------------------

Test:

- Reaction event
- Correct timing
- Incorrect timing
- Early click
- Late click
- Double click
- Multiple clicks
- Simultaneous players
- Timeout
- Score

Verify no player can exploit rapid repeated clicks.

--------------------------------------------------
PHASE 18 — SCORING ENGINE
--------------------------------------------------

Audit the entire scoring system.

For every game verify:

INPUT
→ VALIDATION
→ SCORE CALCULATION
→ SCORE COMMIT
→ LEADERBOARD UPDATE

Test:

- Correct answer
- Wrong answer
- Timeout
- Tie
- Multiple correct answers
- Duplicate answer
- Simultaneous answer
- Round bonus
- Final bonus
- Comeback bonus

Verify:

Scores never become:

- Negative unexpectedly
- NaN
- Infinity
- Undefined
- Duplicated
- Double-counted

The same event must never award points twice.

--------------------------------------------------
PHASE 19 — LEADERBOARD
--------------------------------------------------

Test:

- Initial ranking
- Score changes
- Rank changes
- Equal scores
- Tie breaker
- Final ranking
- Player leaving
- Player reconnecting

Define deterministic tie-breaking.

Example:

1. Score
2. Correct answers
3. Response time
4. Stable player ID

Use one consistent rule.

Never randomly reorder tied players.

--------------------------------------------------
PHASE 20 — ROUND TRANSITIONS
--------------------------------------------------

After each round verify:

ROUND
→ RESULT
→ LEADERBOARD
→ NEXT ROUND

Test:

- Last round
- First round
- Middle round
- Multiple games
- Single game

Verify the game counter is always correct.

Example:

«راند ۲ از ۵»

must never become:

«راند ۶ از ۵»

--------------------------------------------------
PHASE 21 — GAME TRANSITIONS
--------------------------------------------------

Test:

Game 1
→ Game 2
→ Game 3
→ ...

Verify:

- Correct next game
- Correct game artwork
- Correct rules
- Correct timer
- Correct player state
- Correct scores

No previous game's state should leak into the next game.

--------------------------------------------------
PHASE 22 — SINGLE PLAYER MODE
--------------------------------------------------

Test:

«بازی تک نفره»

The user must be able to play supported games against computer/AI.

Test:

- Game selection
- Difficulty
- AI turn
- AI response
- Timer
- Score
- Win
- Loss
- Draw
- Restart
- Exit

Verify:

Single-player mode does NOT require another human player.

Games without a meaningful AI implementation must not appear as playable single-player games.

--------------------------------------------------
PHASE 23 — DISCONNECT / RECONNECT
--------------------------------------------------

This is mandatory.

During EVERY major state, disconnect a player:

- Lobby
- Countdown
- Game
- Answering
- Result
- Leaderboard
- Next game
- Final ceremony

Reconnect.

Verify:

Player returns to correct state.

Player does not:

- Duplicate
- Lose score
- Submit twice
- Become stuck
- Reset game incorrectly

--------------------------------------------------
PHASE 24 — REFRESH TEST
--------------------------------------------------

Refresh the browser during:

- Lobby
- Countdown
- Game
- Answer
- Result
- Leaderboard

The application must recover gracefully.

No corrupted session.

--------------------------------------------------
PHASE 25 — MULTI-TAB TEST
--------------------------------------------------

Open the same player in multiple tabs.

Test:

- Lobby
- Game
- Submission
- Score

Prevent duplicate player state and duplicate submissions.

--------------------------------------------------
PHASE 26 — NETWORK DELAY
--------------------------------------------------

Simulate:

- Slow network
- High latency
- Delayed response
- Temporary connection loss

Verify the game remains deterministic.

Client lag must never change the authoritative result.

--------------------------------------------------
PHASE 27 — CHEAT / EXPLOIT TEST
--------------------------------------------------

Attempt to exploit:

- Double click
- Repeated submission
- Client timer manipulation
- Client score manipulation
- Invalid game action
- Out-of-turn action
- Hidden-state inspection
- Direct state manipulation
- Replaying old action
- Sending action after timeout

Reject invalid actions.

Never trust client-provided score.

Never trust client-provided winner.

--------------------------------------------------
PHASE 28 — UI STATE TEST
--------------------------------------------------

Every button must have:

- Default
- Hover
- Active
- Disabled
- Loading
- Success
- Error

Test:

- Button spam
- Double click
- Rapid navigation
- Back button
- Escape
- Refresh

No action should execute twice accidentally.

--------------------------------------------------
PHASE 29 — ANIMATION TEST
--------------------------------------------------

Test:

- Countdown
- Score animation
- Rank movement
- Game transitions
- Achievement
- Winner ceremony
- Background animation
- CTA animation

Verify:

Animations never block gameplay.

No animation should prevent clicking.

No animation should remain active after leaving a screen.

No animation should create memory leaks.

--------------------------------------------------
PHASE 30 — MOBILE TEST
--------------------------------------------------

Test all critical flows on mobile dimensions.

Verify:

- Buttons accessible
- Timer visible
- Text readable
- Game board usable
- Keyboard does not break layout
- No horizontal overflow
- Swipe does not conflict with gameplay
- Modal works
- Game slider works

--------------------------------------------------
PHASE 31 — RTL / PERSIAN TEST
--------------------------------------------------

Test Persian content.

Verify:

- RTL
- Numbers
- Persian digits where appropriate
- Mixed Persian/English
- Names
- Long text
- Half-space
- Persian punctuation

No:

- Text overflow
- Broken alignment
- Incorrect direction
- Clipped text

--------------------------------------------------
PHASE 32 — ACCESSIBILITY TEST
--------------------------------------------------

Test:

- Keyboard navigation
- Focus
- Screen reader labels
- Contrast
- Reduced motion
- Touch target size

No critical action should depend only on color.

--------------------------------------------------
PHASE 33 — FINAL RESULT
--------------------------------------------------

Test final result under every possible scenario:

- Clear winner
- Tie
- Comeback
- Single-player win
- Single-player loss
- Multiple games
- One game
- Player disconnect
- Player leaves
- Incomplete game

Winner calculation must be deterministic.

--------------------------------------------------
PHASE 34 — WINNER CEREMONY
--------------------------------------------------

Verify:

- Correct winner
- Correct avatar
- Correct name
- Correct final score
- Correct achievements
- Correct rankings

Never display an incorrect winner.

Never show stale score.

--------------------------------------------------
PHASE 35 — MEMORY LEAK TEST
--------------------------------------------------

Check for:

- Timers
- setInterval
- setTimeout
- requestAnimationFrame
- Event listeners
- Subscriptions
- Multiplayer listeners

Verify cleanup on:

- Unmount
- Navigation
- Game end
- Room exit
- Reconnect

--------------------------------------------------
PHASE 36 — REGRESSION TEST
--------------------------------------------------

After fixing bugs, rerun ALL previously failed tests.

Do not assume fixing one bug did not break another feature.

Perform:

BUG
→ FIX
→ RETEST
→ REGRESSION TEST

--------------------------------------------------
PHASE 37 — BUG CLASSIFICATION
--------------------------------------------------

For every bug found, classify:

CRITICAL
HIGH
MEDIUM
LOW

Critical examples:

- Wrong winner
- Wrong score
- Secret information leak
- Multiplayer desynchronization
- Game cannot finish
- Game stuck
- Duplicate scoring
- Room corruption

Fix ALL Critical and High issues.

Fix Medium and Low issues where practical.

--------------------------------------------------
PHASE 38 — FINAL QUALITY GATE
--------------------------------------------------

DO NOT declare the product ready unless:

✓ All games start
✓ All games finish
✓ Scores are correct
✓ Winners are correct
✓ Timers are correct
✓ Multiplayer synchronization works
✓ Secret information is protected
✓ Single-player works
✓ Room creation works
✓ Player joining works
✓ Reconnection works
✓ Leaderboard works
✓ Final ceremony works
✓ No critical console errors
✓ No broken interactions
✓ No infinite loading
✓ No duplicate submissions
✓ No double scoring
✓ No impossible game states

--------------------------------------------------
PHASE 39 — SELF-AUDIT
--------------------------------------------------

Now play the entire platform as a real user.

Do NOT inspect only the code.

Actually walk through:

HOME
→ START TEAM GAME
→ SELECT GAMES
→ INVITE
→ LOBBY
→ READY
→ COUNTDOWN
→ GAME
→ ANSWER
→ RESULT
→ LEADERBOARD
→ NEXT ROUND
→ NEXT GAME
→ FINAL RESULT
→ WINNER CEREMONY
→ REMATCH

Then repeat the process as:

- Host
- Player
- Late player
- Disconnected player
- Reconnected player
- Winner
- Losing player
- Tied player
- Single-player user

--------------------------------------------------
PHASE 40 — FIX EVERYTHING
--------------------------------------------------

IMPORTANT:

Do NOT only report bugs.

FIND → REPRODUCE → DIAGNOSE → FIX → RETEST.

For every issue discovered:

1. Identify root cause.
2. Fix root cause.
3. Re-run affected test.
4. Run regression tests.
5. Verify no new bug was introduced.

Do not hide errors.

Do not disable features simply because they are difficult.

Do not remove functionality to make tests pass.

--------------------------------------------------
FINAL REQUIREMENT
--------------------------------------------------

The goal is NOT:

"the UI looks correct."

The goal is:

"the complete multiplayer game platform behaves correctly under real-world usage."

The platform must be stable enough for real colleagues to use simultaneously.

After ALL testing and fixes are complete:

SAVE ALL CHANGES.

VERIFY THE APPLICATION ONE FINAL TIME.

THEN:

PUBLISH THE UPDATED APPLICATION.

IMPORTANT:

UPDATE THE PREVIOUSLY PUBLISHED VERSION.

DO NOT CREATE A NEW SEPARATE APP.

The final published version must contain ALL bug fixes and QA improvements.

FINAL ACTION:

PUBLISH AND UPDATE THE PREVIOUSLY PUBLISHED APPLICATION.