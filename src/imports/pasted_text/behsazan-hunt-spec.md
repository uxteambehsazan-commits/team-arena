حتماً. این نسخه را طوری تنظیم کردم که **مستقیماً در Figma Make کپی** کنی و کل بازی «شکار بهسازانی» را با اطلاعات جدید سه ساختمان، سیستم سرنخ، نقش‌ها، امتیازدهی، اطلس، Admin و تمام تعاملات پیاده‌سازی کند.

```text
PROJECT: شکار بهسازانی | Behsazan Hunt
PRODUCT: Team Arena / میدان هم‌تیمی‌ها
PLATFORM: Responsive Web App
SOURCE OF TRUTH: Current Figma Make project

==================================================
1. CORE OBJECTIVE
==================================================

Create a premium, highly engaging digital team game called:

«شکار بهسازانی»

The game is an organizational-memory + deduction + team discussion game based on REAL internal characteristics of Behsazan buildings.

IMPORTANT:
This is 100% DIGITAL.

Players DO NOT physically hide.
Players DO NOT physically move through buildings.
No GPS.
No location tracking.
No real-world navigation.

Instead:

One player becomes the HIDER.
Other players become SEARCHERS.

The HIDER receives a secret digital location inside one of Behsazan buildings.

SEARCHERS receive progressive clues and must identify:

1. Which building?
2. Which floor?
3. Which area/unit/location?

The goal is to create strong:

Recognition → Deduction → Discussion → Tension → AHA Moment → Reveal → Reward

==================================================
2. DO NOT REDESIGN THE EXISTING PRODUCT
==================================================

Use the CURRENT Figma Make project as the source of truth.

Do NOT redesign unrelated pages.

Preserve:
- existing visual language
- existing navigation
- existing components
- existing typography
- existing spacing system
- existing responsive behavior
- existing Team Arena architecture
- existing authentication
- existing player profile
- existing admin environment

Only introduce or modify the screens/components necessary for:

«شکار بهسازانی»

The new game must feel like a native part of Team Arena.

==================================================
3. GAME ENTRY
==================================================

The game must live inside:

میدان هم‌تیمی‌ها
→ بازی‌های بهسازانی
→ شکار بهسازانی

Do NOT show the old generic physical «قایم‌باشک» concept.

The public game card should communicate:

🎯 شکار بهسازانی

Short description:

«با سرنخ‌ها حدس بزن کجای بهسازان است!»

Game card should show:
- game icon
- difficulty
- player count
- estimated duration
- status
- short description
- play button

Possible status:
🟢 آماده بازی
🛠 در حال بهبود
🟠 نگهداری موقت
🔵 به‌زودی

IMPORTANT:
«در حال بهبود» does NOT automatically disable the game.

Use a separate playable flag.

==================================================
4. GAME MODES
==================================================

Create multiple modes:

1. کلاسیک
2. سرعتی
3. حافظه بهسازانی
4. استاد بهسازانی
5. سه‌ساختمانه
6. سورپرایز

Default:

کلاسیک

Each mode changes:
- number of clues
- timer
- scoring
- difficulty
- available abilities
- location selection logic

==================================================
5. BUILDING KNOWLEDGE DATABASE
==================================================

Create a centralized Building Knowledge Database.

Every location must have structured data:

Building
Floor
Unit
Location
Location Type
Description
Recognition Clues
Difficulty
Nickname
Fun Fact
Image
Audio Clue
Active/Inactive
Rare/Epic/Legendary
Discovery Status

DO NOT invent real-world facts.

Only use verified information supplied by the product owner or entered through Admin.

==================================================
6. REAL BEHSAZAN BUILDINGS
==================================================

Create exactly these three buildings:

1. ارم
2. شمسایی
3. مژگان

------------------------------------------
BUILDING: ارم
------------------------------------------

Known structure:

Location:
خیابان دولت

Structure:
- 2 underground parking levels
- 5 office floors
- rooftop restaurant / food area

IMPORTANT STRUCTURAL FACT:

Each office floor is:

1 UNIT ONLY

Therefore:

Floor 1 → 1 unit
Floor 2 → 1 unit
Floor 3 → 1 unit
Floor 4 → 1 unit
Floor 5 → 1 unit

Use this as a powerful recognition clue.

Example clue:

«در این ساختمان، هر طبقه فقط یک واحد دارد.»

This should strongly help distinguish Eram from Shamsayi and Mozhgan.

Do NOT invent additional distinctive locations unless added and verified through Admin.

------------------------------------------
BUILDING: شمسایی
------------------------------------------

Location:
خیابان دیباجی جنوبی
کوچه شمسایی

Known structure:

- 2 underground parking levels
- 9 floors above ground
- ground-floor food area
- rooftop prayer room

IMPORTANT STRUCTURAL FACT:

Each floor has:

4 UNITS

Therefore:

Floor 1 → 4 units
Floor 2 → 4 units
...
Floor 9 → 4 units

Known restroom structure:

EVEN FLOORS:
Women's restroom area
4 women's restrooms grouped together

ODD FLOORS:
Men's restroom area

This must become an important clue system.

Example:

«طبقه‌ای که دنبالش می‌گردی، زوج است و چهار سرویس بهداشتی در یک بخش دارد.»

Possible reasoning:

Building = Shamsayi
Floor type = Even
Location = Women's restroom area

------------------------------------------
BUILDING: مژگان
------------------------------------------

Known structure:

- 1 underground parking level
- motor house / technical area
- courtyard
- smoking room
- 5 office floors
- rooftop prayer room

IMPORTANT STRUCTURAL FACT:

Each floor has:

4 UNITS

Therefore:

Floor 1 → 4 units
Floor 2 → 4 units
Floor 3 → 4 units
Floor 4 → 4 units
Floor 5 → 4 units

SPECIAL FACTS:

Floor 1:
- 1 general meeting room
- 3 IT units

Therefore:

Floor 1 = 4 units total
including:
- 1 general meeting room
- 3 IT units

Parking -1:
- 2 restrooms

Courtyard:
- 3 electrical generators

Smoking room:
- recognizable special location

Rooftop:
- prayer room

These must be available as verified clues.

Example clue:

«در طبقه اول، سه واحد IT و یک اتاق جلسات عمومی وجود دارد.»

This should strongly identify:

مژگان → طبقه اول

Another clue:

«ساختمانی که در حیاط آن سه ژنراتور برق قرار دارد...»

→ مژگان

Another:

«مکان موردنظر جایی است که برای افراد سیگاری در نظر گرفته شده.»

→ مژگان / smoking room

==================================================
7. BUILDING DIFFERENTIATION SYSTEM
==================================================

This is one of the MOST IMPORTANT parts of the game.

The system should intelligently use structural differences between buildings.

Create a Building Recognition Engine.

Core distinctions:

ERAM:
1 unit per floor

SHAMSAEI:
4 units per floor

MOZHEGAN:
4 units per floor

Therefore, the system must combine multiple clues when two buildings share the same structural characteristic.

Example:

CLUE 1:
«این ساختمان در هر طبقه ۴ واحد دارد.»

Possible:
Shamsayi / Mozhegan

CLUE 2:
«طبقه اول شامل سه واحد IT و یک اتاق جلسات عمومی است.»

→ Mozhegan

This creates deduction rather than random guessing.

==================================================
8. CLUE ENGINE
==================================================

Build a progressive intelligent clue system.

Never reveal all information immediately.

Clues must be revealed gradually.

Clue categories:

1. Building clue
2. Floor clue
3. Unit-count clue
4. Structural clue
5. Function clue
6. Location clue
7. Count clue
8. Memory clue
9. Employee knowledge clue
10. Visual clue
11. Audio clue
12. Combination clue

Examples:

LEVEL 1:
«در این ساختمان، هر طبقه فقط یک واحد دارد.»

LEVEL 2:
«مکان موردنظر در یکی از پنج طبقه اداری است.»

LEVEL 3:
«طبقه موردنظر فقط یک واحد دارد.»

LEVEL 4:
Reveal visual / location card.

For Mozhegan:

LEVEL 1:
«در این ساختمان هر طبقه چهار واحد دارد.»

LEVEL 2:
«طبقه موردنظر در پنج طبقه اداری قرار دارد.»

LEVEL 3:
«در طبقه اول سه واحد IT وجود دارد.»

LEVEL 4:
«یک اتاق جلسات عمومی هم در همان طبقه قرار دارد.»

Final:
Reveal exact location.

==================================================
9. SMART CLUE COMBINATION
==================================================

Do not generate repetitive random clues.

The engine should select clues based on:

- current building
- current floor
- target location
- difficulty
- previous clues
- remaining time
- player knowledge
- number of wrong guesses

Example:

If target = Mozhegan / Floor 1 / General Meeting Room:

Possible progression:

1. ساختمان موردنظر پنج طبقه اداری دارد.
2. هر طبقه چهار واحد دارد.
3. طبقه اول با یک ویژگی خاص شناخته می‌شود.
4. سه واحد IT در این طبقه قرار دارد.
5. یک اتاق جلسات عمومی نیز در همین طبقه است.
6. Reveal.

==================================================
10. HIDER EXPERIENCE
==================================================

When the round starts:

HIDER sees:

🎭 شما مخفی‌شده هستید

Secret Location:

ساختمان: مژگان
طبقه: ۱
مکان: اتاق جلسات عمومی

HIDER must see the exact answer.

SEARCHERS must NOT see the answer.

Show HIDER:
- building
- floor
- location
- difficulty
- available deception abilities
- timer
- survival progress

==================================================
11. SEARCHER EXPERIENCE
==================================================

Searchers see:

🔎 شما پیدا‌کننده هستید

They do NOT see the exact location.

They see:

- timer
- current clues
- possible buildings
- possible floors
- eliminated locations
- team discussion
- guess button

==================================================
12. TEAM DISCUSSION
==================================================

Create a central discussion area.

Players can:

- discuss
- react
- select a candidate
- mark a clue as important
- eliminate an option
- vote

Create lightweight reactions:

🔥
🤔
👀
💡
😂
❌

Avoid turning the game into a full chat application.

The discussion UI must remain fast and focused.

==================================================
13. BUILDING SELECTION
==================================================

Searchers can initially select:

🏢 ارم
🏢 شمسایی
🏢 مژگان

Once a building is selected:

show its relevant floors.

Then:

floor selection.

Then:

location selection.

This creates:

Building → Floor → Location

==================================================
14. ELIMINATION BOARD
==================================================

Create an interactive deduction board.

Example:

BUILDINGS

☐ ارم
☑ شمسایی
☐ مژگان

FLOORS

☐ 1
☑ 2
☐ 3
☐ 4

LOCATIONS

❌ eliminated
❌ eliminated
❓ possible
🎯 selected

Players should visually understand:

«چه چیزهایی را رد کرده‌ایم؟»

==================================================
15. CONFIDENCE METER
==================================================

Before submitting final guess:

Show:

میزان اطمینان شما

Low
Medium
High

This is NOT merely cosmetic.

It can be used for optional risk/reward mechanics.

Example:

High confidence + correct:
bonus points

High confidence + wrong:
larger penalty

Keep this optional in Classic mode.

==================================================
16. SMART GUESS SYSTEM
==================================================

Players can submit:

Building only
Building + floor
Building + floor + location

The more precise the guess:

Higher reward.

Incorrect guesses:

Penalty.

Repeated random guessing:

Progressively less efficient.

==================================================
17. TIMER
==================================================

Every round has a visible timer.

Use:

- normal state
- warning state
- critical final seconds

Final 30 seconds:

Change the emotional atmosphere.

Show:

⚡ وقت داره تموم میشه!

Final 10 seconds:

Large countdown.

Do not make the UI overwhelming.

==================================================
18. HIDER ABILITIES
==================================================

Optional abilities:

1. 🌀 سرنخ مبهم
2. ⏳ تأخیر
3. 🎭 گمراه‌سازی
4. 🔒 قفل سرنخ

Use limited charges.

Do not create an unfair system.

Abilities must be clearly explained.

==================================================
19. SEARCHER ABILITIES
==================================================

Optional abilities:

1. دریافت سرنخ بعدی
2. حذف یک ساختمان
3. حذف یک طبقه
4. درخواست سرنخ ویژه

Abilities have limited usage.

==================================================
20. SURPRISE / AHA MOMENT
==================================================

The reveal is one of the most important moments.

When the correct answer is submitted:

Pause briefly.

Then show:

🎯 پیدا شد!

ساختمان:
مژگان

طبقه:
۱

مکان:
اتاق جلسات عمومی

Then animate:

- location card
- building identity
- floor
- special fact
- points
- player reactions

Example:

«سه واحد IT + یک اتاق جلسات عمومی»

→ «آهان! طبقه اول مژگان!»

This should create the signature AHA moment.

==================================================
21. LOCATION CARD
==================================================

Every discovered location should have a beautiful collectible card.

Example:

┌────────────────────────┐
│ 🏢 مژگان              │
│                        │
│ طبقه ۱                 │
│                        │
│ اتاق جلسات عمومی       │
│                        │
│ ⭐ درجه سختی: متوسط    │
│                        │
│ 3 واحد IT              │
│ +                      │
│ 1 اتاق جلسات عمومی     │
└────────────────────────┘

Add:

- rarity
- discovery date
- difficulty
- fun fact
- related clues

==================================================
22. ATLAS / اطلس بهسازان
==================================================

Create a permanent player collection:

«اطلس بهسازان»

Each player can collect discovered locations.

Example:

اطلس بهسازان

ارم
██████░░░░ 12/20

شمسایی
███████░░░ 18/25

مژگان
████░░░░░░ 9/18

Total:
39 / 63 locations discovered

Every discovered location becomes permanently collectible.

Show:

- building progress
- total discovered
- rare locations
- personal discovery history
- mastery percentage

==================================================
23. BUILDING MASTERY
==================================================

Each building has a mastery level.

Example:

مژگان
سطح 4
حافظه خوب

Progress:

████████░░

Unlock:

- badges
- frames
- titles
- visual effects
- special challenges

Do not make rewards pay-to-win.

==================================================
24. RARITY SYSTEM
==================================================

Locations can have:

COMMON
RARE
EPIC
LEGENDARY

Example:

⭐ Common
⭐⭐ Rare
⭐⭐⭐ Epic
👑 Legendary

Legendary locations should be difficult because of deduction difficulty, not randomness.

==================================================
25. ACHIEVEMENTS
==================================================

Create achievements:

🎯 شکارچی تازه‌کار
🧠 حافظه بهسازانی
🏢 سه‌ساختمانه
🔎 کارآگاه
⚡ حدس برق‌آسا
👑 استاد بهسازانی
🔥 شکارچی سرعتی
🗺️ اطلس‌گرد
🏆 متخصص مژگان
🏆 متخصص شمسایی
🏆 متخصص ارم

Each achievement has:

- locked state
- unlocked state
- progress
- reward

==================================================
26. PERSONAL PROGRESSION
==================================================

Player profile should include:

XP
Level
Matches
Wins
Losses
Win Rate
Current Streak
Best Streak
Total Guesses
Correct Guesses
Average Solve Time
Buildings Mastered
Locations Discovered
Achievements

==================================================
27. END OF MATCH
==================================================

After each round show:

نتیجه بازی

Winner
Score
Accuracy
Solve time
Clues used
Wrong guesses

Then:

🏆 بهترین عملکردها

Examples:

⚡ سریع‌ترین حدس
🧠 بهترین استدلال
🎯 دقیق‌ترین بازیکن
🔥 بیشترین مشارکت
🗺️ بیشترین شناخت ساختمان

Avoid ranking players based only on spending or arbitrary metrics.

==================================================
28. ROLE ROTATION
==================================================

After each round:

HIDER changes.

Do not let the same player always become HIDER.

Show:

«این بار نوبت ... است»

Use a short transition animation.

==================================================
29. REPLAYABILITY
==================================================

Do NOT repeatedly select the same location.

Selection engine should consider:

- previous locations
- player discovery history
- difficulty
- building
- game mode
- recent matches
- team composition

Prioritize locations not recently used.

==================================================
30. NEW PLAYER EXPERIENCE
==================================================

New players should not be overwhelmed.

First match:

Simple clues.

Example:

«ساختمانی که در هر طبقه فقط یک واحد دارد.»

Then gradually teach:

Building
→ Floor
→ Unit
→ Location

Add:

«چطور بازی کنیم؟»

with a 3-step explanation.

==================================================
31. LEARN WHILE PLAYING
==================================================

After each reveal:

Show a tiny knowledge card.

Example:

💡 می‌دانستی؟

«در ساختمان مژگان، هر طبقه ۴ واحد دارد و طبقه اول شامل ۳ واحد IT و یک اتاق جلسات عمومی است.»

This turns the game into:

بازی + شناخت سازمان

==================================================
32. EMPLOYEE MEMORY SYSTEM
==================================================

Admin can define:

- employee nickname
- internal name
- memorable location
- inside joke
- fun fact
- recognition clue

Use carefully.

Do not expose private/sensitive information.

==================================================
33. OPTIONAL VISUAL CLUES
==================================================

Each location may have:

- image
- simplified illustration
- icon
- floor diagram
- abstract visual clue

IMPORTANT:

These are digital game assets.

They are NOT navigation instructions.

==================================================
34. SIMPLIFIED BUILDING MAP
==================================================

Create simplified digital floor diagrams.

NOT a real-world navigation map.

Purpose:

- deduction
- memory
- recognition

Example:

مژگان
طبقه ۱

[ IT ] [ IT ]
[ IT ] [جلسات]

The exact layout should only be shown if verified and entered by Admin.

==================================================
35. ADMIN CONTENT MANAGEMENT
==================================================

Integrate everything with the existing Admin environment.

Create:

ADMIN
│
├── 🎮 مدیریت بازی‌ها
│
├── 🏢 ساختمان‌ها
│
├── 📍 مکان‌ها
│
├── 💡 سرنخ‌ها
│
├── 🎯 بازی‌ها / Match History
│
├── 🗺️ اطلس
│
├── 🏆 Achievement
│
└── ⚙️ تنظیمات

==================================================
36. BUILDING ADMIN
==================================================

Admin can create/edit:

Building
Address description
Number of floors
Parking levels
Units per floor
Special areas
Roof areas
Active status

Do NOT hard-code building facts if they are likely to change.

==================================================
37. LOCATION ADMIN
==================================================

Admin fields:

Building
Floor
Unit
Location Name
Location Type
Description
Difficulty
Rarity
Nickname
Fun Fact
Image
Audio
Active
Verified
Published

==================================================
38. CLUE ADMIN
==================================================

Admin can create clues manually.

Fields:

Clue
Clue Type
Difficulty
Building
Floor
Location
Order
Reveal Condition
Point Cost
Active

Clue lifecycle:

Draft
→ Review
→ Approved
→ Published

Only Approved/Published content enters the live game.

==================================================
39. SMART CLUE QUALITY CONTROL
==================================================

Before publishing a clue:

Validate:

- Is the fact correct?
- Does it reveal too much?
- Is it ambiguous?
- Is it duplicated?
- Is it appropriate for difficulty?
- Does it identify the correct location?
- Does it conflict with another clue?

Show Admin warnings.

==================================================
40. GAME STATUS MANAGEMENT
==================================================

Admin can set:

READY
IMPROVING
MAINTENANCE
COMING_SOON

Also:

playable = true/false

Example:

Status:
🛠 در حال بهبود

Playable:
YES

Then the game remains playable but shows:

«در حال بهبود»

==================================================
41. FEEDBACK SYSTEM
==================================================

Connect player feedback to:

Game
Building
Location
Clue
Issue Type
Suggestion

Admin can see:

- total feedback
- feedback by game
- feedback by location
- feedback by clue
- recurring problems

IMPORTANT:

Never fabricate feedback counts.

Only display a number such as:

«70 بازخورد»

if the actual system contains 70 feedback records.

==================================================
42. YOU SAID → WE IMPROVED
==================================================

Create a release communication system.

Example:

💬 شما گفتید:

«سرنخ‌های بازی سخت بود.»

🛠 ما بهبود دادیم:

«ترتیب و وضوح سرنخ‌های بازی اصلاح شد.»

Then:

نسخه 2.4.0

This must be DATA-DRIVEN.

==================================================
43. VERSION MANAGEMENT
==================================================

Create centralized:

App Version

Example:

2.4.0

Use:

MAJOR.MINOR.PATCH

Release object:

version
releaseDate
title
summary
releaseNotes
relatedGame
feedbackCount
status

Statuses:

Draft
Scheduled
Published
Archived

==================================================
44. WHAT'S NEW MODAL
==================================================

When a new version is published:

Show:

🎉 به‌روزرسانی جدید

نسخه 2.4.0

«این بار با کمک بازخورد شما، شکار بهسازانی بهتر شده.»

Then:

• سرنخ‌های هوشمندتر
• تشخیص بهتر ساختمان‌ها
• تجربه سریع‌تر بازی
• بهبود سیستم امتیازدهی

Show:

«آخرین بهبودها»

User should not repeatedly see the same update.

Store:

lastSeenVersion

Example key:

teamArena_last_seen_version

==================================================
45. RELEASE MANAGEMENT IN ADMIN
==================================================

Admin can:

Create release
Edit release
Preview release
Schedule release
Publish release
Archive release

Before Publish:

Show confirmation.

Preview must look exactly like the user-facing update modal.

IMPORTANT:

Content Release ≠ Code Deployment.

Admin publishing a Release Note must NOT pretend to deploy application code.

==================================================
46. SMART LOADING SYSTEM
==================================================

Do NOT show blank screens.

Create centralized loading architecture.

States:

IDLE
LOADING
SUCCESS
EMPTY
ERROR
RETRY

Use:

Skeleton:
when content structure is known.

Spinner:
for short actions.

Full-page loader:
only when absolutely necessary.

==================================================
47. PROGRESSIVE LOADING
==================================================

Load:

1. App shell
2. Navigation
3. Game structure
4. Critical data
5. Game-specific data
6. Non-critical assets

Avoid blocking the entire page because one image or secondary asset is loading.

==================================================
48. ERROR HANDLING
==================================================

Every important action must have:

Loading
Success
Empty
Error
Retry

Handle:

- network errors
- malformed data
- missing game
- missing location
- corrupted local storage
- unavailable asset
- expired game session

Never leave the player on a dead-end screen.

==================================================
49. MOBILE EXPERIENCE
==================================================

Mobile-first.

Optimize:

- clue cards
- timer
- team discussion
- building selection
- floor selection
- final guess
- reveal
- score
- modal
- Admin screens

Avoid crowded headers.

Important information hierarchy:

Timer
↓
Current clue
↓
Main action
↓
Secondary information

==================================================
50. DESKTOP EXPERIENCE
==================================================

Desktop can use:

Left:
Game information

Center:
Main gameplay

Right:
Team / discussion / deductions

Do not make desktop UI overly dense.

==================================================
51. ACCESSIBILITY
==================================================

Support:

Readable typography
High contrast
Keyboard navigation
Clear focus states
Meaningful buttons
Non-color-only status indicators
Reduced motion where appropriate

==================================================
52. VISUAL DESIGN
==================================================

Keep the current Team Arena design system.

For this game, create a premium detective / discovery feeling.

Visual language:

- dark premium base
- strong contrast
- building-inspired cards
- subtle glow
- depth
- smooth transitions
- modern Iranian corporate atmosphere
- playful but professional

Avoid excessive neon.

Avoid childish visual language.

==================================================
53. ANIMATION
==================================================

Use animation strategically.

Important moments:

Game start
Role reveal
New clue
Timer warning
Correct guess
Wrong guess
Final reveal
Achievement unlock
Atlas collection
Level up

Keep animation fast and purposeful.

==================================================
54. SOUND
==================================================

Optional sound system:

Clue received
Correct guess
Wrong guess
Timer warning
Final reveal
Achievement

All sound must have:

Mute control.

Never require sound to understand gameplay.

==================================================
55. PERFORMANCE
==================================================

Optimize:

- images
- assets
- component rendering
- animations
- large lists
- Admin tables
- location cards
- Atlas

Use lazy loading where appropriate.

Avoid unnecessary dependencies.

Avoid excessive re-renders.

==================================================
56. SECURITY
==================================================

Never expose:

- admin secrets
- API keys
- private credentials
- sensitive employee information

Admin authorization must be enforced by the actual authentication/backend architecture.

Do not assume hiding an Admin button is security.

Validate:

- user actions
- game state
- submitted guesses
- permissions

==================================================
57. DATA MODEL
==================================================

Create logical models:

User
Game
Match
Round
Team
PlayerRole
Building
Floor
Unit
Location
Clue
Guess
Achievement
AtlasEntry
Feedback
Release
GameStatus

Relationships must be clear.

==================================================
58. IMPORTANT REAL BUILDING DATA
==================================================

Use ONLY these verified facts currently supplied:

ERAM:
- 2 underground parking levels
- 5 office floors
- rooftop restaurant/food area
- each office floor = 1 unit

SHAMSAEI:
- 2 underground parking levels
- 9 floors above ground
- ground-floor food area
- rooftop prayer room
- each floor = 4 units
- even floors = women's restroom area
- women's restroom area = 4 restrooms grouped together
- odd floors = men's restroom area

MOZHEGAN:
- 1 underground parking
- motor house / technical area
- courtyard
- smoking room
- 5 office floors
- rooftop prayer room
- each floor = 4 units
- floor 1 = 1 general meeting room + 3 IT units
- parking -1 = 2 restrooms
- courtyard = 3 electrical generators

Do NOT invent anything else.

Any future building fact must be entered/verified through Admin before being used as a factual clue.

==================================================
59. EXAMPLE PREMIUM ROUND
==================================================

Round:

HIDER:
مژگان / طبقه ۱ / اتاق جلسات عمومی

SEARCHERS:

Clue 1:

«این ساختمان در هر طبقه ۴ واحد دارد.»

Possible:
شمسایی
مژگان

Clue 2:

«ساختمان موردنظر ۵ طبقه اداری دارد.»

Searchers narrow:

مژگان

Clue 3:

«در طبقه موردنظر، سه واحد IT وجود دارد.»

Searchers:

مژگان / طبقه ۱

Clue 4:

«یک اتاق جلسات عمومی نیز در همین طبقه قرار دارد.»

Team:

«آهان! مژگان، طبقه اول!»

Final Guess:

مژگان
طبقه ۱
اتاق جلسات عمومی

CORRECT!

Reveal animation.

Award:

+500 XP
+250 points
🏆 Location collected

Add location to:

اطلس بهسازان

==================================================
60. EXAMPLE ERAM ROUND
==================================================

Clue:

«در این ساختمان، هر طبقه فقط یک واحد دارد.»

Searchers identify:

ارم

Then:

«مکان موردنظر در یکی از پنج طبقه اداری قرار دارد.»

Then floor-specific clue.

==================================================
61. EXAMPLE SHAMSAEI ROUND
==================================================

Clue:

«در این ساختمان هر طبقه ۴ واحد دارد.»

Possible:

مژگان
شمسایی

Next:

«طبقه موردنظر زوج است.»

Next:

«در آن طبقه بخش سرویس بانوان وجود دارد و چهار سرویس در یک بخش قرار گرفته‌اند.»

Searchers:

شمسایی

Then select exact floor.

==================================================
62. GAME EMOTIONAL JOURNEY
==================================================

Design the complete experience around:

«کجاست؟»

↓

«چه ساختمونی؟»

↓

«ارم یا شمسایی یا مژگان؟»

↓

«آهان، شمسایی!»

↓

«طبقه زوج...»

↓

«چهار سرویس کنار هم...»

↓

«فکر کنم طبقه ۴!»

↓

«درسته!»

↓

🎯 REVEAL

↓

🏆 REWARD

↓

🗺️ ATLAS UPDATED

This emotional sequence is the heart of the product.

==================================================
63. ADMIN DASHBOARD
==================================================

Admin dashboard should show:

Active games
Game status
Published locations
Pending clues
Feedback count
Recent matches
Popular locations
Most discovered buildings
System health
Latest release

Create quick actions:

+ افزودن مکان
+ افزودن سرنخ
+ انتشار نسخه
+ مشاهده بازخوردها

==================================================
64. ANALYTICS-READY
==================================================

Prepare architecture for analytics.

Track events such as:

game_started
role_assigned
clue_revealed
guess_submitted
guess_correct
guess_wrong
round_completed
location_discovered
achievement_unlocked
feedback_submitted
release_seen

Do not add unnecessary third-party tracking.

==================================================
65. NO FAKE DATA
==================================================

Do NOT create fake:

feedback counts
player statistics
building facts
match results
leaderboards
release numbers

For demo-only UI, clearly label mock data.

Production UI must use real data.

==================================================
66. ROUTING
==================================================

Create clean routes.

Example:

/games
/games/behsazani-hunt
/games/behsazani-hunt/lobby
/games/behsazani-hunt/game
/games/behsazani-hunt/reveal
/games/behsazani-hunt/results
/profile/atlas
/admin
/admin/buildings
/admin/locations
/admin/clues
/admin/releases
/admin/feedback

Respect the existing routing architecture if different.

No broken routes.

No dead ends.

Back navigation must work.

==================================================
67. SESSION RECOVERY
==================================================

If user refreshes during a match:

Attempt to restore the session if supported.

If impossible:

Show clear recovery UI.

Example:

«بازی قبلی پیدا شد»

ادامه بازی
خروج

Never silently lose the player state.

==================================================
68. EXIT / BACK
==================================================

When leaving a live match:

Show confirmation:

«مطمئنی می‌خواهی از بازی خارج شوی؟»

Options:

ادامه بازی
خروج

Do not accidentally destroy the match.

==================================================
69. FINAL QA
==================================================

Before considering the implementation complete, test:

SCENARIO 1:
Single player

SCENARIO 2:
Multiple players

SCENARIO 3:
Hider

SCENARIO 4:
Searcher

SCENARIO 5:
Correct guess

SCENARIO 6:
Wrong guess

SCENARIO 7:
Timer expires

SCENARIO 8:
Player leaves

SCENARIO 9:
Refresh

SCENARIO 10:
Mobile

SCENARIO 11:
Desktop

SCENARIO 12:
Admin creates building

SCENARIO 13:
Admin creates location

SCENARIO 14:
Admin creates clue

SCENARIO 15:
Admin publishes clue

SCENARIO 16:
Admin changes game status

SCENARIO 17:
New release

SCENARIO 18:
What's New modal

SCENARIO 19:
Atlas collection

SCENARIO 20:
Achievement unlock

==================================================
70. BUILDING DATA QA
==================================================

Verify that:

ERAM:
Every office floor = 1 unit

SHAMSAEI:
Every floor = 4 units

MOZHEGAN:
Every floor = 4 units

MOZHEGAN FLOOR 1:
1 general meeting room
3 IT units

SHAMSAEI:
Even floors = women's restroom area
4 women's restrooms grouped together
Odd floors = men's restroom area

MOZHEGAN:
Parking -1 = 2 restrooms
Courtyard = 3 generators
Smoking room exists

No contradiction between clues.

==================================================
71. UX QA
==================================================

Verify:

No dead ends
No duplicate buttons
No confusing role states
No accidental answer reveal
No answer visible to searchers
No hidden required action
No blank loading screens
No broken modals
No overflowing mobile cards
No unreadable text
No excessive header density

==================================================
72. FINAL ACCEPTANCE CRITERIA
==================================================

The feature is complete only when:

✓ Digital hide-and-seek works
✓ No physical hiding
✓ No GPS
✓ Hider/Searcher roles work
✓ Building selection works
✓ Floor selection works
✓ Location selection works
✓ Progressive clues work
✓ Smart clue combinations work
✓ Timer works
✓ Guessing works
✓ Penalties work
✓ Scoring works
✓ Role rotation works
✓ Reveal works
✓ Atlas works
✓ Achievements work
✓ Building mastery works
✓ Feedback works
✓ Admin management works
✓ Game status works
✓ Version system works
✓ What's New works
✓ Smart loading works
✓ Error recovery works
✓ Mobile works
✓ Desktop works
✓ Accessibility is respected
✓ No fake data
✓ No invented building facts
✓ No dead-end route
✓ No console/runtime errors

==================================================
73. FINAL PRODUCT PRINCIPLE
==================================================

Do NOT make this feel like a generic hide-and-seek game.

It should feel like:

«یک بازی اختصاصی برای آدم‌هایی که بهسازان را می‌شناسند.»

The strongest experience should come from:

شناخت واقعی سازمان
+
حافظه
+
استدلال
+
رقابت
+
شوخی دوستانه
+
کشف
+
لحظه AHA
+
پیشرفت دائمی

The player should finish a round thinking:

«من واقعاً ساختمان‌های بهسازان را بهتر می‌شناسم.»

And want to play another round because:

«این یکی رو دیگه حتماً می‌دونم کجاست!»

==================================================
FINAL INSTRUCTION TO FIGMA MAKE
==================================================

Implement this as a complete, production-quality feature inside the CURRENT Figma Make project.

Do not replace the entire product.

Do not redesign unrelated screens.

Use the existing design system.

Build the necessary components, states, interactions, routes, data structures, Admin interfaces, loading states, error states and responsive behavior.

Use the verified building information exactly as provided above.

Do not invent missing building information.

Where information is unknown, make it Admin-configurable instead of guessing.

After implementation, perform a complete UX and functional QA pass across:

mobile
desktop
hider
searcher
single player
multiple players
correct answer
wrong answer
timeout
exit
refresh
Admin
release
feedback
Atlas
achievement
loading
error
empty states

Fix all discovered issues before considering the feature complete.
```
