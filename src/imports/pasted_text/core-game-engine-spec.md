============================================================
SHKAR BEHSAZANI — NEW CORE GAME ENGINE
"THE HIDDEN PLACE"
============================================================

IMPORTANT:
THIS IS A CORE GAMEPLAY REPLACEMENT.

Do NOT merely redesign the current "شکار بهسازانی" UI.

The current gameplay is too similar to a form:

- read clues
- select building
- select floor
- select confidence
- submit answer

This must be fundamentally replaced.

The new game must feel like:

SOCIAL DEDUCTION
+
HIDDEN ROLE
+
CLUE CREATION
+
BLUFF
+
INVESTIGATION
+
TEAM DISCUSSION
+
RISK / REWARD
+
TIME PRESSURE
+
SURPRISE REVEAL

The core emotional loop must be:

"می‌دونم کجاست، ولی نباید مستقیم بگم."
        ↓
"باید یک سرنخ خوب بسازم."
        ↓
"سرنخ رو کمی مبهم می‌کنم."
        ↓
"آیا تیم مقابل متوجه می‌شود؟"
        ↓
"این سرنخ به کدام ساختمان می‌خورد؟"
        ↓
"صبر کنیم یا حدس بزنیم؟"
        ↓
"فکر کنم پیداش کردیم!"
        ↓
"REVEAL"
        ↓
"درست / غلط"
        ↓
"امتیاز + پیشرفت + کشف مکان"

============================================================
01 — CORE CONCEPT
============================================================

Each round contains two sides:

1. HIDERS
   «مخفی‌شونده‌ها»

2. SEEKERS
   «پیداکننده‌ها»

The Hiders know the exact secret location.

The Seekers do NOT know the exact location.

The Hiders must create clues.

The Seekers must interpret the clues.

The Hiders must NEVER directly reveal the location.

The Seekers must solve the mystery before the timer ends.

============================================================
02 — IMPORTANT: DIGITAL GAME ONLY
============================================================

This game is completely DIGITAL.

Players do NOT physically hide inside Behsazan buildings.

No GPS.

No physical movement.

No real-world hiding.

The "hidden location" exists only inside the game.

Real Behsazan building information is used as:

GAME KNOWLEDGE
+
MEMORY
+
DEDUCTION

============================================================
03 — ROUND STRUCTURE
============================================================

Each round:

ROUND START
↓
SYSTEM SELECTS SECRET LOCATION
↓
HIDERS RECEIVE SECRET LOCATION
↓
SEEKERS SEE ONLY MYSTERY STATE
↓
HIDERS CREATE FIRST CLUE
↓
CLUE IS TRANSFORMED / PROCESSED
↓
SEEKERS RECEIVE CLUE
↓
TEAM DISCUSSION
↓
SEEKERS CAN:
- eliminate
- investigate
- request another clue
- guess
↓
HIDERS CAN:
- create next clue
- make clue clearer
- make clue more ambiguous
- use limited special ability
↓
MORE CLUES
↓
RISK / REWARD DECISION
↓
FINAL GUESS
↓
REVEAL
↓
SCORING
↓
LOCATION COLLECTION
↓
NEXT ROUND

============================================================
04 — ROLE ASSIGNMENT
============================================================

At the beginning of a match:

Assign:

1 or more Hiders

and

multiple Seekers.

Recommended:

2 Hiders
+
remaining players as Seekers

for larger groups.

For smaller groups:

1 Hider
+
remaining players as Seekers.

The system must support configurable role counts.

Admin can define:

minimum players
maximum players
number of Hiders
number of Seekers
round count
timer
difficulty

============================================================
05 — FAIR ROLE ROTATION
============================================================

Do NOT allow the same player to permanently remain Hider.

Across rounds:

rotate roles.

Track:

previousHider
hiderRounds
seekerRounds

Try to distribute roles fairly.

At the end of the match:

show:

«نوبت همه رسید؟»

and role distribution.

============================================================
06 — SECRET LOCATION
============================================================

The system selects one location from the verified:

Behsazan Location Database.

The Hider sees:

--------------------------------
🔒 فقط برای مخفی‌شونده‌ها

مکان مخفی:

🏢 ساختمان مژگان
طبقه اول
🗣 اتاق جلسات عمومی

اطلاعات کمکی:

این طبقه 4 واحد دارد:
1 اتاق جلسات عمومی
+
3 واحد IT

--------------------------------

The Seekers MUST NOT see this information.

============================================================
07 — SEEKER VIEW
============================================================

Seekers see:

--------------------------------
🎯 شکار بهسازانی

یک مکان در یکی از ساختمان‌های
بهسازان مخفی شده.

ساختمان:
❓

طبقه:
❓

مکان:
❓

زمان:

01:45

منتظر اولین سرنخ...
--------------------------------

Do NOT show the answer.

============================================================
08 — HIDER GAMEPLAY
============================================================

Hiders must actively play.

They should NOT simply wait.

For every clue round:

Hider receives:

SECRET LOCATION
+
AVAILABLE CLUE OPTIONS

Example:

--------------------------------

🎯 مکان:
مژگان / طبقه 1 / اتاق جلسات

یک سرنخ بساز:

[ اینجا برای جلسات استفاده می‌شود ]

[ این مکان در یک طبقه با 4 واحد است ]

[ اینجا معمولاً چند نفر جمع می‌شوند ]

[ این مکان در فضای اداری قرار دارد ]

--------------------------------

Hider chooses one.

============================================================
09 — HIDER CLUE CREATOR
============================================================

Allow two modes:

MODE A:
Choose from system-generated clues.

MODE B:
Write a custom clue.

The system must support both.

For custom clues:

Hider writes in Persian.

Example:

«اینجا جاییه که معمولاً چند نفر
برای تصمیم گرفتن کنار هم جمع میشن.»

============================================================
10 — CLUE SAFETY / VALIDATION
============================================================

Before a custom clue is sent:

Validate it.

The system must check:

1. Does it contradict the secret location?
2. Does it reveal the exact answer too directly?
3. Is it completely unrelated?
4. Does it contain inappropriate content?
5. Is it outside the verified game knowledge?

If invalid:

show:

«این سرنخ با مکان انتخاب‌شده
هماهنگ نیست.»

or:

«این سرنخ بیش از حد مستقیم است.»

Allow:

[ویرایش]
[استفاده از سرنخ پیشنهادی]

============================================================
11 — INDIRECT CLUES
============================================================

The Hider should NOT directly say:

«اتاق جلسات عمومی مژگان»

Instead:

GOOD:

«اینجا جاییه که چند نفر برای
گفتگو و تصمیم‌گیری کنار هم جمع میشن.»

GOOD:

«اینجا بیشتر برای صحبت کردن
است تا کار روزمره.»

GOOD:

«تعداد آدم‌هایی که اینجا جمع
می‌شوند معمولاً بیشتر از یک نفر است.»

BAD:

«اتاق جلسات طبقه اول مژگان»

The game should reward indirect clues.

============================================================
12 — CLUE TRANSFORMATION ENGINE
============================================================

This is a signature mechanic.

The Hider's original clue does NOT necessarily appear exactly as written.

The system can transform the clue.

Possible transformations:

1. حذف بخشی از فاصله‌ها
2. تغییر فاصله‌گذاری
3. حذف یا اضافه محدود علائم نگارشی
4. شکستن جمله
5. برجسته‌کردن یک بخش
6. حذف بخشی از کلمات
7. نمایش تکه‌ای
8. Blur محدود
9. Crop
10. رمزگذاری بصری
11. نمایش کلمات به ترتیب غیرعادی
12. نمایش بخشی از جمله در چند مرحله

IMPORTANT:

The transformation must NEVER make Persian text unreadable.

It must remain solvable.

============================================================
13 — EXAMPLE OF TRANSFORMED CLUE
============================================================

Hider writes:

«اینجا معمولاً چند نفر برای تصمیم‌گیری
کنار هم جمع می‌شوند.»

Seekers might see:

«اینجا معمولاً چند نفر
برای تصمیم‌گیری
کنار هم...»

Then:

[باز کردن ادامه سرنخ]

or:

«...کنار هم جمع می‌شوند.»

This creates anticipation.

============================================================
14 — CLUE FRAGMENTATION
============================================================

Allow a clue to arrive in pieces.

Example:

PART 1:

«طبقه...»

PART 2:

«...با 4 واحد...»

PART 3:

«...اداری»

Seekers must connect the information.

Do NOT overuse this mechanic.

It should be used strategically.

============================================================
15 — CLUE DISTORTION
============================================================

One special ability:

«محو کن»

The Hider can intentionally make one clue slightly ambiguous.

Example:

Original:

«این مکان در طبقه اول است.»

Displayed:

«این مکان در یکی از طبقات پایین قرار دارد.»

ONLY if the transformed clue remains logically valid.

Do not allow the system to generate false factual information.

============================================================
16 — CLUE TYPES
============================================================

Support:

STRUCTURAL
LOCATION
FUNCTION
COUNT
FLOOR
BUILDING
MEMORY
VISUAL
COMPARATIVE
INDIRECT
COMBINATION

Examples:

STRUCTURAL:
«این ساختمان در هر طبقه تعداد واحد مشخصی دارد.»

COUNT:
«چهار واحد در این طبقه وجود دارد.»

FUNCTION:
«اینجا بیشتر برای جمع شدن افراد استفاده می‌شود.»

MEMORY:
«خیلی از همکارها اینجا را با جلسه به یاد می‌آورند.»

COMPARATIVE:
«این ساختمان مثل ارم تک‌واحدی نیست.»

============================================================
17 — CLUE CHOICE
============================================================

Hiders should sometimes choose between 3 generated clues.

Example:

CLUE A:
Easy

CLUE B:
Medium

CLUE C:
Hard

Hider chooses.

Harder clue:

Higher Hider reward.

Easier clue:

Lower Hider reward.

This creates strategy.

============================================================
18 — HIDER RISK / REWARD
============================================================

The Hider's goal is NOT simply:

"make impossible clues."

The goal is:

Give enough information to make the game fun,
but not enough to reveal the answer immediately.

Scoring:

Useful but ambiguous clue
+
high difficulty
+
seekers need multiple clues
=
higher Hider reward.

Completely useless clue
=
low reward.

Direct clue
=
low reward.

============================================================
19 — HIDER SPECIAL POWERS
============================================================

Each Hider can have limited powers.

Examples:

🧩 تکه‌تکه کن
Split clue into fragments.

🌫 مبهم کن
Make clue less direct.

🔐 رمز کن
Apply visual clue transformation.

🖼 تصویر بده
Reveal a small visual fragment.

⏳ تأخیر
Delay next clue slightly.

🎭 طعمه
Create a misleading but logically valid interpretation.

Each power has:

LIMITED USE.

Do NOT allow unlimited powers.

============================================================
20 — DECOY CLUE
============================================================

Introduce:

«سرنخ طعمه»

A clue that is technically true
but can initially point toward another building/location.

Example:

Secret:

مژگان / طبقه اول / اتاق جلسات

Clue:

«این طبقه 4 واحد دارد.»

This may initially make Seekers think:

شمسایی.

But another clue later reveals:

«این ساختمان فقط 5 طبقه اداری دارد.»

Now Seekers reconsider.

The Decoy must always be based on TRUE information.

Never create fake building facts.

============================================================
21 — SEEKER GAMEPLAY
============================================================

Seekers receive clues progressively.

They can:

1. Discuss
2. Eliminate
3. Ask for clue
4. Make a guess
5. Vote
6. Inspect known facts
7. Commit final answer

============================================================
22 — INVESTIGATION BOARD
============================================================

Create:

🕵️ Investigation Board

Example:

KNOWN:

✓ ساختمان دارای 4 واحد در هر طبقه
✓ مکان اداری
✓ مکان برای چند نفر

UNKNOWN:

? ساختمان
? طبقه
? مکان دقیق

POSSIBLE:

🟢 شمسایی
🟡 مژگان
🔴 ارم

This board updates dynamically.

============================================================
23 — POSSIBILITY STATES
============================================================

Every building/location candidate can have:

UNKNOWN
POSSIBLE
LIKELY
ELIMINATED

Use visual indicators.

Do NOT reveal the correct answer through the UI.

These states are player deductions.

============================================================
24 — SEEKER CLUE REQUEST
============================================================

Seekers can request:

«سرنخ بعدی»

But clues have a cost.

Example:

Current Score:

820

Next clue:

-30

Button:

[دریافت سرنخ -30]

Alternative:

[الان حدس می‌زنیم]

This creates tension.

============================================================
25 — EARLY GUESS
============================================================

Seekers can guess before all clues are revealed.

Early correct guess:

HIGH REWARD

Early wrong guess:

HIGH PENALTY

This creates:

RISK / REWARD.

============================================================
26 — FINAL GUESS
============================================================

At the end:

«آخرین فرصت»

The team must choose:

Building
+
Floor
+
Location

Then:

[ثبت حدس نهایی]

No more changes.

============================================================
27 — TEAM VOTING
============================================================

Before final guess:

Show:

«تیم روی کدام گزینه توافق دارد؟»

Example:

ارم
1 رأی

شمسایی
4 رأی

مژگان
0 رأی

Then:

[تأیید حدس تیم]

The majority choice becomes the team's answer.

============================================================
28 — TEAM DISCUSSION
============================================================

Support quick reactions:

👍 موافقم
🤔 شک دارم
🔥 مطمئنم
❌ بعیده

If chat infrastructure exists:

use existing chat.

Do NOT create a second unrelated chat system.

============================================================
29 — TIMER
============================================================

Each round has a countdown.

Example:

02:00

At:

60 sec:
«نصف زمان گذشت»

30 sec:
«زمان داره تموم میشه!»

10 sec:
«آخرین فرصت!»

Timer must affect strategy.

============================================================
30 — HIDER TIMER
============================================================

Hiders also have limited time to create clues.

Example:

15 seconds

If they don't choose:

System automatically selects a valid clue.

This prevents the game from stopping.

============================================================
31 — NO DEADLOCK
============================================================

If:

Hider doesn't respond
OR
Seekers don't respond

the game must continue automatically.

Examples:

Hider timeout:
→ choose system-generated clue.

Seeker timeout:
→ no guess / continue.

Final timeout:
→ automatic reveal.

Never create an infinite waiting state.

============================================================
32 — REAL BEHSAZAN KNOWLEDGE
============================================================

Use only verified information.

KNOWN DATA:

مژگان:

- 1 طبقه پارکینگ
- موتورخانه / فضای فنی
- حیاط
- اتاق سیگار
- 5 طبقه اداری
- طبقه اول:
  - 1 اتاق جلسات عمومی
  - 3 واحد IT
  - مجموعاً 4 واحد
- پشت‌بام:
  - نمازخانه
- پارکینگ -1:
  - 2 سرویس
- حیاط:
  - 3 ژنراتور

شمسایی:

- 2 طبقه پارکینگ
- 9 طبقه روی زمین
- هر طبقه 4 واحد
- همکف:
  - فضای غذا
- پشت‌بام:
  - نمازخانه
- طبقات زوج:
  - بخش سرویس بانوان
  - 4 سرویس در یک بخش
- طبقات فرد:
  - بخش سرویس آقایان

ارم:

- 2 طبقه پارکینگ
- 5 طبقه اداری
- هر طبقه 1 واحد
- تک‌واحدی
- پشت‌بام:
  - رستوران / فضای غذا

DO NOT INVENT additional facts.

============================================================
33 — LOCATION DATABASE
============================================================

Each location must contain:

locationId
buildingId
floor
name
category
description
difficulty
rarity
verified
active
clues
clueTypes
funFact
image
nickname

============================================================
34 — LOCATION DIFFICULTY
============================================================

EASY

Obvious structural clues.

MEDIUM

Requires 2–3 clues.

HARD

Requires combining multiple facts.

EXPERT

Requires strong organizational memory and deduction.

============================================================
35 — LOCATION RARITY
============================================================

COMMON
RARE
EPIC
LEGENDARY

Rarity affects:

score
XP
Atlas reward
achievement

Do NOT use rarity to create unfairness.

============================================================
36 — REVEAL EXPERIENCE
============================================================

When Seekers are correct:

DO NOT immediately show the answer.

Create a reveal sequence:

1. Screen pauses
2. Timer stops
3. Mystery card glows
4. Building appears
5. Floor appears
6. Location appears
7. Real fact appears

Example:

🎯 پیدا شد!

🏢 مژگان

طبقه ۱

🗣 اتاق جلسات عمومی

💡 این طبقه شامل:

1 اتاق جلسات عمومی
+
3 واحد IT

This must feel like an achievement.

============================================================
37 — WRONG GUESS
============================================================

Wrong guess:

Do NOT immediately end the game.

Show:

❌ این حدس درست نبود.

Then:

- penalty
- remaining time
- remaining possibilities
- next clue option

The round continues if attempts remain.

============================================================
38 — HIDER WIN CONDITION
============================================================

Hiders win if:

Seekers fail to identify the exact location
within the allowed conditions.

Hider score depends on:

time survived
clue quality
difficulty
number of wrong guesses
number of clues used
successful ambiguity

============================================================
39 — SEEKER WIN CONDITION
============================================================

Seekers win if:

they correctly identify:

Building
+
Floor
+
Location

Score depends on:

speed
clues used
wrong guesses
difficulty
early guess
team accuracy

============================================================
40 — SCORE SYSTEM
============================================================

Avoid overly complicated currencies.

Use:

Score
XP

Possible formula:

Base Location Score
+
Difficulty Bonus
+
Speed Bonus
+
Early Guess Bonus
-
Clue Cost
-
Wrong Guess Penalty

For Hiders:

Base Hider Score
+
Difficulty
+
Time Survived
+
Clue Creativity
+
Wrong Guess Count

Keep the scoring understandable.

============================================================
41 — HIDER CLUE QUALITY
============================================================

Do NOT reward simply writing longer text.

Reward:

relevance
indirectness
usefulness
difficulty
creativity

Possible internal scoring:

Clue Quality
0–100

But do NOT expose unnecessary technical scoring.

Show simple feedback:

🔥 سرنخ هوشمندانه
🎯 سرنخ دقیق
🧩 سرنخ مبهم
💡 سرنخ خلاقانه

============================================================
42 — CLUE CREATIVE FEEDBACK
============================================================

After Hider submits a clue:

Show:

«سرنخ ثبت شد.»

Optional:

«این سرنخ خیلی مستقیم بود.»

or:

«سرنخ خوبی بود؛ تیم را مجبور به فکر کردن می‌کند.»

This helps the Hider improve.

============================================================
43 — HIDDEN CLUE TRANSFORMATION
============================================================

Create a visual language for transformed clues.

Possible modes:

TEXT_FRAGMENT
DOT_SHIFT
SPACING_SHIFT
WORD_MASK
PROGRESSIVE_REVEAL
BLUR
PARTIAL_IMAGE
SYMBOL_HINT

Do NOT randomly transform every clue.

Each transformation must have:

purpose
difficulty
readability.

============================================================
44 — DOT / PUNCTUATION MECHANIC
============================================================

Support the user's idea:

Some clues can subtly modify:

dots
spacing
punctuation
letter separation

Example:

Normal:

«مژگان»

Transformed:

«مـژگـان»

or:

«مژ گان»

or:

«م . ژ گ ا ن»

But:

DO NOT destroy the Persian word.

The transformation should become a recognizable game mechanic.

============================================================
45 — SECRET CODE CLUES
============================================================

Some rounds can contain:

«رمز سرنخ»

Example:

Every extra dot means:

ONE STEP CLOSER.

Or:

A specific symbol indicates:

Building
Floor
Category

But explain the mechanic briefly when first introduced.

Do NOT make the game impossible to understand.

============================================================
46 — PROGRESSIVE COMPLEXITY
============================================================

New players should NOT immediately receive:

complex cryptographic clues
heavy deception
multiple powers.

Beginner:

simple clue selection.

Intermediate:

ambiguous clues.

Advanced:

transformation.

Expert:

deception
+
multi-layer clues.

============================================================
47 — PLAYER MASTERY
============================================================

Track:

Hider Skill
Seeker Skill

Possible titles:

🔎 جستجوگر
🧠 تحلیلگر
🎭 استاد ابهام
🕵️ کارآگاه
👑 استاد شکار

Use these for progression.

============================================================
48 — ATLAS OF BEHSAZAN
============================================================

Every discovered location is added to:

📖 اطلس بهسازان

Example:

مژگان
12 / 20

شمسایی
15 / 25

ارم
8 / 15

Total:

35 / 60

Each location card contains:

building
floor
location
difficulty
rarity
discovery date
fact

This becomes long-term progression.

============================================================
49 — DISCOVERY STREAK
============================================================

Track:

Successful discoveries

Example:

🔥 4 کشف متوالی

Reward:

XP
badge
special frame

Do not over-reward grinding.

============================================================
50 — MATCH HIGHLIGHTS
============================================================

At end of match:

Show:

🏆 بهترین شکارچی
🎭 بهترین مخفی‌شونده
⚡ سریع‌ترین حدس
🧠 بهترین سرنخ
🔥 بیشترین ریسک
📖 بیشترین کشف

This creates social recognition.

============================================================
51 — GAME MODES
============================================================

CLASSIC

Normal Hider vs Seekers.

BLITZ

Short timer.

MEMORY

Clues heavily depend on organizational knowledge.

MASTER

Complex clues.

SURPRISE

Special clue transformations.

TEAM WAR

Two teams compete across multiple rounds.

============================================================
52 — TEAM WAR
============================================================

Example:

TEAM A
2 Hiders
3 Seekers

vs

TEAM B
2 Hiders
3 Seekers

Teams alternate.

Total score determines winner.

This creates a highly replayable competitive mode.

============================================================
53 — ROLE ROTATION
============================================================

Across rounds:

Hider
→ Seeker
→ Hider
→ Seeker

Avoid repeated Hider assignments.

At match end:

show role statistics.

============================================================
54 — ADMIN CONTROL
============================================================

Admin must control:

Buildings
Floors
Locations
Clues
Clue types
Difficulty
Rarity
Transformations
Special powers
Game modes
Timer
Scoring
Role count

No code change should be necessary to add a location.

============================================================
55 — CONTENT VALIDATION
============================================================

Every location should have:

verified = true/false

Only:

verified = true

can enter production gameplay.

Draft content:

NOT playable.

============================================================
56 — ANTI-REPETITION
============================================================

Do not repeatedly select:

same location
same building
same clue
same transformation

Track:

recentLocations
recentClues
recentTransformations

Balance:

Eram
Shamsayi
Mozhgan

based on available content.

============================================================
57 — FAIRNESS
============================================================

The system must prevent:

Hider intentionally giving impossible clues.

Seekers receiving impossible information.

System-generated false facts.

Repeated advantage for one player.

Use:

verified facts
limited powers
role rotation
difficulty balancing.

============================================================
58 — GAME STATE MACHINE
============================================================

Implement explicit states:

LOBBY
ROLE_ASSIGNMENT
SECRET_LOCATION
HIDER_CLUE_CREATION
CLUE_VALIDATION
CLUE_TRANSFORMATION
CLUE_REVEAL
SEEKER_DISCUSSION
SEEKER_ACTION
GUESS
WRONG_GUESS
NEXT_CLUE
FINAL_GUESS
REVEAL
ROUND_RESULT
MATCH_RESULT

Never allow illegal state transitions.

============================================================
59 — GAME STATE SAFETY
============================================================

Every action must verify:

currentPlayer
currentRole
currentRound
currentGameState
timer
availableActions

A Seeker must NEVER access:

secretLocation
Hider-only clue tools
Hider powers.

A Hider must NEVER access:

Seeker deduction board that reveals their current conclusions,
unless the selected mode explicitly allows it.

============================================================
60 — MOBILE GAMEPLAY
============================================================

Design mobile-first.

Primary action at bottom.

Large touch targets.

Avoid dense desktop-style dashboards.

Hider interface:

Secret Location
+
Clue Builder
+
Power Actions
+
Timer

Seeker interface:

Current Clue
+
Investigation Board
+
Candidates
+
Team Discussion
+
Guess

============================================================
61 — GAME FLOW EXAMPLE
============================================================

SECRET:

مژگان
طبقه اول
اتاق جلسات عمومی

Hider chooses:

«اینجا جاییه که چند نفر
برای تصمیم گرفتن کنار هم جمع میشن.»

System transforms:

«اینجا جاییه که چند نفر
برای تصمیم گرفتن
کنار هم...»

Seekers see:

🎯 سرنخ شماره 1

Then discuss:

«اتاق جلسات؟»

Candidate:

مژگان 🟡

Hider uses:

🧩 تکه‌تکه کن

Next clue:

«این طبقه 4 واحد دارد.»

Seekers:

«پس شمسایی یا مژگان.»

Next clue:

«این ساختمان فقط 5 طبقه اداری دارد.»

Seekers:

«مژگان!»

Final:

طبقه اول

Location:

اتاق جلسات عمومی

REVEAL:

🎯 پیدا شد!

============================================================
62 — GAME FEEL
============================================================

The desired emotional experience:

MYSTERY
→
CURIOSITY
→
DISCUSSION
→
DOUBT
→
DISCOVERY
→
RISK
→
TENSION
→
REVEAL
→
REWARD

Every round should contain at least:

1 mystery
1 meaningful decision
1 uncertainty
1 reveal.

============================================================
63 — WHAT NOT TO DO
============================================================

DO NOT:

✗ Return to form-based gameplay
✗ Show all clues at once
✗ Force building/floor selection immediately
✗ Ask confidence as a boring form field
✗ Make Hiders passive
✗ Allow arbitrary fake information
✗ Reveal exact answer through clues
✗ Use physical hiding
✗ Use GPS
✗ Invent building facts
✗ Create endless complicated controls
✗ Overload the screen
✗ Make every round identical
✗ Require users to read long instructions
✗ Create dead-end states

============================================================
64 — ONBOARDING
============================================================

First time:

Explain in 3 screens maximum:

1.
«مخفی‌شونده مکان را می‌داند.»

2.
«مخفی‌شونده سرنخ می‌سازد.»

3.
«پیداکننده‌ها باید مکان را کشف کنند.»

Then:

[شروع اولین شکار]

Do not create a long tutorial.

============================================================
65 — ACCESSIBILITY
============================================================

Support:

Persian RTL
large touch targets
high contrast
reduced motion
clear selected state
screen-reader labels where applicable

Do not rely only on color.

============================================================
66 — PERFORMANCE
============================================================

The game must remain fast.

Optimize:

animations
images
clue transitions
state updates
timers
effects

Avoid unnecessary re-renders.

Timer must not cause full application re-render every second.

============================================================
67 — ERROR HANDLING
============================================================

Handle:

Hider timeout
Seeker timeout
Invalid clue
Missing location
Network interruption if online backend exists
State mismatch
Player disconnect
Refresh
Re-entry

Never expose secret location to unauthorized players.

============================================================
68 — RECONNECT
============================================================

If online multiplayer is supported:

Player reconnects:

restore:

matchId
round
role
gameState
timer
available actions

Do not reveal unauthorized state.

============================================================
69 — SECURITY
============================================================

CRITICAL:

The secret location must NOT be exposed to Seekers through:

DOM
URL
query parameters
client-visible global variables
public state
debug text

If a real backend is available:

secret location should be server-authoritative.

If the current implementation is client-only:

clearly isolate role-specific state
and understand that client-side secrecy is not cryptographically secure.

Do NOT falsely claim secure secrecy in a purely client-side implementation.

============================================================
70 — FINAL QA
============================================================

Test at least 20 complete rounds.

Test:

1 Hider
2 Hiders
Multiple Seekers
Small group
Large group

Test:

Easy
Medium
Hard
Expert

Test:

Correct first guess
Wrong guess
Multiple wrong guesses
Hider timeout
Seeker timeout
No clue
Multiple clues
Clue transformation
Custom clue
Invalid clue
Decoy clue
Final guess
Timer expiration
Reconnect
Refresh
Role rotation
Repeated location prevention

Verify:

✓ no dead ends
✓ no impossible clues
✓ no contradictory clues
✓ no secret leakage
✓ no wrong scoring
✓ no duplicated state
✓ no timer bugs
✓ no infinite loading
✓ no broken RTL
✓ no mobile overflow
✓ no console errors
✓ no stale game state

============================================================
71 — FINAL SUCCESS CRITERIA
============================================================

The new game is successful ONLY if:

✓ Hiders actively play
✓ Seekers actively investigate
✓ Clues are progressively revealed
✓ Hiders create clues
✓ Clues can be subtly transformed
✓ Risk/reward exists
✓ Early guessing matters
✓ Wrong guesses matter
✓ Team discussion matters
✓ Elimination matters
✓ Time pressure matters
✓ Correct reveal feels exciting
✓ Real Behsazan knowledge matters
✓ Players learn something
✓ Locations are collectible
✓ Roles rotate
✓ Rounds are replayable
✓ Gameplay is understandable
✓ UI is not overloaded
✓ Mobile experience is excellent

============================================================
72 — THE CORE GAME IN ONE SENTENCE
============================================================

«یک یا چند نفر مکان واقعی و مخفی بهسازان را می‌دانند؛
آن‌ها باید با ساختن سرنخ‌های خلاقانه، مبهم و گاهی رمزگذاری‌شده
بدون لو دادن مستقیم مکان، چند نفر دیگر را از مسیر درست دور نگه دارند؛
و تیم پیدا‌کننده باید قبل از تمام شدن زمان، با بحث، حذف گزینه‌ها
و ریسک کردن، مکان مخفی را کشف کند.»

============================================================
FINAL INSTRUCTION

DO NOT PRESERVE THE CURRENT FORM-BASED CORE.

PRESERVE VERIFIED BEHSAZAN DATA.

PRESERVE EXISTING APPLICATION ARCHITECTURE WHERE POSSIBLE.

REPLACE THE CORE GAMEPLAY LOOP.

The final game should feel like:

"Among Us style hidden-role tension"
+
"Deduction game"
+
"Escape-room clue solving"
+
"Behsazan organizational memory"
+
"Social team competition"

BUT IT MUST HAVE ITS OWN ORIGINAL GAMEPLAY AND IDENTITY.

The primary goal is:

MAKE THE PLAYER THINK,
MAKE THE PLAYER DISCUSS,
MAKE THE PLAYER RISK,
MAKE THE PLAYER LAUGH,
MAKE THE PLAYER DISCOVER,
AND MAKE THEM WANT TO PLAY THE NEXT ROUND.
============================================================