اپلیکیشن موجود را به‌صورت کامل Audit، تست و اصلاح کن.
**هیچ قابلیت، بازی، قانون، سناریو یا داده‌ای را حذف یا بازتعریف نکن.** هدف اصلی این تسک، رفع باگ‌های فعلی، اطمینان از صحت اتصال UI به Game Engine و اصلاح Responsive Design در Web و Mobile است.

### 1. رفع مشکل Scroll در صفحه نخست موبایل

در نسخه موبایل، صفحه Home در حال حاضر به‌درستی Scroll نمی‌شود.

بررسی و اصلاح کن:

* صفحه اصلی در تمام ارتفاع‌های مختلف موبایل قابل اسکرول باشد.
* هیچ `overflow: hidden`، `fixed height`، `position: fixed` یا ساختار والد/فرزند دیگری مانع اسکرول عمودی نشده باشد.
* Header، Hero، لیست بازی‌ها، بخش تهیه‌کنندگان و Footer همگی داخل جریان طبیعی صفحه قرار داشته باشند.
* Scroll در iOS و Android و مرورگرهای Chrome / Safari صحیح باشد.
* هنگام باز شدن Modal یا Bottom Sheet، فقط همان بخش Lock شود و بعد از بسته‌شدن، Scroll صفحه اصلی به حالت عادی برگردد.
* در موبایل‌های کوچک، متوسط و بزرگ تست شود.

### 2. حذف تکرار «تهیه‌کنندگان»

در صفحه اصلی، بخش «تهیه‌کنندگان» دو بار نمایش داده شده است.

اصلاح کن:

* نسخه «تهیه‌کنندگان» که در قسمت بالای سمت چپ صفحه قرار گرفته را **کاملاً حذف کن**.
* فقط نسخه اصلی «تهیه‌کنندگان» که در انتهای صفحه قرار دارد باقی بماند.
* هیچ فضای خالی یا فاصله غیرطبیعی ناشی از حذف این بخش باقی نماند.
* در Desktop، Tablet و Mobile همین ساختار حفظ شود.

### 3. مهم‌ترین مورد: تطبیق کامل 16 بازی با Game Engine

در حال حاضر بازی‌ای که Host انتخاب می‌کند با بازی‌ای که سیستم اجرا/نمایش می‌دهد مطابقت ندارد.

مثال:

* Host بازی «مافیا» را انتخاب می‌کند.
* اما سیستم بازی «سرعت» را نمایش/اجرا می‌کند.

این مشکل را فقط در UI اصلاح نکن؛ **ریشه مشکل در ارتباط بین Game Selection، Game ID، Game Configuration، Game Engine و Game Session را پیدا و اصلاح کن.**

#### الزام مهم

در حال حاضر هسته اصلی اپلیکیشن شامل **16 بازی موجود** است.

**این 16 بازی و عناوین و دسته‌بندی‌های فعلی آنها را تغییر نده.**

باید دقیقاً همین 16 بازی موجود در سیستم حفظ شوند و فقط صحت عملکرد، اتصال و UI/UX آنها بررسی و اصلاح شود.

برای هر 16 بازی بررسی کن:

1. عنوان بازی
2. Game ID / Unique ID
3. Category
4. Thumbnail / Cover
5. Description
6. Host selection
7. Game configuration
8. Game session creation
9. انتقال Game ID از صفحه انتخاب بازی به Session
10. دریافت Game ID در Lobby
11. دریافت Game ID در Game Room
12. Load شدن Game Engine صحیح
13. قوانین بازی
14. سناریوی بازی
15. نقش‌ها و وضعیت بازیکنان
16. Turn / Round logic در صورت وجود
17. Win / Lose / Score logic
18. پایان بازی
19. Restart / Rematch
20. نمایش صحیح نتیجه

### 4. جلوگیری از Match اشتباه بین بازی‌ها

هیچ‌وقت بر اساس:

* index آرایه
* position
* ترتیب نمایش کارت‌ها
* نام فارسی
* label
* ترتیب category
* یا fallback تصادفی

بازی را resolve نکن.

بازی باید با یک **Unique Game ID / Stable Identifier** از ابتدا تا انتهای Flow منتقل شود.

Flow صحیح باید به شکل زیر باشد:

`Game Selection`
→ `Selected Game ID`
→ `Create Session`
→ `Lobby`
→ `Host Configuration`
→ `Game Room`
→ `Game Engine`
→ `Game Result`

در تمام این مراحل باید **همان Game ID** حفظ شود.

اگر در بخشی از پروژه Mapping بین Game ID و Game Component وجود دارد، آن Mapping را Audit کن و در صورت وجود mismatch اصلاح کن.

### 5. تست تک‌تک 16 بازی

برای هر یک از 16 بازی یک Test Case ایجاد کن.

برای هر بازی حداقل این سناریو را تست کن:

`Host`
→ انتخاب بازی
→ مشاهده نام و تصویر بازی
→ ایجاد Session
→ ورود به Lobby
→ ورود بازیکن
→ Start Game
→ اجرای Game Engine
→ اجرای قوانین
→ اجرای سناریو
→ پایان بازی
→ نمایش Result

اطمینان حاصل کن که:

**بازی انتخاب‌شده = بازی نمایش‌داده‌شده = بازی اجراشده = Game Engine صحیح**

هیچ بازی نباید به Game Engine بازی دیگری متصل شود.

### 6. بررسی قوانین و سناریوهای 16 بازی

برای هر 16 بازی، منطق فعلی موجود در هسته را بررسی کن.

قوانین و سناریوهای موجود را **تغییر نده**؛ فقط Bug Fix انجام بده.

بررسی کن:

* Ruleها به Game ID صحیح متصل باشند.
* State Machine هر بازی صحیح باشد.
* Eventهای بازی به Game Engine صحیح ارسال شوند.
* Timerها به بازی صحیح متصل باشند.
* Player Stateها بین بازی‌ها Cross-contaminate نشوند.
* اطلاعات یک Session وارد Session بازی دیگر نشود.
* بعد از پایان یک بازی، State آن روی بازی بعدی باقی نماند.
* با Refresh یا Reconnect، Game ID و Session صحیح بازی حفظ شود.

### 7. بررسی Category و لیست بازی‌ها

دسته‌بندی‌های فعلی 16 بازی را تغییر نده.

بررسی کن:

* هر بازی فقط در Category صحیح نمایش داده شود.
* تعداد بازی‌ها صحیح باشد.
* Duplicate Game وجود نداشته باشد.
* Game Card به Game ID صحیح متصل باشد.
* کلیک روی Card دقیقاً همان بازی را باز کند.
* Search / Filter / Tab در صورت وجود، Game ID صحیح را منتقل کنند.

### 8. Responsive کامل کل اپلیکیشن

کل اپلیکیشن را از ابتدا تا انتها بررسی کن؛ نه فقط Home.

تمام Screenها باید Responsive واقعی باشند:

* Desktop
* Laptop
* Tablet
* Mobile
* Mobile کوچک
* Mobile بزرگ

حداقل این Widthها را تست کن:

`320px`
`360px`
`375px`
`390px`
`414px`
`768px`
`1024px`
`1280px`
`1440px`

بررسی کن:

* Layout
* Typography
* Buttons
* Cards
* Images
* Header
* Navigation
* Tabs
* Modals
* Bottom Sheets
* Forms
* Game Room
* Lobby
* Player List
* Avatar
* Timer
* Score
* Result
* Toast
* Dialog
* Footer

هیچ عنصر مهمی نباید:

* از صفحه خارج شود
* Overlap داشته باشد
* بریده شود
* متنش خارج از Container قرار بگیرد
* باعث Horizontal Scroll ناخواسته شود
* در Mobile غیرقابل استفاده شود.

### 9. Mobile UX

در موبایل Layout را صرفاً با کوچک کردن Desktop پیاده‌سازی نکن.

در صورت نیاز:

* Grid → List
* Horizontal sections → Horizontal Scroll
* Desktop Navigation → Mobile Navigation
* Modal → Bottom Sheet
* Multi-column → Single-column

اما **اطلاعات، منطق و ساختار عملکردی محصول تغییر نکند.**

### 10. Regression Test

بعد از اصلاحات، کل Flow را دوباره تست کن:

Home
→ Game Selection
→ Game Details
→ Avatar
→ Host
→ Create Session
→ Lobby
→ Player Join
→ Game Start
→ Game Engine
→ Game Play
→ Result
→ Rematch / Exit

همه این مراحل را در Desktop و Mobile بررسی کن.

### 11. مهم: چیزی را حذف یا بازطراحی اساسی نکن

این پروژه یک محصول موجود است.

بنابراین:

* 16 بازی موجود حفظ شوند.
* نام بازی‌ها تغییر نکند.
* Categoryها تغییر نکنند.
* قوانین تغییر نکنند.
* سناریوها تغییر نکنند.
* Game Engineها جایگزین نشوند.
* اطلاعات و داده‌های موجود حذف نشوند.
* UI فعلی بدون دلیل بازطراحی اساسی نشود.

تمرکز روی:
**Bug Fix + Data Mapping + Game Engine Integrity + Responsive + UX Quality**

### Acceptance Criteria

در پایان باید تمام موارد زیر برقرار باشند:

✅ Home در Mobile به‌صورت کامل Scroll می‌شود.

✅ «تهیه‌کنندگان» فقط یک بار و در انتهای صفحه نمایش داده می‌شود.

✅ هر 16 بازی دقیقاً با Game ID صحیح Mapping شده‌اند.

✅ بازی انتخاب‌شده توسط Host دقیقاً همان بازی‌ای است که در Lobby و Game Room اجرا می‌شود.

✅ هیچ Game ID اشتباهی به Game Engine دیگری متصل نیست.

✅ قوانین و سناریوهای هر 16 بازی به Game Engine صحیح متصل هستند.

✅ State یک بازی وارد بازی دیگر نمی‌شود.

✅ Session و Reconnect بازی صحیح را حفظ می‌کنند.

✅ هر 16 بازی End-to-End تست شده‌اند.

✅ هیچ Duplicate یا Mapping اشتباه در Game Selection وجود ندارد.

✅ تمام Screenهای Web و Mobile Responsive هستند.

✅ هیچ Horizontal Overflow ناخواسته‌ای وجود ندارد.

✅ هیچ عنصر مهمی در Mobile بریده، Overlap یا خارج از Viewport نیست.

✅ تغییرات انجام‌شده باعث Regression در سایر بخش‌های اپلیکیشن نشده است.

در پایان، قبل از اعلام تکمیل کار، یک **Full Regression Test** روی کل اپلیکیشن انجام بده و فقط زمانی کار را Complete اعلام کن که تمام Acceptance Criteria بالا پاس شده باشند.
