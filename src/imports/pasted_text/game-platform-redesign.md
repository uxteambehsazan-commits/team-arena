MASTER PROMPT — COMPLETE GAME PLATFORM REDESIGN, REPLACEMENT, TESTING & BUG FIXING

You are working on an existing multiplayer organizational gaming platform.

IMPORTANT:
Do NOT treat this as a simple UI redesign.
The objective is to completely redesign and replace the existing game experience, game rules, game engine behavior, scoring logic, round management, winner/loser detection, multiplayer flow, and result handling while preserving the existing visual identity where explicitly required below.

==================================================
1. CORE OBJECTIVE
==================================================

Completely replace the current game implementations with a professional, reliable, highly engaging multiplayer organizational game platform.

The new experience must feel like a premium corporate game show:
- modern
- energetic
- polished
- highly interactive
- fast
- social
- competitive
- visually exciting
- easy to understand
- reliable in multiplayer situations

Do NOT simply modify the current games.
Rebuild their game logic and interaction flow according to this specification.

The final result must be production-quality.

==================================================
2. STRICT PRESERVATION RULES
==================================================

The following existing elements MUST NOT be redesigned, replaced, removed, recolored, or structurally changed unless absolutely necessary for functionality:

A) The existing "Game Producers / تهیه‌کنندگان بازی" page
B) Existing producer information and producer presentation
C) Existing avatar images
D) Existing avatar artwork/design
E) Existing main/home page visual identity and layout
F) Existing brand identity and overall visual language

Do not replace the existing avatar images with generated avatars.

Do not redesign the producer page.

Do not change the main page structure.

The main page should remain recognizable as the current product.

Only enhance the background of the main page with a premium animated visual layer as described below.

==================================================
3. MAIN PAGE BACKGROUND ANIMATION
==================================================

Keep the existing main page completely recognizable.

Add a high-quality animated background layer behind the existing content.

The animation should feel:
- premium
- sophisticated
- cinematic
- modern
- technology-oriented
- related to gaming and collaboration
- appropriate for an enterprise environment

Avoid childish game graphics.

Avoid excessive neon.

Avoid distracting particles.

The background animation should be subtle enough that all existing UI elements remain readable.

Suggested visual language:

- abstract floating geometric game elements
- subtle glowing lines
- interconnected nodes
- slowly moving particles
- soft depth/parallax
- abstract game-board patterns
- subtle cards/shapes moving in depth
- elegant light trails
- very soft ambient motion

Animation must:
- run smoothly
- not affect interaction
- not reduce readability
- not cause layout shifts
- respect prefers-reduced-motion
- be performant on desktop and mobile

The animation must stay BEHIND the existing home-page content.

Do not cover existing buttons or text.

==================================================
4. NEW GAME SYSTEM
==================================================

Create a centralized multiplayer Game Engine.

Do not implement game rules independently inside each screen.

The Game Engine must control:

- Room
- Players
- Player status
- Selected games
- Game order
- Current game
- Current round
- Timer
- Turn
- Player actions
- Answers
- Answer validation
- Score
- Ranking
- Winner
- Tie
- Timeout
- Game completion
- Player elimination
- Disconnect
- Reconnect
- Next round
- Next game
- Final leaderboard

Use an explicit state machine.

Required general state flow:

LOBBY
→ GAME_CONFIGURATION
→ PLAYERS_READY
→ GAME_INTRO
→ COUNTDOWN
→ ROUND_ACTIVE
→ PLAYER_ACTION
→ ROUND_LOCKED
→ CALCULATE_RESULT
→ SHOW_ROUND_RESULT
→ UPDATE_LEADERBOARD
→ NEXT_ROUND
→ GAME_RESULT
→ NEXT_GAME
→ FINAL_RESULT
→ WINNER_CEREMONY

No game should bypass result calculation.

No game should determine the winner using UI-only state.

==================================================
5. ROOM CREATOR / GAME PRODUCER
==================================================

The room creator must be able to decide exactly which games are active in the room.

Add a professional "Game Selection" experience.

Example:

SELECT GAMES FOR THIS ROOM

☑ 🎯 Guess the Image
☑ 🔤 Name & Family
☑ 🕵️ Hide & Seek
☑ 🚫 Forbidden Word
☑ 🎯 Territory Tic-Tac-Toe
☑ 💡 One Word, Multiple Clues
☑ 👁️ Wink
☑ 🕵️ Spy

The creator must be able to:

- enable/disable games
- reorder selected games
- configure each game's settings
- remove a selected game
- add another game
- choose number of rounds
- configure game duration
- configure player count where applicable
- configure scoring where applicable
- choose Random mode
- choose Tournament mode
- choose Quick Play mode

Game order must be respected by the engine.

==================================================
6. INVITE FRIENDS
==================================================

Add a prominent "Invite Friends / دعوت دوستان" feature.

The room creator must be able to invite other players.

Support:

- room code
- copy room code
- share invitation link
- copy invitation link
- invite colleagues/friends if the existing application supports user selection

Invitation experience:

"رضا شما را به یک بازی دعوت کرده است"

Show:
- game/session name
- number of players
- room code
- selected game(s)

CTA:

"پیوستن به بازی"

Joining through the invitation must bring the player into the correct room.

Prevent duplicate player entries.

Prevent invalid room joining.

Handle full rooms gracefully.

==================================================
7. GAME 1 — GUESS THE IMAGE
==================================================

Persian name:
"حدس بزن — تصویر مخفی"

Players:
2–8

Concept:
A blurred image progressively becomes clearer.

Players can submit a guess at any time.

Scoring:
The earlier a player gives a correct answer, the higher the score.

Required behavior:
- image starts heavily blurred
- blur decreases gradually
- timer is visible
- answer input/action is always clear
- first valid correct answer is determined by authoritative game ordering
- incorrect answers must be handled consistently
- timeout ends the round
- no answer means zero score
- result clearly identifies winners

Animations:
- blur transition
- reveal animation
- correct answer celebration
- score movement toward leaderboard

==================================================
8. GAME 2 — NAME & FAMILY
==================================================

Persian:
"اسم‌فامیل سرعتی"

Players:
2–8

System generates:
- letter
- categories

Example categories:
Name
Family
City
Food
Animal
Job
Movie
Object

Creator can enable/disable categories.

Players receive a fixed amount of time.

Answers must be validated.

Scoring must be deterministic.

Handle:
- empty answer
- duplicate answer
- invalid answer
- timeout
- same answer between players
- simultaneous submission
- round completion

Provide clear scoring explanation.

==================================================
9. GAME 3 — HIDE & SEEK
==================================================

Persian:
"قایم‌باشک"

Players:
3–8

One player secretly chooses a location/option.

Other players attempt to identify the hidden position.

Use progressive clues and/or narrowing choices.

The hidden player must not accidentally expose their selection.

Guessing players receive score based on:
- correctness
- speed
- number of attempts

The system must clearly determine:
- successful guessers
- hidden player outcome
- round winner
- scores

==================================================
10. GAME 4 — FORBIDDEN WORD
==================================================

Persian:
"کلمه ممنوعه"

Players:
4–8

One player/team receives a target word and forbidden words.

They must explain the target without using forbidden words.

Timer is visible.

System must detect/handle:
- target word
- forbidden words
- successful answer
- failed attempt
- timeout

Provide strong visual feedback.

==================================================
11. GAME 5 — TERRITORY TIC-TAC-TOE
==================================================

Persian:
"دوز — نبرد قلمرو"

Create a multiplayer strategic board game inspired by Tic-Tac-Toe.

Do NOT make it a basic two-player traditional Tic-Tac-Toe.

Support up to 8 players.

Use a larger board.

Players have unique symbols/identities.

Core objective:
claim territory and create required patterns.

Possible mechanics:
- 4-in-a-row
- territory capture
- special cells
- bonus cells
- defensive moves

Every move must be validated by the engine.

No invalid move may be accepted.

Clearly display:
- current player
- available moves
- claimed cells
- score
- remaining time
- round state

At the end:
- calculate ranking
- show winner
- show score changes

==================================================
12. GAME 6 — ONE WORD, MULTIPLE CLUES
==================================================

Persian:
"یک کلمه، چند سرنخ"

Players:
2–8

One hidden answer.

Clues appear progressively.

Example scoring:

Clue 1 → 100 points
Clue 2 → 80 points
Clue 3 → 60 points
Clue 4 → 40 points

Correct earlier guess = higher score.

Incorrect guess behavior must be explicitly handled.

==================================================
13. GAME 7 — WINK
==================================================

Persian:
"چشمک"

Players:
EXACTLY 8

Roles:
- 1 hidden Wink player
- 7 normal players

The hidden Wink player secretly selects other players.

A selected player receives a private visual indication.

Other players must not know who performed the action.

Players can accuse another player.

Accusation system must include:
- confirmation
- limited mistakes
- clear result
- consequences

The Wink player wins if they successfully eliminate/mark enough players without being identified.

Normal players win if they identify the Wink player according to the configured rules.

The private nature of the role must be preserved.

Do NOT rely on camera-based eye detection.

Use UI actions only.

==================================================
14. GAME 8 — SPY
==================================================

Persian:
"جاسوس"

Players:
6–8

Roles:
- 1 Spy
- remaining players know the secret topic

The Spy does NOT know the secret topic.

Example topic:
"بانک"

Players ask questions or provide clues without making the topic obvious.

Each player participates in a controlled turn.

Then voting begins.

Every player votes for one suspected Spy.

If the Spy is correctly identified:
the Spy receives one final opportunity to guess the secret topic.

If the Spy correctly guesses the topic:
the Spy can still win.

If the Spy is not identified:
Spy wins.

All role information must remain private.

Do not reveal the Spy accidentally through UI state.

==================================================
15. FINAL / SPEED GAME
==================================================

Create one additional fast competitive game for the final round.

It should emphasize:
- speed
- reaction
- accuracy
- rapid decision making

Keep rules extremely simple.

The final game should feel exciting and suitable for a final championship round.

==================================================
16. GAME SETTINGS
==================================================

Each game should expose only relevant settings.

Do not overwhelm the creator.

Use progressive configuration.

Global settings:

- selected games
- game order
- total session mode
- number of rounds
- player limit
- scoring mode
- sound on/off
- animation on/off

Game-specific settings should appear only when that game is selected.

==================================================
17. TOURNAMENT SYSTEM
==================================================

Support a complete Tournament mode.

Example:

Game 1 → scores
Game 2 → scores
Game 3 → scores
Game 4 → scores

All scores accumulate.

At the end show:

FINAL LEADERBOARD

🥇 1st
🥈 2nd
🥉 3rd
4th
5th
6th
7th
8th

Also show achievements such as:

FASTEST ANSWER
MOST CORRECT
BEST STREAK
BEST COMEBACK
PERFECT ROUND

Do not make all recognition dependent only on final ranking.

==================================================
18. RESULT EXPERIENCE
==================================================

Results must be one of the strongest visual moments.

Every round should show:

- round winner
- player ranking
- score gained
- score lost if applicable
- correct answer
- reason for result

Use premium animations.

Example:

+250

animated from the game action toward the player's score.

Ranking changes should animate smoothly.

==================================================
19. WINNER CEREMONY
==================================================

At the end of the complete session:

Create a premium Winner Ceremony.

Do not make it childish.

Use:
- cinematic reveal
- subtle particles
- elegant celebration
- score count-up
- ranking animation
- winner spotlight
- player avatar
- achievement badges

Show:

🏆 CHAMPION

[Player Avatar]

Player Name

Total Score

Then show the full leaderboard.

Provide:

"Play Again"

"Back to Lobby"

"Change Games"

==================================================
20. ANIMATION SYSTEM
==================================================

Create a consistent animation system across the entire application.

Animations must feel premium.

Use motion intentionally.

Required animation moments:

- player joins room
- player leaves room
- ready status
- game selected
- game starts
- countdown
- timer warning
- correct answer
- wrong answer
- score gained
- score lost
- rank change
- round winner
- next round
- game winner
- final champion
- invitation sent
- player joined through invitation

Avoid excessive animation.

Animations must never interfere with usability.

Respect:
prefers-reduced-motion

==================================================
21. SOUND DESIGN
==================================================

If the current project architecture supports sound:

Add optional sound feedback.

Sounds should be:
- premium
- subtle
- modern
- not childish

Examples:
countdown
game start
correct
wrong
timer warning
winner
achievement

Provide global mute/unmute.

Never force sound.

==================================================
22. MULTIPLAYER RELIABILITY
==================================================

This is critical.

Test and handle:

1. two players submitting simultaneously
2. duplicate answer
3. player disconnects
4. player reconnects
5. player leaves during a round
6. player joins late
7. timer reaches zero
8. player submits at exactly timeout
9. invalid answer
10. empty answer
11. duplicate player
12. full room
13. host leaves
14. host reconnects
15. game starts with insufficient players
16. player refreshes page
17. network delay
18. stale UI state
19. race conditions
20. tied scores
21. tied answers
22. repeated round
23. next game transition
24. final result calculation

Never allow client-side UI state alone to determine an authoritative winner.

==================================================
23. DETERMINISTIC SCORING
==================================================

Create centralized scoring logic.

Every scoring event must be traceable.

Example:

PLAYER
ACTION
→ VALIDATION
→ SCORE EVENT
→ SCORE UPDATE
→ LEADERBOARD UPDATE

Do not calculate the same score independently in multiple components.

Avoid duplicated scoring logic.

==================================================
24. EDGE CASE TESTING
==================================================

After implementation, actively test every game.

Do not stop after checking the happy path.

For each game test:

A) normal play
B) wrong answer
C) timeout
D) simultaneous actions
E) player leaves
F) player reconnects
G) duplicate action
H) invalid action
I) final second action
J) tie
K) replay
L) next round
M) next game
N) final result

If a bug is discovered:
DO NOT merely hide the bug in the UI.

Find and fix the underlying logic.

==================================================
25. SELF-AUDIT BEFORE DELIVERY
==================================================

Before considering the task complete, perform a full internal audit.

Check:

- Are all buttons functional?
- Can every selected game actually start?
- Can every round finish?
- Can every game calculate a winner?
- Can every game calculate scores?
- Can users proceed to the next round?
- Can users proceed to the next game?
- Does Tournament score accumulate correctly?
- Does final ranking match accumulated scores?
- Can the creator change selected games?
- Does game order work?
- Does invitation work?
- Can players join correctly?
- Are private roles truly private?
- Are there impossible states?
- Are there dead-end screens?
- Are there loading states?
- Are there empty states?
- Are there error states?
- Does refresh/reconnect break the game?
- Does the UI remain responsive?

Fix all discovered issues before completion.

==================================================
26. UI / UX QUALITY
==================================================

The platform should feel like a professional product.

Use:
- clear hierarchy
- strong typography
- RTL support
- Persian-friendly UI
- clear CTAs
- large touch targets
- responsive layouts
- smooth transitions
- clear timer
- clear player state
- clear scoring
- clear result states

Do not clutter screens.

Do not use unnecessary cards everywhere.

Do not make every screen visually identical.

Each game should have its own visual identity while remaining part of one unified product.

==================================================
27. PERSIAN / RTL
==================================================

The entire experience must support Persian RTL correctly.

Check:
- alignment
- numbers
- timers
- score display
- player names
- buttons
- animations
- ranking
- text direction
- mixed Persian/English content

Avoid broken punctuation and awkward RTL/LTR combinations.

==================================================
28. PERFORMANCE
==================================================

Animations must be optimized.

Avoid:
- unnecessary re-renders
- heavy continuous animations
- duplicated timers
- memory leaks
- orphaned event listeners
- timers that continue after leaving a game
- animation loops that continue after unmount
- duplicated subscriptions

Clean up:
- timers
- subscriptions
- listeners
- animation frames

when leaving a screen or game.

==================================================
29. DO NOT BREAK EXISTING PRODUCT
==================================================

Preserve all existing functionality that is unrelated to the game redesign.

Do not unnecessarily rewrite:
- producer page
- existing avatars
- main page structure
- existing branding
- unrelated components

Only change what is necessary to implement the new gaming experience.

==================================================
30. FINAL IMPLEMENTATION REQUIREMENT
==================================================

Do not present this as a conceptual prototype.

Implement the actual working experience inside the existing project.

Replace the old game logic with the new system.

Make all games playable.

Make all transitions functional.

Make multiplayer behavior deterministic.

Make the creator able to select and configure games.

Make invitation functional within the existing architecture.

Make results and leaderboard reliable.

Make animations polished.

Make the main page background animated without changing the existing main-page design.

==================================================
31. FINAL QA
==================================================

After implementation:

1. Inspect all modified components.
2. Identify logical inconsistencies.
3. Identify dead code related to replaced games.
4. Identify duplicated state management.
5. Identify duplicated scoring logic.
6. Identify timer conflicts.
7. Identify race conditions.
8. Identify UI states that can become unreachable.
9. Test every game from Lobby → Start → Round → Result → Next Round → Final Result.
10. Test the Creator flow.
11. Test invitation flow.
12. Test multiplayer edge cases.
13. Fix all issues found.
14. Perform a second verification pass.

Do not claim the implementation is complete if any selected game cannot reliably finish from start to result.

FINAL GOAL:

The result should feel like a premium multiplayer organizational gaming platform, not a collection of disconnected mini-games.

Preserve the existing producer page, avatar artwork, and main-page identity exactly as requested.

Upgrade only the main-page background with a sophisticated animated layer.

Replace the current game experience with the new game system.

Prioritize:
RELIABILITY
→ GAMEPLAY
→ CLARITY
→ ENGAGEMENT
→ ANIMATION
→ VISUAL POLISH