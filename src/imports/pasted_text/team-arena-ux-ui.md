============================================================
TEAM ARENA — HOME + PROFILE UX/UI REDESIGN
PREMIUM MOBILE-FIRST EXPERIENCE
============================================================

IMPORTANT:
Use the CURRENT Figma Make project as the source of truth.

Do NOT redesign the entire application.

Do NOT change unrelated pages, games, game logic, data models, authentication, or Admin functionality.

Focus specifically on:

1. HOME / LANDING PAGE
2. PROFILE PAGE
3. PROFILE AVATAR SYSTEM
4. START GAME INTERACTION
5. PROFILE STATUS / PROGRESSION
6. CHARACTER SELECTION EXPERIENCE

The goal is to make the experience:

MORE MINIMAL
MORE PREMIUM
MORE ORGANIZED
MORE FUNCTIONAL
LESS CROWDED
EASIER TO UNDERSTAND
MORE GAME-LIKE
MORE PERSONAL
AND MORE MOBILE-FRIENDLY.

Use the two provided reference screenshots as visual/UX references.

Do NOT blindly copy them.

============================================================
01 — MAIN HOME PAGE
============================================================

The current home page contains too much information competing for attention.

The current structure includes:

- profile/game icon in top corner
- logo
- title
- large hero artwork
- player/avatar area
- profile status
- level / XP
- main CTA
- online game
- single-player game
- leaderboard
- how to play
- other information

This creates visual density.

Redesign the information architecture so the Home page has a much clearer hierarchy.

The primary objective of the Home page should be:

START PLAYING

Everything else should support this goal.

============================================================
02 — HOME PAGE INFORMATION HIERARCHY
============================================================

Create this hierarchy:

LEVEL 1 — Identity
Profile Avatar

LEVEL 2 — Game Brand / Hero

LEVEL 3 — Primary CTA
«شروع بازی»

LEVEL 4 — Game Mode Selection
Online / Single Player

LEVEL 5 — Secondary content
Leaderboard / How to play / other features

Do NOT display all secondary information at the same visual weight.

The user should immediately understand:

Who am I?
↓
What can I do?
↓
How do I start?

============================================================
03 — PROFILE AVATAR IN HOME HEADER
============================================================

IMPORTANT:

Replace the current Gamepad icon in the top corner of the Home page with the user's selected PROFILE AVATAR.

CURRENT:
🎮 Gamepad icon

NEW:
Selected user avatar

The avatar must be connected to the actual selected character in the Profile page.

If the user changes their character:

Home page avatar must automatically update.

Do NOT use a separate static image.

============================================================
04 — AVATAR PRESENTATION
============================================================

The avatar in the Home header should be:

Small
Circular
Premium
Recognizable
Interactive

Use:

- circular mask
- subtle border
- subtle depth
- small glow
- selected-character image

Behind the avatar create a subtle animated light.

Concept:

AVATAR
+
SOFT AURA
+
LIGHT GLOW
+
SUBTLE PULSE

The light should slowly radiate behind the avatar.

Animation should be:

subtle
premium
continuous
low distraction

Avoid an aggressive flashing effect.

The avatar should attract attention without becoming the main visual element of the Home page.

============================================================
05 — AVATAR MICRO-INTERACTION
============================================================

When user taps the avatar:

Navigate to:

PROFILE

Add a subtle interaction:

- scale
- glow
- transition

Do not open an unnecessary popup.

The avatar should feel like a gateway to the user's identity.

============================================================
06 — HOME HERO REDESIGN
============================================================

Keep the existing Team Arena visual identity and character artwork.

However:

Reduce visual clutter.

The hero should have one dominant visual focal point.

Do not allow:

logo
title
characters
profile status
XP
buttons
leaderboard

to compete equally.

Create clear spacing between:

Brand
Hero
CTA

Use depth and gradients instead of adding more UI elements.

============================================================
07 — HOME PRIMARY CTA
============================================================

The most important button on Home should be:

«شروع بازی»

Make it visually dominant.

Use the existing visual language.

The button should have:

- strong hierarchy
- clear icon
- touch-friendly size
- subtle hover/press animation
- loading state
- disabled state if necessary

Do NOT place too many competing primary buttons around it.

============================================================
08 — START GAME INTERACTION
============================================================

When the user taps:

«شروع بازی»

DO NOT immediately navigate away.

Instead show a:

BOTTOM SHEET

or

COMPACT GAME MODE SELECTION PANEL

The panel should contain exactly two primary choices:

🎮 بازی آنلاین

and

🧩 بازی تک‌نفره

============================================================
09 — ONLINE GAME BOTTOM SHEET
============================================================

When selecting:

🎮 بازی آنلاین

Show:

بازی آنلاین

Short explanation:

«با هم‌تیمی‌ها بازی کن و رقابت کن.»

Then:

- بازی سریع
- انتخاب بازی
- پیوستن به بازی / ساخت بازی

Use the existing Team Arena game flow where applicable.

Do NOT create a parallel game architecture.

Reuse the existing online game flow.

============================================================
10 — SINGLE PLAYER BOTTOM SHEET
============================================================

When selecting:

🧩 بازی تک‌نفره

Show:

بازی تک‌نفره

Short explanation:

«تنهایی تمرین کن، امتیاز بگیر و مهارتت را بالا ببر.»

Then navigate to the existing single-player game experience if it already exists.

If it does not exist:

Create only the required entry state.

Do NOT invent unrelated game mechanics.

============================================================
11 — BOTTOM SHEET UX
============================================================

The bottom sheet must:

- open smoothly
- have rounded top corners
- use backdrop
- support swipe down where appropriate
- close with X
- close when tapping backdrop where appropriate
- preserve page state
- work correctly on mobile
- respect safe areas

Animation:

Fast
Smooth
Premium

Do not make the interaction slow.

============================================================
12 — HOME SECONDARY CONTENT
============================================================

Reduce the number of permanently visible sections on Home.

Do NOT show every feature simultaneously.

Secondary features should be:

compact cards
quick actions
or secondary navigation.

For example:

🏆 جدول امتیازات
❓ چطور بازی کنیم؟
🎯 ماموریت‌ها

These should have lower visual priority than:

شروع بازی

============================================================
13 — PROFILE PAGE REDESIGN
============================================================

Completely rethink the current Profile page information architecture.

The current page is too dense.

The goal:

Identity first
Progress second
Navigation third
Customization fourth

The Profile page should feel like:

«اتاق شخصیت کاربر»

not a dashboard full of unrelated cards.

============================================================
14 — PROFILE HEADER
============================================================

Create a premium Profile Hero section.

At the top show:

Selected Character

FULL BODY

not only the head/avatar.

The selected character should be displayed:

large
centered
full-height
visually dominant

The character must feel like the user's identity inside the game.

============================================================
15 — FULL-BODY CHARACTER
============================================================

Use the user's currently selected character asset.

Display the character as a full-body figure.

IMPORTANT:

Do NOT require a 3D model.

Use the existing 2D character artwork.

Create a premium presentation using:

- transparent/clean cutout if available
- soft background glow
- subtle shadow
- aura
- depth
- gradient
- particles where appropriate
- subtle idle animation

Possible animation:

slow floating
very subtle scale/breathing effect
light passing behind character

Do NOT fake skeletal 3D animation.

If only a static image exists, use subtle CSS/UI animation.

============================================================
16 — CHARACTER STAGE
============================================================

Create a dedicated character stage.

Structure:

       ✨
   [FULL CHARACTER]
       ✨

Below:

Character Name
Level
Title / Rank

Example:

👑 پرنسس آریا

Level 12

«بازیکن حرفه‌ای»

The character should visually dominate the upper portion of the Profile page.

============================================================
17 — CHARACTER CAROUSEL
============================================================

Character selection must NOT be displayed as a dense grid.

Replace the current character grid with:

HORIZONTAL CAROUSEL

The selected character appears:

LARGER
CENTERED
PROMINENT

Adjacent characters appear:

smaller
partially visible
lower emphasis

This creates a clear carousel affordance.

Example:

        [previous]
             ↓
     [ CHARACTER ]
        SELECTED
             ↓
        [next]

Show partial previews of neighboring characters.

============================================================
18 — CHARACTER CAROUSEL INTERACTION
============================================================

Support:

Swipe left
Swipe right
Tap neighboring character
Previous
Next

When character changes:

- animate transition
- update selected state
- update avatar
- update Home header avatar
- preserve selection

The selected character should have:

glow
border
scale
selected indicator

============================================================
19 — LOCKED CHARACTERS
============================================================

Locked characters should remain visually discoverable.

Show:

🔒

and a concise reason:

Level 10
Achievement
Special event
etc.

Do not make locked characters visually dominant.

Avoid large amounts of text.

============================================================
20 — PROFILE TABS
============================================================

Move these tabs to the TOP of the Profile content:

شخصیت
ماموریت‌ها
افتخارات
آمار

These are the four main Profile sections.

Recommended order:

شخصیت
ماموریت‌ها
افتخارات
آمار

The tabs must appear directly below the Profile identity/header area.

They should be:

compact
clear
horizontal
touch-friendly

The active tab should use the existing purple accent.

============================================================
21 — PROFILE TAB BEHAVIOR
============================================================

When user selects:

شخصیت

Show:

- selected full-body character
- character carousel
- available characters
- locked characters
- frames
- aura
- title
- customization

When user selects:

ماموریت‌ها

Show:

- active missions
- completed missions
- progress
- reward
- claim button

When user selects:

افتخارات

Show:

- achievements
- unlocked
- locked
- progress
- rarity

When user selects:

آمار

Show:

- matches
- wins
- losses
- win rate
- score
- XP
- streak
- best score
- games played

Do NOT mix all four categories into one long page.

============================================================
22 — PROFILE STATUS BAR
============================================================

Move the user's main progression/status information INTO the Profile page.

The Home page should not carry the entire status dashboard.

Create a compact Profile Status Bar.

Show:

Level
XP
Progress
Rank
Win rate
Streak

Example:

Level 12

████████░░  720 / 1000 XP

🏆 بازیکن حرفه‌ای

🔥 5 برد متوالی

Do not overload it.

The most important information should be visible first.

============================================================
23 — XP BAR
============================================================

Create a clean XP progression bar.

Show:

Level 12

720 / 1000 XP

Progress bar

Next level:

Level 13

The XP bar should be visually clear.

Do not use tiny text.

============================================================
24 — PROFILE STATS
============================================================

Use a compact statistics system.

Instead of many large cards:

Create a clean grid or horizontal statistic row.

Example:

بازی‌ها      بردها       نرخ برد       امتیاز

128           74          58%           12,450

Keep cards small and readable.

Avoid excessive borders.

============================================================
25 — PROFILE VISUAL HIERARCHY
============================================================

Profile hierarchy:

1. Full-body character
2. Character identity
3. Level / XP
4. Profile tabs
5. Tab content
6. Secondary customization

Do NOT show every metric at the top.

============================================================
26 — REMOVE PROFILE CLUTTER
============================================================

Remove or consolidate:

- duplicated XP
- duplicated level
- duplicated avatar
- excessive statistic cards
- unnecessary borders
- repeated labels
- oversized empty areas
- redundant information

Every element must answer:

«Why does the user need this here?»

If not:

Remove it or move it into the appropriate tab.

============================================================
27 — CHARACTER CUSTOMIZATION
============================================================

Inside:

شخصیت

organize customization into clear sections:

شخصیت‌ها
قاب‌ها
هاله‌ها
عنوان‌ها

Do not show all customization options simultaneously if they create clutter.

Use compact horizontal sections or secondary tabs where necessary.

============================================================
28 — HOME ↔ PROFILE DATA CONNECTION
============================================================

The following must be shared state:

selectedCharacter
avatar
level
XP
rank
streak
stats

If the user changes:

Character

then:

Profile character updates
+
Home avatar updates
+
Any relevant game identity updates

Do not duplicate this data in multiple independent states.

============================================================
29 — HOME HEADER
============================================================

Redesign the Home header.

Current:

Gamepad icon
Shield icon
other controls

Replace the Gamepad profile entry with:

USER AVATAR

Keep other important controls only if they are actually necessary.

Do not overload the header.

Recommended structure:

[Profile Avatar]          [Essential Action]

Do not add more icons merely because there is available space.

============================================================
30 — HOME HEADER AVATAR ANIMATION
============================================================

Create a subtle animated aura:

Avatar
↓
soft circular glow
↓
slow light sweep
↓
fade
↓
repeat

Animation duration:

approximately 2–4 seconds

Use easing.

No flashing.

No aggressive pulse.

Respect:

prefers-reduced-motion

When reduced motion is enabled:

remove continuous animation and keep only a static glow.

============================================================
31 — HOME MINIMALIZATION
============================================================

Reduce visible content on Home by approximately:

30–40%

Do NOT remove functionality.

Move secondary functionality to:

Profile
Game selection
Secondary cards
Navigation
Bottom sheets

The Home page should feel breathable.

============================================================
32 — PRIMARY HOME STRUCTURE
============================================================

Use this general structure:

HEADER
↓
Brand / Hero
↓
Main Character / Visual
↓
START GAME
↓
Secondary Actions
↓
Minimal supporting content

Do not place:

Leaderboard
How to play
Profile stats
Achievements
Missions
Full player status

all simultaneously above the fold.

============================================================
33 — LEADERBOARD
============================================================

Move:

«جدول امتیازات همکاران»

away from the primary CTA area.

Keep it as a secondary action/card.

Example:

🏆 جدول امتیازات
«رتبه خودت را ببین»

Tap:

Open leaderboard page/sheet.

This prevents the Home page from becoming a dashboard.

============================================================
34 — HOW TO PLAY
============================================================

Move:

«چطور بازی کنیم؟»

to a secondary action.

Do not give it equal visual weight to:

شروع بازی

Use a compact link/button.

============================================================
35 — PROFILE TRANSITION
============================================================

When tapping the avatar:

Create a smooth transition:

Home Avatar
→
Profile Hero

Use the same character image where possible to create continuity.

The user should feel that the avatar expands into their profile identity.

============================================================
36 — PROFILE MOBILE LAYOUT
============================================================

Profile must be optimized specifically for mobile.

Avoid:

- excessive vertical scrolling
- giant cards
- dense grids
- tiny labels
- horizontal overflow
- multiple competing sections

The full-body character should occupy the upper visual area without consuming the entire screen.

Tabs should remain easily reachable.

============================================================
37 — PROFILE DESKTOP LAYOUT
============================================================

On larger screens:

Use a two-column composition where appropriate.

Left / Center:

Character stage

Right:

Profile status
Level
XP
Rank
Quick stats

Then:

Tabs

Do not simply stretch the mobile layout.

============================================================
38 — EMPTY / LOCKED STATES
============================================================

For:

No achievements
No missions
No statistics
No unlocked characters

show useful empty states.

Example:

«هنوز افتخاری باز نکردی»

«با بازی کردن اولین افتخارت را به دست بیاور.»

Keep them concise.

============================================================
39 — INTERACTION QUALITY
============================================================

Every interactive component must have:

Default
Hover
Pressed
Selected
Disabled
Loading
Error

where applicable.

Character cards:

Default
Selected
Locked
Pressed

Tabs:

Default
Active
Pressed

Start button:

Default
Pressed
Loading
Disabled

============================================================
40 — ACCESSIBILITY
============================================================

Ensure:

- readable text
- sufficient contrast
- touch targets
- keyboard navigation where applicable
- focus states
- reduced motion
- status not communicated only through color

Do not rely solely on glow to indicate selection.

============================================================
41 — PERFORMANCE
============================================================

Do not let the new animations or character assets negatively impact performance.

Optimize:

- avatar images
- character images
- glow effects
- particles
- carousel rendering
- animations

Avoid unnecessary animation loops.

Use efficient CSS transforms where possible.

Lazy-load characters that are not immediately visible.

============================================================
42 — DATA ARCHITECTURE
============================================================

Use a centralized user profile model.

Example:

UserProfile:

id
selectedCharacter
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

Do NOT duplicate profile state independently across Home and Profile.

============================================================
43 — CHARACTER DATA
============================================================

Character model:

id
name
image
fullBodyImage
avatarImage
rarity
unlocked
unlockCondition
title
frame
aura
active

If fullBodyImage is not available:

Use the existing character image and create the best possible 2D presentation.

Do NOT pretend the character is a real 3D model.

============================================================
44 — DO NOT CHANGE GAME LOGIC
============================================================

This redesign must NOT break:

- existing games
- online gameplay
- single-player gameplay
- waiting room
- player joining
- team assignment
- scoring
- leaderboard
- achievements
- missions
- Admin

Only improve the presentation and information architecture.

============================================================
45 — RESPONSIVE QA
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

- header
- avatar
- character stage
- carousel
- tabs
- bottom sheet
- CTA
- status bar

No clipping.

No horizontal scroll.

No overlapping.

============================================================
46 — FINAL UX ACCEPTANCE TEST
============================================================

Test this exact journey:

HOME
↓
See user's avatar
↓
Avatar has subtle animated aura
↓
Tap avatar
↓
PROFILE
↓
See full-body selected character
↓
See Level + XP + Rank
↓
See tabs:

شخصیت | ماموریت‌ها | افتخارات | آمار

↓
Swipe character carousel
↓
Select another character
↓
Character updates
↓
Return Home
↓
Header avatar updates
↓
Tap «شروع بازی»
↓
Bottom Sheet opens
↓
Choose:

بازی آنلاین
OR
بازی تک‌نفره

↓
Enter correct existing game flow

No dead ends.

============================================================
47 — FINAL DESIGN PRINCIPLE
============================================================

The Home page is NOT the Profile page.

HOME = PLAY

PROFILE = IDENTITY + PROGRESSION

GAME SELECTION = CHOICE

ADMIN = MANAGEMENT

Keep these responsibilities separate.

Home should answer:

«الان چه کار کنم؟»

Profile should answer:

«من کی هستم و چقدر پیشرفت کرده‌ام؟»

Game Selection should answer:

«چه نوع بازی می‌خواهم انجام بدهم؟»

============================================================
48 — FINAL IMPLEMENTATION RULE
============================================================

Do not simply move existing cards around.

Re-evaluate the information architecture.

Remove unnecessary duplication.

Create a clean hierarchy.

Preserve the current Team Arena visual identity while making the experience feel:

Premium
Minimal
Modern
Game-like
Personal
Fast
Clear

============================================================
49 — FINAL QA
============================================================

After implementation test:

✓ Home
✓ Profile
✓ Avatar
✓ Avatar animation
✓ Full-body character
✓ Character carousel
✓ Character selection
✓ Locked characters
✓ Level
✓ XP
✓ Rank
✓ Stats
✓ Missions
✓ Achievements
✓ Profile tabs
✓ Start Game
✓ Online bottom sheet
✓ Single-player bottom sheet
✓ Existing game routing
✓ Back navigation
✓ Mobile
✓ Desktop
✓ Accessibility
✓ Reduced motion
✓ Loading states
✓ Error states
✓ State persistence
✓ Home/Profile synchronization
✓ Performance

Fix all discovered issues.

Do not finish with broken interactions.

============================================================
FINAL RESULT
============================================================

The final experience should feel like a polished game platform:

HOME:
Minimal + cinematic + focused on PLAY

PROFILE:
Personal + character-focused + progression-driven

CHARACTER:
Full-body + collectible + customizable

AVATAR:
Personal identity + animated premium aura

START GAME:
One clear CTA → simple mode choice

PROFILE TABS:
شخصیت | ماموریت‌ها | افتخارات | آمار

The result must be significantly cleaner and more usable than the current implementation while preserving the existing Team Arena identity and functionality.