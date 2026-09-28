CRITICAL — DIAGNOSE FIGMA MAKE ↔ GITHUB CONNECTION FIRST,
THEN CLEAN REBUILD ONLY IF NECESSARY

SOURCE OF TRUTH = CURRENT FIGMA MAKE PROJECT

============================================================
MISSION
============================================================

The CURRENT FIGMA MAKE PROJECT is the ONLY source of truth.

The existing GitHub repository may contain stale, incomplete,
incorrect, duplicated, or obsolete code.

The current problem is:

THE LATEST FIGMA MAKE VERSION IS NOT RELIABLY APPEARING IN GITHUB
AND/OR GITHUB PAGES.

Do NOT immediately delete the GitHub repository.

Do NOT immediately delete the GitHub source.

FIRST diagnose the entire Figma Make → GitHub connection.

Only after the connection is verified as healthy should you decide
whether a complete GitHub source reset and re-upload is required.

The final objective is:

CURRENT FIGMA MAKE SOURCE
        ↓
VALID FIGMA MAKE ↔ GITHUB CONNECTION
        ↓
CORRECT GITHUB REPOSITORY
        ↓
CORRECT BRANCH
        ↓
CLEAN SOURCE
        ↓
CLEAN BUILD
        ↓
GITHUB ACTIONS
        ↓
GITHUB PAGES
        ↓
LIVE CURRENT VERSION

============================================================
PHASE 0 — ABSOLUTE SOURCE OF TRUTH
============================================================

The CURRENT FIGMA MAKE PROJECT is authoritative.

GitHub is NOT the source of truth.

GitHub Pages is NOT the source of truth.

Old GitHub code is NOT authoritative.

If there is any difference between:

Figma Make
and
GitHub

the current Figma Make source must win.

Do not modify the Figma Make product to match obsolete GitHub code.

Instead, bring GitHub up to date with the current Figma Make source.

============================================================
PHASE 1 — DIAGNOSE FIGMA MAKE ↔ GITHUB CONNECTION
============================================================

THIS STEP IS MANDATORY.

Before deleting, replacing, rebuilding, or pushing anything,
inspect the existing Figma Make ↔ GitHub integration.

Do NOT assume the connection is correct.

Determine:

1. Which GitHub account/organization is connected?
2. Which repository is connected?
3. Is the repository actually the intended production repository?
4. Is Figma Make connected to the correct repository?
5. Which branch does Figma Make push to?
6. Is that branch the same branch used by production deployment?
7. Is the repository accessible?
8. Does Figma Make have the required permission to push?
9. Is the GitHub connection authenticated correctly?
10. Is the connection expired, broken, revoked, or partially configured?
11. Is the repository still available?
12. Has the repository been renamed or moved?
13. Is the default branch correct?
14. Is the Figma Make project connected to an old repository?
15. Is another repository accidentally being used?
16. Is GitHub Pages deploying from a different branch?
17. Is GitHub Pages deploying from a different workflow?
18. Is there more than one deployment workflow?
19. Is an old GitHub Actions workflow still active?
20. Is the latest Figma Make source actually being pushed?

Do NOT proceed based on assumptions.

============================================================
PHASE 2 — VERIFY THE CONNECTION WITH A REAL TEST
============================================================

Perform an actual connection/push verification if the available
Figma Make integration supports it.

Do not only inspect configuration labels.

Verify that Figma Make can actually communicate with the intended
GitHub repository.

Verify:

FIGMA MAKE
→ AUTHENTICATION
→ GITHUB
→ REPOSITORY
→ BRANCH
→ PUSH

If the connection fails, identify the exact reason.

Examples:

- authentication failure
- permission failure
- wrong repository
- wrong branch
- repository unavailable
- integration disconnected
- invalid GitHub configuration
- deployment mismatch
- stale integration
- repository mismatch

============================================================
PHASE 3 — IF CONNECTION HAS A PROBLEM
============================================================

IF the Figma Make ↔ GitHub connection is broken or incorrect:

DO NOT delete the repository yet.

FIRST FIX THE CONNECTION.

Correct:

- GitHub authentication
- repository selection
- organization/account
- repository permissions
- branch selection
- default branch
- Figma Make integration
- deployment target
- GitHub Pages target

Then perform a controlled test push.

Verify that a change from the CURRENT Figma Make source
actually reaches the intended GitHub repository.

Do not continue until the connection is confirmed functional.

============================================================
PHASE 4 — IF CONNECTION IS HEALTHY
============================================================

If:

- Figma Make is connected correctly
- GitHub authentication works
- correct repository is selected
- correct branch is selected
- permissions are correct
- a real push can be performed

BUT

the latest Figma Make source is STILL not correctly represented
in GitHub,

then assume the problem is caused by stale/incorrect repository
source, build configuration, deployment configuration, cache,
workflow, or generated artifacts.

In this case proceed to a CLEAN REPOSITORY SOURCE RESET.

============================================================
PHASE 5 — CLEAN GITHUB SOURCE RESET
============================================================

IMPORTANT:

Do NOT delete the GitHub repository itself unless technically
necessary.

First preserve:

- repository identity
- repository URL
- GitHub Pages capability
- permissions
- integration relationship
- required repository settings

But remove the OLD APPLICATION SOURCE.

The goal is:

KEEP REPOSITORY
+
REMOVE OBSOLETE APPLICATION
+
REBUILD FROM CURRENT FIGMA MAKE

============================================================
PHASE 6 — DELETE OBSOLETE APPLICATION DATA
============================================================

Remove obsolete GitHub application content that conflicts with
the CURRENT FIGMA MAKE source.

This may include:

- old source files
- old React components
- old routes
- old pages
- old game implementations
- old generated files
- old build output
- old assets
- old service workers
- old manifests
- old deployment files
- old workflows
- old CI configuration
- old configuration files
- obsolete scripts
- obsolete dependencies
- obsolete cache configuration

Do NOT preserve obsolete code merely because it exists in GitHub.

Do NOT merge obsolete implementation with the current Figma source.

The result must be a clean application source.

============================================================
PHASE 7 — DO NOT DELETE THE WRONG DATA
============================================================

Before deletion, classify repository content:

A. Required repository configuration
B. Current application source
C. Obsolete application source
D. Deployment configuration
E. Build artifacts
F. Secrets/configuration
G. Documentation
H. GitHub metadata

Preserve anything required for:

- repository access
- Figma Make connection
- GitHub Pages
- permissions
- deployment

unless it is demonstrably obsolete or conflicting.

Never delete credentials blindly.

Never expose credentials.

Never copy secrets into source code.

============================================================
PHASE 8 — RELOAD CURRENT FIGMA MAKE SOURCE
============================================================

After cleaning the obsolete application source:

LOAD / GENERATE THE APPLICATION FROM THE CURRENT FIGMA MAKE SOURCE.

Do NOT reconstruct the application from old GitHub files.

Do NOT use old GitHub implementation as a template.

Do NOT use the deployed website as the source.

The application must be generated from:

CURRENT FIGMA MAKE

The complete current application must be transferred.

Include:

- pages
- routes
- components
- interactions
- state
- game logic
- game selection
- Waiting Room
- player states
- responsive UI
- assets
- styles
- typography
- current product structure
- current functionality

============================================================
PHASE 9 — VERIFY SOURCE COMPLETENESS
============================================================

Before pushing to GitHub, compare the generated application
against the CURRENT Figma Make project.

Verify that no major current functionality is missing.

Check:

- all routes
- all pages
- all game screens
- all interactions
- all game selection logic
- all Waiting Room functionality
- all player states
- all navigation
- all responsive states
- all assets

Do not declare the source complete until this comparison passes.

============================================================
PHASE 10 — REBUILD DEPLOYMENT CONFIGURATION
============================================================

Recreate a clean production deployment configuration.

There must be ONE production deployment architecture.

Avoid:

- duplicate GitHub Actions workflows
- duplicate Pages workflows
- old gh-pages workflows
- conflicting deployment branches
- obsolete build scripts
- multiple production entry points

Preferred architecture:

Figma Make
→ GitHub main/default branch
→ GitHub Actions
→ Build
→ Pages artifact
→ GitHub Pages

============================================================
PHASE 11 — BRANCH VERIFICATION
============================================================

Verify exactly which branch Figma Make pushes to.

Verify exactly which branch GitHub Pages deploys from.

These MUST NOT conflict.

If Figma Make pushes to:

main

but Pages deploys another branch,

correct the deployment configuration.

Do not leave multiple possible production branches.

============================================================
PHASE 12 — BUILD SYSTEM
============================================================

Inspect the CURRENT Figma Make application and identify the actual
framework and build system.

Do NOT assume:

Vite
React
Next.js
or any other framework.

Use the actual project configuration.

Correctly configure:

- package manager
- lockfile
- dependencies
- build command
- output directory
- base path
- asset paths
- routing
- dynamic imports

The production build must complete successfully.

============================================================
PHASE 13 — GITHUB PAGES
============================================================

Configure GitHub Pages correctly for the actual application.

Verify:

- Pages source
- Pages branch
- Actions deployment
- environment
- deployment permissions
- artifact
- output directory
- base URL

Ensure the repository URL works correctly.

If the repository is:

https://USERNAME.github.io/REPOSITORY/

then configure the application so all assets work under that path.

Verify:

- CSS
- JavaScript
- images
- fonts
- icons
- lazy-loaded chunks
- dynamic imports
- manifest

No broken absolute paths.

============================================================
PHASE 14 — ROUTING
============================================================

If this is a SPA, make routing compatible with GitHub Pages.

Test:

- initial page
- direct URL
- refresh
- back
- forward
- deep link
- invalid route

Do not allow valid application routes to produce unnecessary 404 errors.

============================================================
PHASE 15 — CACHE RESET
============================================================

Because stale cache may be contributing to the current problem,
perform a complete cache audit.

Inspect:

- browser cache behavior
- service worker
- Cache Storage
- old asset hashes
- old manifest
- old HTML
- stale JavaScript
- stale CSS

If the service worker is obsolete:

REMOVE IT SAFELY.

If the service worker is required:

implement correct versioning and cache invalidation.

Never allow an obsolete service worker to continuously serve
the old application.

============================================================
PHASE 16 — CACHE STRATEGY
============================================================

Use proper production caching.

HTML:
must be refreshable so a new release can be discovered.

Hashed JS/CSS/assets:
can use long-term caching.

Do not permanently cache index.html.

Do not use aggressive caching that prevents deployment updates.

Use content hashing where supported.

============================================================
PHASE 17 — SECURITY
============================================================

Perform a production security review.

Never expose:

- passwords
- tokens
- API secrets
- private keys
- GitHub credentials
- database credentials
- private environment variables

inside the client bundle.

Remember:

GitHub Pages is public.

Anything delivered to the browser is public.

Review:

- XSS risks
- unsafe HTML
- URL parameters
- query parameters
- localStorage
- sessionStorage
- external scripts
- dependencies
- user-controlled content
- dynamic imports
- third-party resources

============================================================
PHASE 18 — PERFORMANCE
============================================================

Optimize production performance.

Review:

- JavaScript bundle size
- CSS size
- image size
- lazy loading
- code splitting
- dynamic imports
- duplicate dependencies
- unnecessary renders
- animation performance
- memory leaks
- unnecessary requests

Prioritize:

FAST INITIAL LOAD
SMOOTH GAME INTERACTION
MOBILE PERFORMANCE
LOW MEMORY USAGE
STABLE ANIMATIONS

Do not change the visual design unnecessarily.

============================================================
PHASE 19 — ERROR HANDLING
============================================================

Add robust error handling.

Handle:

- invalid route
- missing game
- invalid game state
- failed asset
- malformed localStorage
- failed async operation
- runtime error
- unexpected player state
- invalid URL parameter

Provide graceful recovery.

Do not expose technical stack traces to users.

If supported, use appropriate error boundaries.

============================================================
PHASE 20 — LOCAL STORAGE / STATE
============================================================

Audit localStorage and sessionStorage.

Use namespaced keys.

Validate stored values.

Handle:

- corrupted storage
- old storage schema
- missing state
- stale state
- incompatible state

Prevent old cached state from breaking the new application.

============================================================
PHASE 21 — TEAM ARENA FLOW
============================================================

Verify the complete current Team Arena flow.

The intended current architecture is:

Previous screen
↓
Team Arena Waiting Room
↓
Players join
↓
Player states
↓
Game selection
↓
Start Game
↓
Game
↓
Game result / next state

Do NOT restore obsolete flows that are not present in the CURRENT
Figma Make source.

============================================================
PHASE 22 — WAITING ROOM QA
============================================================

Test:

1. One player enters.
2. Player waits.
3. Multiple players join.
4. Player list updates.
5. Host state.
6. Non-host state.
7. Minimum players.
8. Ready state if supported.
9. Start Game.
10. Player leaves.
11. Back.
12. Refresh.
13. Re-entry.
14. Mobile.
15. Desktop.

No dead ends.

============================================================
PHASE 23 — GAME SELECTION QA
============================================================

Use the CURRENT FIGMA MAKE rules.

If the current source supports:

one selected game

or

multiple selected games

or

maximum four games

verify those exact rules.

Do NOT invent new selection rules.

Verify all current game categories and games.

============================================================
PHASE 24 — RESPONSIVE QA
============================================================

Test:

360px
375px
390px
414px
768px
1024px
1280px
1440px+

Verify:

- header
- navigation
- game cards
- buttons
- Waiting Room
- player list
- game selection
- game screen
- modals
- dialogs

No overflow.

No clipping.

No inaccessible controls.

============================================================
PHASE 25 — DEPLOYMENT
============================================================

After the clean rebuild:

1. Commit current source.
2. Push to the verified production branch.
3. Trigger production build.
4. Verify build success.
5. Verify artifact.
6. Verify GitHub Pages deployment.
7. Open actual public URL.
8. Verify live application.

DO NOT stop at:

"GitHub Actions passed."

The live website itself must be checked.

============================================================
PHASE 26 — LIVE VERSION VERIFICATION
============================================================

Verify that the live website contains the CURRENT Figma Make version.

Check:

- latest UI
- latest routes
- latest Waiting Room
- latest game selection
- latest interactions
- latest assets
- latest functionality

Make sure no old GitHub implementation remains visible.

============================================================
PHASE 27 — STALE CACHE VERIFICATION
============================================================

Perform a realistic stale-cache test.

Test:

1. Open old version.
2. Deploy new version.
3. Refresh.
4. Hard refresh.
5. New browser session.
6. Incognito/private session if available.
7. Mobile browser if available.

Confirm the new version is served.

If old version remains:

investigate:

- service worker
- Cache Storage
- HTML caching
- CDN behavior
- old asset references
- old deployment artifact

Do NOT simply claim cache has been fixed.

============================================================
PHASE 28 — VERSION IDENTIFICATION
============================================================

If technically possible, expose a non-sensitive build identifier
for debugging.

Example:

BUILD_VERSION
COMMIT_SHA
BUILD_TIMESTAMP

This is for verification only.

Do not expose secrets.

============================================================
PHASE 29 — FAILURE HANDLING
============================================================

If any operation cannot actually be performed:

DO NOT FAKE SUCCESS.

Clearly state:

- what failed
- where it failed
- why it failed
- what is required to continue

Especially for:

- GitHub authentication
- repository permissions
- GitHub repository access
- Figma Make integration
- GitHub Actions
- GitHub Pages

Never claim that a push happened if it did not.

Never claim that deployment happened if it did not.

Never claim that the live URL was verified if it was not.

============================================================
PHASE 30 — DECISION LOGIC
============================================================

FOLLOW THIS EXACT DECISION TREE:

START
 ↓
CHECK FIGMA MAKE ↔ GITHUB CONNECTION
 ↓
Is connection broken?
 ├── YES
 │    ↓
 │  FIX CONNECTION
 │    ↓
 │  TEST REAL PUSH
 │    ↓
 │  SUCCESS?
 │    ├── NO → REPORT EXACT FAILURE
 │    └── YES → CONTINUE
 │
 └── NO
      ↓
VERIFY REPOSITORY + BRANCH + DEPLOYMENT
      ↓
TEST REAL PUSH
      ↓
DOES CURRENT FIGMA SOURCE REACH GITHUB CORRECTLY?
      ├── YES
      │    ↓
      │  Verify build + Pages + cache + live version
      │
      └── NO
           ↓
        CLEAN SOURCE RESET
           ↓
        REMOVE OBSOLETE APPLICATION DATA
           ↓
        REBUILD FROM CURRENT FIGMA MAKE
           ↓
        PUSH COMPLETE CURRENT SOURCE
           ↓
        CLEAN BUILD
           ↓
        DEPLOY
           ↓
        VERIFY LIVE VERSION

============================================================
PHASE 31 — IMPORTANT SAFETY RULE
============================================================

Do NOT delete the entire GitHub repository simply because the
application source is stale.

Only delete/recreate the entire repository if:

1. the repository itself is corrupted or unusable,
2. Figma Make cannot reliably connect to it,
3. permissions/ownership prevent proper deployment,
4. the repository architecture fundamentally prevents the required
   deployment,
5. and a clean repository is technically necessary.

If the repository itself is healthy:

KEEP THE REPOSITORY.

DELETE/REPLACE ITS OBSOLETE APPLICATION SOURCE.

============================================================
PHASE 32 — FINAL ACCEPTANCE CRITERIA
============================================================

The task is successful ONLY if all of these are true:

[ ] Figma Make ↔ GitHub connection verified
[ ] Correct GitHub repository verified
[ ] Correct branch verified
[ ] Correct permissions verified
[ ] Real push verified
[ ] Current Figma Make source transferred
[ ] Obsolete GitHub source removed where necessary
[ ] No duplicate application
[ ] No duplicate deployment workflow
[ ] Production build succeeds
[ ] GitHub Pages deployment succeeds
[ ] Routing works
[ ] Assets load
[ ] Cache strategy works
[ ] No obsolete service worker
[ ] Security reviewed
[ ] Performance reviewed
[ ] Error handling reviewed
[ ] Waiting Room works
[ ] Game selection works
[ ] Game flow works
[ ] Mobile works
[ ] Desktop works
[ ] Live URL verified
[ ] Live version matches CURRENT FIGMA MAKE

============================================================
FINAL REPORT
============================================================

At the end provide:

1. FIGMA MAKE ↔ GITHUB CONNECTION
   - Status
   - Problem found
   - Fix performed

2. GITHUB REPOSITORY
   - Repository
   - Branch
   - Status

3. SOURCE RESET
   - Was clean reset required?
   - What was removed?
   - What was rebuilt?

4. BUILD
   - Framework
   - Package manager
   - Build command
   - Output directory

5. DEPLOYMENT
   - GitHub Actions status
   - GitHub Pages status
   - Live URL

6. CACHE
   - Service worker
   - Cache strategy
   - Cache invalidation

7. SECURITY
   - Findings
   - Fixes

8. PERFORMANCE
   - Findings
   - Fixes

9. QA
   - Tested scenarios
   - Passed
   - Failed

10. REMAINING ISSUES
   - Only real unresolved issues

CRITICAL FINAL RULE:

DO NOT DECLARE SUCCESS UNTIL THE ACTUAL LIVE GITHUB PAGES
URL HAS BEEN VERIFIED AGAINST THE CURRENT FIGMA MAKE SOURCE.

The goal is not merely:

"Push succeeded."

The goal is:

CURRENT FIGMA MAKE
=
GITHUB SOURCE
=
PRODUCTION BUILD
=
GITHUB PAGES
=
LIVE GAME