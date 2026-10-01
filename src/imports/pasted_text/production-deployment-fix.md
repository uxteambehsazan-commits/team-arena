============================================================
CRITICAL PRODUCTION DEPLOYMENT FIX
FIGMA MAKE → GITHUB → GITHUB PAGES
============================================================

IMPORTANT:

Current Figma Make is the ONLY SOURCE OF TRUTH.

The latest current Figma Make source is the correct and authoritative
version of the application.

GitHub repository and GitHub Pages are ONLY deployment targets.

DO NOT rebuild the application from the old GitHub source.

DO NOT use the old GitHub version as the source of the application.

The problem is:

The current Figma Make version has been updated significantly,
but the public GitHub Pages URL is STILL showing an older version
from yesterday.

The latest Figma Make changes are NOT visible on the published
GitHub Pages URL.

This must be diagnosed and fixed systematically.

============================================================
PHASE 0 — DO NOT DELETE ANYTHING YET
============================================================

Before deleting, resetting or replacing anything:

FIRST inspect the complete deployment chain.

Verify:

FIGMA MAKE
↓
FIGMA MAKE GITHUB CONNECTION
↓
CONNECTED GITHUB ACCOUNT / ORGANIZATION
↓
CONNECTED REPOSITORY
↓
DEFAULT BRANCH
↓
LATEST COMMIT
↓
BUILD / WORKFLOW
↓
GITHUB PAGES SOURCE
↓
DEPLOYED ARTIFACT
↓
PUBLIC LIVE URL

Do NOT assume the problem is cache.

Do NOT assume the problem is GitHub Actions.

Do NOT assume the Push operation actually contains the latest Figma source.

Find exactly where the old version enters the chain.

============================================================
PHASE 1 — VERIFY FIGMA MAKE ↔ GITHUB CONNECTION
============================================================

Check the GitHub integration configured in the current Figma Make file.

Verify:

1. Which GitHub account / organization is connected?
2. Which repository is connected?
3. Is this repository the intended production repository?
4. Is the repository actually associated with THIS Figma Make file?
5. Is the GitHub integration authorized?
6. Does Figma Make have permission to push?
7. Is the default branch correct?
8. Which branch receives the Figma Make Push?
9. Is the current Figma Make file pushing to the expected repository?
10. Is there any possibility that another Figma Make file is connected
    to another repository?

IMPORTANT:

Figma Make's GitHub integration is one-way:

FIGMA MAKE → GITHUB

GitHub must NOT be treated as the source of truth.

Do not pull the old GitHub code back into Figma Make.

============================================================
PHASE 2 — VERIFY THE CURRENT FIGMA VERSION
============================================================

Before touching GitHub:

Inspect the CURRENT Figma Make source.

Confirm that the latest changes are actually present in the current
Figma Make project.

Create a deployment fingerprint.

The fingerprint should include:

- application version
- release/build identifier
- build timestamp
- source revision identifier where possible

For example:

VERSION:
2.x.x

BUILD:
2026-09-XX-XXXX

SOURCE:
FIGMA-MAKE-CURRENT

IMPORTANT:

Do not use a fake version number.

If the application already has a version-management system,
reuse it.

Otherwise create a minimal internal deployment/build identifier.

This identifier must be visible somewhere in an Admin/System Health
screen or diagnostic mode so that we can verify exactly which version
is running.

============================================================
PHASE 3 — FIRST ATTEMPT: REBUILD / REPUBLISH WITHOUT DELETING
============================================================

Before deleting the repository:

Perform a clean production rebuild of the CURRENT Figma Make source.

Do NOT rebuild from GitHub.

Do NOT restore the previous version.

Do NOT revert the current Figma source.

Do NOT remove current application functionality.

Build the CURRENT Figma source.

Verify:

- all imports
- all components
- routes
- assets
- dependencies
- environment configuration
- build configuration
- SPA routing
- GitHub Pages base path
- public asset paths
- case-sensitive file paths
- static files
- generated files

Fix any build errors before deployment.

============================================================
PHASE 4 — PUSH CURRENT FIGMA SOURCE
============================================================

Push the CURRENT Figma Make source to the repository associated
with THIS Figma Make file.

IMPORTANT:

The Push must represent the CURRENT Figma source.

Do not mix:

OLD GITHUB SOURCE
+
NEW FIGMA SOURCE.

The repository should represent the current Figma Make application.

Verify the resulting GitHub commit.

Record:

- commit SHA
- commit timestamp
- branch
- changed files
- build identifier

Confirm that the latest commit contains the latest Figma changes.

============================================================
PHASE 5 — VERIFY GITHUB ACTIONS / BUILD
============================================================

Inspect GitHub Actions / deployment workflow.

Check:

- workflow exists
- workflow is enabled
- correct branch
- correct trigger
- correct build command
- correct output directory
- correct Node version
- correct dependency installation
- no stale build artifact
- no duplicate deployment workflow
- no competing workflow
- no old deployment workflow
- no failed deployment hidden behind a successful commit

There should be ONE clear production deployment path.

Prefer:

CURRENT FIGMA MAKE
→ DEFAULT PRODUCTION BRANCH
→ ONE BUILD
→ ONE DEPLOYMENT
→ GITHUB PAGES

Do not create multiple competing workflows.

============================================================
PHASE 6 — CLEAN BUILD
============================================================

Force a clean build.

Do not reuse stale build artifacts.

Clean where technically appropriate:

- old build directory
- old generated assets
- stale deployment artifacts
- stale workflow artifacts
- unnecessary service worker caches

BUT:

Do NOT delete source files required by the current Figma Make
application.

The goal is:

CLEAN BUILD

not:

BLIND DELETION.

============================================================
PHASE 7 — GITHUB PAGES CONFIGURATION
============================================================

Verify GitHub Pages configuration.

Check:

- Pages enabled
- correct source
- correct branch
- correct directory
- correct deployment workflow
- correct base path
- correct public URL
- SPA routing
- fallback behavior
- asset paths

The application must work correctly when opened directly on:

/

and on internal routes.

Prevent:

404 on refresh
404 on direct route
missing JS
missing CSS
missing images
wrong relative paths.

============================================================
PHASE 8 — CACHE / SERVICE WORKER
============================================================

Investigate whether an old version is being served from:

- browser cache
- service worker
- CDN cache
- GitHub Pages cache
- old generated assets
- old index.html
- old hashed bundles
- local storage
- session storage

If a service worker exists:

verify that it does not permanently serve stale application assets.

Implement a safe cache invalidation strategy.

IMPORTANT:

Do NOT simply add random query parameters everywhere.

Fix the actual caching architecture.

The latest deployment must reliably become the active version.

============================================================
PHASE 9 — LIVE URL VERIFICATION
============================================================

This is CRITICAL.

Do NOT consider the deployment successful merely because:

- GitHub Actions says SUCCESS
- Push says SUCCESS
- Build says SUCCESS

The REAL test is the PUBLIC GITHUB PAGES URL.

Open the actual production URL.

Verify that it contains the latest Figma Make version.

Compare the live application against the current Figma Make source.

Check at least:

- homepage
- profile
- avatar selection
- game selection
- Behsazani Hub
- Waiting Room
- game flows
- new "شکار بهسازانی" core
- admin
- version information
- all critical routes

============================================================
PHASE 10 — DEPLOYMENT FINGERPRINT TEST
============================================================

Use the deployment fingerprint created earlier.

For example:

CURRENT FIGMA:

VERSION 2.x.x
BUILD XXXXX

LIVE GITHUB:

VERSION ?
BUILD ?

The live GitHub version MUST match the current Figma version.

If:

FIGMA ≠ GITHUB

the deployment is NOT successful.

Do not claim success.

============================================================
PHASE 11 — IF THE REBUILD WORKS
============================================================

If the public GitHub Pages URL now correctly shows the latest
Figma Make version:

STOP.

DO NOT DELETE THE REPOSITORY.

Do a final production QA.

Report:

✓ connection
✓ repository
✓ branch
✓ commit
✓ build
✓ deployment
✓ live URL
✓ version match
✓ cache status
✓ routing
✓ application health

============================================================
PHASE 12 — IF THE REBUILD DOES NOT WORK
============================================================

ONLY IF:

CURRENT FIGMA SOURCE
≠
GITHUB REPOSITORY
OR
GITHUB PAGES

after a clean rebuild and verified Push,

then proceed to:

CLEAN DEPLOYMENT RESET.

Do NOT immediately delete the entire GitHub repository.

First preserve:

- repository identity
- repository URL
- GitHub Pages configuration where possible
- permissions
- connected Figma Make integration
- required deployment settings

Before destructive action:

create a backup/reference of the current repository state.

Record:

- current commit SHA
- repository name
- default branch
- Pages configuration
- workflow configuration
- deployment configuration

============================================================
PHASE 13 — CLEAN SOURCE RESET
============================================================

If and ONLY if required:

Remove obsolete application source/build/deployment files
that are causing the old version to remain active.

Then rebuild the repository from:

CURRENT FIGMA MAKE SOURCE.

IMPORTANT:

DO NOT copy the old application source back.

DO NOT restore yesterday's version.

The repository must become a clean representation of the
CURRENT Figma Make project.

Preserve only configuration that is genuinely required.

============================================================
PHASE 14 — EXTREME RESET
============================================================

ONLY if the repository itself is corrupted or the Figma Make
connection is irreparably attached to the wrong repository:

consider repository recreation.

Before doing this:

1. Verify the current Figma Make GitHub connection.
2. Verify the correct GitHub account.
3. Verify the correct organization.
4. Verify the intended repository.
5. Verify permissions.
6. Verify the default branch.
7. Verify GitHub Pages requirements.
8. Verify the deployment path.

Do NOT create multiple repositories accidentally.

There must be one authoritative production repository.

============================================================
PHASE 15 — IMPORTANT FIGMA MAKE GITHUB RULE
============================================================

Treat the Figma Make repository connection carefully.

Do NOT manually restructure files in ways that conflict with
the Figma Make-generated source architecture.

The current Figma Make source is authoritative.

If GitHub contains manually modified or outdated files,
they must NOT override the current Figma source.

============================================================
PHASE 16 — PRODUCTION BUILD HARDENING
============================================================

Before final deployment, verify:

BUILD:

✓ production build
✓ no TypeScript errors
✓ no unresolved imports
✓ no missing assets
✓ no broken routes
✓ no invalid environment references
✓ no unnecessary development dependencies
✓ no duplicate bundles

RUNTIME:

✓ no console errors
✓ no unhandled exceptions
✓ no infinite loading
✓ no broken state
✓ no blank screens
✓ no broken modal
✓ no broken navigation

============================================================
PHASE 17 — PERFORMANCE
============================================================

Check:

- initial bundle size
- lazy loading
- code splitting
- image optimization
- unnecessary re-renders
- animation performance
- timer performance
- memory usage
- excessive localStorage reads
- excessive state updates

Do NOT sacrifice functionality merely to reduce bundle size.

Optimize intelligently.

============================================================
PHASE 18 — SECURITY
============================================================

Check:

- no API secrets in frontend
- no private credentials in repository
- no exposed tokens
- no unnecessary third-party scripts
- no unsafe HTML injection
- safe URL handling
- safe localStorage usage
- safe client-side profile data
- no sensitive information exposed through public build

============================================================
PHASE 19 — PROFILE / LOCAL CLIENT DATA
============================================================

The application currently does NOT use username/password
authentication for normal players.

Player profile data is client-side.

Therefore verify:

- profile data is isolated per browser/device
- one player's profile does not overwrite another player's profile
- avatar
- player display name
- XP
- level
- statistics
- selected character
- game progress

remain consistent.

Do NOT claim that client-side storage is equivalent to secure
server-side authentication.

============================================================
PHASE 20 — COMPLETE GAME REGRESSION TEST
============================================================

After deployment, test the entire application.

Test:

HOME
→ PROFILE
→ AVATAR
→ NAME
→ GAME SELECTION
→ ONLINE GAME
→ SINGLE PLAYER
→ WAITING ROOM
→ GAME START
→ GAMEPLAY
→ RESULT
→ PROFILE
→ ADMIN

Then test all major games.

For every game:

0 → 100 QA.

============================================================
PHASE 21 — GAME QUALITY TEST
============================================================

For each game verify:

FUNCTIONALITY
PERFORMANCE
SPEED
USABILITY
ACCESSIBILITY
RESPONSIVENESS
GAMEPLAY
GAME BALANCE
GAMIFICATION
SCORING
STATE MANAGEMENT
ERROR HANDLING
LOADING
EMPTY STATES
RECOVERY
NAVIGATION
ROUTING
DATA PERSISTENCE
LOCAL STORAGE
MULTIPLAYER STATE
ROLE ASSIGNMENT
TIMER
RECONNECT
REFRESH
BACK BUTTON
EXIT
RE-ENTRY

============================================================
PHASE 22 — CORE GAME HEALTH
============================================================

For each game verify:

✓ core gameplay loop works
✓ no dead-end
✓ no soft-lock
✓ no impossible state
✓ no infinite timer
✓ no duplicate reward
✓ no duplicated score
✓ no negative unexpected score
✓ no incorrect role
✓ no incorrect player state
✓ no stale data
✓ no duplicated players
✓ no lost player
✓ no incorrect winner
✓ no broken restart
✓ no broken replay
✓ no broken rematch

============================================================
PHASE 23 — MULTIPLAYER QA
============================================================

Test:

1 player
2 players
minimum players
normal group
maximum supported group

Test:

host
non-host
player joining
player leaving
host leaving
rejoin
refresh
back
timeout
disconnect
reconnect

Verify that every participant receives the correct state.

============================================================
PHASE 24 — MOBILE QA
============================================================

Test on mobile dimensions.

Verify:

✓ no horizontal overflow
✓ no clipped buttons
✓ no overlapping text
✓ no inaccessible controls
✓ no tiny touch targets
✓ no keyboard problems
✓ no bottom navigation conflicts
✓ no modal overflow
✓ no timer overlap
✓ no header congestion

============================================================
PHASE 25 — DESKTOP QA
============================================================

Verify:

✓ layout
✓ spacing
✓ responsive scaling
✓ no excessive empty space
✓ no stretched mobile UI
✓ no broken cards
✓ no broken dialogs

============================================================
PHASE 26 — VERSIONING
============================================================

Before final deployment:

Create/update application version.

Use semantic versioning:

MAJOR.MINOR.PATCH

Examples:

2.0.0
2.1.0
2.1.1

For a major gameplay-core replacement:

use an appropriate MAJOR or MINOR increment based on the
existing versioning architecture.

DO NOT invent a version unrelated to the current release state.

Record:

version
release date
release title
release summary
build identifier

============================================================
PHASE 27 — RELEASE VALIDATION
============================================================

The final release must have:

VERSION
+
BUILD ID
+
DEPLOYMENT COMMIT

These three identifiers must allow us to answer:

"What exactly is running on GitHub Pages?"

============================================================
PHASE 28 — FINAL LIVE COMPARISON
============================================================

Compare:

A — CURRENT FIGMA MAKE

B — GITHUB SOURCE

C — GITHUB BUILD

D — GITHUB PAGES LIVE

They must represent the same production version.

Expected:

A = B = C = D

If:

A ≠ B

fix Push.

If:

B ≠ C

fix Build.

If:

C ≠ D

fix Deployment / Pages / Cache.

If:

A = B = C
but
D ≠ C

investigate:

Pages source
deployment artifact
cache
service worker
wrong URL
wrong repository
wrong branch.

============================================================
PHASE 29 — DO NOT ACCEPT FALSE SUCCESS
============================================================

NEVER report:

"Done"
"Published"
"Synced"
"Updated"

only because an action succeeded.

Success requires:

CURRENT FIGMA VERSION
=
GITHUB COMMIT VERSION
=
BUILT VERSION
=
LIVE GITHUB PAGES VERSION

============================================================
PHASE 30 — FINAL REPORT
============================================================

At the end provide a concise technical report:

1. Figma Make source:
   VERIFIED / NOT VERIFIED

2. GitHub connection:
   VERIFIED / FIXED / FAILED

3. Repository:
   [repository]

4. Default branch:
   [branch]

5. Latest commit:
   [SHA]

6. Build:
   PASS / FAIL

7. GitHub Pages:
   PASS / FAIL

8. Live URL:
   [URL]

9. Version:
   [VERSION]

10. Build ID:
   [BUILD ID]

11. Figma version = Live version:
   YES / NO

12. Cache/service worker:
   VERIFIED / ISSUE

13. SPA routing:
   PASS / FAIL

14. Game regression:
   PASS / FAIL

15. Mobile:
   PASS / FAIL

16. Desktop:
   PASS / FAIL

17. Console/runtime errors:
   NONE / FOUND

18. Security:
   PASS / FAIL

19. Performance:
   PASS / FAIL

20. Final deployment status:
   PRODUCTION VERIFIED
   OR
   NOT VERIFIED

============================================================
FINAL RULE
============================================================

DO NOT DELETE THE GITHUB REPOSITORY AT THE BEGINNING.

FIRST:

DIAGNOSE
→ REBUILD
→ PUSH
→ BUILD
→ DEPLOY
→ OPEN LIVE URL
→ COMPARE VERSION

ONLY IF THIS FAILS:

BACKUP
→ CLEAN RESET
→ REBUILD FROM CURRENT FIGMA
→ DEPLOY
→ OPEN LIVE URL
→ VERIFY AGAIN.

The current Figma Make source MUST remain untouched and must
remain the SOURCE OF TRUTH throughout the entire operation.

Do not downgrade the current Figma Make application.

Do not restore the old GitHub version.

Do not redesign unrelated parts of the application.

The final goal is not simply:

"GitHub Actions = green"

The final goal is:

"THE EXACT CURRENT FIGMA MAKE VERSION IS ACTUALLY RUNNING
ON THE PUBLIC GITHUB PAGES URL."

============================================================
END
============================================================