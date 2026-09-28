حتماً. این پرامپت را مستقیم به **Lovable / Figma Make / Claude Code** بده. طوری نوشته شده که فقط ظاهر نسازد، بلکه **صفحه انتخاب بازی را در همان Design Language تصاویر انتخاب آواتار** طراحی و پیاده‌سازی کند.

### Prompt — Game Selection Page

```text
Design and implement a premium, highly engaging Persian RTL “Game Selection” page for a fantasy social gaming platform.

IMPORTANT:
The existing Avatar Selection screens are the main visual reference and MUST be preserved as the source of truth for the visual language.

The new Game Selection page must feel like the exact next step after Avatar Selection — same world, same characters, same visual identity, same lighting, same color system, same illustration style, same UI language.

Do NOT create a generic gaming dashboard.
Do NOT use a generic SaaS layout.
Do NOT make it look like a web admin panel.

It should feel like entering a magical fantasy game world.

==================================================
1. VISUAL DIRECTION
==================================================

Use the uploaded Avatar Selection screens as the primary visual reference.

Match:

- Dark fantasy background
- Deep navy / midnight blue surfaces
- Purple and electric blue gradients
- Warm orange/golden ambient lighting
- Glowing lanterns
- Magical particles
- Soft atmospheric blur
- Rounded glassmorphism panels
- Thin glowing borders
- Large colorful 3D/chibi fantasy characters
- Soft shadows
- Purple glowing CTA buttons
- High-quality fantasy game illustration
- Playful but premium visual style

The UI should feel:

Magical
Premium
Playful
Social
Immersive
Modern
Friendly
Fast

Avoid:
- excessive visual noise
- too many gradients
- excessive neon
- generic gaming UI
- flat corporate cards
- excessive text
- huge empty areas
- overly complicated navigation

==================================================
2. PAGE PURPOSE
==================================================

This page is the central “Choose Your Game” screen.

The user has already:

1. Entered the platform
2. Selected an avatar
3. Arrived at the Game Selection page

Therefore the selected avatar should remain visible throughout the page and establish continuity with the previous screen.

The page should communicate:

“حالا وقتشه بازی‌ات رو انتخاب کنی!”

==================================================
3. PAGE HEADER
==================================================

Top section:

Right side:

- User avatar
- Username
- Level
- Small progress indicator
- Optional coin/XP indicator

Example:

کاربر مهمان
سطح ۱

The selected avatar must be the SAME avatar selected in the previous screen.

Center:

Large title:

«انتخاب بازی»

Subtitle:

«یک بازی انتخاب کن و وارد ماجراجویی شو!»

Add a small playful game-controller icon.

Left side:

- Back button
- Home button if appropriate

Buttons should use the same circular glass style as the Avatar Selection screen.

==================================================
4. MAIN CATEGORY TABS
==================================================

Create TWO large tabs directly below the header.

Tab 1:

🎮 بازی‌های عمومی

Tab 2:

👑 بازی‌های بهسازی

Use Persian RTL.

The selected tab should have:

- Purple → blue gradient
- Soft glow
- Bright icon
- Slight elevation
- Animated active indicator

Inactive tab:

- Dark glass surface
- Subtle border
- Lower opacity

Add a smooth animated transition when switching tabs.

The selected tab should visually feel “alive”.

Do NOT use browser-default tabs.

==================================================
5. GAME LIST
==================================================

Games must be presented as a LIST / CARD LIST rather than a simple grid.

Each game item should be a large premium horizontal card.

Desktop:

Image on the RIGHT.

Content in the CENTER/LEFT.

CTA on the LEFT.

Mobile:

Convert naturally into a vertical card.

Each game card contains:

1. Game illustration
2. Game name
3. Short Persian description
4. Difficulty
5. Number of players
6. Estimated duration
7. Optional category/tag
8. Primary “شروع بازی” button

Example:

بازی:
«قلعه افسانه‌ای»

Description:
«از قلعه محافظت کن و با حل چالش‌ها امتیاز بگیر.»

Metadata:

👥 ۲–۴ نفر
🔥 متوسط
⏱ ۵–۱۰ دقیقه

CTA:

«شروع بازی →»

==================================================
6. GAME CARD VISUAL DESIGN
==================================================

Each card should feel like an object inside the fantasy world.

Use:

- Dark translucent background
- 1px glowing border
- 18–28px border radius
- Soft shadow
- Subtle inner highlight
- Large illustrated character/game scene
- Gradient image fade into card background
- Purple/blue glow around important elements

On hover:

- Card moves upward 4–6px
- Image slightly scales
- Border becomes brighter
- Background glow increases
- CTA becomes brighter
- Tiny magical particles appear
- Transition must be smooth

Duration:

250–350ms

Use transform and opacity for performant animations.

Avoid expensive layout animations.

==================================================
7. GAME ILLUSTRATIONS
==================================================

Every game must have its own fantasy illustration.

Keep EXACTLY the same visual universe as the Avatar Selection screen.

Use:

- cute 3D chibi characters
- fantasy castle
- wizard
- king
- queen
- knight
- magical forest
- treasure
- dragons
- glowing crystals
- magical portals

But do NOT overcrowd the cards.

Each image should communicate the game's concept immediately.

Images should look like professionally produced mobile game artwork.

==================================================
8. EXAMPLE GAMES
==================================================

Create sample content such as:

1.
عنوان:
«قلعه افسانه‌ای»

توضیح:
«از قلعه محافظت کن و با حل چالش‌ها امتیاز بگیر.»

سطح:
سخت

بازیکن:
۲–۴ نفر

زمان:
۵–۱۰ دقیقه


2.
عنوان:
«جادوگر کوچک»

توضیح:
«با حل معماها و چالش‌های جادویی امتیاز جمع کن.»

سطح:
متوسط

بازیکن:
۱–۲ نفر

زمان:
۳–۷ دقیقه


3.
عنوان:
«ماجراجوی برفی»

توضیح:
«در سرزمین برفی مسیرت را پیدا کن و گنج‌های پنهان را کشف کن.»

سطح:
متوسط

بازیکن:
۱–۳ نفر

زمان:
۵–۱۰ دقیقه


4.
عنوان:
«سفر به فضا»

توضیح:
«به کهکشان‌ها سفر کن، ستاره‌ها را جمع کن و رکورد بزن.»

سطح:
متوسط

بازیکن:
۱–۴ نفر

زمان:
۵ دقیقه


5.
عنوان:
«راز جنگل جادویی»

توضیح:
«در جنگل جادویی قدم بزن و رازهای پنهان را کشف کن.»

==================================================
9. SECOND TAB — بازی‌های بهسازی
==================================================

The second tab must feel slightly more special and premium.

Use:

👑 بازی‌های بهسازی

These games should communicate:

- progression
- skill development
- challenge
- learning
- improvement
- rewards
- XP

Add a small explanatory label:

«بازی‌هایی برای تقویت مهارت و رشد امتیاز شما»

Each game can have:

⭐ XP Reward
🏆 رکورد
🔥 Streak
🎯 Skill

Example:

«چالش سرعت ذهن»

«با حل سریع چالش‌ها، سرعت تصمیم‌گیری خودت را محک بزن.»

Rewards:

+120 XP

==================================================
10. EMPTY / LOCKED STATES
==================================================

Create polished states for:

No games available

Locked game

Coming soon

Completed game

Already played

Example:

«به‌زودی باز می‌شود»

with a small magical lock illustration.

Do NOT make empty states boring.

==================================================
11. MICRO INTERACTIONS
==================================================

Add subtle animations.

Page entrance:

- Background fades in
- Header slides upward
- Tabs fade/slide
- Cards appear sequentially

Card hover:

- image scale 1.04
- glow
- elevation

Button hover:

- slight scale
- glow

Tab change:

- active indicator slides smoothly
- game list fades/slides

When clicking “شروع بازی”:

- button compresses slightly
- magical glow expands
- card transitions into the game screen

Use Framer Motion if already available in the project.

Otherwise use performant CSS transitions.

IMPORTANT:
Do not animate large layout properties such as width/height/top/left when transform/opacity can be used.

==================================================
12. BACKGROUND
==================================================

Do not use a flat background.

Create a subtle fantasy environment:

- dark blue magical sky
- distant castle silhouettes
- warm windows
- lanterns
- subtle stars
- floating particles
- atmospheric fog
- soft purple/blue glow

Keep the background visually rich but low contrast so the UI remains readable.

Use layered background effects.

Do NOT overload the page.

==================================================
13. RESPONSIVE DESIGN
==================================================

Desktop:

1440×900 reference.

Game cards should be horizontal.

Tablet:

Cards become slightly more compact.

Mobile:

390×844 reference.

Everything must become a vertical flow.

Header:

Avatar + username compact.

Tabs:

Full width segmented control.

Cards:

Vertical.

Image:

Top.

Content:

Below image.

CTA:

Full width.

Touch targets:

minimum 44×44px.

No horizontal scrolling.

Respect:

safe-area-inset-top
safe-area-inset-bottom

for iOS.

==================================================
14. MOBILE UX
==================================================

Mobile is NOT just a scaled desktop version.

Design specifically for touch.

Use:

- large touch targets
- thumb-friendly CTA
- clear hierarchy
- compact metadata
- readable Persian typography
- no tiny text
- no accidental interactions

The main CTA should always be easy to reach.

==================================================
15. TYPOGRAPHY
==================================================

Use the same Persian font system as the existing Avatar Selection screens.

Maintain:

- Persian RTL
- correct numerals
- proper line height
- strong heading hierarchy

Recommended hierarchy:

Page title:
28–36px

Section title:
20–24px

Game title:
18–22px

Description:
13–15px

Metadata:
12–13px

CTA:
14–16px

Do not use excessive font weights.

==================================================
16. DESIGN SYSTEM
==================================================

Create reusable components:

GameSelectionPage
GameTabs
GameList
GameCard
GameImage
GameMetadata
GameDifficulty
GamePlayers
GameDuration
GameCTA
LockedGameCard
EmptyGameState
UserMiniProfile

Do NOT duplicate UI code.

Use reusable data-driven game cards.

Example architecture:

games = [
  {
    id,
    title,
    description,
    image,
    category,
    difficulty,
    players,
    duration,
    xp,
    status
  }
]

Tabs should filter the same data model.

==================================================
17. PERFORMANCE
==================================================

This is very important.

The page must feel extremely fast.

Optimize:

- images
- fonts
- animations
- JS
- bundle
- rendering
- network requests

Use:

WebP / AVIF where supported.

Use:

loading="lazy"

for non-critical images.

Use:

decoding="async"

where appropriate.

Do NOT lazy-load the first visible hero/game image if it harms LCP.

Avoid loading all game artwork immediately if the list is long.

Use browser-native image loading and caching wherever possible.

Use GPU-friendly animations:

transform
opacity

Avoid unnecessary:

box-shadow animation
filter animation
layout animation

Do not introduce a heavy animation library if the project doesn't already use one.

==================================================
18. ACCESSIBILITY
==================================================

Support:

- keyboard navigation
- focus states
- readable contrast
- aria-label
- semantic buttons
- reduced motion

Respect:

prefers-reduced-motion

When reduced motion is enabled:

- disable floating particles
- reduce transitions
- remove large entrance animations

==================================================
19. PERSIAN RTL
==================================================

The entire page must be RTL.

Pay special attention to:

- icon positioning
- arrows
- metadata
- image placement
- card direction
- text alignment
- animations
- navigation

Use CSS logical properties whenever possible.

Do not simply mirror an LTR design.

==================================================
20. CONTINUITY WITH AVATAR SELECTION
==================================================

This is one of the most important requirements.

The user should immediately feel:

“I am still inside the same game world.”

Therefore reuse:

- avatar artwork
- background style
- lighting
- purple/blue palette
- card style
- button style
- border treatment
- icon style
- typography
- magical particles
- character proportions

The Game Selection page must look like the next screen in the same product.

==================================================
21. UX FLOW
==================================================

Expected flow:

Avatar Selection
        ↓
Confirm Avatar
        ↓
Game Selection
        ↓
Choose Tab
        ↓
Browse Games
        ↓
Select Game
        ↓
Game Detail / Lobby
        ↓
Start Game

The transition between Avatar Selection and Game Selection should feel natural.

==================================================
22. IMPORTANT VISUAL PRIORITY
==================================================

Hierarchy should be:

1. Page title
2. Two game categories
3. Game artwork
4. Game title
5. Description
6. Important metadata
7. Start button

Do not allow decorative elements to overpower the games.

==================================================
23. FINAL RESULT
==================================================

The final result should feel like:

A premium Persian fantasy social-game platform.

Not:

A dashboard.
Not:
A generic card grid.
Not:
A template.
Not:
A basic CRUD interface.

It should feel:

✨ Magical
🎮 Playful
👑 Premium
🧙 Character-driven
🌌 Immersive
⚡ Fast
📱 Mobile-first
🇮🇷 Persian RTL

Use the provided Avatar Selection screens as the visual source of truth.

First analyze the existing design system and components.

Then implement the Game Selection page consistently with it.

Do not replace existing avatar-selection UI.

Do not redesign unrelated pages.

Only introduce new reusable components and styles required for the Game Selection experience.
```
