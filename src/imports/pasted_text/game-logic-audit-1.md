هسته منطقی تمام بازی‌های اپلیکیشن «میدان هم‌تیمی‌ها» را به‌صورت کامل بررسی، تست و در صورت نیاز بازطراحی کن.

هدف اصلی این تسک این است که اجرای هر بازی کاملاً بر اساس:

* تعداد مجاز شرکت‌کنندگان
* نوع اجرای بازی
* تک‌نفره یا چندنفره بودن
* آنلاین یا آفلاین بودن
* نیاز یا عدم نیاز به Room
* نیاز یا عدم نیاز به Room Code
* نقش Host / Player
* و قوانین واقعی همان بازی

کنترل شود و هیچ Flow نامعتبر یا متناقضی در اپ وجود نداشته باشد.

## 1. ابتدا هسته تمام بازی‌ها را Audit کن

برای هر 16 بازی موجود، یک Game Configuration منطقی تعریف یا اصلاح کن که حداقل شامل این موارد باشد:

* gameId
* gameName
* category
* minPlayers
* maxPlayers
* supportedModes
* singlePlayerSupported
* multiplayerSupported
* onlineSupported
* offlineSupported
* requiresRoom
* requiresRoomCode
* requiresHost
* numberOfTeams
* teamMode
* gameDuration
* scoringModel
* winnerModel

قبل از هر تغییر UI، منطق هر بازی را بررسی کن و مشخص کن که چه حالت‌هایی واقعاً برای آن بازی معتبر هستند.

هر بازی فقط باید در Modeهایی اجرا شود که برای هسته واقعی آن بازی معتبر هستند.

---

# 2. قانون مهم: بازی نباید با Mode نامعتبر اجرا شود

به‌عنوان مثال:

اگر «شکار بهسازانی‌ها» یک بازی چندنفره تیمی است:

* نباید در حالت «بازی تک‌نفره» نمایش داده شود.
* نباید امکان اجرای آن با یک بازیکن وجود داشته باشد.
* اگر حداقل بازیکن آن بیشتر از 1 است، سیستم باید قبل از شروع بازی مانع ادامه شود.
* نباید با Fake Player یا Bot به‌صورت خودکار آن را تک‌نفره کند مگر اینکه برای همان بازی صراحتاً Bot Mode طراحی شده باشد.
* اگر بازی به چند بازیکن واقعی نیاز دارد، باید کاربر را به Flow مناسب Multiplayer هدایت کند.

این منطق را فقط برای شکار بهسازانی‌ها اعمال نکن؛ تمام بازی‌ها باید با همین رویکرد بررسی شوند.

---

# 3. منطق Single Player را اصلاح کن

زمانی که کاربر در صفحه انتخاب بازی، گزینه:

«بازی تک نفره»

را انتخاب می‌کند، سیستم باید فقط بازی‌هایی را نمایش دهد که واقعاً Single Player را پشتیبانی می‌کنند.

بازی‌های Multiplayer-only نباید در این حالت قابل انتخاب باشند.

اگر کاربر قبلاً یک بازی Multiplayer-only را انتخاب کرده باشد و سپس Mode را به Single Player تغییر دهد:

1. سیستم باید آن بازی را از Selection حذف کند یا با پیام واضح اعلام کند که این بازی در حالت تک‌نفره قابل اجرا نیست.
2. نباید کاربر وارد Flow ناقص شود.
3. نباید Room ساخته شود.
4. نباید Room Code ایجاد شود.
5. نباید انتظار ورود بازیکن دیگر ایجاد شود.

---

# 4. Bottom Sheet انتخاب نوع بازی را هوشمند کن

در Flow انتخاب نوع بازی، Bottom Sheet نباید همیشه همه گزینه‌ها را نشان دهد.

گزینه‌ها باید Dynamic باشند و بر اساس بازی انتخاب‌شده تغییر کنند.

### حالت Single Player

اگر کاربر «بازی تک نفره» را انتخاب کرده است:

نمایش:

* بازی تک نفره

و در صورت نیاز گزینه‌های مرتبط با همان بازی.

نباید این موارد نمایش داده شوند:

* بازی آنلاین
* بازی چندنفره آنلاین
* ورود با کد اتاق
* ساخت اتاق
* Join Room
* Room Code
* Host
* Invite Players

مگر اینکه برای همان Flow واقعاً مورد نیاز باشند.

### حالت Multiplayer Online

فقط در صورتی نمایش داده شود که بازی انتخاب‌شده Multiplayer و Online را پشتیبانی کند.

گزینه‌های مرتبط:

* ساخت دورهمی / ساخت اتاق
* ورود با کد اتاق
* دعوت دوستان
* Room Code
* Host / Player

### حالت Offline / Local

اگر بازی قابلیت اجرای Local/Offline دارد، فقط در بازی‌هایی که این حالت را پشتیبانی می‌کنند نمایش داده شود.

در این حالت:

* اینترنت نباید اجباری باشد.
* Room Code نباید ایجاد شود.
* Join با Code نباید نمایش داده شود.
* بازی باید بتواند روی همان دستگاه اجرا شود.
* تعداد بازیکنان باید با min/maxPlayers کنترل شود.

---

# 5. هیچ Option غیرمرتبطی را نمایش نده

اصل مهم UI:

«Don't show invalid options; don't show them and then disable them.»

یعنی اگر یک گزینه برای بازی انتخاب‌شده معتبر نیست، ترجیحاً اصلاً نمایش داده نشود.

برای مثال:

اگر بازی فقط Single Player است:

❌ بازی آنلاین
❌ ورود با کد اتاق
❌ ساخت اتاق

و فقط:

✅ بازی تک نفره

نمایش داده شود.

اگر بازی فقط Multiplayer Online است:

❌ بازی تک نفره

نمایش داده نشود.

---

# 6. سیستم Selection بازی را با Mode هماهنگ کن

کاربر ممکن است قبل از انتخاب Mode چند بازی انتخاب کند.

سیستم باید بررسی کند که آیا تمام بازی‌های انتخاب‌شده با Mode انتخاب‌شده سازگار هستند یا خیر.

مثلاً:

Game A → Single Player
Game B → Multiplayer Only

اگر کاربر Mode = Single Player را انتخاب کند:

Game B باید از Selection حذف شود یا سیستم باید یک پیام واضح نمایش دهد و از کاربر بخواهد Selection را اصلاح کند.

هیچ بازی ناسازگاری نباید وارد Match شود.

اگر چند بازی انتخاب شده‌اند، سیستم باید Compatibility Matrix ایجاد کند:

Selected Games × Selected Mode × Player Count

و فقط زمانی اجازه Start بدهد که تمام بازی‌ها معتبر باشند.

---

# 7. تعداد بازیکنان را قبل از شروع Validate کن

برای هر بازی:

minPlayers
maxPlayers

را قبل از Start بررسی کن.

مثلاً اگر:

minPlayers = 4

و تعداد بازیکنان = 1

دکمه Start نباید Match را شروع کند.

به‌جای آن یک پیام واضح نمایش بده:

«برای اجرای این بازی حداقل ۴ بازیکن لازم است.»

اگر تعداد بازیکنان بیشتر از maxPlayers باشد:

«این بازی حداکثر برای ۱۲ بازیکن طراحی شده است.»

از ورود تعداد نامعتبر به Game Engine جلوگیری کن.

---

# 8. Team Logic را نیز بررسی کن

برای بازی‌های تیمی:

* تعداد بازیکنان باید با تعداد تیم‌ها سازگار باشد.
* تقسیم تیم‌ها باید منطقی باشد.
* اگر تعداد بازیکنان فرد است، سیستم باید Rule مشخصی برای تقسیم داشته باشد.
* هیچ تیمی نباید بدون بازیکن ایجاد شود.
* بازیکن نباید همزمان در چند تیم قرار گیرد.
* Host نباید به‌صورت اشتباه به‌عنوان بازیکن اضافه تکراری ایجاد شود.

اگر بازی نیاز به دو تیم دارد، Game Engine باید قبل از شروع بررسی کند:

players >= minimum required
teams valid
players distributed correctly

---

# 9. Room Logic را کاملاً از Single Player جدا کن

Room فقط زمانی ایجاد شود که بازی و Mode به آن نیاز داشته باشند.

Single Player:

NO ROOM

NO ROOM CODE

NO JOIN

NO HOST

NO INVITE

Multiplayer Online:

ROOM REQUIRED

ROOM CODE AVAILABLE

HOST / PLAYER ROLES

INVITE AVAILABLE

Local / Offline:

NO ONLINE ROOM

NO ROOM CODE

NO ONLINE JOIN

Local players can join according to the game's local player limit.

---

# 10. User Flowهای مختلف را End-to-End تست کن

حداقل این سناریوها را شبیه‌سازی و تست کن:

### Scenario 1 — Single Player

Home
→ انتخاب بازی
→ انتخاب «بازی تک نفره»
→ نمایش فقط بازی‌های Single Player
→ Start
→ Game

بررسی کن که هیچ Room یا Code غیرضروری ایجاد نشود.

---

### Scenario 2 — Multiplayer Online Host

Home
→ انتخاب بازی Multiplayer
→ انتخاب Online
→ ساخت دورهمی
→ تعیین نام اتاق
→ ایجاد Room
→ نمایش Room Code
→ دعوت بازیکنان
→ Join Players
→ Start Game

---

### Scenario 3 — Multiplayer Online Join

Home
→ انتخاب بازی
→ انتخاب Online
→ ورود با کد اتاق
→ وارد کردن Code
→ Join
→ انتظار برای Host
→ شروع بازی

کاربری که Join می‌کند نباید مجبور به ساخت Room یا تعیین نام Room باشد.

---

### Scenario 4 — Offline Multiplayer

Home
→ انتخاب بازی Offline
→ تعیین تعداد بازیکنان
→ ورود بازیکنان
→ Start
→ Game

هیچ Room Code یا Online Join نباید نمایش داده شود.

---

### Scenario 5 — انتخاب بازی ناسازگار

انتخاب چند بازی
→ انتخاب Single Player

اگر یکی از بازی‌ها Multiplayer-only باشد:

آن بازی نباید وارد Match شود.

Flow باید gracefully handle شود و UI توضیح واضح ارائه دهد.

---

### Scenario 6 — تعداد بازیکن کمتر از Minimum

انتخاب بازی
→ تعداد بازیکنان کمتر از minPlayers

Start باید Block شود.

پیام واضح نمایش داده شود.

---

### Scenario 7 — تعداد بازیکن بیشتر از Maximum

تعداد بازیکنان > maxPlayers

Start Block شود یا امکان اضافه‌کردن بازیکن بیشتر محدود شود.

---

### Scenario 8 — تغییر Mode بعد از انتخاب بازی

Game Selected
→ Online
→ تغییر به Single Player

تمام گزینه‌ها و Stateهای وابسته به Online باید Reset شوند:

Room
Room Code
Host State
Invites
Joined Players

نباید State قدیمی باقی بماند.

---

### Scenario 9 — تغییر بازی بعد از انتخاب Mode

Single Player
→ انتخاب بازی Multiplayer-only

سیستم باید همان لحظه ناسازگاری را تشخیص دهد و اجازه Start ندهد.

---

### Scenario 10 — Back Navigation

کاربر بین این صفحات حرکت کند:

Game Selection
→ Mode Selection
→ Room
→ Player Lobby
→ Game

و با Back برگردد.

Stateها نباید خراب یا Duplicate شوند.

Roomهای اشتباه نباید ایجاد شوند.

---

# 11. State Management را بررسی کن

تمام Stateهای زیر را بررسی کن:

selectedGames
selectedMode
playerCount
roomId
roomCode
roomName
hostPlayer
joinedPlayers
teams
gameStatus
currentGame
currentRound
scores

بررسی کن که هنگام تغییر:

Game
Mode
Player Count
Back
Restart
Exit

Stateهای قبلی به‌درستی Reset یا Update شوند.

از State Leakage جلوگیری کن.

---

# 12. Game Engine و UI را از هم جدا کن

منطق بازی نباید فقط در UI پیاده‌سازی شده باشد.

یک Configuration مرکزی برای بازی‌ها ایجاد کن تا UI و Game Engine از همان Source of Truth استفاده کنند.

مثلاً ساختاری مشابه:

GameConfig {
id,
name,
minPlayers,
maxPlayers,
modes,
requiresRoom,
requiresHost,
requiresTeams,
scoring,
duration
}

UI باید بر اساس همین Configuration تصمیم بگیرد چه گزینه‌هایی را نمایش دهد.

Game Engine نیز باید قبل از Start همین Configuration را Validate کند.

بنابراین حتی اگر کاربر somehow از UI عبور کرد، Game Engine نباید Match نامعتبر را اجرا کند.

---

# 13. Error Handling

برای تمام حالت‌های نامعتبر پیام واضح و فارسی نمایش بده.

پیام‌ها کوتاه، دوستانه و غیرتخصصی باشند.

مثلاً:

«این بازی برای یک نفر طراحی نشده است.»

«برای شروع حداقل ۴ بازیکن لازم است.»

«این بازی فقط به‌صورت آنلاین تیمی قابل اجراست.»

«این بازی در حالت تک‌نفره در دسترس نیست.»

«تعداد بازیکنان این بازی کامل نیست.»

از Errorهای فنی مانند:

Invalid Game Mode
Room Required
Player Count Error

در UI نهایی استفاده نکن.

---

# 14. Loading / Empty / Error / Success States

تمام Flowها را برای این Stateها بررسی کن:

Loading
Success
Empty
Error
Retry
Timeout
Room Closed
Host Left
Player Left
Connection Lost
Game Start Failed
Game Finished

برای هر State UI مناسب داشته باش.

---

# 15. سناریوهای Edge Case

حداقل این موارد را تست کن:

* Host قبل از Start خارج شود.
* Player قبل از Start خارج شود.
* آخرین Player خارج شود.
* Room Code اشتباه وارد شود.
* Room پر باشد.
* Room منقضی شده باشد.
* کاربر دوبار روی Start کلیک کند.
* کاربر دوبار Join کند.
* اینترنت هنگام Join قطع شود.
* اینترنت هنگام بازی قطع شود.
* کاربر Back بزند.
* کاربر App را Refresh کند.
* کاربر چند بار بین Modeها جابه‌جا شود.
* بازی انتخاب‌شده حذف شود.
* همه بازی‌ها حذف شوند.
* تعداد بازیکنان به حداقل نرسد.
* تعداد بازیکنان از حداکثر عبور کند.

هیچ‌کدام نباید باعث ایجاد Match خراب یا State ناسازگار شوند.

---

# 16. اصل مهم UX

کاربر نباید مجبور باشد منطق فنی سیستم را بفهمد.

سیستم باید خودش بفهمد:

«این بازی با این تعداد بازیکن و این Mode قابل اجرا هست یا نیست.»

و UI فقط گزینه‌های معتبر را به کاربر نشان دهد.

هدف:

ZERO INVALID FLOWS

ZERO IMPOSSIBLE MATCHES

ZERO UNNECESSARY ROOM CREATION

ZERO CONFUSING OPTIONS

---

# 17. تست نهایی تمام بازی‌ها

برای هر 16 بازی یک Test Matrix ایجاد کن و بررسی کن:

Game
Category
Min Players
Max Players
Single Player
Multiplayer
Online
Offline
Room Required
Room Code
Host Required
Teams
Valid Modes
Invalid Modes

تمام ترکیب‌های منطقی را تست کن.

برای هر بازی حداقل این موارد را تست کن:

1. Minimum valid players
2. Maximum valid players
3. Below minimum
4. Above maximum
5. Single Player
6. Multiplayer
7. Online
8. Offline
9. Room Flow
10. Join Flow
11. Back Flow
12. Error Flow

اگر یک Mode برای بازی معتبر نیست، آن Mode نباید در UI نمایش داده شود.

---

# 18. بهبود کلی UX در صورت مشاهده مشکل

فقط مشکلات ذکرشده را Patch نکن.

در حین بررسی، اگر ساختار فعلی باعث پیچیدگی، تکرار State، تناقض بین صفحات یا Flowهای غیرضروری شده است، یک Refactor منطقی انجام بده.

اما:

* Visual Identity فعلی «میدان هم‌تیمی‌ها» حفظ شود.
* تصاویر، Avatarها و Assetهای فعلی بدون دلیل تغییر نکنند.
* ساختار کلی طراحی حفظ شود.
* فقط UX و Architecture در جاهایی که واقعاً لازم است بهبود داده شود.
* هیچ Feature موجودی بدون دلیل حذف نشود.

---

# 19. معیار پذیرش نهایی

تسک فقط زمانی کامل است که:

✅ هر بازی فقط در Modeهای معتبر خود اجرا شود.

✅ بازی‌های Multiplayer-only در Single Player قابل اجرا نباشند.

✅ بازی تک‌نفره هیچ Room غیرضروری نسازد.

✅ در Single Player گزینه‌های Online / Room / Join Code نمایش داده نشوند.

✅ Room فقط برای بازی‌هایی ایجاد شود که واقعاً به آن نیاز دارند.

✅ minPlayers و maxPlayers همیشه enforce شوند.

✅ Team Logic صحیح باشد.

✅ Host و Player Role صحیح باشند.

✅ تغییر Mode باعث باقی‌ماندن State قبلی نشود.

✅ Back Navigation State خراب ایجاد نکند.

✅ تمام 16 بازی تست شوند.

✅ تمام مسیرهای Single Player / Multiplayer / Online / Offline تست شوند.

✅ Error / Loading / Empty / Retry Stateها بررسی شوند.

✅ Edge Caseها تست شوند.

✅ هیچ Invalid Match قابل شروع نباشد.

در پایان، قبل از اعلام موفقیت، یک End-to-End Regression Test روی کل اپلیکیشن انجام بده و مطمئن شو اصلاحات جدید باعث خراب‌شدن Flowهای قبلی نشده‌اند.

در صورت وجود هرگونه تناقض بین UI فعلی و منطق واقعی بازی، منطق معتبر بازی را Source of Truth قرار بده و UI را با آن هماهنگ کن.
