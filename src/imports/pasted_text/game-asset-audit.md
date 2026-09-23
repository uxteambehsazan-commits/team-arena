## Game Image Asset Audit, Mapping, and 16-Game Consistency Validation

Please perform a **complete asset audit and implementation review** for all 16 games in the application.

The primary goal is to ensure that the correct game images are used **everywhere they are supposed to be used**, that no incorrect or unrelated images appear anywhere, and that every game's visual identity matches its actual name, rules, and gameplay concept.

---

### 1. Behsazan Games Tab – Authoritative Image Set

The **Behsazan Games tab has exactly 8 approved game images**.

These 8 images are the **only authoritative images** that may be used for the corresponding Behsazan games.

Treat these 8 images as the official source of truth.

#### Critical requirement:

For every Behsazan game:

* Find every place where the game image is displayed.
* Verify that the image is exactly the approved image assigned to that game.
* Verify that no alternative image, placeholder, duplicate, old asset, generated image, unrelated image, or image from another game is being used.
* Check all references, imports, components, routes, cards, game menus, game headers, waiting-room elements, result screens, and other UI locations.
* Check both direct image references and dynamically generated asset references.
* Check desktop and mobile/responsive layouts where applicable.

The approved 8 images must be consistently used wherever those Behsazan games are represented.

**Do not replace, redesign, regenerate, recolor, crop into a different asset, or otherwise alter the approved images unless the existing implementation technically requires a non-destructive display transformation such as responsive scaling.**

---

### 2. Do NOT Change the General Games Tab Images

The images belonging to the **General Games tab are already correct**.

Do NOT modify them.

Do NOT replace them with Behsazan images.

Do NOT normalize them to the Behsazan image set.

Do NOT redesign or regenerate them.

The General Games tab should remain visually and functionally unchanged unless a specific implementation bug causes the wrong asset to appear.

The objective is:

```text
BEHSAZAN GAMES
→ Use ONLY the 8 approved Behsazan images

GENERAL GAMES
→ Keep the existing correct images exactly as they are
```

There must be no cross-contamination between the two image sets.

---

### 3. Build a Complete Game → Image Mapping

Before making changes, inspect the project and create an internal mapping of all 16 games.

The mapping must contain at least:

```text
Game ID
Game Name
Game Category / Tab
Expected Image
Actual Image Reference
Image File / Asset Path
All UI Locations Using the Image
Player Count
Game Type
Game Concept / Gameplay Nature
Validation Status
```

Example:

```text
Game ID: game_01
Name: <actual game name>
Category: Behsazan
Expected Asset: <approved image>
Actual Asset: <detected asset>
Player Count: 2-4
Game Type: Multiplayer
Concept: <verified game concept>
Status: PASS / FAIL
```

Do not rely only on filenames.

Verify the actual imported asset and its usage in the application.

---

### 4. Verify Every Image Reference in the Entire Codebase

Search the complete codebase for:

* Image imports
* Asset paths
* `<img>` elements
* Image components
* Background images
* CSS background-image references
* Game card images
* Game thumbnails
* Hero images
* Modal images
* Waiting-room images
* Game headers
* Result/summary screens
* Dynamic image mappings
* Configuration objects
* JSON game definitions
* Database/game metadata
* Asset registries
* Static file references
* CDN references
* Generated asset URLs
* Fallback images
* Default/placeholder images

Do not assume that the visible game-selection screen is the only place where game images are used.

Trace every reference back to its source asset.

---

### 5. Detect and Eliminate Wrong Image References

Identify any situation where:

```text
Game A → Image B
```

instead of:

```text
Game A → Image A
```

Also detect:

* Old image assets still referenced by code
* Duplicate assets
* Incorrect fallback images
* Generic placeholder images
* Images copied from another game
* Images from the General Games tab appearing in Behsazan
* Behsazan images appearing in General Games
* Wrong images after navigation
* Wrong images after refresh
* Wrong images after session creation
* Wrong images after entering the waiting room
* Wrong images during gameplay
* Wrong images after transitioning to another game
* Wrong images after completing a game
* Wrong images caused by stale cache
* Wrong images caused by an incorrect game ID
* Wrong images caused by an incorrect game-name mapping

---

### 6. Verify the Name of Every One of the 16 Games

For all 16 games, verify that:

**Game ID → Game Name → Image → Game Logic → Game Concept**

are all consistent.

The game name must correctly represent the actual game implemented.

Do not assume that a filename or existing label is correct.

Inspect the actual game implementation and determine:

* What the game actually does
* What the player is expected to do
* What the core mechanics are
* What type of game it is
* How many players it supports
* Whether it is turn-based, real-time, quiz-based, puzzle-based, strategy-based, etc.
* What the objective of the game is

Then compare this against:

* Game name
* Game description
* Game icon/image
* Game metadata
* Game configuration
* UI labels
* Player instructions

---

### 7. Validate Game Name vs. Game Nature

For every game, perform a semantic consistency check:

```text
Game Name
      ↓
Game Description
      ↓
Game Image
      ↓
Actual Game Mechanics
      ↓
Player Interaction
```

All five must describe the same game.

If a game is named one thing but its implementation behaves like another game, flag it as a **CRITICAL mismatch**.

Examples of problems to detect:

```text
Name says "Chess"
but implementation is a quiz

Name says "Tic-Tac-Toe"
but implementation is Host vs AI when multiplayer is expected

Name says "Memory"
but implementation has no memory/matching mechanic

Image represents Game A
but the game implementation is actually Game B
```

Do not rename a game merely because of assumptions.

Only change the name when the implementation/design clearly demonstrates that the existing name is incorrect and the intended product definition can be verified.

---

### 8. Validate Image Semantics

For each of the 16 games, verify that the assigned image visually represents the correct game.

The image should correspond to the game's actual identity and concept.

Check:

* Subject matter
* Game type
* Visual elements
* Characters/objects
* Main gameplay concept
* Visual relationship to the game name

Do not substitute an image simply because it looks visually similar.

The authoritative asset mapping must always take priority.

---

### 9. Verify All 16 Games

Perform this audit individually for:

```text
Game 01
Game 02
Game 03
Game 04
Game 05
Game 06
Game 07
Game 08
Game 09
Game 10
Game 11
Game 12
Game 13
Game 14
Game 15
Game 16
```

For each game verify:

* Correct name
* Correct ID
* Correct category/tab
* Correct image
* Correct image everywhere
* Correct player count
* Correct game type
* Correct game mechanics
* Correct description
* Correct instructions
* Correct multiplayer behavior
* Correct relationship between image and gameplay
* Correct navigation
* Correct game-selection behavior
* Correct transition into the game
* Correct transition out of the game

---

### 10. Check Dynamic Game Configuration

Pay special attention to game configuration structures such as:

```javascript
games[]
gameConfig
gameRegistry
gameMetadata
gameDefinitions
gameImages
gameIcons
gameCards
gameRoutes
```

Make sure the mapping is deterministic.

Prefer a single authoritative mapping instead of multiple independent mappings that can drift apart.

For example:

```javascript
{
  id: "game_x",
  name: "Game X",
  category: "behsazan",
  image: APPROVED_GAME_X_IMAGE,
  minPlayers: 2,
  maxPlayers: 4,
  type: "multiplayer"
}
```

Avoid situations where the name comes from one configuration object while the image comes from another unrelated mapping.

---

### 11. Prevent Asset Drift

Implement safeguards so that future developers cannot accidentally assign the wrong image.

Where practical:

* Use stable game IDs.
* Use a centralized game registry.
* Use explicit image-to-game mappings.
* Avoid fragile array-index-based image selection.
* Avoid generic fallback images for known games.
* Avoid duplicated game metadata.
* Add validation for missing or duplicate image mappings.

A game should have exactly one authoritative image mapping.

---

### 12. Automated Validation

Create or use an automated validation mechanism where practical.

The validator should detect:

```text
Missing game image
Wrong game image
Duplicate image assignment
Unknown game ID
Unknown asset
Missing game metadata
Name/image mismatch
Category/image mismatch
Invalid player-count configuration
Broken asset path
Unused approved asset
Unexpected Behsazan asset
Behsazan asset used in General Games
General Games asset used in Behsazan
```

The validation should fail loudly rather than silently falling back to an unrelated image.

---

### 13. Cache and Stale Asset Validation

Because incorrect images can remain visible due to browser, service-worker, CDN, or application cache, verify the implementation using a clean state.

Test:

1. Fresh application load
2. Hard refresh
3. New browser/session
4. Existing session
5. New multiplayer session
6. Navigation between tabs
7. Navigation between games
8. Game completion → next game
9. Reopening the application
10. Updated asset deployment

Ensure that an old game image cannot remain associated with a new game because of stale cached state.

Do not solve an incorrect mapping problem simply by clearing cache. Fix the underlying mapping/state issue.

---

### 14. Full UI Sweep

Inspect every location where the 16 games can appear.

At minimum:

```text
Game Tabs
→ Game Cards
→ Game Selection
→ Host Configuration
→ Waiting Room
→ Session Start
→ Game Header
→ Gameplay Screen
→ Game Instructions
→ Game Result
→ Scoreboard
→ Next Game
→ Session Summary
→ Replay / Restart
→ Mobile Layout
→ Desktop Layout
```

Verify that the correct image remains associated with the correct game throughout the entire lifecycle.

---

### 15. Regression Protection

Do not modify the General Games images.

Do not unintentionally change:

* Existing correct game assets
* UI layout
* Typography
* Game logic
* Player logic
* Scoring
* Navigation
* General Games tab
* Existing correct game metadata

Only make changes required to fix the identified asset/game consistency issues.

---

### 16. Final QA Matrix

Create a final validation matrix similar to:

| #   | Game | Tab | Expected Image | Actual Image | Name Correct | Game Nature Correct | Player Count Correct | All References Correct | Status    |
| --- | ---- | --- | -------------- | ------------ | ------------ | ------------------- | -------------------- | ---------------------- | --------- |
| 01  | ...  | ... | ...            | ...          | PASS/FAIL    | PASS/FAIL           | PASS/FAIL            | PASS/FAIL              | PASS/FAIL |
| 02  | ...  | ... | ...            | ...          | PASS/FAIL    | PASS/FAIL           | PASS/FAIL            | PASS/FAIL              | PASS/FAIL |
| ... | ...  | ... | ...            | ...          | ...          | ...                 | ...                  | ...                    | ...       |
| 16  | ...  | ... | ...            | ...          | PASS/FAIL    | PASS/FAIL           | PASS/FAIL            | PASS/FAIL              | PASS/FAIL |

Do not mark an item as PASS unless it has actually been verified.

---

### 17. Final Acceptance Criteria

The task is complete only when all of the following are true:

* Exactly the 8 approved images are used for the Behsazan games.
* Each Behsazan game has the correct approved image.
* No other image is used for those games.
* No unrelated/old/placeholder image remains referenced.
* General Games images remain unchanged.
* No Behsazan image incorrectly appears in General Games.
* No General Games image incorrectly appears in Behsazan.
* All 16 games have been individually reviewed.
* Every game name correctly represents its actual implementation.
* Every game's image corresponds to its intended identity.
* Every game's mechanics match its defined nature.
* Game IDs, names, images, metadata, and implementation are consistent.
* Dynamic game mappings are correct.
* All image references throughout the application are correct.
* Cached/stale assets do not cause incorrect images to appear.
* The application has no broken image references.
* The final QA matrix has been completed.
* No unrelated functionality has been changed.

### Important Rule

**Do not make assumptions about which image belongs to which game.**

Use the provided 8 approved Behsazan images as the authoritative visual source and inspect the actual application/game implementation to establish the correct mapping.

For the General Games tab, preserve the existing correct assets exactly as they are.

The objective is not to make the images merely “look consistent”; the objective is to establish and enforce a **one-to-one, deterministic relationship between each game ID, game name, game nature, and its authoritative image asset** across the entire application.
