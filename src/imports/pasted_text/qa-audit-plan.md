You are a Senior QA Engineer, Game Tester, Multiplayer QA Specialist, UX Tester, and Bug Fixer.

Your task is to perform a COMPLETE END-TO-END QA AUDIT of the existing multiplayer game platform and test ALL 16 GAMES currently implemented in the project.

IMPORTANT:
Do NOT redesign the product.
Do NOT change the existing visual identity, design system, layout language, colors, typography, navigation structure, or game concepts unless a change is strictly required to fix a functional bug or usability problem.

Your primary goal is:

1. Discover all 16 existing games from the current project.
2. Understand the actual rules and implementation of each game.
3. Test every game from start to finish.
4. Test normal scenarios AND edge cases.
5. Test multiplayer behavior.
6. Test private/hidden information.
7. Test turn management, timers, scoring, rounds and game endings.
8. Test navigation and state persistence.
9. Find every functional, visual, UX and logic bug.
10. Fix the bugs directly in the implementation whenever possible.
11. Re-test every fixed issue.
12. Perform a final regression test across all 16 games.

DO NOT assume that a game works simply because its UI appears correctly.
Every game must actually be played through its complete logical flow.

--------------------------------------------------
PHASE 1 — PROJECT DISCOVERY
--------------------------------------------------

First inspect the entire existing application.

Identify:

- All 16 games currently available
- Game names
- Game routes/screens
- Game modes
- Player count limits
- Turn-based or simultaneous gameplay
- Game setup flow
- Lobby flow
- Room creation
- Room joining
- Player invitation
- Game start conditions
- Roles
- Teams
- Scoring system
- Round system
- Timer system
- Victory conditions
- Defeat conditions
- Tie conditions
- Restart behavior
- Rematch behavior
- Exit behavior
- Private information
- Public information
- Host/admin capabilities
- Player capabilities

Do NOT invent missing rules.

Use the actual implementation, existing UI, game logic, data structures and current product behavior as the source of truth.

Create an internal test matrix containing all 16 games.

--------------------------------------------------
PHASE 2 — GLOBAL APPLICATION TEST
--------------------------------------------------

Before testing individual games, test the entire platform.

Test:

A. APP LAUNCH
- App loads correctly
- No blank screens
- No console/runtime errors
- No broken assets
- No missing components
- No unexpected loading states

B. HOME
- All 16 games appear correctly
- Game cards open the correct game
- Game descriptions match the actual game
- No wrong game routes
- No duplicated games
- No missing games

C. GAME SELECTION
Test:
- Select exactly 1 game
- Select multiple games
- Select the maximum allowed number
- Deselect a game
- Select → deselect → select again
- Navigate away and return
- Refresh during selection
- Attempt invalid combinations

Verify that the application never enters an inconsistent state.

D. GAME ORDER
If games can be reordered:
- Move first game to last
- Move last game to first
- Swap two games
- Reorder multiple games
- Start a session after reordering
- Verify actual gameplay follows the selected order

E. ROOM CREATION
Test:
- Create room
- Generate room code
- Generate invitation link
- Copy room code
- Join using code
- Join using link
- Invalid room code
- Expired/invalid room
- Multiple players joining
- Duplicate player attempts

F. LOBBY
Test:
- Host joins
- Second player joins
- Maximum number of players joins
- Player leaves
- Player rejoins
- Host leaves
- Host changes settings
- Player waits for host
- Game starts with minimum players
- Attempt to start with insufficient players
- Attempt to start with maximum players

Verify that every player's UI reflects the same actual room state.

--------------------------------------------------
PHASE 3 — TEST ALL 16 GAMES
--------------------------------------------------

For EACH of the 16 games, execute the following complete test protocol.

Do not skip a game.

For every game create the following test scenarios:

### TEST A — BASIC HAPPY PATH

1. Open the game.
2. Start a valid game.
3. Complete the setup.
4. Perform every available player action.
5. Complete at least one full round.
6. Complete the entire game.
7. Trigger the intended winning condition.
8. Verify the winner.
9. Verify score calculation.
10. Verify game-end screen.
11. Verify rematch.
12. Verify exit to game selection.

Expected result:
The game must be playable from start to finish without manual intervention or inconsistent state.

--------------------------------------------------
TEST B — MINIMUM PLAYER COUNT
--------------------------------------------------

Run the game using the minimum supported number of players.

Verify:

- Game can start
- Rules remain valid
- UI remains correct
- Turn order works
- Timer works
- Scoring works
- Winner calculation works
- No player remains stuck

--------------------------------------------------
TEST C — MAXIMUM PLAYER COUNT
--------------------------------------------------

Run the game using the maximum supported number of players.

Verify:

- Lobby
- Player list
- Avatars
- Turn order
- Cards/components
- Game board
- Scoreboard
- Timer
- Notifications
- End-game state

Check for:

- Overflow
- Clipping
- Overlapping UI
- Missing players
- Incorrect player indexing
- Incorrect score calculation
- Incorrect turn transitions

--------------------------------------------------
TEST D — TURN SYSTEM
--------------------------------------------------

For turn-based games test:

- Player 1 turn
- Player 2 turn
- Last player's turn
- Turn transition
- Rapid repeated clicks
- Clicking during another player's turn
- Attempting an invalid action
- Ending a turn
- Timer expiration
- Automatic turn transition
- Returning from background
- Reconnection during a turn

Expected result:
Only the correct player can perform the correct action at the correct time.

--------------------------------------------------
TEST E — TIMER
--------------------------------------------------

Test:

- Timer starts correctly
- Timer displays correct value
- Timer counts down correctly
- Timer reaches zero
- Automatic action at timeout
- Timer reset between turns
- Timer reset between rounds
- Timer does not continue after game ends
- Multiple clients show synchronized timer state

Also test:

- Very short timer
- Long timer
- Rapid start/stop transitions
- Player reconnect during timer

--------------------------------------------------
TEST F — SCORING
--------------------------------------------------

For each game identify every scoring rule.

Then deliberately test:

- Minimum score
- Maximum score
- Zero score
- Negative score if applicable
- Equal scores
- Tie-breaker
- Multiple scoring events simultaneously
- Score at round end
- Score at game end
- Repeated action that could accidentally award points twice

Verify that:

DISPLAYED SCORE == ACTUAL GAME STATE

Never allow:

- Double scoring
- Missing scoring
- Negative values when impossible
- Score reset at wrong time
- Wrong winner

--------------------------------------------------
TEST G — ROUND SYSTEM
--------------------------------------------------

If the game has rounds:

Test:

- Round 1
- Middle round
- Final round
- Round transition
- Score persistence
- Timer reset
- Player state reset
- Temporary state reset
- Persistent state preservation
- End-of-round notification

Verify that data belonging to the previous round does not incorrectly leak into the next round.

--------------------------------------------------
TEST H — PRIVATE INFORMATION
--------------------------------------------------

For games involving:

- Hidden cards
- Secret roles
- Spy
- Wink
- Private answers
- Hidden choices
- Individual clues
- Secret information

Test using multiple players.

Verify:

PLAYER A must NEVER see information belonging to PLAYER B unless the rules explicitly allow it.

Test:

- Switching players
- Refreshing
- Opening another screen
- Browser back
- Reconnecting
- Joining late
- Leaving and rejoining
- Multiple browser tabs

Pay special attention to hidden-role games.

--------------------------------------------------
TEST I — INVALID ACTIONS
--------------------------------------------------

Intentionally attempt invalid actions.

Examples:

- Click disabled buttons
- Submit empty input
- Submit too much text
- Submit too little text
- Click an option twice
- Click multiple options rapidly
- Submit after timer expires
- Submit after round ends
- Submit after game ends
- Perform another player's action
- Navigate backwards during critical state
- Refresh during submission

The application must gracefully reject invalid actions without crashing or corrupting the game state.

--------------------------------------------------
TEST J — RAPID USER ACTIONS
--------------------------------------------------

Stress every interactive element.

Rapidly:

- Click buttons
- Select/deselect cards
- Submit answers
- Start game
- End turn
- Change selections
- Navigate
- Open/close dialogs
- Join room
- Leave room
- Rematch

Look specifically for:

- Duplicate actions
- Double submissions
- Duplicate points
- Multiple API calls
- Race conditions
- Frozen UI
- Incorrect state
- Navigation bugs

--------------------------------------------------
TEST K — REFRESH / BACKGROUND / RECONNECT
--------------------------------------------------

At critical moments perform:

1. Browser refresh
2. Browser back
3. Browser forward
4. Close and reopen tab
5. Background application
6. Reconnect
7. Temporary network interruption

Test during:

- Lobby
- Game start
- Player turn
- Opponent turn
- Timer
- Answer submission
- Round transition
- Game end

Verify that the game either:

A. Restores the correct state

OR

B. Clearly informs the player and safely recovers.

Never leave the player in a corrupted or impossible state.

--------------------------------------------------
TEST L — PLAYER LEAVES
--------------------------------------------------

Test when:

- A normal player leaves
- Current player leaves
- Host leaves
- Player leaves during timer
- Player leaves during round transition
- Player leaves at game end
- Player reconnects
- Player rejoins

Verify that remaining players can continue whenever the rules allow it.

--------------------------------------------------
TEST M — SIMULTANEOUS ACTIONS
--------------------------------------------------

Use multiple players and intentionally perform actions at nearly the same time.

Examples:

- Two players submit simultaneously
- Two players select the same item
- Two players attempt the same action
- Player submits exactly as timer reaches zero
- Host starts game while player joins
- Player leaves while another submits

Look for race conditions and inconsistent game states.

--------------------------------------------------
TEST N — END GAME
--------------------------------------------------

For every game verify:

- Correct end condition
- Correct winner
- Correct ranking
- Correct scores
- Correct tie behavior
- Correct final statistics
- Correct UI
- No additional actions after game end
- Rematch works
- Exit works
- Starting another game works

Attempt to perform actions AFTER the game has ended.

No game state should change.

--------------------------------------------------
PHASE 4 — UI / UX QA
--------------------------------------------------

Test every game on:

- Mobile
- Tablet
- Desktop

Pay special attention to mobile.

Check:

- Header density
- Game title
- Player information
- Scoreboard
- Timer
- Buttons
- Cards
- Dialogs
- Modals
- Bottom navigation
- Game controls
- Text wrapping
- RTL Persian layout
- Touch targets
- Overflow
- Clipping
- Safe areas
- Long player names
- Long game names
- Large scores
- Maximum player count

No important information should overlap or become unreadable.

Do NOT redesign the UI.
Only fix actual usability or layout bugs while preserving the existing design system.

--------------------------------------------------
PHASE 5 — PERSIAN / RTL QA
--------------------------------------------------

Because this is a Persian application, specifically test:

- RTL direction
- Persian text alignment
- Persian numbers
- Mixed Persian/English text
- Long Persian text
- Buttons
- Counters
- Timers
- Player names
- Game names
- Dialogs
- Error messages
- Toast messages

Check for:

- Incorrect text direction
- Broken punctuation
- Incorrect icon direction
- Misaligned buttons
- Incorrect spacing
- Text overflow
- Broken wrapping

--------------------------------------------------
PHASE 6 — GAME-SPECIFIC LOGIC TESTING
--------------------------------------------------

For each of the 16 games, identify its unique mechanics.

Do NOT use the same generic test only.

Create game-specific scenarios for:

- Rules
- Roles
- Cards
- Questions
- Answers
- Clues
- Teams
- Voting
- Bluffing
- Hidden information
- Randomization
- Scoring
- Timers
- Win conditions

For example, if a game contains a hidden role:

TEST:
- Correct role assignment
- Exactly correct number of special roles
- Role privacy
- Role persistence
- Role visibility
- Role behavior
- End-game role reveal

If a game contains cards:

TEST:
- Correct card distribution
- No duplicate cards unless allowed
- Deck depletion
- Empty deck
- Discard pile
- Card selection
- Invalid card selection
- Card effects
- Multiple effects
- Final card

If a game contains voting:

TEST:
- Everyone votes
- One player does not vote
- Duplicate vote attempt
- Vote change if allowed
- Vote timeout
- Tie
- Majority
- No majority
- Final result

If a game contains teams:

TEST:
- Correct team assignment
- Equal/allowed team sizes
- Team score
- Team turn
- Player leaving
- Team with missing player
- Team victory

Adapt the tests to the actual mechanics of EACH game.

--------------------------------------------------
PHASE 7 — BUG HUNTING
--------------------------------------------------

Actively try to break the application.

Use exploratory testing.

Try:

- Rapid clicks
- Back/forward navigation
- Refreshing
- Multiple tabs
- Invalid input
- Empty input
- Maximum input
- Minimum input
- Repeated submissions
- Joining twice
- Leaving and rejoining
- Disconnecting
- Reconnecting
- Starting twice
- Ending twice
- Rematching repeatedly
- Switching games rapidly

Look for:

CRITICAL:
- Crash
- Data corruption
- Game cannot start
- Game cannot finish
- Incorrect winner
- Security/privacy leak
- Hidden information leak
- Permanent stuck state

HIGH:
- Incorrect scoring
- Incorrect turn
- Broken multiplayer synchronization
- Broken timer
- Lost game state
- Player cannot reconnect
- Player cannot continue

MEDIUM:
- UI state inconsistency
- Incorrect validation
- Navigation problem
- Incorrect feedback

LOW:
- Visual defects
- Minor spacing
- Typography problems
- Non-critical animation issues

--------------------------------------------------
PHASE 8 — FIX BUGS
--------------------------------------------------

Do not only report bugs.

For every reproducible bug:

1. Identify the root cause.
2. Fix the implementation.
3. Re-run the exact scenario.
4. Verify the bug no longer occurs.
5. Run related regression tests.
6. Verify that the fix did not break another game.

Do NOT create superficial fixes that only hide the visible symptom.

Fix the underlying state, logic, validation, synchronization or UI problem.

--------------------------------------------------
PHASE 9 — REGRESSION TEST
--------------------------------------------------

After fixing bugs, test ALL 16 games again.

At minimum run:

- Launch
- Game selection
- Room creation
- Lobby
- Game start
- One complete round
- Complete game
- Score
- Winner
- Rematch
- Exit
- Re-enter another game

For every game.

Do not assume a bug fix is isolated.

--------------------------------------------------
PHASE 10 — FINAL QA REPORT
--------------------------------------------------

At the end provide a structured report.

TABLE:

| # | Game | Status | Critical Bugs | High Bugs | Medium Bugs | Fixed | Remaining |
|---|------|--------|---------------|-----------|-------------|-------|-----------|

Then provide:

### 1. GLOBAL BUGS
List platform-wide issues.

### 2. GAME-SPECIFIC BUGS
List issues for each of the 16 games.

For each bug:

- Bug ID
- Game
- Scenario
- Steps to reproduce
- Expected behavior
- Actual behavior
- Severity
- Root cause
- Fix applied
- Regression test result

### 3. MULTIPLAYER QA
Report:

- Synchronization issues
- Turn issues
- Timer issues
- Reconnection issues
- Player leave issues
- Race conditions
- Hidden-information issues

### 4. UI/UX QA
Report:

- Mobile issues
- Desktop issues
- RTL issues
- Overflow
- Touch targets
- Readability
- Navigation

### 5. FINAL STATUS

Clearly state:

- Number of games tested: 16
- Number of scenarios executed
- Number of bugs found
- Number of bugs fixed
- Number of bugs remaining
- Any blocked tests
- Any unresolved critical/high issues

IMPORTANT:
Do not claim that a test passed unless you actually executed it.

Do not mark a game as "PASS" simply because the screen loads.

A game is considered functionally passed only when its complete gameplay flow, multiplayer state, scoring, turn system, timer where applicable, end condition and rematch/exit behavior have been successfully tested.

FINAL REQUIREMENT:

Do not stop after finding the first bug.

Continue testing ALL 16 games.

Do not stop after fixing the first bug.

After every fix, perform regression testing.

The objective is not merely to identify bugs.

The objective is to leave the existing 16-game platform in a stable, playable, consistent and production-ready state while preserving the existing product design and game concepts.