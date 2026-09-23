در این پروژه یک بازبینی و بازطراحی عمیق روی «هسته بازی‌ها» انجام بده.

هدف اصلی این است که بازی‌های چندنفره فعلی از حالت «بازی روی یک دستگاه / Shared Screen» خارج شوند و به یک ساختار واقعی Online Multiplayer تبدیل شوند؛ به‌گونه‌ای که هر بازیکن با دستگاه خودش وارد بازی شود و بر اساس نقش، وضعیت، اطلاعات محرمانه و اتفاقات مربوط به خودش، محتوای متفاوتی ببیند.

⚠️ بسیار مهم:
فقط UI را تغییر نده.
فقط دکمه‌ها و صفحات را جابه‌جا نکن.
هسته منطقی، State Management، Role Management، Game Flow، Event System و Visibility Rules تمام بازی‌ها را بررسی و در صورت نیاز بازطراحی کن.

---

1. ابتدا کل پروژه را Audit کن

---

تمام بازی‌های موجود در پروژه را شناسایی کن و برای هر بازی موارد زیر را استخراج کن:

* نام بازی
* حداقل و حداکثر بازیکن
* امکان Single Player
* امکان Online Multiplayer
* امکان بازی با Room Code
* تعداد نقش‌ها
* نقش هر بازیکن
* اطلاعات عمومی
* اطلاعات خصوصی
* اطلاعات محرمانه
* اطلاعاتی که فقط Host باید ببیند
* اطلاعاتی که فقط یک نقش خاص باید ببیند
* اطلاعاتی که باید برای همه بازیکنان نمایش داده شود
* مراحل بازی
* شرایط شروع
* شرایط پایان
* نحوه تعیین برنده
* نحوه تعیین بازنده
* Eventهای بازی
* وضعیت‌های قابل تغییر
* وابستگی‌های بین بازیکنان
* وضعیت‌های همزمان و غیرهمزمان

برای هر بازی مشخص کن آیا واقعاً Multiplayer است یا فقط ظاهر Multiplayer دارد.

---

2. معماری واقعی Multiplayer ایجاد کن

---

برای بازی‌های آنلاین این مدل معماری را در هسته پیاده‌سازی کن:

GAME SESSION
↓
ROOM
↓
PLAYERS
↓
ROLES
↓
GAME STATE
↓
PRIVATE PLAYER STATE
↓
PUBLIC GAME STATE
↓
EVENTS
↓
PLAYER-SPECIFIC VIEW

هر Room باید دارای:

* roomId
* hostId
* gameId
* players
* playerRoles
* currentPhase
* currentTurn
* gameState
* publicState
* privateStates
* events
* timers
* scores
* winner
* loser
* connectionStatus

باشد.

---

3. اصل بسیار مهم: Server/Game Authority

---

منطق اصلی بازی نباید وابسته به UI یک بازیکن باشد.

هیچ بازیکنی نباید بتواند با تغییر UI یا State محلی:

* نقش خودش را تغییر دهد
* نقش بازیکن دیگر را ببیند
* اطلاعات محرمانه را مشاهده کند
* امتیاز خود را به صورت غیرمجاز تغییر دهد
* برنده را تعیین کند
* زمان بازی را دستکاری کند
* Event غیرمجاز ایجاد کند
* نوبت بازیکن دیگر را اجرا کند

State اصلی بازی باید authoritative باشد.

Client فقط:

1. Event معتبر ارسال کند
2. State مجاز خودش را دریافت کند
3. View متناسب با Role خودش را Render کند

---

4. Public State و Private State را کاملاً جدا کن

---

برای هر بازی State را حداقل به دو بخش تقسیم کن:

PUBLIC GAME STATE

اطلاعاتی که همه بازیکنان می‌توانند ببینند.

مثلاً:

* نام بازیکنان
* Avatar
* امتیازهای قابل مشاهده
* مرحله فعلی
* زمان باقی‌مانده
* نوبت فعلی
* وضعیت عمومی بازی
* Eventهای عمومی

PRIVATE PLAYER STATE

اطلاعاتی که فقط همان بازیکن مجاز به دیدن آن است.

مثلاً:

* Role
* Secret Word
* Secret Location
* Private Mission
* Hidden Identity
* Secret Clue
* کارت‌های اختصاصی
* انتخاب‌های مخفی
* اطلاعات مربوط به تیم
* اطلاعاتی که فقط Host یا Moderator مجاز به دیدن آن است

هیچ Private State نباید به Client بازیکن دیگر ارسال شود.

---

5. Role-Based Visibility System بساز

---

یک سیستم مرکزی برای کنترل Visibility ایجاد کن.

برای هر Data Object مشخص کن:

visibility:

* public
* player
* role
* team
* host
* moderator
* hidden

مثلاً:

{
"secretWord": {
"visibility": "player",
"playerId": "P03"
}
}

یا:

{
"spyIdentity": {
"visibility": "role",
"role": "spy"
}
}

یا:

{
"teamClue": {
"visibility": "team",
"teamId": "teamA"
}
}

UI نباید خودش تصمیم بگیرد چه اطلاعاتی محرمانه است.
این تصمیم باید از Game Engine و Permission/Visibility Layer بیاید.

---

6. Player-specific UI ایجاد کن

---

یک Game Screen مشترک نساز که همه بازیکنان دقیقاً همان محتوا را ببینند.

برای هر Player این ساختار را داشته باش:

GAME STATE
↓
PLAYER ID
↓
PLAYER ROLE
↓
PLAYER PERMISSIONS
↓
VISIBLE STATE
↓
PLAYER VIEW

بنابراین:

Player A ممکن است یک اطلاعات ببیند.
Player B اطلاعات دیگری.
Player C اطلاعات دیگری.

اما همه از یک Game Session مشترک استفاده کنند.

---

7. Event-driven Game Engine

---

تمام اتفاقات مهم بازی را به Event تبدیل کن.

مثلاً:

PLAYER_JOINED
PLAYER_READY
GAME_STARTED
ROLE_ASSIGNED
TURN_STARTED
PLAYER_ACTION
ANSWER_SUBMITTED
CLUE_SENT
VOTE_STARTED
VOTE_SUBMITTED
PLAYER_ELIMINATED
ROUND_STARTED
ROUND_ENDED
TIMER_STARTED
TIMER_EXPIRED
GAME_ENDED
PLAYER_DISCONNECTED
PLAYER_RECONNECTED

هر Event باید شامل مواردی مانند:

* eventId
* roomId
* gameId
* playerId
* eventType
* timestamp
* payload
* phase
* validation
* visibility

باشد.

Eventها باید باعث تغییر Game State شوند، نه اینکه UI مستقیماً State را تغییر دهد.

---

8. State Machine برای هر بازی

---

برای تک‌تک بازی‌ها State Machine واقعی تعریف کن.

مثلاً:

LOBBY
↓
PLAYER_JOINING
↓
READY_CHECK
↓
ROLE_ASSIGNMENT
↓
GAME_START
↓
ROUND
↓
TURN
↓
ACTION
↓
RESOLUTION
↓
NEXT_TURN / NEXT_ROUND
↓
GAME_END
↓
RESULT

هیچ بازیکنی نباید بتواند بدون Event معتبر از یک State به State دیگر منتقل شود.

برای هر Transition مشخص کن:

* چه کسی مجاز است؟
* چه Eventی لازم است؟
* چه اطلاعاتی تغییر می‌کند؟
* چه کسانی تغییر را می‌بینند؟
* چه کسی باید Notification دریافت کند؟

---

9. بازی‌ها را یکی‌یکی از نظر هسته بررسی کن

---

تمام بازی‌های فعلی پروژه را بدون حذف بازی بررسی کن.

حداقل برای این دسته‌ها:

* مافیای بهسازانی
* جاسوس بهسازان
* رمزگشایان بهسازان
* طراح ناشناس
* مسابقه بزرگ IT
* کد مخفی پروژه
* یک کلمه
* چشمک
* دوز
* نبرد قلمرو
* یک کلمه، چند سرنخ
* کلمه ممنوعه
* اسم‌فامیل سرعتی
* حدس بزن
* بازی سرعتی نهایی
* قایم‌باشک / شکار بهسازانی

منطق واقعی Multiplayer هرکدام را بررسی کن و در صورت نیاز اصلاح کن.

---

10. بازی‌های Role-Based

---

برای بازی‌هایی مثل:

مافیا
جاسوس
قایم‌باشک / شکار
طراح ناشناس
رمزگشایان
کد مخفی
بازی‌های تیمی

حتماً Role Assignment واقعی ایجاد کن.

مثلاً:

PLAYER
TEAM
ROLE
PRIVATE INFORMATION
AVAILABLE ACTIONS

برای هر Role مشخص کن:

* چه چیزی می‌بیند؟
* چه چیزی نمی‌بیند؟
* چه کاری می‌تواند انجام دهد؟
* چه کاری نمی‌تواند انجام دهد؟
* چه Eventهایی می‌تواند ایجاد کند؟
* چه Eventهایی فقط باید مشاهده کند؟

---

11. نمونه مهم: بازی جاسوس بهسازان

---

این بازی نباید روی یک صفحه مشترک اجرا شود.

سناریوی صحیح:

Room ساخته می‌شود.

بازیکنان وارد می‌شوند.

Game Engine نقش‌ها را تعیین می‌کند.

مثلاً:

Player 1 → Employee
Player 2 → Employee
Player 3 → Employee
Player 4 → Spy

برای Employeeها:

LOCATION = قابل مشاهده

برای Spy:

LOCATION = مخفی

اما Spy باید اطلاعات متفاوتی دریافت کند؛ مثلاً:

* نقش خودش
* قوانین Spy
* اطلاعات عمومی لازم
* هدف بازی

Employeeها نباید بفهمند چه کسی Spy است.

هر Client فقط State مجاز خودش را دریافت کند.

---

12. نمونه مهم: مافیای بهسازانی

---

نقش‌ها باید به صورت واقعی Private باشند.

مثلاً:

Mafia
Doctor
Detective
Citizen

هر بازیکن فقط Role خودش را ببیند.

Detective ممکن است بتواند یک Player را بررسی کند.

نتیجه بررسی فقط به Detective ارسال شود.

Doctor ممکن است فقط اطلاعات مربوط به انتخاب خودش را ببیند.

Mafia ممکن است اطلاعات اعضای Mafia را ببیند.

Citizen نباید هیچ‌کدام از این اطلاعات را دریافت کند.

نتیجه رأی عمومی می‌تواند برای همه نمایش داده شود، اما اطلاعات خصوصی هر Role نباید عمومی شود.

---

13. نمونه مهم: قایم‌باشک / شکار بهسازانی

---

این بازی حتماً باید Multiplayer واقعی باشد.

یک Player به عنوان Hidden Player / Hider انتخاب شود.

سایر بازیکنان در دو Team قرار بگیرند.

Hider باید اطلاعات اختصاصی مربوط به محل مخفی شدن را ببیند.

Teamها باید اطلاعات عمومی و Clueهای مجاز خودشان را ببینند.

اگر سیستم Clue یا Beep وجود دارد:

Beep باید توسط Game Engine کنترل شود.

شدت/زمان/مرحله آن باید بخشی از Game State باشد.

بازیکنان نباید محل واقعی Hider را مستقیماً دریافت کنند.

هر بازیکن باید بتواند از دستگاه خودش:

* وضعیت بازی
* Clueهای مجاز
* Timer
* انتخاب
* حدس
* نتیجه

را ببیند.

---

14. بازی‌های Team-Based

---

برای بازی‌هایی که Team دارند:

Team State و Player State را جدا کن.

مثلاً:

PUBLIC:
Team A score
Team B score
Round
Timer

TEAM PRIVATE:
Team A clues
Team A secret information

PLAYER PRIVATE:
Player-specific mission
Player-specific cards
Player-specific role

بازیکن تیم A نباید اطلاعات Private تیم B را دریافت کند.

---

15. بازی‌های بدون Role

---

حتی بازی‌هایی که Role مخفی ندارند نیز نباید روی یک Client واحد اجرا شوند.

هر Player باید:

* Client مستقل
* Input مستقل
* Action مستقل
* Score مستقل
* Timer synchronized
* Connection status مستقل

داشته باشد.

مثلاً در بازی سرعتی:

Player A جواب خودش را ارسال می‌کند.

Player B جواب خودش را ارسال می‌کند.

Server/Engine هر دو را ثبت می‌کند.

UI هر Player فقط وضعیت مجاز را نشان می‌دهد.

---

16. Synchronization

---

تمام Clientها باید با Game Clock و State مشترک Synchronize باشند.

از Local Timer مستقل برای تصمیم‌گیری استفاده نکن.

Timer اصلی باید authoritative باشد.

در صورت:

* Refresh
* قطع اینترنت
* Reconnect
* بازگشت به صفحه
* تغییر دستگاه
* تأخیر شبکه

بازی باید از State واقعی Room دوباره بازسازی شود.

---

17. Reconnect و Recovery

---

اگر Player اتصالش قطع شد:

Room نباید خراب شود.

State بازیکن حفظ شود.

بعد از Reconnect:

1. Player شناسایی شود
2. Role قبلی بازیابی شود
3. Private State مجدداً برای همان Player ارسال شود
4. Game State فعلی دریافت شود
5. Player به مرحله فعلی برگردد

Player نباید Role جدید بگیرد مگر اینکه قوانین همان بازی چنین چیزی را مشخص کرده باشد.

---

18. جلوگیری از تقلب و State Manipulation

---

هیچ مقدار مهمی را صرفاً از Client قبول نکن.

موارد زیر باید Server/Game Engine اعتبارسنجی شوند:

* Score
* Winner
* Role
* Turn
* Timer
* Vote
* Answer
* Game Phase
* Room State

اگر Client Event غیرمجاز ارسال کرد:

REJECT_EVENT

و بازی نباید State نامعتبر دریافت کند.

---

19. Single Player را از Multiplayer کاملاً جدا کن

---

این موضوع بسیار مهم است.

اگر کاربر «بازی تک نفره» را انتخاب کرد:

نباید عناصر مربوط به Multiplayer نمایش داده شوند.

از جمله:

* Online Game
* Room Code
* Join Room
* Player List
* Team Selection
* Host
* Waiting Room Multiplayer

در Single Player فقط Flow مخصوص Single Player اجرا شود.

اگر بازی ذاتاً Multiplayer است و Single Player برای آن تعریف نشده:

آن بازی نباید در Single Player قابل انتخاب باشد.

این Rule را از Game Metadata کنترل کن، نه فقط UI.

---

20. Game Capability Metadata

---

برای هر بازی یک Configuration استاندارد ایجاد کن:

{
gameId,
minPlayers,
maxPlayers,
supportsSinglePlayer,
supportsOnline,
supportsRoomCode,
supportsTeams,
supportsHiddenRoles,
supportsPrivateInformation,
requiresHost,
requiresRealtimeSync,
gamePhases,
roles,
winConditions
}

تمام UI و Flow باید از همین Metadata استفاده کنند.

---

21. Game Engine مشترک

---

به‌جای اینکه برای هر بازی منطق Multiplayer جداگانه و پراکنده ساخته شود، یک Multiplayer Core مشترک ایجاد کن:

MultiplayerCore

شامل:

* RoomManager
* PlayerManager
* RoleManager
* GameStateManager
* EventManager
* PermissionManager
* VisibilityManager
* TurnManager
* TimerManager
* ScoreManager
* ConnectionManager
* ReconnectionManager
* GameResultManager

و هر بازی فقط Game Rules مخصوص خودش را روی این Core پیاده کند.

---

22. تست سناریوهای واقعی

---

برای تک‌تک بازی‌ها حداقل این سناریوها را تست کن:

Scenario A:
2 بازیکن

Scenario B:
حداقل تعداد بازیکن

Scenario C:
تعداد متوسط

Scenario D:
حداکثر تعداد بازیکن

Scenario E:
بازیکن جدید وسط Lobby

Scenario F:
بازیکن Disconnect

Scenario G:
بازیکن Reconnect

Scenario H:
Refresh صفحه

Scenario I:
دو بازیکن همزمان Action انجام دهند

Scenario J:
Action غیرمجاز ارسال شود

Scenario K:
بازیکن تلاش کند اطلاعات Role دیگر را ببیند

Scenario L:
Timer تمام شود

Scenario M:
Host Disconnect شود

Scenario N:
Game End

Scenario O:
Rematch

در هر Scenario بررسی کن:

* State صحیح است؟
* Role صحیح است؟
* اطلاعات Private لو نمی‌رود؟
* همه Clientها Synchronize هستند؟
* Score صحیح است؟
* Winner صحیح است؟
* UI صحیح است؟
* Event صحیح ثبت می‌شود؟
* بازی وارد State نامعتبر نمی‌شود؟

---

23. تست Security / Privacy

---

به‌صورت اختصاصی بررسی کن:

آیا Player A می‌تواند Private State Player B را دریافت کند؟

آیا Role مخفی در Client دیگری وجود دارد؟

آیا اطلاعات Hidden در DOM / State / Local Storage / Client Payload قابل مشاهده است؟

آیا با تغییر URL یا Route می‌توان وارد صفحه Player دیگر شد؟

آیا با تغییر Player ID می‌توان اطلاعات بازیکن دیگر را گرفت؟

آیا Client می‌تواند Score را دستکاری کند؟

آیا Client می‌تواند Winner را تغییر دهد؟

اگر هرکدام ممکن است، اصلاح کن.

---

24. تست UI بر اساس Role

---

برای هر بازی یک Matrix بساز:

| Role | Visible Information | Hidden Information | Allowed Actions | Forbidden Actions |

و UI را بر اساس آن Render کن.

هدف:

یک Player نباید صرفاً به دلیل اینکه صفحه را باز کرده، اطلاعاتی را ببیند که متعلق به Role دیگری است.

---

25. تست End-to-End

---

برای هر بازی حداقل 3 تا 10 Client مجزا شبیه‌سازی کن.

مثلاً:

Browser 1 → Player A
Browser 2 → Player B
Browser 3 → Player C
Browser 4 → Player D

بررسی کن که:

هر Client اطلاعات صحیح خودش را می‌بیند.

Actionهای یک Player در Clientهای مجاز نمایش داده می‌شود.

Actionهای Private در Clientهای غیرمجاز نمایش داده نمی‌شود.

Game State همه Clientها synchronized باقی می‌ماند.

---

26. Performance

---

از ارسال State کامل در هر Event خودداری کن.

در صورت امکان:

* Delta Updates
* Event-based Updates
* Selective State Updates
* Debouncing
* Throttling
* Efficient subscriptions

استفاده کن.

هر Player فقط اطلاعاتی را دریافت کند که برای او لازم است.

---

27. نتیجه نهایی مورد انتظار

---

در پایان، تمام بازی‌ها باید از این مدل:

ONE DEVICE
↓
SHARED SCREEN
↓
SHARED STATE
↓
EVERYONE SEES EVERYTHING

به این مدل تبدیل شوند:

MULTIPLE DEVICES
↓
ONE ROOM
↓
AUTHORITATIVE GAME STATE
↓
PLAYER ROLES
↓
PRIVATE + PUBLIC STATE
↓
ROLE-BASED VISIBILITY
↓
PLAYER-SPECIFIC UI
↓
SYNCHRONIZED EVENTS
↓
REAL MULTIPLAYER GAME

---

28. مهم‌ترین قانون پروژه

---

هرجا بین «ظاهر درست» و «هسته درست» تعارض وجود داشت، اولویت با هسته درست است.

قبل از تغییر UI ابتدا Architecture و Game Logic را اصلاح کن.

هیچ بازی را صرفاً با تغییر ظاهر Multiplayer فرض نکن.

هر بازی باید واقعاً بتواند روی چند دستگاه مستقل اجرا شود.

---

29. گزارش نهایی

---

بعد از بررسی و اصلاح، یک گزارش داخلی تولید کن که برای هر بازی مشخص کند:

Game
Multiplayer Status
Player Count
Roles
Public State
Private State
Game Phases
Events
Synchronization
Reconnect
Security
Win Condition
Test Status

و در پایان:

* تمام مشکلات پیدا شده
* تمام مشکلات اصلاح شده
* مشکلات باقی‌مانده
* مواردی که نیاز به Backend واقعی دارند
* مواردی که در Figma Make قابل شبیه‌سازی هستند
* مواردی که نیازمند WebSocket / Realtime Backend هستند

را مشخص کن.

اگر بخشی از Multiplayer واقعی به Backend یا Realtime Infrastructure نیاز دارد، آن را مخفی یا شبیه‌سازی نکن؛ دقیقاً مشخص کن کدام بخش نیازمند Backend واقعی است.

---

30. قانون نهایی

---

قبل از اعلام پایان:

تمام بازی‌ها را Audit کن.
تمام Roleها را Audit کن.
تمام Visibilityها را Audit کن.
تمام Stateها را Audit کن.
تمام Eventها را Audit کن.
تمام مسیرهای Single Player / Multiplayer را Audit کن.
تمام سناریوهای Disconnect / Reconnect را Audit کن.
تمام سناریوهای چند دستگاهی را Audit کن.
تمام مسیرهای برنده / بازنده را Audit کن.

هیچ بازی را فقط به دلیل اینکه UI آن درست نمایش داده می‌شود، موفق تلقی نکن.

معیار موفقیت این است:

اگر 4 بازیکن با 4 دستگاه مستقل وارد یک Room شوند، هر چهار نفر بتوانند همزمان یک بازی واقعی را تجربه کنند و هر بازیکن فقط اطلاعات و امکانات مجاز مربوط به Role و وضعیت خودش را ببیند.
