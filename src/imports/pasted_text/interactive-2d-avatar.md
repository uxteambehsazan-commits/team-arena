You are working on the existing Team Arena web application.

IMPORTANT:
The current Figma Make project is the SOURCE OF TRUTH.
Do NOT rebuild the application from GitHub.
Do NOT redesign unrelated pages.
Do NOT break or replace the existing game flows, navigation, routing, waiting room, game selection, admin panel, or existing UI.

I currently cannot export the 3D character from Meshy as GLB/FBX.
Therefore, DO NOT depend on a real 3D model, Three.js, WebGL, GLB, FBX, or any external 3D asset.

Instead, use the provided Meshy character image as the visual reference and build a premium 2D interactive avatar system around it.

==================================================
1. FIRST: AUDIT THE EXISTING APPLICATION
==================================================

Before changing anything:

1. Inspect the current Figma Make project.
2. Understand the existing:
   - routes
   - pages
   - components
   - player/user data
   - game data
   - authentication
   - admin environment
   - existing avatar/player selection
   - score system
   - game results
   - local storage
   - backend/database, if already connected
3. Reuse existing architecture and components whenever possible.
4. Do not create duplicate systems.
5. Do not create fake player data where real data already exists.
6. Do not break the current Team Arena game flow.

The new avatar/progression system must be integrated into the existing application.

==================================================
2. NEW CONCEPT: INTERACTIVE 2D AVATAR
==================================================

Use the uploaded Meshy character image as the primary avatar visual.

The avatar should NOT look like a static image.

Create an interactive 2D avatar experience using:

- CSS animations
- transforms
- scale
- rotation
- subtle floating
- subtle breathing
- glow
- shadow
- particles
- badges
- frames
- overlays
- state-based visual effects

The result should visually feel alive even though the source asset is a 2D image.

Do NOT attempt fake photorealistic 3D.

==================================================
3. AVATAR STATES
==================================================

Create a reusable Avatar component with different states:

IDLE
- subtle floating animation
- very small vertical movement
- subtle breathing/scale effect
- soft dynamic shadow
- occasional blink-like visual effect if possible without modifying the character image

HOVER
- slightly scale up
- subtle tilt
- stronger glow
- shadow becomes slightly larger
- display small interaction hint

SELECTED
- premium glowing frame
- animated border
- small particles
- selected badge
- subtle scale animation

WIN
- character slightly jumps
- celebration particles
- crown/glow effect
- animated score increase
- success visual effect

LOSE
- subtle downward movement
- reduced glow
- calm visual state
- do not make the character look damaged or negative

LEVEL UP
- character performs a stronger celebration animation
- XP bar animates
- level number increases
- particles appear
- unlock notification appears

STREAK
- special fire/glow effect around avatar
- intensity increases with streak
- show current winning streak

TOP PLAYER
- premium frame
- crown
- special aura
- Top Player badge

==================================================
4. AVATAR SELECTION PAGE
==================================================

Improve the existing avatar/personality selection experience.

Do not simply show a grid of static images.

Create a premium mobile-first experience.

Suggested structure:

--------------------------------
شخصیت من
--------------------------------

        [Large Avatar]

       ✨ Level 18

       XP PROGRESS
       ███████████░░░

       2,840 امتیاز

       86 رقابت
       54 برد
       32 باخت

       🔥 7 برد متوالی

       رتبه Gold
       بین 1,240 بازیکن

--------------------------------

[ شخصیت ] [ افتخارات ] [ آمار ]

--------------------------------

The avatar should occupy the visual focus of the page.

On mobile:
- avatar remains large
- statistics should NOT create a crowded header
- use cards/chips
- prioritize the most important information
- allow scrolling
- maintain excellent readability

==================================================
5. PLAYER PROGRESSION
==================================================

Create a reusable player progression system.

Player profile should support:

- Level
- XP
- Total Score
- Total Matches
- Wins
- Losses
- Win Rate
- Current Streak
- Best Streak
- Rank
- Achievements
- Unlocked Items
- Player Title
- Badges

Example:

Level 18

2,840 XP

86 Matches

54 Wins
32 Losses

62.8% Win Rate

🔥 7 Win Streak

🏆 Gold

Do not hardcode these values if the application already has real user/game data.

Use the existing data model whenever possible.

==================================================
6. XP AND LEVEL SYSTEM
==================================================

Implement a reusable XP progression system.

Example:

Level 18
██████████████░░░░
82% to Level 19

When XP changes:

- animate progress bar
- animate numeric value
- show XP gained
- if level increases, trigger Level Up state

Example:

+120 XP

LEVEL UP!

19

The animation should be short and polished.

==================================================
7. RANK SYSTEM
==================================================

Create visual rank states such as:

Bronze
Silver
Gold
Platinum
Diamond
Champion

Do NOT invent real rankings.

If the existing application already has ranking logic, use it.

If there is no real ranking backend yet, build the UI architecture so real ranking data can be connected later.

Each rank can have:

- unique visual treatment
- badge
- frame
- glow
- progress indicator

==================================================
8. ACHIEVEMENTS
==================================================

Create an Achievement section.

Examples:

🏆 First Victory
Win your first game

🔥 Winning Streak
Win 5 games consecutively

⚔️ Veteran
Play 50 games

👑 Champion
Reach Champion rank

🎯 Perfect Round
Complete a game without losing

Achievements must have:

UNLOCKED
and
LOCKED

states.

Locked achievements should clearly show their unlock requirement.

Do not falsely mark achievements as completed.

==================================================
9. AVATAR FRAME SYSTEM
==================================================

Since we don't have a real 3D model, create visual customization around the 2D avatar.

Support:

- Default Frame
- Bronze Frame
- Silver Frame
- Gold Frame
- Champion Frame
- Special Event Frame

Frames should be layered around the avatar.

Also support:

- glow
- aura
- particles
- crown
- badge
- title

These visual elements should react to the player's progression.

==================================================
10. AVATAR PERSONALIZATION
==================================================

Create a personalization architecture.

Support:

Avatar
Frame
Aura
Badge
Title
Effect

Example:

Avatar:
King

Frame:
Gold

Aura:
Champion

Badge:
Top 10%

Title:
Strategist

The system should be data-driven.

Do not hardcode every combination into separate pages.

Create reusable configuration objects/components.

==================================================
11. CLOTHING / SKINS
==================================================

IMPORTANT:

Because we currently only have one character image and no 3D export, DO NOT pretend that real 3D clothing replacement is available.

Instead, create the architecture for future skins.

The UI should support:

Classic
Royal
Champion
Legendary

But only display a skin as actually available if a real asset exists.

For unavailable skins:

🔒 Locked

Show:

"در آینده"

or

"با رسیدن به Level 20 باز می‌شود"

Do not create fake clothing images.

If technically appropriate, allow future transparent overlay assets to be placed over the base avatar without changing the core architecture.

==================================================
12. UNLOCK SYSTEM
==================================================

Create a generic unlock rule system.

Items can unlock based on:

- Level
- Score
- Matches
- Wins
- Win Streak
- Rank
- Achievement

Examples:

Level 10
→ Silver Frame

Level 20
→ Champion Frame

10 Win Streak
→ Fire Aura

100 Matches
→ Veteran Badge

Champion Rank
→ Champion Crown

The rules must be centralized and reusable.

==================================================
13. GAME-SPECIFIC PERSONALIZATION
==================================================

If the current application supports multiple games, allow the profile to have game-specific statistics.

Example:

Mafia
12 games
8 wins

Quiz
20 games
13 wins

Name-Family
15 games
9 wins

Show:

"آمار بازی‌ها"

with compact game cards.

Do not modify existing game logic unless necessary.

==================================================
14. PLAYER PROFILE CARD
==================================================

Create a reusable PlayerCard component.

It should support:

Avatar
Level
Rank
Score
Win Rate
Streak
Badge
Title

Example:

┌─────────────────────┐
│       👑            │
│     Avatar          │
│                     │
│  Level 18           │
│  Gold               │
│                     │
│  2,840 Score        │
│  62.8% Win Rate     │
│  🔥 7 Streak        │
└─────────────────────┘

Use the same component in:

- Avatar selection
- Player profile
- Leaderboard
- Game result
- Waiting room
- Game lobby
- Admin preview

==================================================
15. LEADERBOARD
==================================================

If the existing application already has real player data, integrate it.

Support:

Top Players
My Rank
Nearby Players
Score
Wins
Win Rate
Streak
Avatar
Badge

Example:

🥇 Player
🥈 Player
🥉 Player

...

You

#37

Do not generate fake global rankings.

If real backend ranking is not currently available, create the UI/data architecture without pretending that the numbers are real.

==================================================
16. GAME RESULT EXPERIENCE
==================================================

Improve the existing game result screen.

After a win:

Avatar
↓
Win animation
↓
+120 XP
↓
+250 Score
↓
New total score
↓
Progress bar
↓
Possible achievement
↓
Possible level up

Example:

🎉 پیروز شدی!

+120 XP

+250 امتیاز

🔥 برد متوالی: 8

If the player levels up:

LEVEL UP
18 → 19

Do not break the existing result flow.

==================================================
17. WAITING ROOM INTEGRATION
==================================================

If the existing Team Arena Waiting Room already shows players:

Improve player cards using the new PlayerCard component.

Each player can show:

- avatar
- level
- rank
- badge
- ready state
- host indicator

Keep the waiting room compact.

Do not make it visually overcrowded.

The host must remain clearly identifiable.

==================================================
18. MICRO INTERACTIONS
==================================================

Add polished micro-interactions:

- hover
- tap
- press
- selected
- locked
- unlocked
- level up
- achievement unlock
- rank change
- score increase
- XP gain
- win
- loss
- streak

Animations should be:

FAST
SUBTLE
PREMIUM
NOT DISTRACTING

Avoid excessive animations.

Respect prefers-reduced-motion.

==================================================
19. PERFORMANCE
==================================================

This is critical.

Because the app runs on GitHub Pages and must work well on mobile:

- optimize avatar images
- avoid loading duplicate large assets
- lazy-load noncritical assets
- use responsive image sizes
- avoid heavy animation loops
- avoid unnecessary re-renders
- avoid WebGL
- avoid Three.js
- avoid heavy 3D libraries
- use CSS transforms where possible
- use GPU-friendly transform/opacity animations
- preload only the currently selected avatar/essential assets

The initial page must load quickly.

==================================================
20. FALLBACK SYSTEM
==================================================

If avatar asset fails to load:

Show a graceful fallback avatar.

Never show:

- broken image
- blank space
- layout collapse

Create:

AvatarLoading
AvatarLoaded
AvatarError

states.

==================================================
21. REAL DATA VS DEMO DATA
==================================================

CRITICAL:

Never present fake statistics as real user statistics.

If the application already has:

score
wins
losses
matches
rank
XP

use those values.

If a backend exists:
connect to the existing backend.

If there is no backend:
keep the architecture ready for backend integration.

LocalStorage may be used only for local prototype state and must not be presented as a global leaderboard.

Do not create fake global users.

==================================================
22. ADMIN INTEGRATION
==================================================

The existing application has an Admin environment.

If appropriate, add an "Avatar & Progression Management" section.

Admin should eventually be able to manage:

Avatars
Frames
Badges
Titles
Auras
Achievements
Unlock Rules
Rank Rules

For example:

Avatar:
King

Status:
Active

Frame:
Gold

Unlock:
Level 20

Badge:
Champion

Also allow Admin to preview how an avatar appears to users.

Do not duplicate existing Admin architecture.

==================================================
23. FUTURE-READY ARCHITECTURE
==================================================

Build reusable components/data structures.

Suggested components:

Avatar
AvatarCard
AvatarPreview
AvatarFrame
AvatarBadge
AvatarEffect
PlayerCard
PlayerStats
XPProgress
RankBadge
AchievementCard
Leaderboard
UnlockItem
ProgressionPanel

Suggested player model:

player {
  id
  name
  avatarId
  frameId
  badgeId
  titleId
  auraId
  level
  xp
  totalScore
  matches
  wins
  losses
  winRate
  currentStreak
  bestStreak
  rank
  achievements
  unlockedItems
}

Do not create duplicate player models if one already exists.
Adapt this structure to the current application's architecture.

==================================================
24. VISUAL DESIGN
==================================================

Keep the existing Team Arena visual language.

Do not introduce a completely different design system.

The avatar area should feel:

Premium
Game-like
Modern
Playful
Competitive
Professional

Use:

- depth
- soft shadows
- glass surfaces where appropriate
- subtle glow
- premium borders
- controlled gradients
- smooth transitions

But avoid visual overload.

The avatar must remain the main visual focus.

==================================================
25. MOBILE FIRST
==================================================

The experience must work exceptionally well on mobile.

Pay special attention to:

- avatar size
- touch interactions
- horizontal scrolling
- bottom sheets
- compact statistics
- readable typography
- buttons large enough for touch
- avoiding crowded headers

Do not simply shrink desktop UI.

Design responsive layouts intentionally.

==================================================
26. ACCESSIBILITY
==================================================

Support:

- keyboard navigation
- visible focus states
- sufficient contrast
- aria labels where needed
- reduced motion
- accessible buttons
- meaningful text alternatives for avatar images

==================================================
27. DO NOT BREAK EXISTING FEATURES
==================================================

Before finishing:

Test:

- login/authentication
- home
- game selection
- waiting room
- player joining
- host
- non-host
- game start
- game play
- game result
- score updates
- navigation
- back button
- refresh
- mobile
- desktop
- admin

The new avatar system must not introduce dead ends.

==================================================
28. IMPLEMENTATION PRIORITY
==================================================

Implement in this order:

PHASE 1
2D interactive avatar

PHASE 2
Player statistics

PHASE 3
XP + Level

PHASE 4
Rank

PHASE 5
Achievements

PHASE 6
Frames / badges / aura

PHASE 7
Unlock system

PHASE 8
Leaderboard integration if real data exists

PHASE 9
Admin management

PHASE 10
Polish + performance + accessibility

Do not implement unnecessary complexity before the core experience works.

==================================================
29. IMPORTANT CONSTRAINT
==================================================

DO NOT use:

- GLB
- FBX
- Three.js
- WebGL
- real-time 3D rendering
- external 3D model dependencies

because I currently cannot export the character from Meshy.

Use the supplied 2D character image and make it feel alive through UI/animation.

The architecture should nevertheless be future-ready so that a real 3D avatar can be added later without rebuilding the entire player/profile/progression system.

==================================================
30. FINAL QA
==================================================

After implementation:

1. Verify all existing routes.
2. Verify all existing game flows.
3. Verify avatar selection.
4. Verify avatar animations.
5. Verify player statistics.
6. Verify XP.
7. Verify level progression.
8. Verify rank.
9. Verify achievements.
10. Verify locked/unlocked states.
11. Verify mobile responsiveness.
12. Verify desktop responsiveness.
13. Verify loading states.
14. Verify image failure fallback.
15. Verify performance.
16. Verify accessibility.
17. Verify Admin integration if implemented.
18. Check for console errors.
19. Check for broken imports.
20. Check for duplicated components/data models.
21. Check that no fake leaderboard or fake user statistics are presented as real.
22. Confirm that the existing Team Arena functionality still works.

IMPORTANT:
Do not stop after creating the UI.
Make the interactions functional.

At the end, provide a concise implementation report containing:

- what was implemented
- which existing components were reused
- which new components were created
- what data is real
- what is currently prototype/local
- what requires backend integration
- any remaining limitations
- any errors found and fixed

Do not claim something is implemented unless it actually works in the current project.