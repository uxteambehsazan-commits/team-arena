CRITICAL PRODUCTION RESET — DELETE OLD GITHUB SOURCE AND REPUBLISH THE CURRENT FIGMA MAKE VERSION

IMPORTANT:
The CURRENT Figma Make source is the ONLY source of truth.

Do NOT use the old GitHub repository code as the source of truth.
Do NOT restore, merge, copy, or reconstruct the application from the old GitHub version.

The goal is to completely eliminate the stale GitHub deployment problem and make the GitHub repository + build + GitHub Pages live deployment represent EXACTLY the current Figma Make source.

==================================================
1. FIRST: VERIFY THE CURRENT FIGMA MAKE SOURCE
==================================================

Before making any destructive action:

- Inspect the CURRENT Figma Make project.
- Treat the current Figma Make code, components, routes, assets, configuration, interactions, data structures, and UI as the only authoritative source.
- Confirm that the latest changes currently visible in Figma Make are the version that must be deployed.
- Do not revert any current Figma changes.
- Do not use an older snapshot.
- Do not use GitHub as a source for missing code.

Create a clear internal deployment fingerprint for the CURRENT FIGMA MAKE VERSION:

CURRENT_FIGMA_SOURCE
CURRENT_VERSION
CURRENT_BUILD_SIGNATURE
CURRENT_ROUTES
CURRENT_MAJOR_FEATURES

The final GitHub deployment must match this fingerprint.

==================================================
2. INSPECT THE FIGMA MAKE ↔ GITHUB CONNECTION
==================================================

Before deleting anything, inspect the GitHub integration.

Verify:

- Which GitHub account/organization is connected
- Which repository is linked to THIS exact Figma Make file
- Repository name
- Repository owner
- Default branch
- GitHub permissions
- Figma GitHub integration status
- Whether this Make file is actually connected to the repository
- Whether another Figma Make file is connected to a different repository
- Whether GitHub Pages is using the correct repository
- Which branch GitHub Pages is deploying
- Whether GitHub Actions is building the correct repository and branch
- Whether multiple workflows are competing
- Whether an old deployment workflow is still active
- Whether the public GitHub Pages URL points to the expected repository

IMPORTANT:

Do NOT assume the visible GitHub repository is necessarily the repository connected to the current Figma Make file.

Do NOT delete anything until this relationship is verified.

==================================================
3. CREATE A RECOVERY REFERENCE BEFORE RESET
==================================================

Before destructive cleanup:

Record/reference:

- Repository name
- Repository owner
- Default branch
- GitHub Pages URL
- Pages configuration
- Existing workflow configuration
- Current deployment configuration
- Existing environment/build configuration
- Existing custom domain if any
- Current Figma Make → GitHub connection

The goal is NOT to preserve the old application source.

The goal is to preserve the repository/deployment identity and configuration where technically possible while completely replacing the obsolete application source.

==================================================
4. PERFORM A CLEAN GITHUB SOURCE RESET
==================================================

Because the GitHub deployment repeatedly shows an older version, perform a CLEAN SOURCE RESET.

Delete the OLD APPLICATION SOURCE from the GitHub repository.

Remove obsolete:

- source files
- old React components
- old routes
- old pages
- obsolete assets
- old build configuration
- obsolete generated files
- old deployment artifacts
- obsolete service workers
- stale cache-related files
- obsolete GitHub Actions workflows
- duplicate deployment workflows
- old configuration that can cause the previous version to be built

DO NOT delete the GitHub repository identity unless technically necessary.

Prefer:

KEEP:
- repository
- repository URL
- repository permissions
- GitHub Pages configuration where possible
- repository identity

RESET:
- application source
- obsolete workflows
- obsolete generated build artifacts
- obsolete deployment files

If the existing repository structure is corrupted or the Figma Make integration cannot reliably overwrite it, then perform a complete repository reset/recreation ONLY if technically necessary.

If full repository recreation is required:

1. Verify the current Figma Make → GitHub connection.
2. Ensure the newly created repository will belong to THIS exact Figma Make file.
3. Ensure the default branch is correct.
4. Ensure GitHub Pages can be configured against the new repository.
5. Do not accidentally connect another Figma Make project.
6. Do not use the old GitHub source.

==================================================
5. PUSH THE ENTIRE CURRENT FIGMA MAKE SOURCE
==================================================

After cleanup:

Push the COMPLETE CURRENT FIGMA MAKE SOURCE to GitHub.

This must be a full source replacement, not an incremental patch based on the old repository.

The GitHub repository must now contain:

CURRENT FIGMA MAKE SOURCE ONLY.

Do NOT:

- copy old GitHub components
- preserve obsolete routes
- merge old source
- restore deleted features from GitHub
- use old generated build files
- reuse stale deployment artifacts

The source of truth is:

CURRENT FIGMA MAKE → GITHUB

==================================================
6. VERIFY THE PUSH
==================================================

After pushing:

Verify that the GitHub repository actually contains the latest Figma Make version.

Check:

- latest source files
- latest components
- latest routes
- latest UI
- latest interactions
- latest game logic
- latest profile system
- latest Team Arena functionality
- latest Behsazan functionality
- latest Admin functionality
- latest loading/error handling
- latest version/release functionality

Compare the repository against the CURRENT FIGMA MAKE SOURCE.

Do not continue if GitHub still appears to contain the old version.

==================================================
7. CLEAN BUILD
==================================================

Perform a completely clean production build.

Before building:

- remove stale build output
- remove obsolete cache
- remove obsolete generated artifacts
- remove stale service-worker references if present
- clear previous deployment artifacts where appropriate
- ensure dependencies are installed from the CURRENT source
- ensure the lockfile/configuration matches the CURRENT source

Then run:

CLEAN INSTALL
+
CLEAN PRODUCTION BUILD

Do not reuse an old build directory.

Do not reuse an old generated bundle.

Do not deploy an old build artifact.

==================================================
8. GITHUB ACTIONS / DEPLOYMENT
==================================================

Ensure there is ONLY ONE production deployment workflow.

Remove or disable duplicate/obsolete workflows.

The workflow must:

1. checkout the current default branch
2. install current dependencies
3. build the current source
4. produce the current production build
5. deploy that build to GitHub Pages

The workflow must NOT:

- use an old branch
- use an old artifact
- use an old build directory
- use a stale cache
- deploy a previous workflow artifact

If caching is enabled:

- invalidate stale caches
- ensure cache keys are based on current dependency/source state
- never allow an old build artifact to be deployed as the current build

==================================================
9. GITHUB PAGES CONFIGURATION
==================================================

Verify GitHub Pages configuration.

Confirm:

- correct repository
- correct branch
- correct deployment source
- correct build output
- correct base path
- correct asset paths
- correct SPA routing
- correct refresh behavior
- correct direct-route behavior

The application must work when:

- opening /
- refreshing /
- navigating to internal routes
- refreshing an internal route
- opening a direct internal route
- using browser back
- using browser forward

No route should accidentally load an old application.

==================================================
10. CACHE / SERVICE WORKER RESET
==================================================

Investigate whether the old version is being served because of:

- browser cache
- GitHub Pages cache
- CDN cache
- service worker
- stale asset references
- stale hashed bundles
- old index.html
- old manifest
- old cached JavaScript
- old deployment artifact

If a service worker exists:

- inspect it carefully
- update its version
- invalidate old caches
- prevent old application bundles from being served
- ensure a new deployment activates correctly

Do NOT simply tell the user to hard-refresh.

The deployment itself must be correct.

==================================================
11. ADD A DEPLOYMENT VERSION FINGERPRINT
==================================================

Add a small internal deployment identity mechanism.

For example:

APP_VERSION
BUILD_ID
BUILD_TIMESTAMP
SOURCE_VERSION

Use the current Figma Make version/build information.

The application should expose this information somewhere appropriate for Admin or diagnostic purposes.

Example:

Version: 2.x.x
Build: FIGMA-CURRENT
Build ID: unique-current-build
Deployment: GitHub Pages

This is primarily for debugging and must not clutter the normal user interface.

==================================================
12. CRITICAL LIVE DEPLOYMENT VERIFICATION
==================================================

Do NOT consider the deployment successful merely because:

- GitHub Actions says SUCCESS
- GitHub says deployment completed
- files exist in the repository
- the build completed

Open the ACTUAL PUBLIC GITHUB PAGES URL.

Verify the live website.

The following chain MUST match:

CURRENT FIGMA MAKE
        ↓
GITHUB SOURCE
        ↓
PRODUCTION BUILD
        ↓
GITHUB ACTIONS
        ↓
GITHUB PAGES
        ↓
LIVE PUBLIC URL

All six must represent the same version.

==================================================
13. COMPARE LIVE VERSION WITH FIGMA
==================================================

Perform visual and functional comparison between:

A) CURRENT FIGMA MAKE PREVIEW
B) LIVE GITHUB PAGES

Check at minimum:

- Home
- Profile
- Start Game
- Online Game
- Single Player
- Join Game
- Team Arena
- Waiting Room
- Behsazan games
- Hide/Seek game
- Admin
- Game selection
- Game status
- Version/Release UI
- Loading states
- Skeleton states
- Error states
- Mobile layouts
- Desktop layouts
- Navigation
- Back button
- Refresh
- Direct routes

The LIVE GITHUB VERSION must be the current Figma version.

==================================================
14. IMPORTANT: IF LIVE VERSION IS STILL OLD
==================================================

If the public GitHub Pages URL still shows the old version:

DO NOT simply repeat Push.

STOP and diagnose.

Determine exactly where the old version is coming from:

A. Figma Make source
B. GitHub repository
C. wrong branch
D. wrong repository
E. GitHub Actions
F. build output
G. GitHub Pages configuration
H. service worker
I. browser/CDN cache
J. wrong public URL

Then fix the exact root cause.

If necessary:

1. perform another clean source reset
2. recreate the production build
3. redeploy
4. verify the public URL again

Do not claim success until the actual live URL shows the CURRENT Figma version.

==================================================
15. DO NOT CHANGE THE PRODUCT DESIGN
==================================================

This operation is a DEPLOYMENT RESET.

Do NOT redesign the application.

Do NOT change:

- UI
- UX
- game mechanics
- layouts
- colors
- typography
- interactions
- content
- navigation
- profile system
- Team Arena
- Behsazan games
- Admin

unless required to fix the deployment itself.

Preserve the CURRENT Figma Make application exactly.

==================================================
16. SECURITY
==================================================

Before final deployment:

Check that:

- no secrets are included in frontend source
- no private API keys are exposed
- no passwords are embedded
- no admin credentials are hardcoded
- no sensitive environment variables are exposed
- no unnecessary external scripts are loaded
- user-local data is handled safely
- client-side profile data is not presented as secure authentication

Remember that GitHub Pages is a public frontend deployment.

==================================================
17. PERFORMANCE
==================================================

Before release verify:

- production build
- no development server code
- no unnecessary duplicate dependencies
- no obsolete assets
- no duplicate bundles
- lazy loading where appropriate
- efficient image loading
- no unnecessary blocking resources
- no infinite render loops
- no excessive animations
- no memory leaks
- acceptable mobile performance

Do not sacrifice functionality just to reduce bundle size.

==================================================
18. ERROR HANDLING
==================================================

Verify:

LOADING
SKELETON
SUCCESS
EMPTY
ERROR
RETRY

states wherever appropriate.

Handle:

- failed data loading
- failed navigation
- corrupted local storage
- missing profile data
- missing game configuration
- invalid route
- deployment asset failure
- network interruption
- reconnect
- unexpected runtime errors

No screen should become permanently blank.

==================================================
19. FINAL GAME REGRESSION TEST
==================================================

After deployment, test the complete application.

At minimum:

1. New user
2. Existing user
3. Profile with avatar/name
4. Profile without avatar/name
5. Start Online Game
6. Start Single Player
7. Join Game
8. Host
9. Non-host
10. Multiple players
11. Player leaves
12. Back
13. Refresh
14. Waiting Room
15. Game selection
16. Behsazan game
17. Hider role
18. Seeker role
19. Clue creation
20. Clue transformation
21. Guess
22. Wrong guess
23. Final guess
24. Reveal
25. Score
26. Admin
27. Game status
28. Version release
29. Loading
30. Error recovery

Test both:

MOBILE
DESKTOP

==================================================
20. FINAL ACCEPTANCE CONDITION
==================================================

The task is NOT complete until ALL of these are true:

[ ] Current Figma Make source verified
[ ] Correct GitHub connection verified
[ ] Correct repository verified
[ ] Correct default branch verified
[ ] Old GitHub application source removed
[ ] Current Figma source pushed completely
[ ] Old workflows removed
[ ] Clean production build completed
[ ] GitHub Actions builds current source
[ ] GitHub Pages points to correct deployment
[ ] SPA routing works
[ ] stale cache/service worker issue resolved
[ ] live URL verified
[ ] live version matches current Figma
[ ] no old UI remains
[ ] no old routes remain
[ ] no old assets remain
[ ] no console/runtime errors
[ ] mobile tested
[ ] desktop tested
[ ] performance checked
[ ] security checked
[ ] complete game flow tested
[ ] Admin tested
[ ] release/version system tested

==================================================
21. FINAL REPORT
==================================================

At the end provide a concise deployment report containing:

- Current Figma source: VERIFIED
- GitHub connection: VERIFIED / FIXED
- Repository: ...
- Default branch: ...
- Old source reset: YES / NO
- New source pushed: YES / NO
- Clean build: PASS / FAIL
- GitHub Actions: PASS / FAIL
- GitHub Pages: PASS / FAIL
- Live URL: ...
- Live version: ...
- Figma version: ...
- Deployment fingerprint: ...
- Cache/service worker: ...
- Routing: PASS / FAIL
- Mobile QA: PASS / FAIL
- Desktop QA: PASS / FAIL
- Game regression: PASS / FAIL
- Security: PASS / FAIL
- Performance: PASS / FAIL

MOST IMPORTANT:

NEVER report SUCCESS based only on GitHub Actions.

SUCCESS means the ACTUAL PUBLIC GITHUB PAGES URL has been opened and verified to contain the CURRENT Figma Make version.

If the live URL still contains the old version, the task is NOT complete.