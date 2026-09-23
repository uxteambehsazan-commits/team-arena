### Multiplayer Game Flow – Requirements, Logic Fixes, and Full QA Testing

Please review and fix the multiplayer game flow based on the following requirements:

#### 1. Remove the Unnecessary Game Selection Screen After the Waiting Room

After all participants have joined the waiting room and the host starts the session, **the host must NOT be shown another “Select Game” screen**.

The host should have already selected the game(s) during the initial setup. Once the participants are ready, the system must automatically proceed according to the host's original game selection.

If the host selected multiple games, they must be played **sequentially, in the exact order selected by the host**.

Example:

* Host initially selects: Game 1 → Game 2 → Game 3
* Participants join the waiting room
* Host starts the session
* Game 1 starts automatically
* After Game 1 is completed, Game 2 starts
* After Game 2 is completed, Game 3 starts
* No additional game-selection screen should appear between the waiting room and the games.

#### 2. Correct the Tic-Tac-Toe Multiplayer Logic

Currently, in Tic-Tac-Toe, the host is being matched against an AI opponent.

This is incorrect for the multiplayer mode.

The host must play against the actual participants/guests in the room, not against AI.

The game logic should dynamically determine the appropriate opponents based on the number of participants.

AI should only be used if the game is explicitly configured as a single-player/AI mode. It must never replace a real participant in a multiplayer session when eligible human participants are available.

#### 3. Check the Number of Participants Before Selecting/Starting Games

Before starting the first game, the system must determine the actual number of participants who successfully joined the session.

Based on the participant count, the system should display only the games that are compatible with that number of players.

For example:

* If a game requires exactly 2 players, it should only be available when the session has 2 eligible players.
* If a game supports 2–4 players, it should be available when the participant count is within that range.
* If a game requires 4+ players, it should not be offered when fewer than 4 eligible participants are present.

The game-selection UI during the initial setup should therefore dynamically filter games based on the expected/allowed number of participants.

The system must also revalidate the actual participant count when the waiting room is finalized, because participants may join, leave, disconnect, or fail to complete the join process.

#### 4. Preserve the Host's Initial Game Selection

The initial game selection made by the host must be persisted as part of the session configuration.

Do not overwrite, reset, or replace this selection after participants enter the waiting room.

The session should maintain something equivalent to:

```text
Session
 ├── Host
 ├── Participants
 ├── Selected Games
 │    ├── Game A
 │    ├── Game B
 │    └── Game C
 └── Current Game Index
```

The game engine should use this configuration to control the entire game sequence.

#### 5. Multiplayer Role Assignment

For every multiplayer game:

* Host must be treated as a real player.
* Guests/participants must be treated as real players.
* Player slots must be assigned based on the actual participants in the session.
* AI must not occupy a player slot when an eligible human participant is available.
* The system must correctly handle player joining, leaving, disconnecting, and reconnecting.
* The game state must remain synchronized across all clients.

For Tic-Tac-Toe specifically, verify that:

```text
Host ↔ Guest
```

or, where supported:

```text
Host + Guest 1 + Guest 2 + ...
```

is used instead of:

```text
Host ↔ AI
```

#### 6. Handle Insufficient Participants

If the host selected a game that requires more players than actually joined:

* Do not silently replace missing players with AI.
* Do not start an invalid game session.
* Clearly inform the host which selected game cannot currently be started and why.
* Provide an appropriate flow, such as waiting for additional participants or skipping that game, depending on the product requirements.
* The remaining valid games should continue according to the host's original selection/order where applicable.

#### 7. Test All 16 Games End-to-End

All 16 games must be tested from **0 to 100**, not just individually at the gameplay level.

Testing must cover the complete user journey:

```text
Create Session
→ Host Selects Games
→ Determine Required Player Count
→ Participants Join
→ Waiting Room
→ Participant Count Validation
→ Session Start
→ First Selected Game
→ Gameplay
→ Game Completion
→ Next Selected Game
→ Gameplay
→ ...
→ Final Game
→ Session Completion
```

Each of the 16 games must be tested with multiple scenarios, including:

### Player Count Scenarios

* Minimum supported number of players
* Maximum supported number of players
* One player fewer than required
* One player more than the minimum
* Maximum capacity
* Zero participants
* Host only
* Host + one guest
* Host + multiple guests

### Session/Flow Scenarios

* Host creates a session
* Participants join successfully
* Participant joins late
* Participant leaves before the game starts
* Participant disconnects during the waiting room
* Participant disconnects during gameplay
* Participant reconnects
* Host starts the game
* Host attempts to start with insufficient players
* Host selects multiple games
* Multiple games execute in the correct order
* Game completion transitions correctly to the next game
* Final game transitions correctly to the session-completion state

### Multiplayer Integrity

For every multiplayer game, verify:

* Correct number of players
* Correct player identities
* Correct host/guest roles
* No unintended AI players
* Correct turn/order assignment
* Correct synchronization between clients
* Correct score/state synchronization
* Correct handling of player disconnects
* Correct winner/result calculation
* Correct transition to the next game

### UI/UX Validation

Verify that:

* No unnecessary game-selection screen appears after the waiting room.
* The host's original game selection is preserved.
* Only games compatible with the participant count are initially selectable.
* The current game is clearly displayed.
* Players can clearly see whose turn it is.
* Game transitions are clear.
* Error and insufficient-player states are understandable.
* No dead ends, duplicate screens, or unexpected redirects occur.

#### 8. Test Game Combinations

Do not test the 16 games only in isolation.

Also test combinations of games, for example:

```text
Game A → Game B
Game A → Game C → Game D
Game B → Game E → Game F
Game A → Game B → Game C → Game D → Game E
```

Verify that state from one game does not incorrectly leak into another game.

Pay particular attention to:

* Player identity persistence
* Scores
* Turn state
* Game configuration
* Selected game order
* Session state
* Participant list
* AI/player assignment
* Completion status

#### 9. Regression Testing

After implementing the fixes, perform a complete regression test across the entire multiplayer system.

The objective is to ensure that fixing the game-selection flow and Tic-Tac-Toe multiplayer logic does not break:

* Waiting rooms
* Session creation
* Participant joining
* Player assignment
* Game selection
* Game sequencing
* Game state synchronization
* Scoring
* Results
* Session completion
* Any of the other 16 games

#### 10. Final Acceptance Criteria

The implementation should only be considered complete when all of the following are true:

* The post-waiting-room game-selection screen has been removed.
* The host's initial game selection is persisted and respected.
* Selected games start automatically in the correct order.
* The actual participant count is validated before games begin.
* Only player-count-compatible games can be selected.
* Multiplayer games use real participants rather than AI.
* Tic-Tac-Toe correctly matches the host with guests/participants.
* Missing participants are handled explicitly rather than silently replaced with AI.
* All 16 games have been tested end-to-end.
* Each game has been tested with multiple player counts and failure/disconnect scenarios.
* Multiple game sequences have been tested.
* No cross-game state leakage exists.
* No broken transitions, dead ends, duplicate screens, or unexpected AI substitutions remain.
* The complete multiplayer flow works reliably from session creation through final session completion.

Please treat this as both an **implementation requirement and a comprehensive QA/regression-testing task**, rather than only a UI change.
