هسته و تجربه بازی «شکار بهسازانی» را به‌صورت کامل بازطراحی و پیاده‌سازی کن.

این تغییر فقط یک تغییر UI نیست؛ باید **Game Core، Multiplayer Architecture، Role Logic، Map System، Round Flow، Visibility Rules، Animation، Scoring، Lobby Flow و تجربه بصری بازی** بازطراحی شوند.

هدف این است که «شکار بهسازانی» به یک بازی آنلاین چندنفره نامتقارن، هیجان‌انگیز، سریع، استراتژیک و اختصاصی برای کارکنان بهسازان ملت تبدیل شود؛ به‌گونه‌ای که هر بازیکن بسته به نقش خود اطلاعات، نقشه، محیط و اتفاقات متفاوتی ببیند.

---

# 1. قانون اصلی بازی

«شکار بهسازانی» یک بازی کاملاً Multiplayer و Role-Based است.

این بازی:

* نباید در حالت تک‌نفره قابل اجرا باشد.
* نباید با یک دستگاه یا یک کاربر اجرا شود.
* نباید اطلاعات نقش‌ها را بین بازیکنان افشا کند.
* هر بازیکن باید Session و View مستقل خود را داشته باشد.
* اطلاعات خصوصی هر Role فقط برای همان Role قابل مشاهده باشد.
* وضعیت بازی باید توسط یک Game State مرکزی و Server-Authoritative کنترل شود.

حداقل تعداد بازیکنان پیشنهادی:

* 4 بازیکن

حداکثر:

* 12 بازیکن

پیشنهاد Role Distribution:

* 1 تا 2 نفر «پیداکننده»
* سایر بازیکنان «مخفی‌شونده»

تعداد پیداکننده‌ها باید بر اساس تعداد بازیکنان به‌صورت Dynamic تنظیم شود.

مثلاً:

4–5 بازیکن:
1 Seeker

6–8 بازیکن:
2 Seekers

9–12 بازیکن:
2–3 Seekers

---

# 2. حذف کامل حالت تک‌نفره

در صفحه انتخاب بازی:

اگر کاربر «شکار بهسازانی» را انتخاب کرد:

گزینه‌های زیر نباید نمایش داده شوند:

* بازی تک‌نفره
* بازی با یک دستگاه
* Solo
* تمرین تک‌نفره

کاربر باید مستقیماً وارد جریان Multiplayer شود.

Flow:

انتخاب بازی
↓
بررسی تعداد بازیکنان
↓
ورود به Lobby
↓
Create Room / Join Room
↓
Waiting Room
↓
Role Assignment
↓
Map Preparation
↓
Round Start
↓
Hide Phase
↓
Hunt Phase
↓
Round Result
↓
Scoreboard
↓
Next Round / Exit

اگر تعداد بازیکنان کافی نیست:

پیام واضح نمایش بده:

«برای شروع شکار بهسازانی حداقل ۴ هم‌تیمی لازم است.»

و CTA:

«دعوت هم‌تیمی‌ها»

---

# 3. Lobby اختصاصی بازی

برای شکار بهسازانی یک Lobby واقعی Multiplayer طراحی کن.

Lobby باید شامل:

* نام اتاق
* کد اتاق
* تعداد بازیکنان حاضر
* Avatar بازیکنان
* وضعیت Ready
* Host
* تعداد بازیکنان موردنیاز
* Map انتخاب‌شده
* تنظیمات بازی
* شمارش معکوس شروع

Host بتواند:

* Map را انتخاب کند
* تعداد Roundها را انتخاب کند
* مدت Hide Phase را انتخاب کند
* مدت Hunt Phase را انتخاب کند
* شروع بازی را بزند

اما Role بازیکنان قبل از شروع Round به‌صورت Secret تعیین شود.

---

# 4. سیستم Role Assignment

در شروع هر Round:

سیستم به‌صورت Random و Server-Side نقش‌ها را تعیین کند.

Roles:

### SEEKER

پیداکننده

### HIDER

مخفی‌شونده

هر بازیکن فقط Role خودش را ببیند.

مثلاً:

Player A:

«تو پیداکننده هستی»

Player B:

«تو مخفی‌شونده هستی»

Player C:

«تو مخفی‌شونده هستی»

هیچ بازیکنی نباید Role سایر بازیکنان را ببیند.

---

# 5. تجربه کاملاً متفاوت برای دو Role

این بخش بسیار مهم است.

نباید برای Hider و Seeker یک صفحه مشترک ساخته شود.

هر Role باید:

* Camera/View مستقل
* Map مستقل
* اطلاعات مستقل
* HUD مستقل
* Objective مستقل
* Animation مستقل
* Sound Cue مستقل
* Ability مستقل
* Interaction مستقل

داشته باشد.

---

# 6. تجربه HIDER

وقتی بازیکن Hider است:

نباید نقشه کامل سه‌بعدی ساختمان را مثل Seeker ببیند.

او باید یک محیط بصری بسیار جذاب از محل مخفی‌شدن خود مشاهده کند.

مثلاً:

«تو در طبقه سوم ساختمان آرام هستی.»

سپس محیط به‌صورت یک Scene سه‌بعدی/ایزومتریک/Interactive نمایش داده شود.

محیط شامل:

* اتاق
* راهرو
* میز
* صندلی
* کمد
* در
* پنجره
* تجهیزات اداری
* عناصر واقعی و آشنا از ساختمان

باشد.

بازیکن باید احساس کند واقعاً داخل آن فضا قرار دارد.

---

# 7. Map Hider

برای Hider یک Mini Map ساده کافی نیست.

یک فضای بصری Interactive بساز.

مثلاً:

┌────────────────────┐
│     محیط طبقه      │
│                    │
│   🪑     🗄️        │
│                    │
│        👤          │
│                    │
│  🚪          🪟    │
└────────────────────┘

محیط باید:

* Parallax داشته باشد
* نورپردازی متحرک داشته باشد
* سایه داشته باشد
* عناصر محیطی Animation داشته باشند
* حرکت بسیار محدود محیطی داشته باشند
* Sound Cue داشته باشد
* وضعیت خطر را با تغییرات ظریف نشان دهد

---

# 8. محل مخفی شدن

Hider در شروع Round باید چند گزینه برای مخفی‌شدن داشته باشد.

مثلاً:

«کجا مخفی می‌شوی؟»

* اتاق جلسه
* کنار تجهیزات
* پشت میز
* انبار
* انتهای راهرو
* کنار پنجره

هر Location باید Risk / Safety متفاوت داشته باشد.

اما این اطلاعات نباید به‌صورت ساده و عددی و خشک نمایش داده شود.

به‌جای:

Safety: 87%

از Visual Language استفاده کن:

🟢 پنهان
🟡 مشکوک
🔴 پرریسک

---

# 9. سیستم حرکت Hider

Hider نباید کاملاً Static باشد.

اما نباید حرکت او کاملاً آزاد و شبیه بازی اکشن باشد.

سیستم:

Hide
↓
Observe
↓
Move
↓
Re-hide

باشد.

حرکت کردن ریسک ایجاد کند.

مثلاً:

هر حرکت:

* Noise افزایش دهد
* احتمال Detection را افزایش دهد
* موقعیت احتمالی Hider را برای Seekers قابل تشخیص‌تر کند

---

# 10. سیستم Clue / Sound

یکی از مهم‌ترین عناصر بازی باید «صدا» باشد.

برای Hider و Seeker سیستم صوتی متفاوت باشد.

Hider:

* صدای محیط
* صدای قدم‌ها
* صدای در
* صدای آسانسور
* صدای محیط اداری

را بشنود.

Seeker:

یک سیستم Clue داشته باشد.

مثلاً:

🔊

«صدای مشکوک از طبقه ۳»

اما اطلاعات نباید دقیقاً محل Hider را لو بدهد.

به‌مرور زمان:

Noise Pulse
→
Approximate Location
→
Stronger Signal

ایجاد شود.

این سیستم باید تنش بازی را افزایش دهد.

---

# 11. نقشه سه‌بعدی SEEKER

Seeker باید یک تجربه کاملاً متفاوت داشته باشد.

برای Seeker یک Map سه‌بعدی از ساختمان طراحی کن.

این Map باید:

* 3D
* طبقه‌به‌طبقه
* قابل Zoom
* قابل Rotate
* قابل انتخاب طبقات
* دارای راهروها
* اتاق‌ها
* آسانسور
* راه‌پله
* نقاط مهم ساختمان

باشد.

ساختمان به شکل یک مدل معماری Simplified ولی بسیار دقیق و جذاب نمایش داده شود.

---

# 12. سیستم طبقات

در سمت راست یا چپ صفحه:

FLOORS

Roof
9
8
7
6
5
4
3
2
1
G
-1
-2

قرار گیرد.

کاربر با انتخاب هر طبقه:

Camera / Map
به همان Floor منتقل شود.

Transition باید Animated باشد.

مثلاً:

Floor 5
↓
Zoom Out
↓
Building Cutaway
↓
Floor 4
↓
Zoom In

---

# 13. ساختمان‌های واقعی بهسازان

از اطلاعات ساختمان‌هایی که قبلاً در پروژه تعریف شده استفاده کن.

ساختمان‌ها:

### ساختمان آرام – خیابان دولت

* 2 طبقه پارکینگ زیرزمین
* 5 طبقه اداری
* رستوران / فضای غذایی روی بام
* هر طبقه یک واحد اصلی

### ساختمان شمسایی – دیباجی جنوبی / کوچه شمسایی

* -2 پارکینگ
* 9 طبقه روی زمین
* فضای غذایی در همکف
* نمازخانه روی بام
* طبقات زوج دارای فضای سرویس بانوان
* طبقات فرد دارای سرویس آقایان
* هر طبقه 4 واحد

### ساختمان مژگان

* -1 پارکینگ
* موتورخانه
* حیاط
* فضای سیگار
* 5 طبقه اداری
* نمازخانه روی بام
* حیاط دارای 3 ژنراتور
* طبقه -1 دارای 2 سرویس
* طبقه اول دارای:

  * 1 اتاق جلسه عمومی
  * 3 واحد IT
* هر طبقه اداری دارای 4 واحد

این اطلاعات باید مستقیماً در ساختار Map استفاده شوند.

---

# 14. Map نباید صرفاً یک تصویر باشد

نقشه ساختمان را به‌صورت یک UI Image ساده نساز.

Map باید از نظر بصری شبیه یک Mini 3D Game World باشد.

دارای:

* Walls
* Rooms
* Doors
* Corridors
* Elevators
* Stairs
* Furniture
* Landmarks
* Floor transitions
* Lighting
* Animated indicators

باشد.

هدف:

کاربر احساس کند در حال کنترل یک نقشه واقعی بازی است.

---

# 15. Landmark System

برای ساختمان‌های بهسازان نقاط شاخص تعریف کن.

مثلاً:

آرام:

* پارکینگ
* طبقات اداری
* رستوران بام

شمسایی:

* فضای غذایی
* آسانسور
* نمازخانه
* سرویس‌ها
* واحدهای هر طبقه

مژگان:

* حیاط
* ژنراتورها
* موتورخانه
* اتاق جلسه
* واحدهای IT
* فضای سیگار

این نقاط باید در بازی نقش Gameplay داشته باشند، نه فقط Decoration.

---

# 16. سیستم Hint هوشمند

Seekers نباید تمام نقشه را بدون محدودیت داشته باشند.

در طول بازی Hint دریافت کنند.

مثلاً:

«صدای مشکوک در این محدوده ثبت شد.»

یک Pulse روی Map ایجاد شود.

اما محدوده:

دایره‌ای و محدود

باشد.

با گذشت زمان:

Pulse
→
Smaller Area
→
Stronger Signal

شود.

---

# 17. سیستم Scan

Seeker یک Ability داشته باشد:

SCAN

با فعال کردن آن:

یک Pulse سه‌بعدی در محیط منتشر شود.

اگر Hider در محدوده باشد:

برای مدت بسیار کوتاه:

Silhouette / Pulse / Distortion

نمایش داده شود.

Scan نباید دائمی باشد.

Cooldown داشته باشد.

مثلاً:

SCAN
Cooldown: 30s

---

# 18. Abilityهای Hider

برای افزایش هیجان، Hider نیز Ability داشته باشد.

اما Abilityها محدود باشند.

مثلاً:

### Silent Move

حرکت بدون ایجاد Noise برای مدت کوتاه.

### Decoy

ایجاد صدای جعلی در نقطه دیگر.

### Hide Pulse

برای چند ثانیه Detection سخت‌تر شود.

### Quick Relocate

یک جابه‌جایی کوتاه به Location مجاور.

هر Ability:

* Cooldown
* Animation
* Sound
* Feedback

داشته باشد.

---

# 19. سیستم Decoy

یکی از مهم‌ترین Mechanics بازی:

Hider بتواند یک Fake Signal ایجاد کند.

مثلاً:

Hider در طبقه 3 است.

Decoy:

🔊 صدای مشکوک در طبقه 4

Seekers تصور می‌کنند Hider در طبقه 4 است.

این قابلیت باعث ایجاد Mind Game می‌شود.

---

# 20. سیستم Risk

برای جلوگیری از Camp کردن Hider:

اگر بازیکن مدت زیادی در یک محل بماند:

Risk Meter افزایش پیدا کند.

مثلاً:

SAFE
↓
SUSPICIOUS
↓
EXPOSED

اما این سیستم نباید به شکل یک نوار خشک نمایش داده شود.

با:

* تغییر نور
* تغییر صدای محیط
* Pulse
* UI Warning

نمایش داده شود.

---

# 21. پایان بازی

Seeker زمانی برنده شود که تمام Hiderها را قبل از پایان زمان پیدا کند.

Hiderها زمانی برنده شوند که:

حداقل یک Hider تا پایان زمان زنده بماند.

همچنین Score فردی داشته باشیم.

Hider:

* Survival Time
* Successful Hides
* Successful Decoys
* Successful Escapes
* Risk Avoided

Seeker:

* Players Found
* Correct Scans
* Successful Searches
* False Searches
* Time Efficiency

---

# 22. سیستم Catch

وقتی Seeker یک Hider را پیدا می‌کند:

نباید ناگهان صفحه عوض شود.

یک Sequence کوتاه Animation اجرا شود.

مثلاً:

Detection
↓
Pulse
↓
Reveal
↓
Hider Found
↓
Player Transition

و Hider Found شده به حالت:

Spectator / Supporter

برود.

---

# 23. بازیکن حذف‌شده

بازیکنی که پیدا شده:

بازی را کاملاً ترک نکند.

او وارد Observer Mode شود.

بتواند:

* نقشه را مشاهده کند
* روند بازی را ببیند
* وضعیت بازیکنان را ببیند

اما اطلاعات مخفی Hiderهای زنده را نبیند.

برای جلوگیری از Spoiler:

Observer View باید محدود باشد.

---

# 24. Dynamic Pressure

هرچه زمان به پایان نزدیک‌تر می‌شود:

* موسیقی سریع‌تر
* Pulse بیشتر
* UI شدیدتر
* نور محیط متفاوت
* Countdown برجسته‌تر
* Hintهای محدودتر ولی ارزشمندتر

شود.

مثلاً:

2:00
Normal

1:00
Pressure

0:30
Final Hunt

0:10
Critical

---

# 25. Multi-Round System

بازی فقط یک Round نباشد.

پیشنهاد:

3 Round

در هر Round:

Roleها تغییر کنند.

مثلاً بازیکنی که Round اول Hider بوده، در Round بعدی امکان Seeker شدن داشته باشد.

در پایان:

TOTAL SCORE

محاسبه شود.

---

# 26. عدالت در Role Assignment

Role Assignment باید طوری طراحی شود که یک بازیکن دائماً Seeker نشود.

از سیستم Weighted Random استفاده کن.

سابقه Role بازیکن را ذخیره کن.

اگر بازیکنی چند Round پشت سر هم Seeker بوده:

Probability Seeker شدن او کاهش یابد.

---

# 27. سیستم امتیازدهی

امتیاز فقط برای برد و باخت نباشد.

Hider Score:

* Survival
* Smart Hide
* Successful Decoy
* Escape
* Team Survival

Seeker Score:

* Find
* Accurate Scan
* Correct Hint Interpretation
* Fast Find
* Team Coordination

در پایان:

MVP Round

با یک عنوان جذاب نمایش داده شود.

مثلاً:

🏆 Master Hunter

یا

🥷 Master Hider

اما سیستم رتبه‌بندی نباید باعث شود بازیکن ضعیف احساس شکست شدید کند.

---

# 28. الهام از بازی‌های موفق

هسته بازی را از الگوهای موفق Multiplayer Hide & Seek / Prop Hunt الهام بگیر، اما هیچ بازی دیگری را کپی نکن.

ویژگی‌هایی که در نمونه‌های این ژانر دیده می‌شوند و باید به‌صورت بومی‌سازی‌شده بررسی و در صورت تناسب استفاده شوند:

* Role Asymmetry
* Multiplayer-only structure
* Limited hiding time
* Limited hunting time
* Detection tools
* Decoy
* Ability system
* Dynamic pressure
* Multi-round matches
* Role rotation
* Observer mode
* Map landmarks
* Environmental interaction

بازی‌هایی مانند Mimetic و نمونه‌های Prop Hunt روی تفاوت شدید تجربه Hider و Hunter، توانایی‌های اختصاصی، Scan و Multiplayer تمرکز دارند.

همچنین برخی پیاده‌سازی‌های Hide & Seek از تبدیل بازیکن پیدا‌شده به تیم Seekers استفاده می‌کنند؛ این ایده را بررسی کن و فقط در صورتی استفاده کن که با تعادل بازی «شکار بهسازانی» سازگار باشد.

---

# 29. نکته بسیار مهم: بازی نباید Prop Hunt کپی باشد

«شکار بهسازانی» نباید صرفاً تبدیل شدن به یک صندلی یا میز و مخفی شدن پشت آن باشد.

هویت اصلی بازی باید:

Corporate Hide & Seek

باشد.

یعنی:

ساختمان واقعی/شناخته‌شده
+
نقشه سه‌بعدی
+
اطلاعات مخفی
+
تاکتیک
+
Mind Game
+
Sound Clues
+
Decoy
+
Role Asymmetry
+
Multiplayer

---

# 30. سیستم اطلاعات خصوصی

این مورد را در معماری بازی بسیار جدی پیاده‌سازی کن.

مثلاً:

Hider A می‌بیند:

«مژگان / طبقه 3 / واحد 2»

اما Seeker فقط می‌بیند:

«مژگان / محدوده طبقات 2 تا 4»

Hider B نباید اطلاعات Hider A را ببیند.

Seekerها باید اطلاعات مشترک Gameplay دریافت کنند، ولی اطلاعات خصوصی Hiderها هرگز نباید به Client آنها ارسال شود.

---

# 31. Multiplayer State

یک State Machine واقعی برای بازی ایجاد کن:

LOBBY
WAITING_FOR_PLAYERS
ROLE_ASSIGNMENT
MAP_LOADING
HIDE_PHASE
HUNT_PHASE
PLAYER_FOUND
FINAL_PHASE
ROUND_RESULT
NEXT_ROUND
MATCH_RESULT

هیچ Player نباید بتواند با Refresh، Back، Reconnect یا تغییر UI State را خراب کند.

---

# 32. Reconnect

اگر بازیکن اینترنت خود را از دست داد:

Connection Lost

نمایش داده شود.

بعد:

Reconnecting...

و در صورت موفقیت:

Resume Game

انجام شود.

Role و وضعیت قبلی بازیکن حفظ شود.

---

# 33. جلوگیری از Cheat

اطلاعات حساس را Client-side قرار نده.

به‌خصوص:

* Hider Location
* Role
* Hidden Position
* Detection State
* Score
* Timer
* Ability Cooldown
* Round State

باید Server-authoritative باشند.

---

# 34. Animation System

تمام تغییرات مهم باید Animation داشته باشند.

حداقل:

* Role Reveal
* Map Load
* Floor Transition
* Scan
* Detection
* Decoy
* Player Found
* Countdown
* Round Start
* Round End
* Victory
* Defeat

از Micro Interactionهای زیاد ولی کوتاه استفاده کن.

---

# 35. Visual Style

سبک بصری:

Premium
Modern
Corporate Game
3D
Stylized
Persian-friendly
Behsazan Identity

باشد.

از UI شلوغ و Gameهای قدیمی فاصله بگیر.

رنگ‌ها با هویت کلی «میدان هم‌تیمی‌ها» هماهنگ باشند.

---

# 36. Mobile UX

بازی باید Mobile First باشد.

برای Seeker:

* Pinch Zoom
* Drag Map
* Tap Floor
* Tap Landmark
* Scan Button
* Hint Button

برای Hider:

* Tap Location
* Swipe Environment
* Ability Buttons
* Hide
* Move
* Decoy

کنترل‌ها باید ساده باشند.

---

# 37. Loading

هنگام ورود به Map:

Skeleton / Loading Scene

نمایش بده.

مثلاً:

«در حال آماده‌سازی ساختمان مژگان...»

سپس:

Map Loading
↓
Floor Loading
↓
Players Sync
↓
Ready

---

# 38. Performance

این بازی باید برای موبایل و مرورگر بهینه باشد.

از ساخت 3D بسیار سنگین خودداری کن.

از:

* Simplified 3D
* Low-poly geometry
* Lazy loading
* Level of Detail
* Asset reuse
* Efficient animations
* Local visual effects
* Minimal network payload

استفاده کن.

تمام Animationهای صرفاً بصری را Client-side اجرا کن و فقط State مهم را Synchronize کن.

---

# 39. Error Handling

سناریوهای زیر را تست کن:

* بازیکن قبل از شروع خارج شود
* Host خارج شود
* Seeker خارج شود
* Hider خارج شود
* اینترنت قطع شود
* Room پر باشد
* Room منقضی شود
* Map Load نشود
* Player Sync نشود
* Role Assignment شکست بخورد
* Timer Sync مشکل داشته باشد
* Reconnect اتفاق بیفتد

برای هر مورد Error State مناسب طراحی کن.

---

# 40. سناریوهای تست اجباری

حداقل این سناریوها را اجرا و بررسی کن:

### Scenario 1

4 بازیکن

1 Seeker
3 Hider

### Scenario 2

8 بازیکن

2 Seeker
6 Hider

### Scenario 3

12 بازیکن

3 Seeker
9 Hider

### Scenario 4

کاربر «شکار بهسازانی» را انتخاب می‌کند.

باید مستقیماً به Lobby منتقل شود.

### Scenario 5

کاربر تلاش می‌کند Solo بازی کند.

باید Block شود.

### Scenario 6

تعداد بازیکنان کمتر از 4 است.

Start Game نباید فعال شود.

### Scenario 7

Hider وارد بازی می‌شود.

نباید Map کامل Seeker را ببیند.

### Scenario 8

Seeker وارد بازی می‌شود.

نباید Location دقیق Hider را ببیند.

### Scenario 9

Hider حرکت می‌کند.

Noise باید تغییر کند.

### Scenario 10

Hider Decoy فعال می‌کند.

Seeker باید Fake Signal دریافت کند.

### Scenario 11

Seeker Scan می‌کند.

فقط اطلاعات مجاز نمایش داده شود.

### Scenario 12

یک Hider پیدا می‌شود.

وارد Observer شود.

### Scenario 13

آخرین Hider پیدا می‌شود.

Seeker Team برنده شود.

### Scenario 14

Timer تمام می‌شود.

حداقل یک Hider باقی مانده باشد.

Hider Team برنده شود.

### Scenario 15

Host Disconnect شود.

Room نباید خراب شود.

### Scenario 16

Player Reconnect شود.

Role و State حفظ شود.

---

# 41. تست Game Core

قبل از اعلام تکمیل شدن بازی، این موارد را تست کن:

* Role Assignment
* Multiplayer State
* Timer Synchronization
* Map Synchronization
* Floor Switching
* Hider Visibility
* Seeker Visibility
* Detection
* Scan
* Decoy
* Movement
* Catch
* Score
* Round Transition
* Match Result
* Reconnect
* Host Migration
* Error Recovery

---

# 42. تست نهایی

پس از پیاده‌سازی:

تمام Flowهای بازی را End-to-End تست کن.

از انتخاب بازی تا خروج از بازی.

هیچ Placeholder، Fake Button، Mock State یا UI بدون Logic باقی نماند.

اگر بخشی هنوز Multiplayer واقعی نیست، آن را به‌عنوان «تکمیل‌شده» در نظر نگیر.

---

# 43. اصل بسیار مهم معماری

این بازی نباید فقط از نظر ظاهری Multiplayer به نظر برسد.

باید واقعاً Multiplayer باشد.

یعنی:

Player A
≠
Player B

و هر Client:

Role
+
Visibility
+
Map
+
State
+
Interaction
+
Objective

متفاوت خودش را داشته باشد.

---

# 44. خروجی مورد انتظار

در پایان، «شکار بهسازانی» باید چنین تجربه‌ای داشته باشد:

انتخاب بازی
↓
انتقال مستقیم به Lobby
↓
ورود هم‌تیمی‌ها
↓
Role Assignment مخفی
↓
نمایش تجربه متفاوت برای هر Role
↓
Hider Map اختصاصی
↓
Seeker 3D Building Map
↓
Hide Phase
↓
Hunt Phase
↓
Sound Clues
↓
Scan
↓
Decoy
↓
Mind Game
↓
Detection
↓
Observer
↓
Final Hunt
↓
Round Result
↓
Score
↓
Role Rotation
↓
Round بعدی
↓
Final Winner

---

# 45. مهم‌ترین اولویت‌ها

در پیاده‌سازی، اولویت را دقیقاً به این ترتیب قرار بده:

1. Multiplayer واقعی
2. Role-based architecture
3. Private information / visibility
4. Lobby
5. Game State
6. 3D Building Map
7. Hider Environment
8. Hide/Hunt Core
9. Detection System
10. Sound Clues
11. Abilities
12. Animation
13. Scoring
14. Performance
15. Error Handling
16. Polish

قبل از هر تغییر UI، ابتدا هسته فعلی «شکار بهسازانی» را بررسی کن و اگر Architecture فعلی Single-Device یا Shared-State است، آن را Refactor کن و به Multiplayer Role-Based Architecture تبدیل کن.

از ایجاد یک UI نمایشی که پشت آن Game Core واقعی وجود ندارد خودداری کن.

تمام تغییرات را روی نسخه فعلی «میدان هم‌تیمی‌ها» اعمال کن و سایر بازی‌ها، صفحات، Avatarها، تصاویر و بخش‌های نامرتبط پروژه را تغییر نده.

در پایان یک تست کامل 0 تا 100 درصدی از بازی اجرا کن و تمام مسیرهای Multiplayer، Role، Map، Lobby، Round، Reconnect و Error را بررسی کن.
