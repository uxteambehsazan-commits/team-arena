==================================================
31. ADD A COMPLETE GAMIFICATION SYSTEM
==================================================

Add a complete, meaningful, scalable and visually engaging gamification system to Team Arena.

IMPORTANT:

Do NOT turn the product into a childish reward system.

The gamification should feel:

- competitive
- social
- motivating
- useful
- understandable
- rewarding
- professional
- suitable for organizational/team games

The purpose is to increase:

- engagement
- repeat play
- participation
- competition
- discovery of different games
- teamwork
- progression
- long-term retention

Gamification must be connected to real gameplay data.

Do NOT create meaningless points just for clicking buttons.

==================================================
32. CORE GAMIFICATION LOOP
==================================================

Build this core loop:

PLAY
↓
EARN XP / SCORE
↓
PROGRESS
↓
LEVEL UP
↓
UNLOCK REWARD
↓
COMPLETE MISSIONS
↓
BUILD STREAK
↓
IMPROVE RANK
↓
COMPETE WITH OTHERS
↓
RETURN TO PLAY

The user should always understand:

1. Where am I?
2. What have I achieved?
3. What can I unlock?
4. What should I do next?
5. How close am I to the next reward?

==================================================
33. TWO DIFFERENT TYPES OF POINTS
==================================================

IMPORTANT:

Separate progression XP from competitive score.

XP:
Used for player progression and levels.

Competitive Score:
Used for ranking/leaderboard where appropriate.

Do NOT use one number for everything.

Example:

Level 18
1,840 XP

Competitive Score
2,840

This prevents the system from becoming confusing.

==================================================
34. XP SYSTEM
==================================================

Award XP based on meaningful gameplay actions.

Possible XP sources:

- completing a game
- winning
- participating actively
- helping the team
- completing a daily mission
- completing a weekly mission
- achieving an achievement
- maintaining a streak
- trying different games

Example:

Game completed:
+50 XP

Win:
+100 XP

Daily Mission:
+150 XP

Achievement:
+300 XP

IMPORTANT:

Use configurable values.

Do not hardcode reward numbers throughout the application.

Create a centralized progression configuration.

==================================================
35. ANTI-FARMING RULES
==================================================

Prevent users from exploiting the gamification system.

Do NOT reward unlimited XP for:

- repeatedly starting and leaving games
- refreshing
- repeatedly clicking
- fake interactions
- intentionally losing
- repeatedly playing the same trivial action
- opening the same page

XP should primarily come from valid completed gameplay.

If the existing backend supports game results, use those results as the source of truth.

==================================================
36. LEVEL SYSTEM
==================================================

Create a progression system:

Level 1
Level 2
Level 3
...
Level 50+

Each level requires XP.

Show:

Current Level
Current XP
XP required for next level
Progress percentage

Example:

LEVEL 18

1,840 / 2,000 XP

████████████████░░ 92%

160 XP تا Level 19

When leveling up:

- animate XP bar
- show Level Up modal
- celebrate the avatar
- show unlocked reward if applicable

==================================================
37. REWARD SYSTEM
==================================================

Each meaningful milestone can unlock something.

Possible rewards:

- Avatar Frame
- Badge
- Aura
- Player Title
- Avatar Effect
- Special Profile Decoration
- Achievement
- Access to special customization
- Special game cosmetic

Avoid rewards that affect gameplay balance.

Rewards should primarily be cosmetic/status-based.

Example:

Level 10
→ Silver Frame

Level 20
→ Champion Frame

10 Wins
→ Winner Badge

10 Win Streak
→ Fire Aura

100 Matches
→ Veteran Badge

Champion Rank
→ Champion Crown

==================================================
38. DAILY MISSIONS
==================================================

Add Daily Missions.

Keep them simple and achievable.

Examples:

🎯 Complete 2 games

🏆 Win 1 game

🎮 Play 2 different games

🤝 Complete a team game

🔥 Win 2 games consecutively

Each mission should show:

- title
- description
- progress
- reward
- completion state

Example:

ماموریت امروز

🎮 دو بازی انجام بده

███████░░░ 1 / 2

+100 XP

When completed:

✓ Completed

+100 XP

Do not create dozens of missions.

Prefer 3–5 meaningful daily missions.

==================================================
39. WEEKLY MISSIONS
==================================================

Add weekly missions with slightly larger rewards.

Examples:

Play 8 games
Win 5 games
Play 4 different games
Complete 3 team games
Reach a 3-game streak

Weekly missions should encourage behaviors that improve product engagement.

Example:

ماموریت هفتگی

🎮 کاوشگر بازی‌ها

3 / 4 بازی متفاوت

+500 XP

==================================================
40. STREAK SYSTEM
==================================================

Create a meaningful streak system.

Examples:

🔥 2 wins
🔥 3 wins
🔥 5 wins
🔥 10 wins

Show:

Current Streak
Best Streak

Example:

🔥 7 برد متوالی

Best:
10

Streak should be based on actual game results.

Do not allow refresh/re-entry to artificially increase streak.

==================================================
41. ACHIEVEMENTS
==================================================

Create a structured achievement system.

Categories:

FIRST STEPS
- First Game
- First Win

COMPETITIVE
- 10 Wins
- 50 Wins
- 100 Wins

STREAK
- 3 Win Streak
- 5 Win Streak
- 10 Win Streak

EXPLORER
- Play 3 Different Games
- Play All Available Games

VETERAN
- 50 Matches
- 100 Matches

CHAMPION
- Reach Gold
- Reach Platinum
- Reach Champion

SOCIAL / TEAM
- Complete 10 Team Games
- Win as a Team
- Help Team Win

Each achievement should have:

Icon
Name
Description
Progress
Reward
Locked/Unlocked state

==================================================
42. GAME EXPLORATION REWARDS
==================================================

Encourage players to discover different games.

For example:

Play 3 different games
→ Explorer Badge

Play 5 different games
→ Explorer Frame

Try every available game
→ Arena Master Achievement

This prevents players from repeatedly playing only one game.

==================================================
43. TEAMWORK REWARDS
==================================================

Because Team Arena is a team-oriented product, gamification should reward teamwork.

Do NOT only reward individual winning.

Create team-oriented achievements such as:

🤝 Team Player
Complete 5 team games

🛡️ Reliable Teammate
Complete 10 team games without leaving

🏆 Team Champion
Win 10 team games

IMPORTANT:

Only award these based on real game state.

==================================================
44. PLAYER TITLES
==================================================

Create unlockable Player Titles.

Examples:

Newcomer
Explorer
Strategist
Veteran
Champion
Team Player
Game Master

Users can select one unlocked title.

Display it near the avatar.

Example:

👑 Reza
Strategist
Level 18 · Gold

Titles should be cosmetic/status-based.

==================================================
45. RANK SYSTEM
==================================================

Create a competitive rank progression.

Example:

Bronze
Silver
Gold
Platinum
Diamond
Champion

Rank should be based on actual competitive score/ranking logic.

Do NOT make rank simply equal to Level.

A high Level user should not automatically be Champion.

Level = experience/progression.

Rank = competitive performance.

==================================================
46. LEADERBOARD
==================================================

Create a leaderboard experience.

Support:

Global
Friends/Team
My Position

Display:

Rank
Avatar
Name
Title
Level
Score
Badge

Example:

🥇 Player A
🥈 Player B
🥉 Player C

...

#37
You

IMPORTANT:

Never fabricate leaderboard users or rankings.

If real backend data is unavailable:

Show a clear prototype state rather than fake global ranking.

==================================================
47. "NEXT BEST ACTION"
==================================================

The gamification system should always recommend one useful next action.

Example:

"120 XP تا Level بعدی"

[یک بازی انجام بده]

or:

"فقط یک برد دیگر تا باز شدن Champion Badge"

[ادامه بازی]

or:

"ماموریت امروز: یک بازی متفاوت انجام بده"

[انتخاب بازی]

This creates a clear motivation loop.

Do NOT show too many competing calls-to-action.

Prioritize ONE recommended action.

==================================================
48. GAMIFICATION HOME / PLAYER HUB
==================================================

Create a compact Player Progress section.

Suggested structure:

--------------------------------

👑 شخصیت من

Level 18
████████████░░

1,840 / 2,000 XP

🏆 Gold
2,840 Score

🔥 7 Win Streak

--------------------------------

🎯 ماموریت‌های امروز

✓ یک بازی انجام بده
2 / 2

○ یک بازی متفاوت امتحان کن
0 / 1

+150 XP

--------------------------------

🏅 آخرین دستاورد

🔥 5 برد متوالی

Unlocked

--------------------------------

🎁 بعدی

Champion Frame

160 XP باقی مانده

--------------------------------

The user should immediately understand their progress.

==================================================
49. POST-GAME GAMIFICATION
==================================================

After every completed game, show a concise reward summary.

Example:

🎉 پیروزی!

+100 XP
+250 Score

🔥 Streak: 7

Progress:

Level 18
██████████████░░
+100 XP

Achievements:
✓ Winning Streak

Next Reward:
Champion Frame

Do NOT create an excessively long result screen.

The actual game result must remain the primary focus.

==================================================
50. REWARD ANIMATION
==================================================

Create polished reward animations.

When XP is earned:

+100 XP
↓
moves toward XP bar

When achievement unlocks:

Achievement card appears
↓
small celebration
↓
reward revealed

When level increases:

Avatar celebration
↓
Level Up
↓
new reward

Animations should be short and performant.

Respect prefers-reduced-motion.

==================================================
51. GAMIFICATION NOTIFICATIONS
==================================================

Create subtle notifications for meaningful events:

+100 XP
Achievement Unlocked
Level Up
New Rank
New Reward
Mission Completed
Streak Increased

Do NOT notify the user for every minor action.

Notifications should be grouped where possible.

==================================================
52. PERSONALIZED REWARDS
==================================================

Use the player's actual behavior to determine useful suggestions.

Examples:

If user rarely tries different games:
→ recommend Game Explorer mission

If user has a high streak:
→ show streak-focused achievement

If user is close to next level:
→ show XP progress

If user is close to unlocking a reward:
→ highlight that reward

Do not create manipulative or excessive notifications.

==================================================
53. FAIRNESS AND BALANCE
==================================================

Gamification must not make the game unfair.

Rewards should primarily be:

- cosmetic
- progression
- recognition
- profile customization

Do NOT provide gameplay advantages that make competitive games unfair.

Do NOT make users feel punished for not playing every day.

Daily missions should be optional.

Missing a day should not permanently damage progression.

==================================================
54. GAMIFICATION DATA MODEL
==================================================

Create or adapt the existing data architecture.

Suggested structure:

playerProgress {
  playerId
  level
  xp
  totalScore
  matches
  wins
  losses
  currentStreak
  bestStreak
  rank
  achievements
  completedMissions
  unlockedRewards
  selectedTitle
  selectedFrame
  selectedBadge
  selectedAura
}

mission {
  id
  type
  title
  description
  target
  progress
  rewardXP
  expiresAt
  status
}

achievement {
  id
  category
  title
  description
  requirement
  progress
  reward
  unlocked
}

reward {
  id
  type
  title
  asset
  unlockCondition
}

Keep the data model compatible with the existing application.

Do NOT create duplicate user/profile systems.

==================================================
55. ADMIN GAMIFICATION MANAGEMENT
==================================================

Integrate gamification into the existing Admin environment.

Add:

Gamification Management

├── Levels
├── XP Rules
├── Missions
├── Achievements
├── Rewards
├── Ranks
├── Leaderboard
└── Player Progress

Admin should be able to configure:

XP reward values
Mission requirements
Achievement requirements
Reward unlock conditions
Rank thresholds
Active/inactive missions

Do NOT require code changes for simple reward configuration where possible.

==================================================
56. ADMIN SAFETY
==================================================

Sensitive gamification configuration must not be editable by unauthorized users.

Validate:

- XP values
- rank thresholds
- reward conditions
- mission targets

Avoid invalid configurations such as:

negative XP
impossible requirements
duplicate IDs
broken rewards

==================================================
57. GAMIFICATION ANALYTICS-READY ARCHITECTURE
==================================================

Prepare the architecture to measure:

- games completed
- missions completed
- achievements unlocked
- level progression
- reward unlocks
- streaks
- game diversity
- player retention
- leaderboard participation

Do not add unnecessary external analytics services.

Keep the architecture ready for future analytics.

==================================================
58. IMPORTANT UX RULE
==================================================

Never overwhelm the player with gamification.

At any given moment, prioritize:

1. Current Progress
2. Next Reward
3. One Recommended Action

Everything else should remain secondary.

The gamification layer should support the game,
not compete with the game.

==================================================
59. FINAL GAMIFICATION EXPERIENCE
==================================================

The final player experience should feel like:

PLAY
→ EARN
→ PROGRESS
→ UNLOCK
→ COMPETE
→ ACHIEVE
→ CUSTOMIZE
→ RETURN

The player should feel that every meaningful game contributes to a visible long-term journey.

==================================================
60. FINAL QA FOR GAMIFICATION
==================================================

Test all of the following:

- XP awarded correctly
- XP not awarded for invalid actions
- Level calculation
- Level Up animation
- Reward unlock
- Achievement progress
- Achievement completion
- Daily mission progress
- Weekly mission progress
- Mission expiration
- Streak calculation
- Best streak
- Rank calculation
- Leaderboard
- Player position
- Avatar customization
- Locked rewards
- Unlocked rewards
- Post-game rewards
- Waiting room player card
- Game result
- Mobile layout
- Desktop layout
- Loading state
- Error state
- Refresh
- Re-entry
- Backend synchronization if available
- Admin configuration
- No duplicate data
- No fake statistics
- No fake leaderboard data
- No console errors
- No broken existing game flows

Most importantly:

Gamification must be based on actual gameplay events and real player data wherever the current architecture supports it.

Do not simulate successful progression merely to make the UI look complete.