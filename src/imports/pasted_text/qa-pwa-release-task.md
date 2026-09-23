حتماً. برای اینکه این کار را به یک **تسک QA + Performance + PWA + Release واقعی** تبدیل کنی، این پرامپت را مستقیم داخل **Lovable / Cursor / Claude Code / ابزار توسعه پروژه** بده. طوری نوشته‌ام که فقط «بررسی» نکند؛ باید **تست → پیدا کردن باگ → اصلاح → تست مجدد → بهینه‌سازی → build → push → ارائه لینک نسخه جدید** را تا انتها انجام دهد.

نکته مهم درباره PWA: ظاهرشدن پیشنهاد نصب به‌صورت Notification روی موبایل صرفاً با داشتن manifest تضمین نمی‌شود؛ مرورگر بر اساس معیارهای نصب و شرایط محیط تصمیم می‌گیرد و برای بعضی سناریوها باید `beforeinstallprompt` و UI نصب داخل خود محصول هم مدیریت شود. ([web.dev][1])

تو به‌عنوان یک **Senior Full-Stack Engineer + QA Engineer + Performance Engineer + PWA Specialist + DevOps Engineer** روی همین پروژه فعلی کار می‌کنی.

هدف این تسک این است که بازی را از وضعیت فعلی به یک **Production-Ready Release** برسانی.

**مهم:**
صرفاً گزارش باگ نده.
هر ایراد یا مشکل قابل اصلاح را خودت پیدا کن، اصلاح کن، دوباره تست کن و تا رسیدن به نسخه پایدار ادامه بده.

در پایان باید یک نسخه جدید و قابل انتشار روی GitHub/Deployment داشته باشیم و لینک نسخه جدید را ارائه کنی.

---

# 1. اول پروژه فعلی را کامل بررسی کن

قبل از هر تغییری:

* ساختار پروژه را بررسی کن.
* Framework و build system را شناسایی کن.
* package.json و dependencyها را بررسی کن.
* تمام routeها و pageها را بررسی کن.
* تمام componentها را بررسی کن.
* state management را بررسی کن.
* assetها و تصاویر را بررسی کن.
* فونت‌ها را بررسی کن.
* CSS/Tailwind/theme/tokenها را بررسی کن.
* PWA configuration را بررسی کن.
* manifest را بررسی کن.
* service worker را بررسی کن.
* caching strategy را بررسی کن.
* نحوه load شدن تصاویر، فونت‌ها، audio و سایر assetها را بررسی کن.
* API/network requestها را بررسی کن.
* localStorage / IndexedDB / Cache Storage را بررسی کن.
* error handling را بررسی کن.
* console error/warningها را بررسی کن.
* production build را اجرا کن.

**هیچ فرضی درباره وضعیت فعلی پروژه نداشته باش.**

---

# 2. تست کامل بازی — سناریوی 0 تا 100

بازی را مثل یک کاربر واقعی از ابتدا تا انتها تست کن.

## سناریوی A — اولین ورود

تست کن:

* باز شدن سایت برای اولین بار
* loading
* splash/loading state
* نمایش صحیح صفحه
* نمایش صحیح فونت
* نمایش صحیح تصاویر
* نبودن layout shift
* نبودن console error
* نبودن broken asset
* responsive بودن صفحه

---

# 3. سناریوهای اصلی Gameplay

تمام مسیرهای اصلی بازی را تست کن.

حداقل این موارد:

### شروع بازی

* Start
* New Game
* Continue
* Restart
* Back
* Exit
* Pause
* Resume

### حین بازی

تست کن:

* انتخاب صحیح گزینه‌ها
* کلیک سریع پشت سر هم
* کلیک روی نقاط مختلف UI
* لمس روی موبایل
* لمس چندگانه
* تغییر orientation
* رفتن background و برگشت به بازی
* refresh کردن صفحه
* باز کردن دوباره tab
* بستن و باز کردن browser
* قطع و وصل اینترنت

### پایان بازی

تست کن:

* Win
* Lose
* Draw در صورت وجود
* Game Over
* Score
* High Score
* Restart
* Next Level
* Return Home

---

# 4. تست سناریوهای Edge Case

عمداً شرایط غیرعادی ایجاد کن.

مثلاً:

* کلیک خیلی سریع
* کلیک دوبار روی Start
* کلیک همزمان چند دکمه
* refresh وسط بازی
* back browser وسط بازی
* تغییر tab وسط بازی
* minimize کردن browser
* قطع اینترنت
* اینترنت ضعیف
* reload هنگام loading
* باز کردن چند tab
* ورود مستقیم به route داخلی
* پاک کردن cache
* پاک کردن localStorage
* تغییر orientation
* تغییر اندازه viewport
* zoom browser
* استفاده با keyboard
* استفاده بدون mouse
* استفاده فقط با touch

هر crash، freeze، race condition، state corruption یا UI inconsistency را اصلاح کن.

---

# 5. تست موبایل

این قسمت بسیار مهم است.

حداقل این viewportها را تست کن:

* 320×568
* 360×640
* 375×667
* 390×844
* 393×873
* 412×915
* 430×932

و همچنین:

* Android Chrome
* iPhone Safari
* Android Chrome در حالت standalone/PWA
* iOS در حالت Add to Home Screen

بررسی کن:

* touch targetها
* safe area
* notch
* bottom navigation
* overflow
* horizontal scroll
* keyboard
* viewport height
* address bar browser
* orientation
* فونت
* تصاویر
* animation
* FPS
* performance

هیچ عنصر مهمی نباید با notch یا browser UI تداخل داشته باشد.

---

# 6. تست Desktop

حداقل:

* 1280×720
* 1366×768
* 1440×900
* 1920×1080
* 2560×1440

تست کن:

* layout
* scaling
* typography
* game board
* buttons
* animation
* تصاویر
* overflow
* performance

---

# 7. تست فونت

تمام فونت‌های پروژه را بررسی کن.

مواردی که باید اصلاح شوند:

* font loading غیرضروری
* font-weightهای اضافی
* font فایل‌های بزرگ
* fontهای تکراری
* preload اشتباه
* FOUT
* FOIT
* layout shift هنگام load فونت

در صورت امکان:

* فقط weightهای موردنیاز را نگه دار.
* فرمت مدرن مثل WOFF2 استفاده کن.
* font-display مناسب استفاده کن.
* فونت را local/self-hosted کن اگر dependency خارجی باعث کندی می‌شود.

اطمینان حاصل کن که در موبایل و desktop متن‌ها بدون تغییر ناگهانی ظاهر می‌شوند.

---

# 8. بهینه‌سازی تصاویر — بسیار مهم

تمام تصاویر پروژه را inventory کن.

برای هر تصویر بررسی کن:

* حجم
* ابعاد
* format
* compression
* duplicate بودن
* استفاده یا عدم استفاده
* loading strategy

تا جای ممکن:

* WebP یا AVIF استفاده کن.
* تصاویر را resize کن.
* تصاویر بزرگ را بدون دلیل load نکن.
* از responsive images استفاده کن.
* `srcset` و `sizes` را در صورت نیاز استفاده کن.
* تصاویر خارج از viewport را lazy-load کن.
* تصاویر critical را preload کن.
* از تصاویر با resolution بسیار بالاتر از نیاز واقعی استفاده نکن.

### بسیار مهم:

برای assetهایی که امکانش وجود دارد، از **browser-native loading/caching mechanisms** استفاده کن و dependency غیرضروری برای image loading ایجاد نکن.

از امکانات native مثل:

* browser cache
* Cache Storage
* Service Worker
* `loading="lazy"`
* `decoding="async"`
* `fetchpriority`
* native image formats
* responsive images

استفاده کن.

هدف:

**کمترین network request + کمترین حجم دانلود + بیشترین cache hit + سریع‌ترین first render**

---

# 9. Performance Audit

Performance را جدی و عددی بررسی کن.

با DevTools/Lighthouse و ابزارهای مناسب بررسی کن:

* FCP
* LCP
* CLS
* INP
* TTFB
* Total Blocking Time
* JS execution
* CSS execution
* image loading
* font loading
* network waterfall
* memory
* CPU
* long tasks
* unnecessary rerender
* bundle size

DevTools و Lighthouse برای این نوع بررسی‌ها ابزارهای رسمی Chrome هستند. ([Chrome for Developers][2])

اگر بازی animation دارد:

* FPS را بررسی کن.
* jank را پیدا کن.
* layout thrashing را پیدا کن.
* forced reflow را پیدا کن.
* animationهایی که روی main thread فشار ایجاد می‌کنند را اصلاح کن.
* تا جای ممکن animation را به propertyهای مناسب مثل transform/opacity منتقل کن.

---

# 10. JavaScript و Bundle Optimization

کل bundle را بررسی کن.

پیدا کن:

* dependencyهای unused
* libraryهای سنگین
* duplicate dependencies
* importهای غیرضروری
* componentهای بزرگ
* unnecessary rerender
* unnecessary state
* memory leak
* event listener leak
* timer leak
* interval leak

در صورت امکان:

* code splitting
* lazy loading
* dynamic import
* tree shaking
* حذف dependency غیرضروری

انجام بده.

اما:

**فقط برای کم کردن bundle، معماری سالم پروژه را خراب نکن.**

---

# 11. PWA — مشکل نصب روی موبایل را کامل رفع کن

مشکل فعلی:

**روی تلفن همراه پیشنهاد/Notification نصب نسخه PWA نمایش داده نمی‌شود.**

این موضوع را از صفر بررسی کن.

## Manifest

بررسی کن:

* name
* short_name
* start_url
* scope
* display
* orientation
* theme_color
* background_color
* icons
* icon sizes
* maskable icon
* MIME type
* مسیر صحیح manifest

Manifest باید production-safe باشد.

---

# 12. Service Worker

بررسی کن:

* service worker واقعاً register می‌شود؟
* registration scope درست است؟
* service worker error دارد؟
* install event اجرا می‌شود؟
* activate اجرا می‌شود؟
* cache versioning درست است؟
* cache قدیمی پاک می‌شود؟
* update mechanism درست است؟
* service worker باعث stale content نمی‌شود؟
* assetهای ضروری cache می‌شوند؟
* runtime caching درست است؟

Service worker نباید باعث شود نسخه قدیمی بازی بعد از deployment همچنان نمایش داده شود.

---

# 13. PWA Install Flow

این بخش را دقیق بررسی و اصلاح کن.

بررسی کن:

* `beforeinstallprompt`
* install eligibility
* install event
* standalone detection
* `window.matchMedia('(display-mode: standalone)')`
* iOS behavior
* Android behavior
* browser differences

اگر browser اجازه prompt بدهد:

* event را capture کن.
* آن را بی‌دلیل از بین نبر.
* یک install CTA مناسب داخل UI ایجاد کن.
* بعد از نصب CTA را مخفی کن.
* اگر app قبلاً نصب شده است، CTA نشان داده نشود.
* اگر browser اجازه native prompt نمی‌دهد، UX جایگزین مناسب ارائه کن.

**توجه:** نباید فرض کنیم همه مرورگرها یک install notification یکسان نشان می‌دهند. منطق نصب باید با قابلیت واقعی browser هماهنگ باشد. ([web.dev][1])

---

# 14. Install UX

یک مسیر واضح داخل بازی ایجاد کن:

مثلاً:

«نصب بازی»

یا:

«افزودن به صفحه اصلی»

و شرایط زیر را مدیریت کن:

### Android/Chrome

در صورت available بودن `beforeinstallprompt`:

* دکمه Install نمایش داده شود.
* با کلیک کاربر native install prompt باز شود.
* بعد از نصب state تغییر کند.

### iOS/Safari

چون flow متفاوت است:

* راهنمای Add to Home Screen نمایش داده شود.
* فقط زمانی نمایش داده شود که واقعاً لازم است.
* بعد از نصب/standalone شدن مخفی شود.

### Standalone

اگر بازی قبلاً نصب شده:

* install CTA نمایش داده نشود.
* UI مخصوص standalone در صورت نیاز فعال شود.

---

# 15. Offline Mode

بررسی کن بازی تا چه حد می‌تواند بدون اینترنت کار کند.

بعد از اولین load:

* assetهای اصلی cache شوند.
* بازی در صورت قطع اینترنت crash نکند.
* UI مناسب offline نمایش داده شود.
* اگر بازی local است، gameplay باید تا جای ممکن بدون network ادامه پیدا کند.

Cache strategy را بر اساس نوع asset تعیین کن.

مثلاً:

* app shell → cache first
* static assets → cache first
* versioned assets → immutable cache
* API data → network first / stale while revalidate بر اساس نیاز

---

# 16. Browser Cache

هدف:

**کاربر بعد از اولین visit نباید دوباره تمام تصاویر، فونت‌ها و assetهای ثابت را دانلود کند.**

بررسی کن:

* Cache-Control
* immutable assets
* hashed filenames
* service worker cache
* browser memory cache
* disk cache

تا جای ممکن assetهای static را cache-friendly کن.

---

# 17. Network Waterfall

در DevTools Network بررسی کن.

پیدا کن:

* چه resourceهایی قبل از render دانلود می‌شوند؟
* چه resourceهایی blocking هستند؟
* کدام تصاویر خیلی بزرگ هستند؟
* کدام JSها unnecessary هستند؟
* آیا request تکراری وجود دارد؟
* آیا fontها دیر load می‌شوند؟
* آیا assetهایی وجود دارند که اصلاً استفاده نمی‌شوند؟

هدف:

**Fast initial render**

---

# 18. Visual QA

بازی را از نظر ظاهری کامل بررسی کن.

موارد:

* alignment
* spacing
* typography
* icon
* button
* border radius
* shadow
* color
* background
* contrast
* states
* hover
* active
* disabled
* loading
* error
* success
* game states

تمام stateهای UI باید تست شوند.

---

# 19. Accessibility

بررسی کن:

* keyboard navigation
* focus state
* semantic HTML
* aria-label
* contrast
* button size
* touch target
* screen reader
* reduced motion
* text scaling

اگر animation زیاد است:

`prefers-reduced-motion`

را پشتیبانی کن.

---

# 20. Security

بررسی کن:

* exposed secrets
* API keys
* environment variables
* unsafe HTML
* XSS
* unsafe external resource
* dependency vulnerabilities
* unnecessary permissions
* service worker scope
* insecure storage

هیچ secretی نباید داخل frontend bundle باشد.

---

# 21. Error Handling

عمداً خطا ایجاد کن.

تست کن:

* network failure
* API failure
* malformed data
* missing image
* missing font
* service worker failure
* localStorage failure
* corrupted state
* unexpected user input

بازی نباید با یک خطای کوچک crash کند.

---

# 22. Memory Leak Test

بازی را:

* start
* play
* restart
* exit
* دوباره start

به تعداد زیاد تکرار کن.

بررسی کن:

* memory growth
* orphan event listeners
* timers
* intervals
* animation frames
* subscriptions
* detached DOM

اگر memory leak وجود دارد، اصلاحش کن.

---

# 23. Stress Test

شرایط سنگین ایجاد کن:

* چندین restart پشت سر هم
* کلیک سریع
* animationهای پشت سر هم
* resize مداوم
* تغییر orientation
* tab switching
* offline/online
* slow network
* CPU throttling

بازی نباید crash یا freeze شود.

---

# 24. تست Browser Compatibility

حداقل:

* Chrome Desktop
* Chrome Android
* Safari iOS
* Edge
* Firefox

را بررسی کن.

اگر feature خاصی browser-dependent است، fallback مناسب ایجاد کن.

---

# 25. تست Production Build

حتماً:

1. clean install
2. build
3. production server
4. run
5. test

انجام بده.

نباید فقط dev mode تست شود.

---

# 26. Automated Tests

اگر تست موجود است:

* تمام testها را اجرا کن.

اگر test کافی نیست:

برای critical logic تست اضافه کن.

حداقل:

* game initialization
* game state
* score
* win/lose
* restart
* persistence
* PWA install logic
* service worker behavior
* critical utilities

---

# 27. Regression Test

بعد از هر اصلاح مهم:

دوباره مسیر اصلی بازی را از ابتدا تا انتها اجرا کن.

هیچ fix نباید feature قبلی را خراب کند.

---

# 28. Performance Target

به این اهداف نزدیک شو:

### Desktop

* سریع initial render
* LCP پایین
* CLS نزدیک صفر
* INP پایین
* بدون long task غیرضروری
* بدون console error

### Mobile

اولویت اصلی:

**CPU + Memory + Network + Battery**

است.

بازی باید روی موبایل میان‌رده نیز روان باشد.

---

# 29. Images Performance Strategy

برای تصاویر این اولویت را رعایت کن:

1. حذف تصاویر unused
2. resize
3. compression
4. AVIF/WebP
5. responsive image
6. lazy loading
7. browser cache
8. service worker cache برای assetهای مناسب
9. preload فقط برای تصاویر critical
10. جلوگیری از دانلود duplicate

هیچ تصویری نباید صرفاً به خاطر راحتی توسعه با resolution غیرضروری بالا load شود.

---

# 30. Font Performance Strategy

فونت:

* local/self-host
* WOFF2
* subset در صورت امکان
* فقط وزن‌های مورد نیاز
* preload فقط در صورت critical بودن
* font-display مناسب

باشد.

---

# 31. Final QA Matrix

در پایان یک ماتریس تست ایجاد کن:

| Category      | Test           | Result    | Issue | Fixed  |
| ------------- | -------------- | --------- | ----- | ------ |
| Gameplay      | Start          | PASS/FAIL | ...   | YES/NO |
| Gameplay      | Restart        | ...       | ...   | ...    |
| Mobile        | Android        | ...       | ...   | ...    |
| Mobile        | iOS            | ...       | ...   | ...    |
| PWA           | Manifest       | ...       | ...   | ...    |
| PWA           | Service Worker | ...       | ...   | ...    |
| PWA           | Install        | ...       | ...   | ...    |
| Performance   | LCP            | ...       | ...   | ...    |
| Performance   | INP            | ...       | ...   | ...    |
| Performance   | CLS            | ...       | ...   | ...    |
| Images        | Optimization   | ...       | ...   | ...    |
| Fonts         | Loading        | ...       | ...   | ...    |
| Accessibility | Keyboard       | ...       | ...   | ...    |
| Security      | Audit          | ...       | ...   | ...    |

---

# 32. مهم: فقط گزارش نده

اگر چیزی خراب است:

**FIX IT.**

اگر چیزی کند است:

**OPTIMIZE IT.**

اگر چیزی ناقص است:

**IMPLEMENT IT.**

اگر تستی fail شد:

**DEBUG → FIX → RETEST**

این چرخه را تا زمانی ادامه بده که critical issue باقی نماند.

---

# 33. Git Workflow

بعد از اینکه تمام اصلاحات انجام شد:

* git status
* git diff
* بررسی فایل‌های تغییرکرده
* حذف فایل‌های debug
* حذف console.logهای غیرضروری
* حذف test artifactهای غیرضروری
* build نهایی
* اجرای test نهایی

سپس commit مناسب ایجاد کن.

مثلاً:

`fix: production QA, PWA install flow and performance optimization`

---

# 34. GitHub

تغییرات را روی repository فعلی push کن.

قبل از push:

* branch فعلی را بررسی کن.
* remote را بررسی کن.
* مطمئن شو روی repository صحیح کار می‌کنی.
* secret یا credential را commit نکن.
* `.env` و اطلاعات حساس را بررسی کن.

سپس:

* commit
* push

را انجام بده.

---

# 35. Deployment

نسخه جدید را روی deployment فعلی منتشر کن.

بعد از deployment:

**حتماً نسخه live را دوباره تست کن.**

فقط local build کافی نیست.

بررسی کن:

* HTTPS
* manifest
* service worker
* cache
* installability
* asset loading
* images
* fonts
* gameplay
* mobile
* desktop

---

# 36. PWA را روی نسخه LIVE تست کن

این قسمت را فراموش نکن.

نسخه production را باز کن و بررسی کن:

* manifest URL
* service worker registration
* service worker scope
* cache
* installability
* standalone mode
* install CTA
* Android Chrome
* iOS Safari

اگر مشکل install notification مربوط به محدودیت خود browser باشد، آن را به‌عنوان limitation browser ثبت کن؛ اما **تا جایی که از سمت application قابل اصلاح است، حتماً اصلاح کن.**

---

# 37. Cache Busting

مراقب این مشکل باش:

کاربر نسخه قبلی را در cache دارد ولی نسخه جدید deploy شده.

بررسی کن:

* hashed assets
* service worker version
* cache invalidation
* old cache cleanup
* update flow

کاربر نباید به خاطر cache نسخه قدیمی بازی را ببیند.

---

# 38. Final Performance Comparison

قبل و بعد را مقایسه کن:

* JS bundle
* CSS bundle
* image size
* font size
* number of requests
* initial load
* LCP
* CLS
* INP
* memory
* cache hit

اگر قبل از اصلاح metric نداری، حداقل baseline فعلی را قبل از optimization ثبت کن.

---

# 39. Final Acceptance Criteria

نسخه نهایی فقط زمانی آماده است که:

* [ ] بازی بدون crash اجرا شود
* [ ] تمام flowهای اصلی کار کنند
* [ ] موبایل responsive باشد
* [ ] desktop responsive باشد
* [ ] تصاویر بهینه باشند
* [ ] فونت بهینه باشد
* [ ] console error نداشته باشیم
* [ ] PWA configuration صحیح باشد
* [ ] Service Worker صحیح باشد
* [ ] install flow صحیح باشد
* [ ] Android install flow تست شده باشد
* [ ] iOS fallback تست شده باشد
* [ ] offline behavior بررسی شده باشد
* [ ] cache صحیح باشد
* [ ] old cache باعث نمایش نسخه قدیمی نشود
* [ ] performance بررسی شده باشد
* [ ] accessibility بررسی شده باشد
* [ ] security بررسی شده باشد
* [ ] production build موفق باشد
* [ ] production deployment موفق باشد
* [ ] live version تست شده باشد
* [ ] GitHub push موفق باشد

---

# 40. خروجی نهایی که باید به من بدهی

در پایان فقط نگویید «انجام شد».

یک گزارش کوتاه ولی دقیق ارائه کن:

## خلاصه

* وضعیت نسخه قبلی
* وضعیت نسخه جدید
* تعداد باگ‌های پیدا شده
* تعداد باگ‌های رفع شده
* تعداد issueهای باقی‌مانده
* وضعیت PWA
* وضعیت performance

## PWA

* Manifest: PASS/FAIL
* Service Worker: PASS/FAIL
* Installability: PASS/FAIL
* Android: PASS/FAIL
* iOS: PASS/FAIL
* Install CTA: PASS/FAIL
* Offline: PASS/FAIL

## Performance

* Bundle قبل/بعد
* Image size قبل/بعد
* Font size قبل/بعد
* Requests قبل/بعد
* LCP
* CLS
* INP
* TBT
* Memory

## Bugs Fixed

لیست مهم‌ترین bugهایی که پیدا و اصلاح کردی.

## Remaining Issues

اگر چیزی به دلیل محدودیت browser / OS / hosting قابل حل نیست، دقیقاً توضیح بده چرا.

## Git

* branch
* commit
* push status

## Release

**Live URL:**
[لینک نسخه جدید]

**GitHub:**
[لینک repository]

---

# قانون نهایی

تو مسئول این release هستی.

از من برای هر bug ساده یا تصمیم فنی معمولی سؤال نپرس.

خودت:

**Inspect → Test → Diagnose → Fix → Optimize → Retest → Build → Deploy → Test Live → Commit → Push**

را انجام بده.

فقط اگر برای ادامه کار واقعاً به دسترسی یا credential نیاز داری که در اختیار تو نیست، همان مورد را مشخص کن.

در غیر این صورت تا رسیدن به یک نسخه Production-Ready کار را ادامه بده.

**هدف فقط پیدا کردن مشکل نیست؛ هدف تحویل نسخه جدید سالم، سریع، responsive، قابل نصب به‌صورت PWA و production-ready است.**

[1]: https://web.dev/learn/pwa?utm_source=chatgpt.com "Learn PWA  |  web.dev"
[2]: https://developer.chrome.com/docs?utm_source=chatgpt.com "Documentation  |  Docs  |  Chrome for Developers"
