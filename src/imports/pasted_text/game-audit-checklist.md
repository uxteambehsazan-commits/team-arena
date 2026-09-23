============================================================
ULTIMATE GAME AUDIT
FULL-SPECTRUM 0→100 GAME QUALITY & HEALTH TEST
============================================================

IMPORTANT:

Do NOT perform a basic visual QA.

Perform a professional, production-grade, full-spectrum audit of the ENTIRE Team Arena product and EVERY GAME inside it.

The purpose is to determine whether the product is:

FAST
STABLE
FUNCTIONAL
FUN
BALANCED
COHERENT
SCALABLE
ACCESSIBLE
SECURE
PERFORMANT
RELIABLE
ENGAGING
AND PRODUCTION-READY.

Audit the product as if it is about to be released to thousands of real users.

Do not only inspect screens.

Inspect the underlying GAME SYSTEM, STATE, LOGIC, DATA FLOW, USER JOURNEY, INTERACTIONS and FAILURE MODES.

============================================================
01 — PRODUCT-WIDE AUDIT
============================================================

Audit the complete product from first entry to final game result.

Test:

Home
Games
Game discovery
Game selection
Game setup
Lobby
Waiting Room
Player joining
Player leaving
Ready states
Host
Non-host
Team formation
Role assignment
Game start
Gameplay
Round transition
Scoring
Results
Rematch
Next game
Exit
Back navigation
Profile
Leaderboard
Achievements
Feedback
Notifications
Admin
Version system
Release system
All shared components
All routes
All persistent states

Trace the complete journey:

ENTRY
→ DISCOVERY
→ SELECTION
→ LOBBY
→ JOIN
→ READY
→ START
→ GAMEPLAY
→ RESULT
→ REWARD
→ PROGRESSION
→ REMATCH
→ RETURN

No broken transition is acceptable.

============================================================
02 — GAME CORE HEALTH
============================================================

For EVERY GAME identify and test its core gameplay loop.

Document:

CORE LOOP

Input
→ Decision
→ Action
→ Feedback
→ Reward/Penalty
→ Progression
→ Next Decision

Verify that every game has a coherent loop.

Test:

- Is the objective immediately understandable?
- Is the player's role clear?
- Is the next action obvious?
- Does every action produce visible feedback?
- Are consequences clear?
- Is there meaningful decision-making?
- Is there a reason to continue?
- Is there a clear ending?
- Is there a meaningful reward?
- Can the player replay?

Detect:

- dead interactions
- meaningless actions
- redundant interactions
- loops with no outcome
- actions with delayed/no feedback
- states with no available action
- accidental infinite loops

============================================================
03 — GAME STATE MACHINE AUDIT
============================================================

Map the state machine of every game.

Expected examples:

IDLE
→ LOBBY
→ JOINING
→ READY
→ STARTING
→ PLAYING
→ ROUND_END
→ RESULTS
→ REMATCH
→ COMPLETE

Test every transition.

Test invalid transitions.

Examples:

Can a player:

- start before ready?
- join after game starts?
- submit twice?
- submit after timer expires?
- leave during countdown?
- refresh during gameplay?
- return after leaving?
- become HIDER twice incorrectly?
- receive another player's state?
- see the answer before reveal?

Prevent impossible states.

============================================================
04 — GAMEPLAY LOGIC INTEGRITY
============================================================

Verify:

- turn order
- player roles
- team assignment
- timers
- rounds
- questions
- clues
- answers
- guesses
- scoring
- penalties
- win conditions
- loss conditions
- tie conditions
- end conditions
- role rotation
- player elimination
- replay logic

Test boundary conditions.

Examples:

0 players
1 player
minimum players
minimum - 1
minimum + 1
maximum players
maximum + 1

Also test:

0 seconds
1 second
last second
timer expiration
simultaneous actions
rapid repeated actions

============================================================
05 — MULTIPLAYER INTEGRITY
============================================================

Test multiplayer synchronization.

Simulate:

Player A
Player B
Player C
Player D
Host

Verify:

- everyone sees correct players
- player state is synchronized
- team state is synchronized
- role state is synchronized
- scores are synchronized
- timers remain consistent
- game status remains consistent
- actions are not duplicated

Test:

JOIN
LEAVE
REJOIN
REFRESH
DISCONNECT
RECONNECT
LATE JOIN
HOST LEAVE
HOST RETURN

Ensure one player's action cannot incorrectly modify another player's state.

============================================================
06 — RACE CONDITION TEST
============================================================

Aggressively test simultaneous actions.

Examples:

Two players submit simultaneously.

Two players press Ready simultaneously.

Two players submit the final answer simultaneously.

Player submits exactly when timer reaches 0.

Host starts while another player joins.

Player leaves exactly when round ends.

Refresh exactly during transition.

Verify deterministic results.

No duplicate scoring.

No duplicate rewards.

No duplicate rounds.

No corrupted state.

============================================================
07 — TIMER HEALTH
============================================================

Timers are critical game infrastructure.

Test:

- timer initialization
- timer synchronization
- timer accuracy
- pause
- resume
- expiration
- background tab
- browser sleep
- refresh
- reconnect
- slow device
- slow network

The timer must NOT rely only on visual countdown.

Where appropriate, calculate authoritative remaining time from timestamps/state.

Prevent:

- negative timer
- timer reset
- timer duplication
- timer desynchronization
- infinite timer
- early timeout
- late timeout

============================================================
08 — GAME BALANCE AUDIT
============================================================

Evaluate whether the mechanics create unfair advantages.

Check:

- role balance
- team balance
- scoring balance
- penalty balance
- clue balance
- timer balance
- reward balance
- ability balance
- difficulty progression

Test whether one strategy dominates all others.

Identify:

- dominant strategies
- useless strategies
- overpowered abilities
- underpowered abilities
- excessive penalties
- trivial scoring
- impossible scoring
- runaway leaders

Do NOT randomly rebalance.

Only make changes when supported by the actual game rules/data.

============================================================
09 — DIFFICULTY CURVE
============================================================

Audit:

Beginner
→ Intermediate
→ Advanced
→ Expert

Verify:

- difficulty increases meaningfully
- new players can understand the game
- expert players still have meaningful decisions
- difficulty does not become random
- difficulty does not depend only on hidden information

Check:

CLUE DIFFICULTY
TIME PRESSURE
NUMBER OF OPTIONS
PENALTY
REWARD
DECISION COMPLEXITY

============================================================
10 — PLAYER PSYCHOLOGY / ENGAGEMENT
============================================================

Audit whether each game creates:

Curiosity
Anticipation
Decision
Tension
Feedback
Reward
Discovery
Mastery
Replay motivation

Check for:

- weak opening
- long waiting
- repetitive rounds
- meaningless rewards
- lack of anticipation
- unclear progression
- excessive friction

The game should create a clear emotional rhythm:

HOOK
→ DISCOVERY
→ TENSION
→ DECISION
→ REVEAL
→ REWARD
→ PROGRESSION

============================================================
11 — FUN / REPLAYABILITY AUDIT
============================================================

Test whether repeated play remains interesting.

Check:

- content repetition
- location repetition
- question repetition
- predictable outcomes
- repetitive animations
- repetitive rewards
- repetitive strategy

Use:

- history
- randomness where appropriate
- difficulty
- player mastery
- content rotation
- different game modes

Do not introduce randomness where it damages fairness.

============================================================
12 — GAMIFICATION AUDIT
============================================================

Audit:

XP
Levels
Achievements
Badges
Titles
Streaks
Progress bars
Collections
Atlas
Mastery
Leaderboards
Rewards
Unlocks
Personal records

Verify:

Every reward has a clear purpose.

Avoid:

- meaningless badges
- excessive currencies
- reward inflation
- impossible progression
- confusing progression
- rewards unrelated to gameplay

Test:

FIRST WIN
FIRST LOSS
LEVEL UP
ACHIEVEMENT
STREAK
STREAK BREAK
LOCATION DISCOVERY
MASTERED BUILDING
RARE DISCOVERY

============================================================
13 — REWARD ECONOMY
============================================================

Audit all reward calculations.

Verify:

XP cannot become negative unexpectedly.

Score cannot exceed intended limits.

Repeated submissions cannot duplicate rewards.

Refreshing cannot duplicate rewards.

Replaying cannot duplicate achievement rewards.

Users cannot repeatedly trigger:

LEVEL UP
ACHIEVEMENT
LOCATION COLLECTION
REWARD

without satisfying the actual condition.

============================================================
14 — LEADERBOARD INTEGRITY
============================================================

Audit:

ranking calculation
sorting
ties
score updates
win rate
streak
XP
ranking history

Test:

equal scores
new player
inactive player
reset
multiple updates
simultaneous updates

Ensure leaderboard values reflect real data.

Never display fabricated statistics.

============================================================
15 — PROGRESSION INTEGRITY
============================================================

Test:

XP
Level
Achievements
Atlas
Building mastery
Streak
Personal best

Test progression after:

win
loss
draw
abandoned match
disconnect
timeout
reconnect
rematch

Progress must not:

duplicate
disappear
rollback unexpectedly
increase without cause

============================================================
16 — CONTENT QUALITY AUDIT
============================================================

Audit every game content item.

Check:

- spelling
- Persian text
- instructions
- rules
- labels
- hints
- clues
- questions
- answers
- difficulty
- duplicates
- contradictions

For Behsazan Hunt specifically:

Cross-check every clue against verified building data.

No invented building fact.

No contradictory clue.

No clue that accidentally reveals the answer too early unless intended.

============================================================
17 — CLUE ENGINE AUDIT
============================================================

For Behsazan Hunt:

Test every clue path.

Verify:

Building
→ Floor
→ Unit
→ Location

Check:

- clue uniqueness
- clue difficulty
- clue ordering
- clue dependency
- clue duplication
- accidental answer reveal
- impossible combinations
- contradictory clues

Generate a clue dependency graph.

Every target location must have at least one valid solvable path.

============================================================
18 — ANSWER LEAK TEST
============================================================

Attempt to expose hidden information through:

UI
DOM
state
URL
query parameters
local storage
session storage
client state
debug output
component props
preloaded data

Searchers must not receive hidden answer data in visible UI or easily exposed client state when the architecture permits server-side protection.

At minimum:

HIDER ANSWER
must not accidentally render in SEARCHER UI.

============================================================
19 — UI / UX AUDIT
============================================================

Audit:

Visual hierarchy
Information hierarchy
Interaction hierarchy
Button priority
Navigation
Feedback
Affordance
Consistency
Readability

For every screen ask:

What should the player notice first?

What should they do next?

Can they understand this without explanation?

============================================================
20 — MICRO-INTERACTION AUDIT
============================================================

Every important action must provide feedback.

Examples:

Button press
Join
Ready
Unready
Start
Submit
Correct
Wrong
Clue received
Achievement
Reward
Exit
Error

Avoid:

silent actions
unclear actions
double-click problems
delayed feedback

============================================================
21 — PERFORMANCE AUDIT
============================================================

Measure/inspect:

Initial load
Time to interactive
Rendering
Interaction latency
Animation performance
Memory
Asset size
Network requests
Bundle size
Code splitting
Lazy loading

Target:

Fast first meaningful experience.

Avoid loading the entire product before showing useful content.

============================================================
22 — RENDER PERFORMANCE
============================================================

Inspect:

- unnecessary React renders
- expensive components
- repeated calculations
- large lists
- animation loops
- timers
- event listeners
- subscriptions

Look for:

memory leaks
orphaned timers
duplicate listeners
unmounted component updates

============================================================
23 — MEMORY / LONG SESSION TEST
============================================================

Run long-session scenarios.

Example:

Play 20+ rounds.

Navigate between:

Home
Games
Lobby
Game
Results
Profile
Admin

Check whether:

memory grows continuously
timers accumulate
listeners accumulate
duplicate subscriptions occur
performance degrades

============================================================
24 — NETWORK RESILIENCE
============================================================

Test:

Fast network
Slow network
Offline
Reconnect
Intermittent network
Request failure
Timeout
Server error

Every critical action must have:

loading
timeout handling
error
retry/recovery

Never leave the player with an infinite spinner.

============================================================
25 — OFFLINE / RECONNECT
============================================================

If offline:

Clearly communicate state.

When reconnecting:

restore valid state where supported.

Do not duplicate:

joins
scores
submissions
rewards

============================================================
26 — ERROR RECOVERY
============================================================

Intentionally trigger errors.

Test:

missing data
invalid data
network failure
expired session
invalid route
missing game
missing player
missing location
corrupted state

Every error must lead to:

Recovery
Retry
Back
Home

Never:

dead-end
blank page
infinite spinner

============================================================
27 — SECURITY AUDIT
============================================================

Check:

XSS
unsafe HTML
unsafe URL params
client-side trust
exposed secrets
admin authorization
sensitive storage
unsafe external resources

Never trust:

client score
client role
client reward
client permissions

Where backend exists, validate critical operations server-side.

============================================================
28 — DATA INTEGRITY
============================================================

Audit:

creation
update
delete
read
relationships
foreign references
duplicate records
missing records

Check:

User
Game
Match
Round
Team
Player
Role
Score
Location
Clue
Achievement
Feedback
Release

No orphan records.

No impossible relationships.

============================================================
29 — ADMIN INTEGRITY
============================================================

Admin actions must be tested.

Create
Edit
Publish
Unpublish
Archive
Delete

Check:

confirmation
permissions
validation
audit trail
error recovery

Admin changes must correctly propagate to player experience.

============================================================
30 — VERSION / RELEASE AUDIT
============================================================

Verify:

version number
release notes
release status
published version
previous version
What's New
lastSeenVersion

Test:

new user
existing user
already-seen release
multiple releases
rollback of content
archived release

Never show a release that was not actually published.

============================================================
31 — RESPONSIVE STRESS TEST
============================================================

Test:

small mobile
large mobile
tablet
laptop
desktop
large desktop

Check:

overflow
text wrapping
modal size
buttons
cards
tables
game board
timers
leaderboards

No horizontal overflow unless explicitly intended.

============================================================
32 — ACCESSIBILITY AUDIT
============================================================

Check:

keyboard navigation
focus
contrast
font readability
button labels
ARIA where appropriate
screen reader semantics
touch target size
reduced motion

Important gameplay information must not rely only on:

color
sound
animation

============================================================
33 — VISUAL REGRESSION
============================================================

Compare all games against the existing Team Arena visual system.

Detect:

inconsistent spacing
inconsistent buttons
different card styles
different typography
different status colors
different modal behavior
different loading patterns

Fix shared inconsistencies at the component level.

============================================================
34 — BROWSER / ENVIRONMENT TEST
============================================================

Verify behavior in:

Chrome
Edge
Safari where supported
Firefox where supported

Test:

desktop
mobile browser

Avoid browser-specific assumptions.

============================================================
35 — ROUTING / DEEP LINK TEST
============================================================

Open important routes directly.

Refresh each route.

Test:

deep links
back
forward
new tab
invalid route

No blank screen.

No incorrect state.

============================================================
36 — DATA PERSISTENCE TEST
============================================================

Test persistence after:

refresh
close/reopen
navigation
logout/login
reconnect

Verify:

profile
progress
achievements
Atlas
version seen state

Only persist data that should persist.

============================================================
37 — ABUSE / EDGE CASE TEST
============================================================

Try to break the game intentionally.

Examples:

Rapid click
Double click
Spam submit
Spam join
Spam leave
Back repeatedly
Refresh repeatedly
Open multiple tabs
Submit invalid values
Use expired state
Trigger actions after timeout

The system should remain stable.

============================================================
38 — GAME HEALTH SCORE
============================================================

For EVERY GAME calculate:

FUNCTIONAL CORE ............... 20
GAMEPLAY LOGIC ............... 15
GAME BALANCE ................. 10
UX / USABILITY ............... 10
ENGAGEMENT / REPLAY .......... 10
GAMIFICATION ................. 10
PERFORMANCE .................. 10
STABILITY / ERROR HANDLING ... 5
MULTIPLAYER INTEGRITY ........ 5
ACCESSIBILITY ................ 3
SECURITY / DATA INTEGRITY .... 2

TOTAL = 100

Do not inflate scores.

============================================================
39 — PRODUCT HEALTH SCORE
============================================================

Calculate a separate:

TEAM ARENA GLOBAL HEALTH SCORE

from:

All games
Shared systems
Navigation
Admin
Performance
Security
Data integrity
Gamification
Accessibility
Reliability

Report:

GLOBAL SCORE: XX / 100

Also report the category scores.

============================================================
40 — RELEASE BLOCKERS
============================================================

A production release MUST be blocked if any of these exist:

CRITICAL GAMEPLAY BUG
CRITICAL DATA CORRUPTION
CRITICAL SECURITY ISSUE
BROKEN CORE GAME LOOP
BROKEN MULTIPLAYER STATE
BROKEN SCORING
BROKEN TIMER
BROKEN ROLE ASSIGNMENT
ANSWER LEAK
UNRECOVERABLE ERROR
BROKEN PRIMARY ROUTE

Do not release while any blocker remains.

============================================================
41 — AUTOMATED FIX LOOP
============================================================

Use this exact cycle:

SCAN
↓
DETECT
↓
CLASSIFY
↓
REPRODUCE
↓
FIX
↓
RETEST
↓
REGRESSION TEST
↓
RESCORE

Repeat until stable.

Do not stop after finding the first issue.

============================================================
42 — REGRESSION TEST
============================================================

After every major fix:

Re-test:

- affected game
- related shared components
- other games using the same components
- navigation
- scoring
- state
- mobile
- desktop

A fix in one game must not silently break another game.

============================================================
43 — FINAL 0→100 GATE
============================================================

Do not consider the product complete simply because all screens exist.

The product must pass:

FUNCTIONALITY
+
GAMEPLAY
+
PERFORMANCE
+
STABILITY
+
MULTIPLAYER
+
GAMIFICATION
+
UX
+
ACCESSIBILITY
+
SECURITY
+
DATA INTEGRITY
+
CROSS-GAME CONSISTENCY
+
ADMIN
+
RELEASE SYSTEM

============================================================
44 — FINAL VERSIONING
============================================================

Only AFTER the complete audit and fixes:

Determine whether the changes require:

PATCH
MINOR
MAJOR

Apply Semantic Versioning.

Do NOT increase the version merely because the audit was performed.

Increase the version according to the actual scope of the released changes.

Update:

APP_VERSION
RELEASE_DATE
RELEASE_TITLE
RELEASE_SUMMARY
RELEASE_NOTES

============================================================
45 — FINAL QA REPORT
============================================================

Produce a final structured report:

--------------------------------
TEAM ARENA GLOBAL AUDIT
--------------------------------

Version:
Previous Version:

Global Health:
XX / 100

Games Audited:
X

Games Passed:
X

Games Requiring Improvement:
X

Critical Issues:
X

High Issues:
X

Medium Issues:
X

Low Issues:
X

--------------------------------
GAME SCORES
--------------------------------

Game A: XX / 100
Game B: XX / 100
Game C: XX / 100
Game D: XX / 100

--------------------------------
CORE HEALTH
--------------------------------

Game Logic:
XX / 100

Multiplayer:
XX / 100

Scoring:
XX / 100

Timer:
XX / 100

State Management:
XX / 100

--------------------------------
PERFORMANCE
--------------------------------

Initial Load:
PASS / ISSUE

Interaction:
PASS / ISSUE

Rendering:
PASS / ISSUE

Memory:
PASS / ISSUE

Network:
PASS / ISSUE

--------------------------------
GAMIFICATION
--------------------------------

Progression:
XX / 100

Achievements:
XX / 100

Rewards:
XX / 100

Leaderboard:
XX / 100

Replayability:
XX / 100

--------------------------------
UX
--------------------------------

Mobile:
PASS / ISSUE

Desktop:
PASS / ISSUE

Accessibility:
PASS / ISSUE

Navigation:
PASS / ISSUE

--------------------------------
SECURITY
--------------------------------

Authentication:
PASS / ISSUE

Authorization:
PASS / ISSUE

Data Integrity:
PASS / ISSUE

Answer Protection:
PASS / ISSUE

--------------------------------
RELEASE
--------------------------------

Release Ready:
YES / NO

New Version:
X.X.X

Release Notes:
...

Remaining Known Issues:
...

============================================================
46 — FINAL ABSOLUTE RULE
============================================================

Do NOT perform a superficial QA.

Do NOT only inspect screenshots.

Do NOT only check whether buttons exist.

Do NOT assume that because a screen looks correct, the game works correctly.

Think like:

GAME DESIGNER
+
QA ENGINEER
+
PERFORMANCE ENGINEER
+
PRODUCT DESIGNER
+
SECURITY REVIEWER
+
MULTIPLAYER SYSTEM TESTER
+
GAME ECONOMY DESIGNER
+
ACCESSIBILITY REVIEWER

Audit the SYSTEM, not just the UI.

The final objective is:

A GAME THAT LOOKS GOOD
+
A GAME THAT WORKS
+
A GAME THAT IS FAST
+
A GAME THAT IS STABLE
+
A GAME THAT IS FAIR
+
A GAME THAT IS FUN
+
A GAME THAT IS REPLAYABLE
+
A GAME THAT CAN SCALE
+
A GAME THAT DOES NOT BREAK UNDER REAL USER BEHAVIOR.

FINAL PIPELINE:

DISCOVER
→ TEST
→ BREAK
→ MEASURE
→ FIX
→ RETEST
→ REGRESSION TEST
→ SCORE
→ VERSION
→ RELEASE