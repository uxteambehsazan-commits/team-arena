============================================================
TEAM ARENA — FINAL PRODUCTION MASTER PROMPT
============================================================

PROJECT:
Team Arena / میدان هم‌تیمی‌ها

IMPORTANT:
The CURRENT FIGMA MAKE PROJECT is the ONLY SOURCE OF TRUTH.

GitHub is ONLY the deployment target.

The current Figma Make source must always have priority over
any existing GitHub source, old implementation, old deployment,
old build artifact, old workflow or cached version.

DO NOT redesign unrelated parts of the product.

DO NOT recreate the application from scratch visually.

DO NOT copy obsolete GitHub implementation into Figma Make.

DO NOT create a second parallel application.

The goal is to make the CURRENT Figma Make application
production-ready, deploy it correctly to GitHub Pages,
and extend the existing Admin environment with:

1. Version Management
2. Release Notes
3. Game Status Management
4. Feedback Management
5. User Update Center
6. "You Said → We Improved" system
7. Smart Loading
8. Skeleton Loading
9. Empty States
10. Error States
11. Retry / Recovery
12. System Health
13. Admin Release Management
14. Deployment-safe architecture

============================================================
PART 1 — SOURCE OF TRUTH
============================================================

The hierarchy must always be:

CURRENT FIGMA MAKE
        ↓
APPLICATION SOURCE
        ↓
GITHUB REPOSITORY
        ↓
BUILD
        ↓
GITHUB ACTIONS
        ↓
GITHUB PAGES
        ↓
LIVE APPLICATION

Figma Make is the source of truth.

GitHub is not the product source of truth.

If GitHub contains an older version than Figma Make:

KEEP THE CURRENT FIGMA MAKE VERSION.

============================================================
PART 2 — FIRST: DIAGNOSE FIGMA MAKE ↔ GITHUB
============================================================

Before deleting, replacing or rebuilding anything:

FIRST inspect the existing Figma Make ↔ GitHub connection.

Verify:

- connected GitHub account
- organization
- repository
- repository owner
- repository name
- branch
- default branch
- Figma Make push branch
- GitHub Pages deployment branch
- GitHub Actions workflow
- authentication
- permissions
- repository access
- Pages configuration
- duplicate workflows
- deployment configuration
- service worker
- cache configuration

Do not assume the connection is correct.

============================================================
PART 3 — REAL CONNECTION TEST
============================================================

Perform an actual Figma Make → GitHub push/test if supported.

Verify:

Figma Make
→ GitHub
→ correct repository
→ correct branch
→ actual source update

Do not only inspect configuration.

If the connection fails:

FIRST fix the connection.

Do not delete the repository before fixing the connection.

If the connection cannot be fixed automatically:

DO NOT pretend it was fixed.

Clearly identify:

- what failed
- why it failed
- what manual action is required

============================================================
PART 4 — CLEAN SOURCE RESET
============================================================

If:

- GitHub connection is healthy
- repository is correct
- permissions are correct
- branch is correct

but the latest Figma Make source is still not correctly represented
in GitHub:

perform a CLEAN APPLICATION SOURCE RESET.

Prefer:

KEEP REPOSITORY
KEEP REPOSITORY URL
KEEP PERMISSIONS
KEEP PAGES CONFIGURATION
KEEP VALID INTEGRATION

Remove/replace obsolete:

- source files
- components
- routes
- pages
- old game implementation
- obsolete assets
- build output
- obsolete workflows
- obsolete service workers
- obsolete configuration
- obsolete dependencies

Then rebuild from CURRENT FIGMA MAKE SOURCE.

Do not merge old GitHub application code with the current Figma code.

============================================================
PART 5 — FULL CURRENT APPLICATION PRESERVATION
============================================================

Preserve all existing valid functionality from CURRENT Figma Make:

- visual identity
- colors
- typography
- components
- interactions
- game logic
- game selection
- Waiting Room
- player states
- navigation
- game flow
- responsive layouts
- existing Admin environment
- existing user experience

Do not redesign unrelated screens.

============================================================
PART 6 — TEAM ARENA FLOW
============================================================

The application must maintain a clear user journey:

Previous Screen
↓
Team Arena
↓
Waiting Room
↓
Players Join
↓
Player Ready States
↓
Game Selection
↓
Start Game
↓
Game
↓
Result / Next State

Every state must have a valid exit or recovery path.

No dead ends.

============================================================
PART 7 — WAITING ROOM
============================================================

The Team Arena Waiting Room must support:

- host
- non-host
- single player
- multiple players
- minimum player requirement
- ready state
- player join
- player leave
- game start
- back
- exit
- refresh/re-entry where supported

Test all states.

The Waiting Room must work correctly on:

- mobile
- desktop

============================================================
PART 8 — GAME SELECTION
============================================================

Preserve the CURRENT Figma Make game-selection rules.

If the current system allows:

- selecting one game
- selecting multiple games
- maximum four games

preserve those exact rules.

Do not invent different selection logic.

============================================================
PART 9 — ADMIN ENVIRONMENT
============================================================

The application already contains an Admin environment.

Do NOT create a separate unrelated Admin application.

Extend the EXISTING Admin environment.

Admin must remain separate from the normal player experience.

Normal users must never see Admin navigation or controls.

Admin routes must be protected by real authorization where supported.

Do NOT rely only on hiding a button.

============================================================
PART 10 — ADMIN NAVIGATION
============================================================

Extend the Admin navigation with:

ADMIN
│
├── 📊 داشبورد
│
├── 🎮 مدیریت بازی‌ها
│   ├── وضعیت بازی‌ها
│   ├── فعال / غیرفعال
│   ├── در حال بهبود
│   └── بازخوردها
│
├── 🚀 انتشارها
│   ├── نسخه‌ها
│   ├── Draft
│   ├── Preview
│   ├── Published
│   └── Release Notes
│
├── 💬 بازخوردها
│   ├── همه
│   ├── بر اساس بازی
│   ├── دسته‌بندی
│   └── مرتبط با انتشار
│
├── ⚙️ تنظیمات
│   ├── نسخه فعلی
│   ├── تنظیمات انتشار
│   └── تنظیمات سیستم
│
└── 🧪 سلامت سیستم
    ├── وضعیت بازی‌ها
    ├── خطاها
    ├── Loading / Error
    └── وضعیت Deployment

============================================================
PART 11 — ADMIN DASHBOARD
============================================================

Dashboard must provide a compact operational overview.

Show:

- current application version
- latest release
- draft release
- number of games
- active games
- games in improvement
- games in maintenance
- recent feedback
- recent release
- system health
- deployment/build information where available

Do not overwhelm the Admin with unnecessary analytics.

============================================================
PART 12 — VERSION MANAGEMENT
============================================================

Create a centralized application version system.

Use semantic versioning:

MAJOR.MINOR.PATCH

Example:

2.4.0

Version must NOT be hard-coded across multiple components.

Create one centralized version/configuration source.

Version should be accessible to:

- Admin
- user update modal
- release history
- system health
- diagnostics
- footer/settings if appropriate

============================================================
PART 13 — RELEASE MANAGEMENT
============================================================

Create:

«مدیریت انتشارها»

Admin can:

- create release
- edit draft
- preview
- publish
- archive
- cancel draft
- view release history

Each Release contains:

VERSION
TITLE
SUMMARY
RELEASE DATE
STATUS
CHANGES
RELATED GAME
FEEDBACK REFERENCE
CHANGE TYPE

Change types:

- قابلیت جدید
- بهبود
- رفع خطا
- عملکرد
- تجربه کاربری
- بازخورد کاربران

============================================================
PART 14 — RELEASE STATUS
============================================================

Support:

DRAFT
SCHEDULED
PUBLISHED
ARCHIVED

Only PUBLISHED releases are visible to normal users.

If scheduling is not technically supported by the current architecture,
use:

DRAFT
PUBLISHED
ARCHIVED

Do not create fake scheduling behavior.

============================================================
PART 15 — RELEASE PREVIEW
============================================================

Admin must be able to preview exactly what users will see.

Button:

«پیش‌نمایش»

Preview should display:

- version
- release title
- summary
- release notes
- improvement information
- feedback-based changes

Preview must NOT publish the release.

============================================================
PART 16 — RELEASE PUBLISHING
============================================================

Before publishing validate:

- valid version
- no duplicate version
- title
- summary
- release notes
- required fields
- related game where required

Only after successful validation:

Publish Release.

Published release becomes available to users.

============================================================
PART 17 — IMPORTANT: RELEASE ≠ CODE DEPLOYMENT
============================================================

Keep these concepts separate:

PRODUCT RELEASE RECORD
and
ACTUAL CODE DEPLOYMENT

Creating a Release in Admin must NOT falsely imply that new code
has already been deployed.

If technically possible, connect:

Release Version
+
Build Version
+
Deployment Version

so Admin can verify whether the published release corresponds
to the actual deployed build.

Never claim a deployment that did not actually happen.

============================================================
PART 18 — USER UPDATE CENTER
============================================================

When a new published version becomes available:

show an elegant update modal.

Example:

🎉 نسخه جدید

نسخه 2.4.0

چه چیزهایی تغییر کرده؟

🎮 بهبود بازی X
روند بازی ساده‌تر و روان‌تر شد.

⚡ بهبود عملکرد
سرعت ورود به بازی بهتر شد.

🐛 رفع خطا
چند مشکل گزارش‌شده برطرف شد.

[مشاهده تغییرات]

[متوجه شدم]

Design must match Team Arena.

On mobile use a comfortable bottom sheet/modal if appropriate.

============================================================
PART 19 — LAST SEEN VERSION
============================================================

Track:

lastSeenVersion

If:

currentVersion > lastSeenVersion

show update notification.

After:

«متوجه شدم»

save the current version as seen.

Do not repeatedly show the same release.

If user dismisses without confirming:

keep a subtle update indicator.

Handle corrupted/missing local storage safely.

============================================================
PART 20 — RELEASE HISTORY FOR USERS
============================================================

Provide:

«تغییرات نسخه‌ها»

Users can see:

2.4.0
2.3.0
2.2.0

Each release:

[مشاهده تغییرات]

Keep this lightweight.

============================================================
PART 21 — GAME STATUS SYSTEM
============================================================

Every game must support:

READY
IMPROVING
MAINTENANCE
COMING_SOON

Persian UI:

🟢 آماده بازی
🛠 در حال بهبود
🟠 نگهداری موقت
🔵 به‌زودی

============================================================
PART 22 — IMPORTANT GAME STATUS RULE
============================================================

"در حال بهبود" does NOT automatically mean unavailable.

Example:

🛠 در حال بهبود
قابل بازی: بله

Admin must be able to independently control:

STATUS
and
PLAYABILITY

Therefore:

Status = IMPROVING
does not automatically disable the game.

Only when:

playable = false

should the game become unavailable.

============================================================
PART 23 — GAME STATUS ADMIN
============================================================

Admin can configure:

Game Name
Status
Playable
Improvement Message
Feedback Count
Show Feedback Count
Related Release

Example:

بازی X

وضعیت:
🛠 در حال بهبود

پیام:
این بازی بر اساس بازخورد بازیکنان در حال بهبود است.

قابل بازی:
☑

نمایش تعداد بازخورد:
☑

تعداد بازخورد:
70

[ذخیره]

============================================================
PART 24 — GAME STATUS USER EXPERIENCE
============================================================

Status must appear subtly on:

- game cards
- game selection
- game details
- relevant Waiting Room areas

Do not allow status badges to dominate the UI.

Do not rely only on color.

============================================================
PART 25 — FEEDBACK MANAGEMENT
============================================================

If the application already has feedback:

integrate the existing feedback data.

Do not create fake feedback.

Admin can:

- view feedback
- search
- filter by game
- filter by category
- filter by status
- mark as reviewed
- link feedback to improvement
- link feedback to release

Possible statuses:

جدید
در حال بررسی
بررسی شد
اعمال شد
آرشیو

============================================================
PART 26 — FEEDBACK → IMPROVEMENT → RELEASE
============================================================

Create a clear data relationship:

USER FEEDBACK
↓
GAME
↓
IMPROVEMENT
↓
RELEASE
↓
VERSION
↓
USER UPDATE

Example:

70 feedback
↓
Game X
↓
Improvement
↓
Version 2.4.0
↓
"بر اساس 70 بازخورد کاربران..."

This must be data-driven.

Never hard-code:

70

unless it is actually stored data.

============================================================
PART 27 — "YOU SAID → WE IMPROVED"
============================================================

Create a reusable user-facing pattern:

💬 شما گفتید

70 بازخورد درباره بازی X

↓

🛠 ما بهبود دادیم

روند بازی X ساده‌تر و روان‌تر شد.

Only show the feedback number if verified.

If no verified count:

«بر اساس بازخورد کاربران»

Do not fabricate statistics.

============================================================
PART 28 — "LATEST IMPROVEMENTS"
============================================================

Create a compact section:

«آخرین بهبودها»

Example:

🎮 بازی X
روند بازی ساده‌تر شد
نسخه 2.4.0

⚡ عملکرد
سرعت ورود به بازی بهبود یافت

🐛 رفع خطا
مشکلات گزارش‌شده برطرف شد

Do not overload the home screen.

============================================================
PART 29 — SMART LOADING ARCHITECTURE
============================================================

Create ONE centralized loading architecture across the entire app.

Standard states:

IDLE
LOADING
SUCCESS
EMPTY
ERROR
RETRY

Do not implement random loading behavior per page.

============================================================
PART 30 — SKELETON LOADING
============================================================

Use Skeleton UI whenever content structure is known.

Examples:

- game cards
- player cards
- Waiting Room
- game details
- feedback lists
- release lists
- Admin dashboard
- tables
- statistics

Skeleton dimensions should closely match final content.

Goal:

avoid layout shift.

Do not use excessive shimmer.

============================================================
PART 31 — LOADING TYPES
============================================================

Use:

SKELETON
for structured page content

INLINE SPINNER
for short actions

BUTTON LOADER
for submit/save/publish

FULL PAGE LOADER
only when the entire application is unavailable

Do not use full-screen loading for every request.

============================================================
PART 32 — PROGRESSIVE LOADING
============================================================

Load in this order:

1. App shell
2. Navigation
3. Core layout
4. Critical data
5. Game-specific data
6. Non-critical assets

Never show a completely blank screen unnecessarily.

============================================================
PART 33 — EMPTY STATES
============================================================

Every list/data section needs a meaningful Empty State.

Examples:

Feedback:

«هنوز بازخوردی ثبت نشده است.»

Releases:

«هنوز نسخه‌ای منتشر نشده است.»

Players:

«هنوز بازیکنی وارد نشده است.»

Games:

«بازی‌ای برای نمایش وجود ندارد.»

Where appropriate provide:

CTA

============================================================
PART 34 — ERROR STATES
============================================================

Every important operation must support:

ERROR
+
RETRY
+
RECOVERY PATH

Example:

«دریافت اطلاعات با مشکل مواجه شد.»

[تلاش دوباره]

Do not expose stack traces or technical errors to normal users.

============================================================
PART 35 — ERROR BOUNDARY / RUNTIME FAILURE
============================================================

Where supported by the framework:

implement global error boundary behavior.

If a component crashes:

do not crash the entire application unnecessarily.

Show:

«مشکلی پیش آمد.»

[تلاش دوباره]

[بازگشت]

============================================================
PART 36 — NETWORK FAILURE
============================================================

Handle temporary connection loss.

Display:

«اتصال اینترنت قطع شده است.»

Then:

«در حال تلاش برای اتصال مجدد...»

After recovery:

«اتصال برقرار شد.»

Do not reload the entire application unnecessarily.

============================================================
PART 37 — CORRUPTED LOCAL DATA
============================================================

If localStorage/session state becomes invalid:

- detect invalid data
- safely reset only the corrupted state
- preserve unrelated data
- continue application startup

Never leave the application stuck on loading.

============================================================
PART 38 — OPTIMISTIC UI
============================================================

Where safe:

use optimistic UI for small actions.

Examples:

- marking feedback as reviewed
- toggling UI preferences

For destructive or important operations:

wait for confirmation.

For publishing releases:

ALWAYS confirm successful persistence before showing Published.

============================================================
PART 39 — ADMIN RELEASE CONFIRMATION
============================================================

Before critical actions:

Publish
Archive
Disable Game
Change Playability

show confirmation where appropriate.

Example:

«آیا از انتشار نسخه 2.4.0 مطمئن هستید؟»

[انصراف]
[انتشار]

============================================================
PART 40 — ADMIN AUDIT LOG
============================================================

Create lightweight audit history.

Track important Admin actions:

- publish release
- archive release
- change game status
- enable/disable game
- change playability
- modify feedback relationship

Store:

Action
Timestamp
Affected Entity
Previous State
New State

Do not store unnecessary personal information.

============================================================
PART 41 — ADMIN SYSTEM HEALTH
============================================================

Create:

«سلامت سیستم»

Display where technically available:

- current version
- build version
- deployment version
- last deployment
- environment
- active games
- games under improvement
- maintenance games
- recent errors
- service state

Do not expose:

- API keys
- secrets
- tokens
- infrastructure credentials

============================================================
PART 42 — SECURITY
============================================================

Perform a security audit.

Never expose client-side:

- passwords
- private tokens
- GitHub credentials
- database credentials
- private environment variables
- secret API keys

Remember:

GitHub Pages is public.

Anything delivered to the browser is public.

Review:

- XSS
- unsafe HTML
- URL parameters
- localStorage
- sessionStorage
- external scripts
- dependencies
- user-generated feedback
- Admin authorization

Admin security must NOT rely only on hiding the route.

============================================================
PART 43 — ADMIN AUTHORIZATION
============================================================

Normal users must not be able to access Admin actions by:

- typing Admin URL
- manipulating UI
- changing local storage
- changing client-side state

Where secure backend/authentication exists:

use real authorization.

If the current architecture is client-only and cannot securely protect
Admin write operations:

DO NOT pretend that it is secure.

Clearly identify the architectural limitation.

============================================================
PART 44 — PERFORMANCE
============================================================

Optimize:

- initial bundle
- JavaScript
- CSS
- images
- fonts
- dynamic imports
- code splitting
- lazy loading
- unnecessary renders
- animations
- memory
- network requests

Admin functionality should not unnecessarily load into the normal
player experience.

============================================================
PART 45 — ADMIN PERFORMANCE
============================================================

Use:

pagination
filtering
lazy loading

for:

- feedback
- releases
- logs
- games

Do not load thousands of records at once.

============================================================
PART 46 — CACHE
============================================================

Audit:

- browser cache
- Cache Storage
- service worker
- old HTML
- old JS
- old CSS
- old manifest

If obsolete service worker exists:

remove it safely.

If service worker is necessary:

implement correct versioning and invalidation.

HTML must not be permanently cached.

Hashed assets may use long-term caching.

============================================================
PART 47 — GITHUB PAGES
============================================================

Configure GitHub Pages correctly.

Prefer GitHub Actions if build is required.

Production pipeline:

Checkout
↓
Install
↓
Build
↓
Validate
↓
Upload Artifact
↓
Deploy Pages

There must be one clear production deployment workflow.

Remove conflicting workflows.

============================================================
PART 48 — BASE PATH
============================================================

If deployed as:

https://USERNAME.github.io/REPOSITORY/

verify:

- CSS
- JS
- images
- fonts
- icons
- dynamic imports
- lazy chunks
- manifest

all work correctly under repository path.

============================================================
PART 49 — ROUTING
============================================================

Verify:

- initial load
- direct route
- refresh
- back
- forward
- deep link
- invalid route

No valid route should unexpectedly become 404 after refresh.

============================================================
PART 50 — MOBILE
============================================================

Test:

360
375
390
414

Verify:

- header
- game cards
- Waiting Room
- game selection
- update modal
- Admin where appropriate
- status badges
- buttons
- forms

No:

- horizontal overflow
- clipped content
- unreadable text
- overlapping elements

============================================================
PART 51 — DESKTOP
============================================================

Test:

1024
1280
1440
1920

Verify:

- game layout
- Waiting Room
- Admin Dashboard
- Release Management
- Feedback
- Game Management

============================================================
PART 52 — ACCESSIBILITY
============================================================

Apply accessibility across:

USER APP
ADMIN

Support:

- keyboard navigation
- visible focus
- semantic controls
- modal focus trap
- ESC close
- readable contrast
- screen reader labels
- status text independent of color

============================================================
PART 53 — DATA ARCHITECTURE
============================================================

Centralize the following:

APP CONFIG
RELEASES
GAMES
GAME STATUS
FEEDBACK
UI STATE
SYSTEM STATE

Suggested conceptual structure:

AppConfig
 ├── version
 ├── build
 └── environment

Release
 ├── version
 ├── title
 ├── date
 ├── status
 ├── summary
 └── changes[]

ReleaseChange
 ├── type
 ├── game
 ├── title
 ├── description
 └── feedbackReference

Game
 ├── name
 ├── status
 ├── playable
 ├── improvementMessage
 └── feedbackCount

Feedback
 ├── game
 ├── category
 ├── status
 └── release

UIState
 ├── loading
 ├── success
 ├── empty
 └── error

Do not scatter this logic across components.

============================================================
PART 54 — RELEASE COPY
============================================================

User-facing release notes should be simple and benefit-oriented.

Avoid technical wording.

Instead of:

"Refactored state synchronization."

Use:

"هماهنگی وضعیت بازی‌ها سریع‌تر و پایدارتر شد."

Instead of:

"Optimized rendering pipeline."

Use:

"سرعت نمایش صفحات و بازی‌ها بهبود پیدا کرد."

============================================================
PART 55 — NO FAKE DATA
============================================================

Never fabricate:

- feedback count
- user count
- performance percentage
- error count
- release statistics
- game statistics

If data does not exist:

hide it
OR
use an honest generic message.

============================================================
PART 56 — VERSION TESTING
============================================================

Test:

Version 1.0.0
→ Version 1.1.0

Verify:

- modal appears
- version is correct
- release notes are correct
- close works
- seen state is saved
- refresh does not repeatedly show it

Then:

Version 1.1.0
→ Version 1.1.1

verify again.

============================================================
PART 57 — ADMIN TESTING
============================================================

Test:

AUTHORIZED ADMIN
UNAUTHORIZED USER
DIRECT ADMIN URL

Then:

Create Draft
→ Edit
→ Preview
→ Publish
→ Verify User sees release

Also test:

Duplicate Version
Invalid Version
Missing Required Fields
Archive
Game Status Change
Playable Toggle
Feedback Link

============================================================
PART 58 — GAME STATUS TESTING
============================================================

Test:

READY
IMPROVING
MAINTENANCE
COMING_SOON

For each:

verify visual state
verify accessibility
verify playability
verify game selection
verify details
verify release relation

============================================================
PART 59 — LOADING TESTING
============================================================

Test:

Fast network
Slow network
No network
Delayed response
Empty response
Failed response
Retry
Reconnect

Verify:

No infinite spinner.

No blank page.

No broken layout.

No unnecessary full-screen loading.

============================================================
PART 60 — WAITING ROOM TESTING
============================================================

Test:

Single player
Multiple players
Host
Non-host
Minimum players
Ready
Not ready
Player leaves
Back
Exit
Refresh
Re-entry
Game start

Test on:

Mobile
Desktop

============================================================
PART 61 — DEPLOYMENT TESTING
============================================================

Verify actual chain:

CURRENT FIGMA MAKE
↓
GITHUB
↓
BRANCH
↓
BUILD
↓
GITHUB ACTIONS
↓
GITHUB PAGES
↓
LIVE URL

Do not consider:

"GitHub Actions = Success"

as sufficient proof.

Open/verify the actual deployed application.

============================================================
PART 62 — LIVE VERSION VERIFICATION
============================================================

Verify:

LIVE BUILD
=
EXPECTED BUILD
=
CURRENT FIGMA MAKE

Verify:

- UI
- routes
- Waiting Room
- game selection
- game flow
- assets
- version
- update modal
- game status
- Admin data

============================================================
PART 63 — CACHE VERIFICATION
============================================================

Test:

- normal browser
- hard refresh
- private/incognito
- new browser
- mobile

Verify that old application is not being served.

============================================================
PART 64 — FINAL ACCEPTANCE CHECKLIST
============================================================

[ ] Current Figma Make identified as source of truth
[ ] GitHub connection inspected
[ ] Correct repository verified
[ ] Correct branch verified
[ ] Authentication verified
[ ] Permissions verified
[ ] Real push tested
[ ] Old source removed where necessary
[ ] Current Figma source deployed
[ ] Build successful
[ ] GitHub Pages successful
[ ] Live URL verified
[ ] Routing verified
[ ] Cache verified
[ ] Service worker verified
[ ] Security reviewed
[ ] Performance reviewed

[ ] Waiting Room verified
[ ] Game selection verified
[ ] Game flow verified
[ ] Player states verified

[ ] Admin Dashboard verified
[ ] Admin Release Management verified
[ ] Admin Preview verified
[ ] Admin Publish verified
[ ] Admin Game Status verified
[ ] Admin Feedback verified
[ ] Admin Audit verified
[ ] Admin authorization verified

[ ] Version Management implemented
[ ] Release Notes implemented
[ ] Update Modal implemented
[ ] Last Seen Version implemented
[ ] Release History implemented

[ ] Game Status implemented
[ ] READY implemented
[ ] IMPROVING implemented
[ ] MAINTENANCE implemented
[ ] COMING_SOON implemented

[ ] Feedback integration implemented
[ ] You Said → We Improved implemented
[ ] No fake feedback counts

[ ] Skeleton loading implemented
[ ] Loading states implemented
[ ] Empty states implemented
[ ] Error states implemented
[ ] Retry implemented
[ ] Recovery implemented
[ ] Network handling implemented

[ ] Mobile QA
[ ] Desktop QA
[ ] Accessibility QA

[ ] No dead ends
[ ] No duplicate flows
[ ] No duplicate deployment workflow
[ ] No fake success

============================================================
PART 65 — FINAL REPORT
============================================================

At the end provide a concise production report containing:

1. FIGMA MAKE ↔ GITHUB
- connection status
- issue found
- resolution

2. GITHUB
- repository
- branch
- commit

3. BUILD
- framework
- package manager
- build command
- output

4. DEPLOYMENT
- GitHub Actions status
- GitHub Pages status
- live URL

5. VERSION
- current version
- deployed build version
- release status

6. ADMIN
- release management
- game status
- feedback
- preview
- audit log

7. LOADING
- skeleton
- loading
- empty
- error
- retry

8. SECURITY
- findings
- fixes
- remaining limitations

9. PERFORMANCE
- findings
- optimizations

10. QA
- scenarios tested
- passed
- failed

11. REMAINING ISSUES
Only list real unresolved issues.

============================================================
FINAL PRINCIPLE
============================================================

The final product must create this complete lifecycle:

USER
 ↓
PLAYS GAME
 ↓
GIVES FEEDBACK
 ↓
ADMIN REVIEWS FEEDBACK
 ↓
IMPROVEMENT IDENTIFIED
 ↓
GAME STATUS = IMPROVING
 ↓
IMPROVEMENT IMPLEMENTED
 ↓
NEW RELEASE CREATED
 ↓
ADMIN PREVIEW
 ↓
RELEASE PUBLISHED
 ↓
CODE DEPLOYED
 ↓
VERSION UPDATED
 ↓
USER SEES UPDATE
 ↓
"شما گفتید → ما بهبود دادیم"
 ↓
USER CONTINUES PLAYING

And technically:

CURRENT FIGMA MAKE
 ↓
GITHUB
 ↓
BUILD
 ↓
DEPLOYMENT
 ↓
GITHUB PAGES
 ↓
LIVE TEAM ARENA

The system must be production-ready,
scalable,
secure,
responsive,
performant,
and maintainable.

Do not fabricate data.

Do not fabricate deployment success.

Do not claim a task is complete unless it has actually been
verified.

Preserve the existing Team Arena visual identity and functionality
unless a change is explicitly required above.
============================================================