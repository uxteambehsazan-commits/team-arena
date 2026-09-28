============================================================
TEAM ARENA — MASTER HOME + PROFILE + PLAYER IDENTITY
UX/UI + CLIENT STORAGE + GAME ENTRY SYSTEM
============================================================

IMPORTANT — READ BEFORE IMPLEMENTATION

Use the CURRENT Figma Make project as the ONLY source of truth.

Do NOT rebuild the application from an old GitHub version.

Do NOT redesign unrelated pages.

Do NOT remove existing game logic.

Do NOT break existing games, Waiting Room, Admin, leaderboard,
missions, achievements, statistics, scoring or game flows.

This task is specifically to improve:

1. HOME PAGE
2. PROFILE PAGE
3. PLAYER IDENTITY
4. AVATAR / CHARACTER SYSTEM
5. CHARACTER SELECTION
6. GAME NAME
7. PROFILE PERSISTENCE
8. START GAME FLOW
9. ONLINE / SINGLE PLAYER ENTRY
10. INFORMATION ARCHITECTURE
11. MOBILE UX
12. PERFORMANCE
13. DATA ISOLATION
14. ERROR / LOADING STATES
15. FINAL QA

The final result must feel:

PREMIUM
MINIMAL
MODERN
GAME-LIKE
PERSONAL
FAST
CLEAR
CONSISTENT
AND PRODUCTION-READY.

============================================================
01 — CORE PRODUCT PRINCIPLE
============================================================

Separate the responsibilities of each screen.

HOME
=
PLAY

PROFILE
=
IDENTITY + CHARACTER + PROGRESSION

GAME SELECTION
=
CHOOSE HOW TO PLAY

ADMIN
=
MANAGEMENT

The Home page must answer:

«الان چه کاری انجام بدهم؟»

The Profile page must answer:

«من در این بازی چه کسی هستم و چقدر پیشرفت کرده‌ام؟»

The Start Game interaction must answer:

«می‌خواهم چگونه بازی کنم؟»

Do NOT turn the Home page into a dashboard.

============================================================
02 — CURRENT HOME PAGE PROBLEM
============================================================

The current Home page is visually crowded.

Too many elements compete for attention:

- logo
- title
- hero artwork
- characters
- player status
- level
- XP
- buttons
- leaderboard
- how-to-play
- profile controls
- secondary information

Reduce the visual density significantly.

Do NOT remove useful functionality.

Instead:

MOVE
CONSOLIDATE
PRIORITIZE
and
HIERARCHICALLY ORGANIZE

the information.

The primary objective of Home must be:

START PLAYING.

============================================================
03 — HOME PAGE INFORMATION HIERARCHY
============================================================

Use this hierarchy:

LEVEL 1:
Profile Avatar

LEVEL 2:
Brand / Hero

LEVEL 3:
«شروع بازی»

LEVEL 4:
Secondary actions

LEVEL 5:
Supporting information

Do NOT give all elements equal visual weight.

The user's eye should naturally move:

Avatar
↓
Hero
↓
Start Game
↓
Secondary options

============================================================
04 — HOME HEADER AVATAR
============================================================

Replace the current Gamepad/Profile icon in the top corner of Home.

CURRENT:

🎮 Gamepad icon

NEW:

User's selected avatar.

The avatar must be connected to the user's actual selected character.

If the character changes in Profile:

Home avatar MUST update automatically.

Do NOT use a separate static avatar.

============================================================
05 — NEW USER AVATAR
============================================================

For a player who has NEVER selected a character:

Show a neutral placeholder avatar.

Use:

LIGHT GRAY
SOFT GRAY
NEUTRAL

Visual characteristics:

- light gray circular background
- subtle gray border
- neutral silhouette
- low visual emphasis
- no colorful character
- no random character

The placeholder should communicate:

«هنوز شخصیتت را انتخاب نکرده‌ای»

Do NOT automatically assign a character.

============================================================
06 — AVATAR AURA
============================================================

For users who have selected a character:

Show the selected avatar in the Home header.

Behind it create a subtle animated aura.

Visual:

Avatar
+
soft circular glow
+
slow light sweep
+
subtle pulse

Animation:

2–4 seconds approximately

Use smooth easing.

The animation must attract attention without becoming distracting.

Do NOT use aggressive flashing.

Respect:

prefers-reduced-motion

When reduced motion is enabled:

Use static glow only.

============================================================
07 — AVATAR INTERACTION
============================================================

When the user taps the avatar:

Navigate directly to:

PROFILE

Do NOT open an unnecessary popup.

Add a subtle press interaction:

scale
+
glow
+
smooth transition

The avatar should feel like the user's personal gateway.

============================================================
08 — HOME HERO
============================================================

Keep the existing Team Arena visual identity.

Preserve the existing:

- brand
- colors
- character artwork
- atmosphere
- general visual language

But reduce clutter.

The hero should have one clear visual focal point.

Do NOT allow:

Logo
Title
Characters
Profile statistics
Leaderboard
Buttons

to all compete equally.

Use:

spacing
depth
gradient
shadow
layering

instead of adding more UI.

============================================================
09 — PRIMARY CTA
============================================================

The most important button on Home:

«شروع بازی»

This must be the strongest CTA.

Use:

- large touch target
- clear typography
- existing Team Arena style
- subtle interaction
- pressed state
- loading state
- disabled state when necessary

Do NOT place multiple competing primary buttons next to it.

============================================================
10 — START GAME FLOW
============================================================

When the user presses:

«شروع بازی»

DO NOT automatically show character selection.

First check the user's local profile.

Decision:

Is the profile complete?

YES
→ Skip character/name setup.

NO
→ Complete only the missing information.

Then continue to the existing game-entry flow.

============================================================
11 — PROFILE COMPLETION
============================================================

A profile is complete only when BOTH exist:

selectedCharacterId
+
gameName

Then:

profileCompleted = true

If both exist:

Do NOT show onboarding again.

============================================================
12 — FIRST-TIME USER FLOW
============================================================

New player:

OPEN APP
↓
Neutral Gray Avatar
↓
Press «شروع بازی»
↓
Character Selection
↓
Game Name
↓
Confirm
↓
Save Profile
↓
Game Mode Selection
↓
Online / Single Player
↓
Existing Game Flow

============================================================
13 — RETURNING USER FLOW
============================================================

Returning player:

OPEN APP
↓
Selected Avatar
↓
Press «شروع بازی»
↓
NO character selection
↓
NO name question
↓
Game Mode Selection
↓
Online / Single Player
↓
Existing Game Flow

This experience must be extremely fast.

============================================================
14 — PARTIAL PROFILE
============================================================

Handle partial profiles correctly.

CASE A:

Character exists.

Game Name does NOT exist.

Then:

Start Game
↓
Ask only for Game Name

Do NOT show Character Selection again.

CASE B:

Game Name exists.

Character does NOT exist.

Then:

Start Game
↓
Ask only for Character

Do NOT ask for Game Name again.

CASE C:

Both exist.

Skip setup completely.

============================================================
15 — GAME MODE SELECTION
============================================================

After profile validation:

Show a:

BOTTOM SHEET

or

compact game mode selection panel.

Only show the main choices:

🎮 بازی آنلاین

🧩 بازی تک‌نفره

Do NOT create unnecessary additional steps.

============================================================
16 — ONLINE MODE
============================================================

When user selects:

«بازی آنلاین»

Use the EXISTING Team Arena online flow.

Do NOT create a parallel architecture.

Continue to the existing:

game selection
waiting room
player joining
team formation
game start

where applicable.

============================================================
17 — SINGLE PLAYER MODE
============================================================

When user selects:

«بازی تک‌نفره»

Use the existing single-player flow if already implemented.

Do NOT invent unrelated mechanics.

============================================================
18 — BOTTOM SHEET UX
============================================================

Bottom sheet must:

- open smoothly
- have rounded top corners
- have backdrop
- support close
- support swipe down where appropriate
- preserve Home state
- respect mobile safe areas

Interaction should be:

FAST
SMOOTH
PREMIUM

Do not create slow transitions.

============================================================
19 — PROFILE PAGE REDESIGN
============================================================

Redesign the Profile page at a professional UI/UX level.

The current Profile page is too dense.

Do NOT simply rearrange existing cards.

Rebuild the information architecture.

Profile should feel like:

«اتاق شخصیت بازیکن»

not:

«یک داشبورد شلوغ».

============================================================
20 — PROFILE HERO
============================================================

At the top of Profile:

Show the currently selected character.

The character must be displayed:

FULL BODY

not only the face.

The selected character should become the primary visual identity of the page.

============================================================
21 — FULL-BODY CHARACTER
============================================================

Use the existing 2D character assets.

Do NOT require 3D export.

Do NOT pretend that a 2D image is a real 3D model.

Create a premium 2D presentation using:

- clean cutout
- soft glow
- shadow
- gradient
- aura
- subtle particles if performant
- subtle floating animation

Possible animation:

slow floating
or
very subtle scale/breathing effect

Avoid aggressive animation.

============================================================
22 — CHARACTER STAGE
============================================================

Create a dedicated character stage:

          ✨

     FULL BODY
      CHARACTER

          ✨

Below:

Character Name

Level

Title / Rank

Example:

👑 پرنسس آریا

Level 12

«بازیکن حرفه‌ای»

The character should feel like the user's identity.

============================================================
23 — CHARACTER CAROUSEL
============================================================

Do NOT display all characters as a dense grid.

Use a:

HORIZONTAL CHARACTER CAROUSEL.

Selected character:

- centered
- larger
- prominent

Neighboring characters:

- partially visible
- smaller
- lower emphasis

The user should immediately understand:

«می‌توانم به چپ و راست حرکت کنم.»

============================================================
24 — CHARACTER CAROUSEL INTERACTIONS
============================================================

Support:

Swipe left
Swipe right
Tap neighboring character
Previous
Next

When selected character changes:

- animate transition
- update selected state
- update Profile
- update Home avatar
- update relevant game identity

Selected character:

- glow
- border
- scale
- check/selected indicator

============================================================
25 — LOCKED CHARACTERS
============================================================

Locked characters should remain discoverable.

Show:

🔒

and a concise unlock condition.

Examples:

Level 10
Achievement
Special Event

Do NOT make locked characters visually dominant.

============================================================
26 — PROFILE TABS
============================================================

Move these tabs to the top of Profile content:

شخصیت
ماموریت‌ها
افتخارات
آمار

Recommended order:

شخصیت | ماموریت‌ها | افتخارات | آمار

Use:

- compact layout
- horizontal scrolling if necessary
- clear active state
- existing purple accent
- touch-friendly targets

============================================================
27 — CHARACTER TAB
============================================================

Character tab contains:

- full-body character
- character carousel
- unlocked characters
- locked characters
- frames
- auras
- titles
- customization

Do NOT display everything as large cards.

Use compact sections.

============================================================
28 — MISSIONS TAB
============================================================

Show:

Active missions
Completed missions
Progress
Reward
Claim state

Example:

🎯 انجام 3 بازی

██████░░░

2 / 3

Do not mix missions with statistics.

============================================================
29 — ACHIEVEMENTS TAB
============================================================

Show:

Unlocked achievements
Locked achievements
Progress
Rarity

Examples:

🏆 اولین برد
🔥 بردهای متوالی
👑 استاد بازی

Keep it visually organized.

============================================================
30 — STATS TAB
============================================================

Show:

بازی‌ها
بردها
باخت‌ها
نرخ برد
امتیاز
XP
Streak
Personal Best

Use a compact layout.

Do NOT create huge cards for every statistic.

============================================================
31 — PROFILE STATUS BAR
============================================================

Move the main user progression information into Profile.

Show:

Level
XP
Rank
Win Rate
Streak

Example:

Level 12

720 / 1000 XP

████████░░

🏆 بازیکن حرفه‌ای

🔥 5 برد متوالی

The Home page should NOT show this entire dashboard.

============================================================
32 — XP PROGRESSION
============================================================

Create a clear XP bar.

Show:

Level 12

720 / 1000 XP

Next:

Level 13

Make the progress immediately understandable.

============================================================
33 — PROFILE STATS
============================================================

Use compact statistics.

Example:

بازی‌ها | بردها | نرخ برد | امتیاز

128 | 74 | 58% | 12,450

Avoid excessive borders.

Avoid unnecessary cards.

============================================================
34 — HOME SECONDARY CONTENT
============================================================

Move secondary features away from the primary CTA.

Examples:

🏆 جدول امتیازات

❓ چطور بازی کنیم؟

🎯 ماموریت‌ها

These should be:

secondary cards
compact actions
or secondary navigation

They should NOT compete with:

«شروع بازی»

============================================================
35 — LEADERBOARD
============================================================

Keep:

«جدول امتیازات همکاران»

but reduce its visual weight on Home.

Use a compact card:

🏆 جدول امتیازات
«رتبه خودت را ببین»

Tap:

Open leaderboard.

============================================================
36 — HOW TO PLAY
============================================================

Keep:

«چطور بازی کنیم؟»

as a secondary action.

Do not give it the same importance as Start Game.

============================================================
37 — HOME MINIMALIZATION
============================================================

Reduce Home visual density by approximately:

30–40%

without removing functionality.

Move secondary functionality to:

Profile
Game Mode Selection
Secondary pages
Bottom sheets

Home should feel:

Breathable
Focused
Cinematic
Fast

============================================================
38 — HOME STRUCTURE
============================================================

Recommended:

HEADER
↓
BRAND / HERO
↓
MAIN VISUAL
↓
START GAME
↓
SECONDARY ACTIONS
↓
MINIMAL SUPPORTING CONTENT

Do NOT turn Home into a statistics dashboard.

============================================================
39 — PLAYER IDENTITY ARCHITECTURE
============================================================

IMPORTANT:

The game currently DOES NOT have:

username/password authentication
email authentication
social login
player accounts

DO NOT introduce login.

Players are identified locally on the client.

Every local player must have a unique:

localPlayerId

generated automatically.

Use a strong random identifier / UUID where supported.

============================================================
40 — LOCAL PLAYER ID
============================================================

Create:

localPlayerId

Example concept:

UUID

Do NOT generate it from:

gameName
characterName
device name
IP
browser name

The ID is internal.

The user does not need to see it.

============================================================
41 — PLAYER PROFILE DATA
============================================================

Use a centralized profile structure:

PlayerProfile:

playerId
gameName
selectedCharacterId
profileCompleted
level
xp
rank
streak
stats
achievements
missions
unlockedCharacters
frames
auras
titles
atlas
createdAt
updatedAt
profileSchemaVersion

============================================================
42 — LOCAL STORAGE ARCHITECTURE
============================================================

IMPORTANT:

Do NOT use browser cache as the only storage for player profiles.

Separate:

PROFILE DATA
from
APPLICATION CACHE.

Recommended:

IndexedDB
=
structured persistent player profile

LocalStorage
=
small metadata

Cache Storage / Service Worker
=
application files and assets

Do NOT put the entire profile inside one giant LocalStorage object.

============================================================
43 — PROFILE STORAGE KEY
============================================================

Profile storage must be scoped to the local player.

Concept:

teamArena_profile_{localPlayerId}

Do NOT use:

teamArena_profile

as a global shared profile.

============================================================
44 — PROFILE DATA ISOLATION
============================================================

Every player must have independent:

Character
Game Name
Level
XP
Stats
Achievements
Missions
Atlas
Unlocked Items

No global profile state.

No shared player state.

============================================================
45 — MULTIPLE PLAYERS ON ONE DEVICE
============================================================

Because there is no authentication:

If multiple people use the same browser/device, they technically share the same local storage context.

If the product needs multiple local players:

Provide an optional:

«تغییر بازیکن»

or:

«افزودن بازیکن»

feature.

Each player receives a separate:

localPlayerId

Example:

👑 آریا
🧙 مهدی
🧝 سارا

Switching player must load that player's independent profile.

============================================================
46 — ACTIVE PLAYER
============================================================

Maintain:

activePlayerId

All profile-related UI must read from:

activePlayerId

Do NOT maintain separate independent character/name states in different pages.

============================================================
47 — HOME / PROFILE SYNCHRONIZATION
============================================================

The following must be shared from one profile source:

selectedCharacterId
gameName
level
xp
rank
streak
stats

If character changes:

Profile
→ Home Avatar
→ Lobby
→ Waiting Room
→ Player Card
→ Results

must update accordingly.

If game name changes:

same principle.

No stale UI.

============================================================
48 — GAME NAME
============================================================

The Game Name is the identity shown to other players.

It is NOT necessarily the user's real name.

Example:

«آریا»

After the player saves the name:

Do NOT ask for the name again during every game.

Only ask again when:

- profile is incomplete
OR
- user explicitly edits it in Profile.

============================================================
49 — NAME VALIDATION
============================================================

Validate:

- empty name
- whitespace-only
- minimum length
- maximum length
- invalid characters if required

Trim unnecessary spaces.

Show clear Persian validation messages.

============================================================
50 — PROFILE CONFIRMATION
============================================================

After character + game name:

Show a compact confirmation:

[ FULL CHARACTER ]

نام بازی:

«آریا»

Level 1

Button:

«تأیید و ادامه»

Secondary:

«ویرایش»

After confirmation:

Save profile.

============================================================
51 — START GAME DECISION ENGINE
============================================================

Implement exactly:

CLICK «شروع بازی»

↓

LOAD ACTIVE PLAYER PROFILE

↓

CHECK CHARACTER

No character?
→ Character Selection

Character exists?
→ Continue

↓

CHECK GAME NAME

No name?
→ Game Name

Name exists?
→ Continue

↓

PROFILE COMPLETE

↓

SHOW:

بازی آنلاین
OR
بازی تک‌نفره

↓

EXISTING GAME FLOW

Never repeat completed steps.

============================================================
52 — PROFILE EDITING
============================================================

From Profile the user can explicitly change:

Character
Game Name

Examples:

«تغییر شخصیت»

«ویرایش نام بازی»

Ask for confirmation where appropriate.

Do not trigger onboarding again after every game.

============================================================
53 — FIRST-TIME EXPERIENCE
============================================================

FIRST TIME:

Gray Avatar
↓
Start Game
↓
Character
↓
Game Name
↓
Confirm
↓
Game Mode
↓
Play

============================================================
54 — RETURNING EXPERIENCE
============================================================

RETURNING PLAYER:

Selected Avatar
↓
Start Game
↓
Game Mode
↓
Play

No repeated setup.

============================================================
55 — PROFILE PERSISTENCE
============================================================

Persist locally:

Character
Game Name
Level
XP
Rank
Stats
Achievements
Missions
Atlas
Unlocked items

Persistence must survive:

Refresh
Navigation
Closing/reopening browser
Reopening application

as long as the browser's site data has not been intentionally cleared.

============================================================
56 — IMPORTANT STORAGE LIMITATION
============================================================

Because there is NO authentication:

Profile is associated with:

THIS BROWSER
+
THIS DEVICE / STORAGE CONTEXT

It does NOT automatically transfer to another device.

Do NOT falsely imply cloud synchronization.

============================================================
57 — BROWSER DATA CLEAR
============================================================

If the user clears:

IndexedDB
LocalStorage
Site Data

the local profile may disappear.

Handle gracefully.

Create a new profile state:

Gray Avatar
No Character
No Game Name

Do not crash.

============================================================
58 — APPLICATION CACHE
============================================================

Service Worker / Cache Storage should contain:

JS
CSS
Images
Fonts
Static Assets

Do NOT delete player profile data during cache updates.

Never run a broad:

clearAllStorage()

during application deployment.

Application updates must preserve player progression.

============================================================
59 — PROFILE MIGRATION
============================================================

Support:

profileSchemaVersion

If future versions modify the profile structure:

migrate existing profile data.

Do NOT unnecessarily reset:

Character
Game Name
XP
Level
Achievements
Missions
Atlas

============================================================
60 — CORRUPTED DATA
============================================================

If local profile data becomes corrupted:

Do not render broken UI.

Attempt safe recovery.

If recovery is impossible:

Show:

«اطلاعات پروفایل بازی قابل بازیابی نیست.»

Then:

«بازیابی»
or
«ساخت پروفایل جدید»

Never silently display another player's data.

============================================================
61 — PRIVACY / ISOLATION
============================================================

Do NOT expose another player's:

Game Name
Character
XP
Level
Stats
Achievements
Missions
Atlas

through:

UI
URL
query parameters
global state
cache
local state

============================================================
62 — SECURITY CLARIFICATION
============================================================

This is a CLIENT-SIDE identity system.

Local storage is NOT secure authentication.

A technically advanced user can modify local browser data.

Therefore:

Do not claim that local storage prevents cheating.

For authoritative competitive values such as:

global ranking
global rewards
competitive score

a backend would be required in the future.

For the current local-only architecture:

Treat local storage as persistent game profile data.

============================================================
63 — PERFORMANCE
============================================================

The new Profile / Avatar system must not slow down Home.

Load:

App Shell
↓
Player ID
↓
Lightweight Profile
↓
Render Home
↓
Progressively load non-critical character assets

Do not block Home rendering for unnecessary assets.

Optimize:

character images
avatar images
glow
particles
carousel
animations

Avoid unnecessary animation loops.

============================================================
64 — LOADING STATES
============================================================

Use appropriate states:

SKELETON
for known content structure

SPINNER
for short actions

INLINE LOADING
for small updates

Do not show a blank screen.

Do not show infinite loaders.

============================================================
65 — ERROR STATES
============================================================

Handle:

Profile load failure
Profile save failure
Corrupted data
Character asset failure
Invalid character
Invalid profile state

Provide:

Retry
Recover
Back

Never create a dead end.

============================================================
66 — ACCESSIBILITY
============================================================

Support:

- readable Persian typography
- adequate contrast
- touch-friendly buttons
- keyboard navigation where relevant
- visible focus
- reduced motion
- semantic labels

Do not communicate selected state only through color or glow.

============================================================
67 — RESPONSIVE DESIGN
============================================================

Test:

360px
375px
390px
412px
768px
1024px
1280px+

Pay special attention to:

Header
Avatar
Hero
Start Game
Bottom Sheet
Full Body Character
Carousel
Tabs
Stats

No:

overflow
clipping
overlapping
broken text
horizontal scrolling

unless intentionally designed.

============================================================
68 — MOBILE PROFILE
============================================================

On mobile:

Full-body character should remain visually dominant.

But it must NOT consume the entire screen.

The user should be able to reach:

Profile Tabs

quickly.

Avoid excessive vertical scrolling.

============================================================
69 — DESKTOP PROFILE
============================================================

On desktop:

Use a more spacious composition.

Possible:

Character Stage
+
Profile Status

side by side.

Then:

Profile Tabs

Do NOT simply stretch the mobile layout.

============================================================
70 — MICRO INTERACTIONS
============================================================

Add subtle interactions for:

Avatar tap
Character selection
Carousel movement
Tab switching
Start Game
Bottom Sheet
Mission completion
Achievement unlock

Use animation carefully.

The interface must feel alive but not noisy.

============================================================
71 — CHARACTER STATES
============================================================

Character states:

DEFAULT
SELECTED
LOCKED
PRESSED

Selected:

Glow
Border
Scale
Check indicator

Locked:

Muted
Lock icon
Unlock requirement

============================================================
72 — PROFILE STATES
============================================================

Profile states:

NEW
INCOMPLETE
COMPLETE
EDITING
LOADING
ERROR

All must be handled.

============================================================
73 — HOME STATES
============================================================

Home states:

NO PROFILE:

Gray Avatar

PROFILE COMPLETE:

Selected Avatar

LOADING:

Skeleton only where required

ERROR:

Recoverable error state

Do not redesign the entire page for every state.

============================================================
74 — DO NOT BREAK EXISTING GAMES
============================================================

The redesign must preserve all existing game systems:

- game selection
- online games
- single-player games
- Waiting Room
- teams
- players
- scoring
- timers
- leaderboard
- missions
- achievements
- Admin
- release/version system

Do not introduce duplicate game architectures.

============================================================
75 — QA / COMPLETE USER JOURNEY
============================================================

After implementation test this exact journey:

NEW PLAYER

Home
↓
Gray Avatar
↓
Start Game
↓
Character Selection
↓
Choose Character
↓
Game Name
↓
Confirm
↓
Game Mode
↓
Online
↓
Existing Game Flow
↓
Finish Game
↓
Return Home
↓
Selected Avatar

Then:

Start Game
↓
NO CHARACTER SETUP
↓
NO NAME QUESTION
↓
Game Mode
↓
Play

============================================================
76 — PROFILE EDIT TEST
============================================================

Profile
↓
Change Character
↓
Save
↓
Home
↓
Avatar Updated

Then:

Profile
↓
Change Game Name
↓
Save
↓
Start Game
↓
New Game Name Automatically Used

============================================================
77 — PERSISTENCE TEST
============================================================

Create profile.

Refresh.

Expected:

Same profile.

Close browser.

Reopen.

Expected:

Same profile.

Clear site data.

Expected:

New profile state.

============================================================
78 — MULTI-PLAYER LOCAL ISOLATION TEST
============================================================

If Player Switcher is enabled:

Player A:

Character A
Game Name A

Switch to Player B.

Expected:

Character B
Game Name B

Change Player B.

Expected:

Player A remains unchanged.

Switch back to A.

Expected:

Exact Player A profile restored.

============================================================
79 — FINAL UX TEST
============================================================

Ask:

Can the user understand what to do immediately?

Can the user start a game quickly?

Can the user understand their identity?

Can the user see their character?

Can the user change character easily?

Can the user see progression?

Does Home feel minimal?

Does Profile feel organized?

Are repeated questions eliminated?

Are unnecessary cards removed?

Is the experience visually consistent?

============================================================
80 — FINAL IMPLEMENTATION PRINCIPLES
============================================================

DO:

✓ Preserve existing visual identity
✓ Improve information architecture
✓ Use gray placeholder for new users
✓ Use selected avatar on Home
✓ Use animated subtle aura
✓ Show full-body character in Profile
✓ Use horizontal character carousel
✓ Put Profile tabs at top
✓ Move status/progression into Profile
✓ Use Bottom Sheet for game mode selection
✓ Persist profile locally
✓ Use unique localPlayerId
✓ Separate each player's local data
✓ Use IndexedDB for structured profile data
✓ Use LocalStorage for lightweight metadata
✓ Use Cache Storage for application assets
✓ Preserve profile through app updates
✓ Handle corrupted data
✓ Handle loading/error states
✓ Respect reduced motion
✓ Optimize performance
✓ Test mobile and desktop
✓ Synchronize Home and Profile

DO NOT:

✗ Add username/password login
✗ Ask game name every game
✗ Ask character every game
✗ Randomly assign avatar
✗ Use a global profile
✗ Store all profiles in one shared object
✗ Treat browser cache as permanent profile storage
✗ Clear profile data during deployment
✗ Show another player's data
✗ Create duplicate game flows
✗ Overload Home
✗ Turn Profile into a dashboard
✗ Use unnecessary 3D
✗ Create fake cloud synchronization

============================================================
81 — FINAL ACCEPTANCE CRITERIA
============================================================

The implementation is complete only if:

✓ New player sees gray placeholder avatar
✓ New player can select character
✓ New player can select game name
✓ Profile saves locally
✓ Character persists
✓ Name persists
✓ Home avatar updates
✓ Profile character updates
✓ Full-body character is displayed
✓ Character carousel works
✓ Locked characters work
✓ Profile tabs work
✓ Missions work
✓ Achievements work
✓ Stats work
✓ XP works
✓ Level works
✓ Start Game checks profile state
✓ Complete users skip onboarding
✓ Incomplete users see only missing steps
✓ Online mode works
✓ Single-player mode works
✓ Existing game flow remains intact
✓ Profile survives refresh
✓ Profile survives browser reopen
✓ App update does not delete profile
✓ Local player ID exists
✓ Player data is isolated
✓ No global profile state exists
✓ No repeated game-name questions
✓ No repeated character selection
✓ Home is significantly less crowded
✓ Profile is significantly more organized
✓ Mobile layout works
✓ Desktop layout works
✓ Loading states work
✓ Error states work
✓ Reduced motion works
✓ Performance remains acceptable
✓ No dead ends
✓ No console/runtime errors caused by the implementation

============================================================
82 — FINAL PRODUCT EXPERIENCE
============================================================

FINAL EXPERIENCE:

NEW PLAYER:

Gray Avatar
↓
«شروع بازی»
↓
انتخاب شخصیت
↓
انتخاب نام بازی
↓
ذخیره
↓
بازی آنلاین / تک‌نفره
↓
بازی

RETURNING PLAYER:

Selected Avatar
↓
«شروع بازی»
↓
بازی آنلاین / تک‌نفره
↓
بازی

PROFILE:

Full Body Character
↓
Game Name
↓
Level + XP
↓
Profile Tabs
↓
Character / Missions / Achievements / Stats
↓
Customization

HOME:

Minimal
↓
Hero
↓
Start Game
↓
Secondary Actions

============================================================
83 — FINAL QA REQUIREMENT
============================================================

Do not consider this task complete merely because the screens look correct.

Actually test:

STATE
+
DATA
+
INTERACTION
+
NAVIGATION
+
PERSISTENCE
+
PERFORMANCE
+
RESPONSIVENESS

Test:

New Player
Returning Player
Incomplete Profile
Complete Profile
Character Change
Name Change
Refresh
Browser Reopen
Data Reset
Multiple Local Players
Mobile
Desktop
Reduced Motion
Slow Loading
Error
Recovery

Fix every issue discovered.

Only then consider the implementation complete.

============================================================
FINAL PRINCIPLE

HOME = PLAY

PROFILE = IDENTITY

CHARACTER = PERSONALITY

GAME NAME = PLAYER IDENTITY

LOCAL PLAYER ID = TECHNICAL IDENTITY

INDEXEDDB = PERSISTENT PROFILE

CACHE = APPLICATION ASSETS

START GAME = FAST ENTRY

FIRST TIME = SETUP

RETURNING USER = PLAY IMMEDIATELY

NO REPETITION
NO CLUTTER
NO DATA MIXING
NO DEAD ENDS
============================================================