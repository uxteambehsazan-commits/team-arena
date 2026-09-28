## MOBILE PWA, APP-LIKE EXPERIENCE & PERFORMANCE OPTIMIZATION

### هدف اصلی

نسخه موبایل این پروژه باید تا حد امکان شبیه یک **اپلیکیشن Native** رفتار کند، نه یک وب‌سایت داخل مرورگر.

تمام تغییرات زیر را روی نسخه موبایل اعمال کن و **ظاهر و ساختار دسکتاپ را بدون دلیل تغییر نده**.

---

# 1. APP-LIKE MOBILE EXPERIENCE

در موبایل:

* تجربه کاربری باید کاملاً شبیه اپلیکیشن باشد.
* Layout باید Full Screen و Edge-to-Edge باشد.
* نوارهای اضافی مرورگر نباید بخشی از طراحی UI باشند.
* از `viewport-fit=cover` استفاده کن.
* از Safe Areaهای سیستم برای iPhone و Android پشتیبانی کن.
* محتوای اصلی نباید زیر Notch، Dynamic Island یا Home Indicator قرار بگیرد.

### مهم

اگر نوار مرورگر توسط خود Browser نمایش داده می‌شود و از داخل Web App قابل حذف نیست:

* سایت را به‌صورت **PWA standalone** پیکربندی کن.
* Manifest را به‌درستی تنظیم کن.
* `display: standalone` یا در صورت امکان `fullscreen` را استفاده کن.
* `theme-color` و `background-color` را مطابق هویت بصری پروژه تنظیم کن.
* هدف این است که بعد از نصب PWA، کاربر دیگر تجربه معمولی Browser را نداشته باشد.

---

# 2. PWA INSTALL PROMPT

یک سیستم حرفه‌ای برای پیشنهاد نصب PWA ایجاد کن.

### رفتار پیشنهادی

وقتی شرایط نصب فراهم است:

یک Notification / Install Prompt ظریف نمایش بده:

**عنوان:**
«میدان هم‌تیمی‌ها را مثل یک اپلیکیشن داشته باش!»

**توضیح:**
«برای دسترسی سریع‌تر و تجربه بهتر، نسخه اپلیکیشن را روی گوشی نصب کن.»

**دکمه اصلی:**
«نصب اپلیکیشن»

**دکمه ثانویه:**
«بعداً»

### قوانین

* فقط زمانی نمایش داده شود که PWA واقعاً قابلیت نصب داشته باشد.
* اگر کاربر آن را رد کرد، بلافاصله دوباره نمایش داده نشود.
* انتخاب کاربر را در Local Storage ذخیره کن.
* پس از نصب، Notification دیگر نمایش داده نشود.
* در iOS که رفتار نصب متفاوت است، یک راهنمای مناسب برای:
  `Add to Home Screen`
  نمایش بده.
* Notification نباید مزاحم Gameplay باشد.
* روی موبایل به‌صورت Bottom Sheet یا Floating Install Card نمایش داده شود.

---

# 3. BOTTOM NAVIGATION — MOBILE SCROLL

مشکل مهم فعلی:

دکمه‌های پایین صفحه در بعضی اندازه‌های موبایل کامل دیده نمی‌شوند.

این مشکل را کاملاً برطرف کن.

### قوانین

Bottom Navigation باید:

* در موبایل قابل مشاهده باشد.
* اگر تعداد دکمه‌ها زیاد است، **Horizontal Scroll** داشته باشد.
* دکمه‌ها نباید کوچک یا فشرده شوند تا همه در یک ردیف جا شوند.
* کاربر بتواند با Swipe به چپ و راست حرکت کند.
* Scrollbar مخفی باشد.
* Touch scrolling روان باشد.
* آخرین آیتم همیشه قابل دسترسی باشد.
* اولین آیتم نیز کامل قابل مشاهده باشد.

### CSS behavior

از این منطق استفاده کن:

```css
overflow-x: auto;
-webkit-overflow-scrolling: touch;
scrollbar-width: none;
```

و:

```css
white-space: nowrap;
```

هر Button باید `flex-shrink: 0` داشته باشد.

### Safe Area

برای Bottom Navigation:

```css
padding-bottom: env(safe-area-inset-bottom);
```

استفاده کن.

Bottom Navigation نباید توسط Home Indicator آیفون پوشانده شود.

---

# 4. FIX MOBILE IMAGE DISPLAY

تمام مشکلات نمایش تصاویر را بررسی و اصلاح کن.

برای همه تصاویر:

* مسیرهای Image Asset را بررسی کن.
* Broken Image نباید وجود داشته باشد.
* تصاویر نباید خارج از Container قرار بگیرند.
* نسبت تصویر حفظ شود.
* از `object-fit: cover` یا `contain` بر اساس نوع تصویر استفاده کن.
* تصاویر Lazy Load شوند.
* تصاویر خارج از Viewport تا زمانی که لازم نیست Load نشوند.

### Image fallback

برای تصاویر خراب:

یک Placeholder حرفه‌ای نمایش بده و از نمایش Broken Image Browser جلوگیری کن.

### مهم

تمام Asset Pathها باید:

* با GitHub Pages
* با Relative Path
* و با Production Build

سازگار باشند.

از Absolute Pathهایی که روی GitHub Pages خراب می‌شوند استفاده نکن.

---

# 5. GITHUB PAGES OPTIMIZATION

چون پروژه روی GitHub Pages اجرا می‌شود، Performance را با فرض **Static Hosting** بهینه کن.

### هدف

حداقل JavaScript و حداقل Network Request ممکن.

انجام بده:

* Code Splitting
* Lazy Loading
* Tree Shaking
* حذف Dependencyهای غیرضروری
* حذف فایل‌های unused
* Minification
* فشرده‌سازی Assetها
* کاهش حجم JavaScript
* کاهش حجم CSS
* کاهش تعداد Requestها
* جلوگیری از Renderهای غیرضروری
* جلوگیری از اجرای JavaScript غیرضروری در Initial Load

---

# 6. LAZY LOAD GAMES

همه بازی‌ها را در Initial Load اجرا یا Import نکن.

ساختار باید تا حد امکان:

HOME
→ Game Selection
→ Load Selected Game

باشد.

هر Game باید در صورت امکان به‌صورت Lazy Loaded Module بارگذاری شود.

یعنی اگر کاربر وارد بازی Mafia نشده:

کد مربوط به Mafia نباید در Initial Bundle غیرضروری باشد.

همین منطق برای تمام بازی‌ها اجرا شود.

---

# 7. LOCAL CACHE / OFFLINE-FIRST

تا جایی که از نظر فنی و امنیتی امکان‌پذیر است، اطلاعات غیرحساس کاربر را روی همان دستگاه Cache کن.

### استفاده از:

* LocalStorage برای Preferences کوچک
* IndexedDB برای داده‌های بزرگ‌تر
* Cache Storage برای Assetها
* Service Worker برای PWA

### اطلاعات قابل ذخیره

مثلاً:

* آخرین بازی انتخاب‌شده
* تنظیمات کاربر
* Theme
* صدا روشن/خاموش
* وضعیت Tutorial
* آخرین Session بازی
* امتیازات محلی
* Achievementهای محلی
* تنظیمات شخصی
* وضعیت نصب/رد کردن PWA
* داده‌های موقت بازی
* اطلاعات موردنیاز برای اجرای سریع‌تر UI

---

# 8. PRIVACY / SECURITY

اطلاعات حساس را در Local Storage ذخیره نکن.

هرگز این موارد را Cache نکن:

* Password
* Token
* Authentication Secret
* اطلاعات بانکی
* اطلاعات محرمانه
* اطلاعات شخصی غیرضروری

هدف فقط:

**Performance + Offline Capability + حفظ وضعیت غیرحساس کاربر**

باشد.

---

# 9. SERVICE WORKER

یک Service Worker استاندارد PWA ایجاد یا اصلاح کن.

استراتژی Cache:

### App Shell

`Cache First`

برای:

* CSS
* JS
* Fonts
* Icons
* Static Images
* Manifest

### Dynamic Content

`Network First` یا در صورت مناسب بودن `Stale While Revalidate`

### Game Assets

`Cache First`

هدف:

اگر کاربر یک بار بازی را باز کرد، دفعه بعد Assetهای آن تا حد امکان از Cache خوانده شوند.

---

# 10. OFFLINE EXPERIENCE

اگر اینترنت قطع شد:

اپلیکیشن نباید Crash کند.

در صورت امکان:

* Home باز شود.
* بازی‌هایی که قبلاً Cache شده‌اند قابل اجرا باشند.
* وضعیت بازی محلی حفظ شود.
* یک پیام کوچک نمایش داده شود:

«اتصال اینترنت برقرار نیست؛ از نسخه ذخیره‌شده استفاده می‌کنید.»

این پیام باید Non-blocking باشد.

---

# 11. PERFORMANCE BUDGET

این پروژه را با رویکرد Performance First بررسی کن.

هدف:

### Initial Load

تا حد امکان سریع

### First Contentful Paint

حداقل تأخیر

### Largest Contentful Paint

حداقل تأخیر

### JavaScript

حداقل Bundle ممکن

### Images

حداقل حجم ممکن

### Network

حداقل Request ممکن

---

# 12. IMAGE OPTIMIZATION

تمام تصاویر را بررسی کن.

در صورت امکان:

* WebP
* AVIF

استفاده کن.

تصاویر بزرگ را Resize کن.

از ارسال تصویر 2000px برای Container 200px خودداری کن.

برای تصاویر مختلف، Responsive Image استفاده کن:

```html
srcset
sizes
```

در صورت امکان.

---

# 13. FONT OPTIMIZATION

Fontهای غیرضروری را حذف کن.

Font Loading را بهینه کن.

از:

```css
font-display: swap;
```

استفاده کن.

Fontهای سنگین را فقط در صورت نیاز Load کن.

---

# 14. MOBILE TOUCH PERFORMANCE

تمام Interactionهای موبایل باید:

* سریع
* Smooth
* بدون Lag
* بدون Layout Shift

باشند.

از Event Listenerهای غیرضروری جلوگیری کن.

برای Touch / Scroll عملکرد روان ایجاد کن.

---

# 15. PREVENT LAYOUT SHIFT

هنگام Load شدن:

* تصاویر نباید Layout را جابه‌جا کنند.
* Buttonها نباید ناگهان حرکت کنند.
* Bottom Navigation نباید بعد از Load شدن محتوا جابه‌جا شود.

برای تصاویر Aspect Ratio یا Width/Height مشخص کن.

---

# 16. APP STATE PERSISTENCE

اگر کاربر:

* صفحه را Refresh کرد
* Browser را بست
* دوباره PWA را باز کرد

تا حد امکان وضعیت غیرحساس قبلی او حفظ شود.

مثلاً:

```text
Selected Game
Player Settings
Sound
Theme
Local Score
Tutorial Status
PWA Status
```

اما Sessionهای حساس یا اطلاعات محرمانه ذخیره نشوند.

---

# 17. MOBILE RESPONSIVE QA

حتماً این اندازه‌ها را بررسی کن:

* 320px
* 360px
* 375px
* 390px
* 412px
* 430px
* 768px

و مطمئن شو:

* هیچ Horizontal Overflow غیرضروری وجود ندارد.
* Bottom Buttons قابل مشاهده‌اند.
* تصاویر خراب نیستند.
* Text Cut Off نمی‌شود.
* CTAها قابل لمس‌اند.
* Safe Area رعایت شده.
* Keyboard باعث خراب شدن Layout نمی‌شود.

---

# 18. PWA MANIFEST

Manifest باید کامل و Production Ready باشد.

شامل:

* name
* short_name
* description
* start_url
* display
* background_color
* theme_color
* icons
* orientation در صورت نیاز

آیکون‌های مناسب PWA نیز فراهم کن.

---

# 19. INSTALL EXPERIENCE

بعد از نصب:

اپ باید با باز شدن از Home Screen دقیقاً شبیه Application رفتار کند.

نباید:

* Browser Chrome UI
* Address Bar
* Tab UI

بخشی از تجربه طراحی باشند.

---

# 20. DO NOT BREAK EXISTING GAMES

این بخش بسیار مهم است.

در فرآیند Performance Optimization:

**منطق هیچ‌کدام از بازی‌ها را تغییر نده.**

به‌خصوص:

* Rules
* Turn Logic
* Score
* Win/Lose
* Player Count
* Game State
* AI
* Multiplayer
* Spy / Hidden Role Logic

نباید تغییر کند.

فقط:

* Loading
* Caching
* Rendering
* Asset Management
* PWA
* Mobile UX
* Performance

را بهینه کن.

---

# 21. FINAL PERFORMANCE AUDIT

بعد از اعمال تغییرات یک Audit کامل انجام بده.

بررسی کن:

### PWA

* Manifest ✓
* Service Worker ✓
* Install Experience ✓
* Standalone Mode ✓

### Mobile

* No Browser-like UI ✓
* Safe Area ✓
* Bottom Navigation Scroll ✓
* Touch UX ✓
* Responsive ✓

### Images

* No Broken Images ✓
* Lazy Loading ✓
* Optimized Assets ✓
* Correct GitHub Pages Paths ✓

### Performance

* Lazy Game Loading ✓
* Reduced Bundle ✓
* Reduced Requests ✓
* Cached Assets ✓
* Optimized Fonts ✓
* Optimized Images ✓

### Persistence

* Local Preferences ✓
* Game State where appropriate ✓
* IndexedDB where needed ✓
* No sensitive data stored ✓

---

# 22. IMPORTANT IMPLEMENTATION RULE

قبل از تغییر:

**ابتدا معماری فعلی پروژه را بررسی کن.**

سپس فقط جاهایی را اصلاح کن که واقعاً لازم است.

از Rewrite کامل پروژه خودداری کن.

از ایجاد Dependency غیرضروری خودداری کن.

اگر قابلیت خاصی در GitHub Pages یا Browser قابل پیاده‌سازی واقعی نیست، آن را جعل نکن.

هدف:

**Fast + Installable + Offline-capable + App-like + Stable + Mobile-first**

است.

در پایان، تمام تغییرات را واقعاً در کد اعمال کن و فقط توضیح یا گزارش ارائه نده.
