CRITICAL — FULL CLEAN REBUILD AND DEPLOYMENT FROM FIGMA MAKE

This is no longer a normal synchronization task.

Multiple previous attempts were made to publish the latest Figma Make implementation to GitHub, but the GitHub Pages deployment is still showing an older version.

Therefore, DO NOT attempt another incremental sync.

We need a CLEAN REBUILD of the GitHub implementation from the CURRENT FIGMA MAKE SOURCE.

==================================================
SOURCE OF TRUTH
==================================================

THE CURRENT FIGMA MAKE PROJECT IS THE ONLY SOURCE OF TRUTH.

Do NOT use the current GitHub implementation as a source of UI, routes, components, game logic, or user flows.

The existing GitHub implementation is considered OUTDATED and must be replaced.

GitHub is only the DEPLOYMENT TARGET.

Architecture:

CURRENT FIGMA MAKE
        ↓
NEW IMPLEMENTATION
        ↓
REPLACE OLD GITHUB SOURCE
        ↓
BUILD
        ↓
DEPLOY
        ↓
GITHUB PAGES
        ↓
VERIFY LIVE VERSION

==================================================
1. DO NOT PATCH THE EXISTING GITHUB CODE
==================================================

DO NOT try to fix the existing GitHub implementation by adding small patches.

DO NOT merge the old GitHub implementation with the new Figma implementation.

DO NOT preserve obsolete routes simply because they already exist in GitHub.

DO NOT copy old GitHub components into the new implementation.

The existing GitHub application should be treated as an obsolete deployment.

==================================================
2. CLEAN REBUILD
==================================================

Create a fresh implementation based on the CURRENT Figma Make source.

The new implementation must include the current:

- screens
- routes
- navigation
- components
- interactions
- game states
- player states
- responsive behavior
- mobile behavior
- desktop behavior
- assets
- data structures
- application state
- Team Arena flow

The current Figma Make implementation must be reproduced as the deployed application.

==================================================
3. REPLACE THE OLD GITHUB SOURCE
==================================================

Before deploying:

Identify the repository, branch, build directory, and deployment configuration currently responsible for:

https://uxteambehsazan-commits.github.io/team-arena/

Then replace the outdated application source with the NEW implementation generated from the CURRENT Figma Make source.

IMPORTANT:

Do not simply add the new files on top of the old project.

Remove obsolete application source files, routes, components, assets and generated build output that belong to the old implementation.

The resulting repository must contain ONE application implementation:

THE CURRENT FIGMA MAKE VERSION.

==================================================
4. DO NOT DELETE THE REPOSITORY UNNECESSARILY
==================================================

Do NOT delete the GitHub repository itself unless absolutely required.

Preserve:

- repository
- GitHub Pages configuration
- deployment configuration
- required permissions
- repository identity

Replace the APPLICATION SOURCE and DEPLOYMENT ARTIFACTS.

If the existing deployment configuration is incompatible with the new implementation, update it accordingly.

==================================================
5. REMOVE OLD BUILD ARTIFACTS
==================================================

Make sure the deployment does not continue serving an old build.

Remove/replace stale:

- dist
- build
- public generated assets
- compiled JavaScript
- compiled CSS
- cached deployment artifacts
- obsolete static HTML
- obsolete routes
- obsolete service workers

Do not allow an old service worker or cached asset to continue serving the previous application.

If a service worker exists, ensure it is compatible with the new version or remove it if it belongs to the obsolete implementation.

==================================================
6. VERIFY THE ACTUAL DEPLOYMENT TARGET
==================================================

Before publishing, determine exactly:

- which repository is being used
- which branch is deployed
- which folder is deployed
- which GitHub Pages configuration is active
- which build command generates the deployment
- which workflow/action publishes the application
- whether the public URL is actually connected to this repository

Do NOT assume these values.

If the GitHub Pages URL is connected to a different branch/repository/build than expected, correct the deployment configuration.

==================================================
7. IMPORTANT — CACHE / OLD VERSION PROTECTION
==================================================

The current problem may be caused by an old deployment or cached build.

Therefore verify:

- GitHub Pages deployment status
- latest commit deployed
- build timestamp/version
- generated assets
- service worker
- browser cache behavior
- route fallback behavior

The deployed application must clearly correspond to the new Figma implementation.

If necessary, introduce a build/version identifier internally so that the deployed version can be verified.

==================================================
8. REQUIRED TEAM ARENA FLOW
==================================================

The newly deployed version must contain the CURRENT Figma Make user journey.

In particular:

The current Figma `behsazanihub` screen must be replaced in the relevant journey by the Team Arena Waiting Room.

Desired flow:

PREVIOUS FIGMA SCREEN
        ↓
TEAM ARENA WAITING ROOM
        ↓
PLAYER WAITING / READY STATES
        ↓
START GAME
        ↓
EXISTING TEAM ARENA GAME FLOW

The obsolete GitHub flow must NOT be restored.

==================================================
9. WAITING ROOM
==================================================

The Waiting Room must be implemented as a real interactive screen.

It must support:

- room/game code
- online state
- player list
- player count
- host state
- player readiness
- waiting state
- invite/share
- exit
- Start Game
- disabled Start Game
- active Start Game
- responsive layout

Use the current Figma implementation for the actual product logic.

The GitHub Waiting Room reference may be used only where explicitly requested for the Waiting Room visual/interaction reference.

==================================================
10. DO NOT IMPORT OBSOLETE GITHUB LOGIC
==================================================

The old GitHub version must NOT determine:

- routes
- navigation
- game selection
- screen sequence
- player logic
- UI architecture
- obsolete BehsazaniHub flow

The new deployed application must originate from the current Figma Make implementation.

==================================================
11. COMPLETE USER-FLOW QA
==================================================

After rebuilding and deploying, test the application end-to-end.

Do NOT stop after confirming that the homepage loads.

Test:

A. First entry
B. Game selection
C. Team Arena entry
D. Waiting Room
E. Single player
F. Multiple players
G. Minimum players reached
H. Host
I. Non-host
J. Player joins
K. Player leaves
L. Ready state
M. Start Game
N. Existing Team Arena game
O. Back
P. Exit
Q. Re-entry
R. Mobile
S. Desktop

==================================================
12. ROUTE AUDIT
==================================================

After deployment, verify every route.

There must be no obsolete route such as:

behsazanihub
→ old Mafia flow

where the new Figma flow requires:

Waiting Room
→ Team Arena

Check for:

- obsolete routes
- duplicate routes
- dead routes
- broken redirects
- incorrect navigation
- missing screens
- dead buttons
- incorrect Back behavior

==================================================
13. DATA / STATE AUDIT
==================================================

Verify that the new implementation correctly handles:

- current user
- player identity
- room/session
- player count
- host
- readiness
- game state
- selected game
- navigation state

Do not replace real application state with static mock data unless the current Figma implementation itself uses mock data.

==================================================
14. VISUAL AUDIT
==================================================

Compare the deployed application against the CURRENT Figma Make source.

Verify:

- typography
- spacing
- colors
- components
- icons
- cards
- avatars
- backgrounds
- responsive behavior
- mobile hierarchy
- game screens
- Waiting Room

The GitHub deployment should visually and behaviorally represent the current Figma source.

==================================================
15. FINAL LIVE VERIFICATION
==================================================

After deployment, open the actual public URL:

https://uxteambehsazan-commits.github.io/team-arena/

Do NOT consider the task complete based only on:

"deployment succeeded"

or:

"GitHub Actions succeeded"

The actual LIVE PAGE must be inspected.

Verify that the browser is displaying the NEW implementation rather than the previous cached/deployed version.

==================================================
16. IF THE LIVE PAGE IS STILL OLD
==================================================

If the public URL still shows the old application after deployment:

DO NOT make random UI changes.

Diagnose the deployment chain:

FIGMA SOURCE
↓
GENERATED SOURCE
↓
REPOSITORY
↓
BRANCH
↓
BUILD
↓
DEPLOYMENT ACTION
↓
GITHUB PAGES
↓
PUBLIC URL

Identify exactly where the old version is being introduced.

Then fix that specific deployment problem.

==================================================
17. SUCCESS CRITERIA
==================================================

The task is COMPLETE only when ALL are true:

✓ Current Figma Make is the source of truth.

✓ Old GitHub application source has been replaced.

✓ Old build artifacts are removed/replaced.

✓ Correct repository is being deployed.

✓ Correct branch is being deployed.

✓ Correct build is being deployed.

✓ GitHub Pages is serving the new build.

✓ The live URL shows the current implementation.

✓ The new Waiting Room exists.

✓ The obsolete BehsazaniHub route is removed from the relevant journey.

✓ The Team Arena flow works.

✓ Multiple user scenarios work.

✓ Host/non-host states work.

✓ Player join/leave states work.

✓ Start Game works.

✓ Back works.

✓ Exit works.

✓ Mobile works.

✓ Desktop works.

✓ No dead-end routes exist.

✓ No duplicate old/new flows exist.

✓ No stale service worker/cache continues to serve the old application.

==================================================
18. FINAL REPORT
==================================================

At the end, provide a concise deployment report:

1. Repository used
2. Branch used
3. Build/deployment method
4. Old source removed/replaced
5. New Figma source deployed
6. Waiting Room implemented
7. Routes changed
8. User scenarios tested
9. Live URL verified
10. Any remaining issue

IMPORTANT:

Do NOT say "completed" merely because files were generated.

The final success condition is:

CURRENT FIGMA MAKE
        =
LIVE GITHUB PAGES APPLICATION

The public URL must actually represent the current Figma Make source.