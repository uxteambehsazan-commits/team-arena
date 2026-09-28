هسته بازی‌های «میدان هم‌تیمی‌ها» را از نظر معماری، جریان کاربری، نقش بازیکنان و Real-Time Multiplayer به‌صورت کامل بررسی و بازطراحی کن.

هدف اصلی این تغییر این است که بازی‌های آنلاین واقعاً بین چند دستگاه و چند کاربر مستقل اجرا شوند و دیگر هیچ‌کدام از بازی‌های آنلاین بر پایه «یک گوشی برای چند شرکت‌کننده» اجرا نشوند.

==================================================

1. اصل معماری جدید بازی
   ==================================================

تمام بازی‌هایی که Online هستند باید بر پایه این مدل اجرا شوند:

Host / Room
↓
Lobby
↓
Player Join
↓
Role Assignment
↓
Game State Synchronization
↓
Independent Player Screens
↓
Real-Time Events
↓
Round State
↓
Result / Score
↓
Next Round / Game End

هر بازیکن باید با دستگاه خودش وارد بازی شود.

هیچ بازیکنی نباید برای مشاهده، انتخاب، حدس زدن، نقاشی کردن، رأی دادن، دریافت سرنخ یا انجام Action اصلی بازی مجبور باشد دستگاه بازیکن دیگری را ببیند یا از آن استفاده کند.

==================================================
2. بازی «طراح ناشناس» — بازطراحی کامل هسته
==========================================

بازی «طراح ناشناس» باید کاملاً به یک بازی Online Multiplayer واقعی تبدیل شود.

سناریوی صحیح:

بازیکن A = نقاش
بازیکنان B,C,D,... = حدس‌زننده‌ها

هر بازیکن با موبایل یا دستگاه مستقل خودش وارد اتاق می‌شود.

نقاش:

* کلمه محرمانه را فقط خودش می‌بیند.
* وارد صفحه Canvas می‌شود.
* شروع به نقاشی می‌کند.
* هر Stroke / Point / Color / Brush Size / Erase باید به‌صورت Real-Time به سرور/State بازی منتقل شود.
* سایر بازیکنان نباید کلمه را ببینند.

حدس‌زننده‌ها:

* فقط Canvas نقاش را مشاهده می‌کنند.
* Canvas باید Live باشد.
* هر حرکت قلم نقاش باید تقریباً همزمان روی دستگاه تمام حدس‌زننده‌ها نمایش داده شود.
* حدس‌زننده‌ها نباید بتوانند نقاشی را تغییر دهند.
* برای حدس‌زدن، ورودی مستقل خودشان را داشته باشند.
* حدس هر بازیکن فقط برای خودش ثبت شود.
* در صورت نیاز، سیستم بتواند حدس‌های صحیح/غلط را مدیریت کند بدون اینکه اطلاعات محرمانه نقش‌ها افشا شود.

==================================================
3. Live Drawing Synchronization
===============================

نقاشی نباید به‌صورت تصویر ثابت یا Screenshot برای سایر کاربران ارسال شود.

مدل صحیح:

Painter Device
→ Drawing Event
→ Shared Game State
→ All Guessers

هر Stroke باید شامل حداقل این داده‌ها باشد:

* x
* y
* previousX
* previousY
* timestamp
* brushSize
* brushColor
* tool
* strokeId
* playerId

در صورت امکان برای عملکرد بهتر:

* به‌جای ارسال کل Canvas، فقط تغییرات / Stroke Events را Synchronize کن.
* Canvas هر کاربر باید Local Render شود.
* State مشترک فقط Eventهای لازم برای Synchronization را دریافت کند.

هدف:
Low Latency
Smooth Drawing
No Flicker
No Duplicate Stroke
No Lost Stroke

==================================================
4. نقش‌ها باید واقعاً مستقل باشند
=================================

برای هر بازی Online، Screen بر اساس Role تعیین شود.

برای «طراح ناشناس»:

Painter Screen:

* کلمه محرمانه
* Canvas
* ابزارهای نقاشی
* پاک‌کن
* رنگ
* ضخامت قلم
* Timer
* وضعیت اتصال
* پایان نوبت

Guesser Screen:

* Live Canvas
* Timer
* Input حدس
* Submit Guess
* وضعیت حدس
* اطلاعات محدود و مجاز بازی

این دو Screen نباید یکسان باشند.

هر بازیکن فقط اطلاعات مجاز Role خودش را دریافت کند.

==================================================
5. محرمانگی Roleها
==================

هیچ اطلاعاتی که فقط متعلق به یک Role است نباید در Client سایر Roleها وجود داشته باشد.

برای مثال:

کلمه نقاشی
نباید در State قابل مشاهده Guessers باشد.

همچنین:

* Role بازیکنان
* اطلاعات مخفی
* Answer
* Secret clue
* اطلاعات Admin/Host

نباید به کاربران غیرمجاز ارسال یا در UI آنها Render شود.

از معماری Shared State با اطلاعات محرمانه برای همه کاربران خودداری کن.

==================================================
6. مدیریت اتصال
===============

برای بازی‌های Online موارد زیر را پیاده‌سازی و در Prototype شبیه‌سازی کن:

Connecting
Connected
Reconnecting
Disconnected
Reconnected

اگر اینترنت یک بازیکن قطع شد:

* بازی نباید برای همه متوقف شود.
* وضعیت بازیکن مشخص شود.
* سیستم تلاش به Reconnect کند.
* State بازی از بین نرود.
* پس از Reconnect، بازیکن باید بتواند وضعیت فعلی Round را دریافت کند.

اگر Host قطع شد:

* Host Migration یا Host Replacement را در معماری پیش‌بینی کن.
* بازی نباید به‌صورت کامل وابسته به دستگاه Host باشد.

==================================================
7. Game State Machine
=====================

برای هر بازی Online State مشخص داشته باش:

LOBBY
WAITING
STARTING
ROLE_ASSIGNMENT
ROUND_ACTIVE
ROUND_PAUSED
RECONNECTING
ROUND_RESULT
NEXT_ROUND
GAME_FINISHED

هیچ UI نباید صرفاً با Navigation بین صفحات، وضعیت بازی را شبیه‌سازی کند.

State واقعی بازی باید منبع اصلی UI باشد.

==================================================
8. جلوگیری از Race Condition
============================

اگر دو یا چند بازیکن تقریباً همزمان Action انجام دادند:

* سیستم باید Eventها را به ترتیب صحیح پردازش کند.
* Timer فقط یک Source of Truth داشته باشد.
* امتیاز فقط یک بار ثبت شود.
* یک Guess نباید دوبار ثبت شود.
* پایان Round نباید چند بار Trigger شود.
* خروج بازیکن نباید باعث Crash یا Reset بازی شود.

تمام Actionهای مهم باید دارای Event ID باشند تا Duplicate Event کنترل شود.

==================================================
9. Timer مشترک
==============

Timer بازی نباید برای هر دستگاه به‌صورت مستقل اجرا شود.

اشتباه:
Device A = 42 sec
Device B = 39 sec
Device C = 44 sec

مدل صحیح:

Server / Shared Game State
= Single Source of Truth

تمام دستگاه‌ها باید Timer هماهنگ داشته باشند.

اختلاف چند میلی‌ثانیه قابل قبول است، اما اختلاف محسوس بین بازیکنان نباید وجود داشته باشد.

==================================================
10. بازی شکار بهسازانی
======================

بازی «شکار بهسازانی» یک بازی Single Player نیست.

این بازی باید به‌صورت کامل از دسته:

«بازی‌های تک نفره»

حذف شود.

آن را فقط در دسته:

«بازی‌های آنلاین»

قرار بده.

در هیچ قسمت از UI نباید «شکار بهسازانی» به‌عنوان بازی تک‌نفره نمایش داده شود.

==================================================
11. جریان صحیح ورود به شکار بهسازانی
====================================

وقتی کاربر «شکار بهسازانی» را انتخاب می‌کند:

Game Selection
↓
Game Detail
↓
Start / Play
↓
Online Lobby
↓
Create Room / Join Room
↓
Players Join
↓
Lobby Ready
↓
Start Game
↓
Role Assignment
↓
Game

برای این بازی نباید این گزینه‌ها نمایش داده شوند:

❌ بازی تک نفره
❌ Single Player
❌ اجرای آفلاین
❌ اجرای چند نفره روی یک دستگاه

گزینه‌های مجاز:

✅ ساخت دورهمی
✅ ورود با کد اتاق

در صورت نیاز Host می‌تواند Room را ایجاد کند و سایر بازیکنان با کد وارد شوند.

==================================================
12. Lobby اختصاصی شکار بهسازانی
===============================

بعد از انتخاب «شکار بهسازانی»، کاربر مستقیماً وارد جریان Multiplayer Lobby شود.

Lobby باید شامل:

* نام بازی
* Room Code
* تعداد بازیکنان فعلی
* ظرفیت بازی
* Avatar بازیکنان
* وضعیت Ready
* Host Indicator
* Copy Code
* Invite Friends
* Start Game برای Host

باشد.

تا زمانی که حداقل تعداد موردنیاز بازیکنان فراهم نشده، Start Game غیرفعال باشد.

==================================================
13. Role Assignment در شکار بهسازانی
====================================

بعد از Start:

System
→ تعیین نقش‌ها
→ نمایش Role مخصوص هر بازیکن

نقش‌ها باید مستقل باشند.

برای مثال:

Hidden Player
و
Search Teams / Search Players

هر Role باید اطلاعات، Map، Objective و Interaction مخصوص خودش را دریافت کند.

اطلاعات محرمانه Hidden Player نباید برای Searchers قابل مشاهده باشد.

اطلاعاتی که فقط Searchers باید ببینند نباید برای Hidden Player ارسال شود.

==================================================
14. Multiplayer Map State
=========================

در «شکار بهسازانی» نیز Map باید Shared Game State داشته باشد اما View هر Role متفاوت باشد.

برای مثال:

Hidden Player:

* محل فعلی
* محیط اطراف
* مسیرهای مجاز
* وضعیت مخفی‌شدن
* Timer
* اطلاعات مخصوص نقش

Searchers:

* Map قابل جستجو
* اطلاعات مکان
* سرنخ‌ها
* وضعیت تیم
* Timer
* محدوده‌های قابل بررسی

هر بازیکن باید Map مخصوص Role خودش را روی دستگاه خودش داشته باشد.

==================================================
15. حذف معماری «یک گوشی برای چند نفر»
=====================================

کل پروژه را Search کن و هرجا الگوی زیر وجود دارد اصلاح کن:

One Device
+
Multiple Players
+
Pass Device
+
Next Player
+
Shared Screen

این معماری فقط برای بازی‌هایی که عمداً Local Multiplayer هستند مجاز است.

در بازی‌های Online باید تبدیل شود به:

One Player
+
One Device
+
One Connection
+
One Role
+
Shared Real-Time Game State

==================================================
16. Game Type Validation
========================

برای هر بازی Metadata مشخص داشته باش:

gameMode:

* SINGLE_PLAYER
* ONLINE_MULTIPLAYER
* LOCAL_MULTIPLAYER

حداقل/حداکثر بازیکنان:

minPlayers
maxPlayers

و همچنین:

requiresLobby
requiresRoom
requiresRoleAssignment
requiresRealtimeSync
supportsOffline

قبل از نمایش گزینه‌های Start، سیستم باید Game Metadata را بررسی کند.

مثال:

شکار بهسازانی:

gameMode = ONLINE_MULTIPLAYER
requiresLobby = true
requiresRoom = true
requiresRoleAssignment = true
requiresRealtimeSync = true
supportsOffline = false

طراح ناشناس:

gameMode = ONLINE_MULTIPLAYER
requiresLobby = true
requiresRoom = true
requiresRoleAssignment = true
requiresRealtimeSync = true
supportsOffline = false

==================================================
17. جلوگیری از نمایش گزینه اشتباه
=================================

UI نباید برای همه بازی‌ها یک Template ثابت داشته باشد.

برای هر Game Type، CTAهای مناسب تولید کن.

اگر:

gameMode = SINGLE_PLAYER

نمایش:
شروع بازی

اگر:

gameMode = ONLINE_MULTIPLAYER

نمایش:
ساخت دورهمی
ورود با کد اتاق

اگر:

gameMode = LOCAL_MULTIPLAYER

نمایش:
شروع بازی روی این دستگاه

این منطق باید Dynamic باشد.

==================================================
18. تست سناریوهای واقعی
=======================

حداقل این سناریوها را تست کن:

Scenario 1:
4 بازیکن
4 دستگاه
طراح ناشناس
1 Painter
3 Guessers

Scenario 2:
8 بازیکن
8 دستگاه
طراح ناشناس
Live Drawing

Scenario 3:
Painter Draws
Guessers Receive Stroke Events in Real Time

Scenario 4:
One Guesser Disconnects
→ Reconnect
→ Continue Current Round

Scenario 5:
Painter Disconnects
→ Handle Reconnect / Role State

Scenario 6:
Two Guessers Submit Guess at Same Time

Scenario 7:
Timer Reaches Zero

Scenario 8:
Correct Guess Submitted

Scenario 9:
Multiple Correct Guesses

Scenario 10:
Host Disconnects

Scenario 11:
New Player Joins Before Game Start

Scenario 12:
Player Attempts to Join After Game Starts

Scenario 13:
Player Opens Game from Single Player Context

برای «شکار بهسازانی»:

Scenario 14:
User Selects Game
→ Must Enter Online Lobby

Scenario 15:
User Searches Single Player Games
→ شکار بهسازانی MUST NOT appear

Scenario 16:
User Opens Game Detail
→ No Single Player CTA

Scenario 17:
Host Creates Room
→ Other Players Join by Code

Scenario 18:
Minimum Players Not Reached
→ Start Disabled

Scenario 19:
Minimum Players Reached
→ Start Enabled

Scenario 20:
Game Starts
→ Role-specific screens appear on separate devices

==================================================
20. Performance Requirements
============================

Live Drawing باید با حداقل Latency ممکن اجرا شود.

از ارسال مداوم Screenshot یا کل Canvas خودداری کن.

از Event-based synchronization استفاده کن.

Canvas باید روی Client Render شود.

Drawing events باید:

* lightweight
* ordered
* deduplicated
* timestamped

باشند.

از ایجاد Renderهای غیرضروری جلوگیری کن.

UI هنگام دریافت Stroke نباید Freeze شود.

==================================================
21. UX وضعیت اتصال
==================

در بازی‌های Online وضعیت اتصال باید برای کاربر قابل فهم باشد.

مثلاً:

● متصل
◌ در حال اتصال مجدد
! اتصال قطع شد

اما این وضعیت نباید مزاحم Gameplay شود.

در صورت قطع اتصال کوتاه:

* بازی را متوقف نکن.
* Reconnect خودکار انجام شود.

==================================================
22. معماری Data Separation
==========================

اطلاعات را به سه دسته تقسیم کن:

PUBLIC GAME STATE
اطلاعاتی که همه بازیکنان مجاز به دیدن آن هستند.

ROLE-SPECIFIC STATE
اطلاعاتی که فقط Role خاص باید ببیند.

PRIVATE PLAYER STATE
اطلاعات شخصی هر بازیکن.

هیچ Role نباید به State محرمانه Role دیگر دسترسی داشته باشد.

==================================================
23. تست امنیتی
==============

بررسی کن که:

* Guesser نتواند Word را دریافت کند.
* Hidden Player نتواند اطلاعات محرمانه Searchers را ببیند.
* Player نتواند Role خود را دستی تغییر دهد.
* Player نتواند Score خود را تغییر دهد.
* Player نتواند Timer را تغییر دهد.
* Player نتواند Round را پایان دهد مگر طبق قوانین.
* Client نتواند Game State اصلی را جعل کند.

==================================================
24. UI فعلی را حفظ کن اما Architecture را اصلاح کن
==================================================

استایل فعلی «میدان هم‌تیمی‌ها»، رنگ‌ها، Avatarها، Typography، Components و Visual Language را بدون دلیل تغییر نده.

تمرکز این تغییر روی:

CORE GAME LOGIC
REAL-TIME MULTIPLAYER
ROLE-BASED UX
GAME STATE
LOBBY
SYNCHRONIZATION
CONNECTION MANAGEMENT
SECURITY
GAME FLOW

باشد.

==================================================
25. خروجی نهایی مورد انتظار
===========================

پس از اعمال تغییرات:

1. تمام بازی‌ها را بررسی کن.
2. Game Type هر بازی را مشخص کن.
3. بازی‌های Single Player و Online را از هم جدا کن.
4. بازی‌های Online را از معماری One Device خارج کن.
5. «طراح ناشناس» را به Multiplayer Real-Time واقعی تبدیل کن.
6. Live Drawing بین دستگاه‌ها را پیاده‌سازی/شبیه‌سازی کن.
7. نقش Painter و Guessers را کاملاً مستقل کن.
8. «شکار بهسازانی» را از Single Player حذف کن.
9. «شکار بهسازانی» را فقط در Online Games قرار بده.
10. انتخاب «شکار بهسازانی» را مستقیماً به Online Lobby هدایت کن.
11. Room Creation و Join by Code را فعال کن.
12. Role Assignment را بعد از شروع بازی انجام بده.
13. Shared State و Role-specific State را تفکیک کن.
14. Timer را مشترک و synchronized کن.
15. Reconnect و Disconnect را مدیریت کن.
16. Host Disconnect را مدیریت کن.
17. Duplicate Event و Race Condition را کنترل کن.
18. همه مسیرها را با سناریوهای مختلف تست کن.
19. هیچ مسیر Single Player برای «شکار بهسازانی» باقی نماند.
20. هیچ بازی Online نباید با یک گوشی و چند شرکت‌کننده اجرا شود.

در پایان یک Audit داخلی انجام بده و برای هر بازی مشخص کن:

Game Name
Game Type
Min Players
Max Players
Online/Offline
Requires Lobby
Requires Room
Requires Role Assignment
Requires Real-Time Sync
Independent Device Per Player
Status

اگر هر بازی هنوز به معماری «یک دستگاه برای چند بازیکن» وابسته است، آن را به‌عنوان FAIL علامت‌گذاری کن و اصلاح کن.

هدف نهایی:

هر بازیکن = یک دستگاه مستقل
هر بازیکن = یک Connection مستقل
هر بازیکن = یک Role مستقل
تمام بازیکنان = یک Shared Real-Time Game State

و تجربه بازی باید واقعاً Multiplayer Online باشد، نه شبیه‌سازی Multiplayer روی یک دستگاه.
