حتماً. این نسخه را می‌توانی **مستقیماً به Figma Make بدهی** تا کل پلتفرم را با رویکرد جدید بازطراحی و اصلاح کند. سعی کردم همه چیزهایی که تا الان گفتیم—بازی‌ها، موتور بازی، فرهنگ سازمانی، تعامل اجتماعی، محبوبیت، انیمیشن، هویت بهسازان ملت و محدودیت‌های فعلی پروژه—در یک پرامپت واحد باشد.

# MASTER PROMPT — میدان هم‌تیمی‌ها

### Social Gaming Platform for Behsazan Mellat Colleagues

```text
You are a senior Product Designer, UX Designer, UI Designer, Game Designer, Interaction Designer, Frontend Engineer and QA Engineer.

Your task is to completely redesign, rebuild, test and refine the existing internal multiplayer gaming platform for Behsazan Mellat colleagues.

IMPORTANT:
Do not treat this as a simple visual redesign.

You must redesign the EXPERIENCE, GAME SYSTEM, GAME LOGIC, GAME RULES, SCORING, MULTIPLAYER FLOW, SOCIAL FEATURES, ANIMATIONS, STATES, RESULTS and EDGE-CASE HANDLING.

The final product must feel like a real, polished, premium social gaming platform intentionally designed for Behsazan Mellat colleagues.

The product name is:

«میدان هم‌تیمی‌ها»

Tagline:

«چند دقیقه دورهمی، کلی رقابت»

The experience should feel friendly, energetic, social, premium, playful and competitive — but never childish, aggressive, casino-like or overly corporate.

--------------------------------------------------
1. CORE PRODUCT IDEA
--------------------------------------------------

«میدان هم‌تیمی‌ها» is an internal multiplayer gaming platform designed to create short, enjoyable and social moments between Behsazan Mellat colleagues.

The goal is not simply to create games.

The goal is to create opportunities for:

- Connection
- Collaboration
- Communication
- Friendly competition
- Creativity
- Participation
- Positive energy
- Belonging
- Getting to know colleagues
- Creating shared experiences

The product must feel like:

"A fun game platform created for our colleagues."

NOT:

"A corporate HR gamification system."

The user should feel:

«بیا یه دور بازی کنیم!»

NOT:

«من باید در یک سازمانی برنامه فرهنگی شرکت کنم.»

FUN MUST ALWAYS COME FIRST.

--------------------------------------------------
2. BRAND AND IDENTITY
--------------------------------------------------

Replace all occurrences of the old product name:

«ماموریت 256»

with:

«میدان هم‌تیمی‌ها»

Optional English secondary name:

TEAMMATES ARENA

Primary language must be Persian.

The interface must be fully RTL.

Use friendly terminology such as:

- هم‌تیمی
- دورهمی
- بازی
- راند
- رقابت
- دعوت هم‌تیمی‌ها
- ساخت دورهمی
- آماده شدن
- شروع رقابت
- بزن بریم
- وقت جبرانه
- راند بعدی
- قهرمان دورهمی

Avoid aggressive terminology such as:

- نابودی
- حذف دشمن
- شکست دادن حریف
- بازنده
- ضعیف‌ترین بازیکن

Prefer:

- ازش جلو بزن
- جایگاهت رو حفظ کن
- وقت جبرانه
- رقابت ادامه داره
- راند بعدی هنوز مونده
- یک قدم تا صدر جدول

--------------------------------------------------
3. IMPORTANT EXISTING ASSETS — DO NOT CHANGE
--------------------------------------------------

Preserve the existing:

- «تهیه‌کنندگان بازی» page
- Producer information
- Producer images
- Existing avatar images
- Existing character artwork
- Main page structure
- Main page composition
- Existing main page image
- Core visual identity

DO NOT replace or redesign these assets.

You may improve the experience around them, but do not remove, redraw, replace or distort them.

--------------------------------------------------
4. MAIN PAGE
--------------------------------------------------

Keep the existing main page structure and artwork.

Enhance it with a premium animated background.

The background should include subtle:

- Floating game tokens
- Abstract game-board geometry
- Light trails
- Particles
- Connection nodes
- Soft glowing shapes
- Abstract player/avatar silhouettes
- Subtle movement
- Depth and parallax
- Premium lighting

Animation must be:

- Smooth
- Elegant
- Lightweight
- Modern
- Premium
- Non-distracting

Never make it look like:

- Casino
- Arcade
- Children's game
- Cheap gaming website
- Overly futuristic sci-fi interface

Respect prefers-reduced-motion accessibility.

--------------------------------------------------
5. PLATFORM STRUCTURE
--------------------------------------------------

Create a complete experience:

HOME
→ CREATE DORAHAMI
→ SELECT GAMES
→ CONFIGURE GAMES
→ INVITE COLLEAGUES
→ LOBBY
→ PLAYERS READY
→ GAME INTRO
→ COUNTDOWN
→ GAME
→ ROUND RESULT
→ LEADERBOARD
→ NEXT ROUND
→ NEXT GAME
→ FINAL RESULT
→ WINNER CEREMONY
→ REMATCH / NEW DORAHAMI

--------------------------------------------------
6. CREATE DORAHAMI
--------------------------------------------------

The room creator must be able to create a multiplayer session.

Use friendly terminology.

Primary CTA:

«ساخت یک دورهمی»

Creator can configure:

- Room name
- Number of players
- Selected games
- Game order
- Number of rounds
- Difficulty where applicable
- Time limit
- Scoring mode
- Team mode where applicable

Provide presets:

«سریع و خودمونی»
«رقابت دوستانه»
«چالش نهایی»

Keep configuration simple.

Do not overwhelm users with technical settings.

--------------------------------------------------
7. GAME SELECTION
--------------------------------------------------

The room creator must be able to choose exactly which games are active.

Each game must have:

- Game title
- Short description
- Number of players
- Estimated duration
- Difficulty
- Game type
- Preview
- Enable/disable control

Creator can:

- Enable game
- Disable game
- Reorder games
- Configure settings
- Preview game

Example:

✓ حدس بزن
✓ اسم‌فامیل سرعتی
✓ قایم‌باشک
✓ کلمه ممنوعه
✓ دوز — نبرد قلمرو
✓ یک کلمه، چند سرنخ
✓ چشمک
✓ جاسوس
✓ بازی سرعتی نهایی

--------------------------------------------------
8. INVITE COLLEAGUES
--------------------------------------------------

Make inviting colleagues extremely easy.

Provide:

«دعوت هم‌تیمی‌ها»

Features:

- Room code
- Shareable link
- Copy invitation
- Internal colleague invitation if supported
- Player list
- Online status

Friendly invitation copy:

«بیا یه دور بازی کنیم! 🎮»

«هم‌تیمی‌ها جمع شدن؛ جای تو خالیه!»

After joining:

«یک هم‌تیمی جدید به دورهمی اضافه شد! 👋»

Handle:

- Duplicate player
- Full room
- Invalid room code
- Expired room
- Disconnect
- Reconnect
- Refresh
- Late join

--------------------------------------------------
9. GAME ENGINE
--------------------------------------------------

Completely rebuild the game engine if necessary.

Do not rely on UI state to determine winners.

The game engine must be authoritative and deterministic.

State machine:

LOBBY
→ GAME_CONFIGURATION
→ GAME_START
→ PLAYERS_READY
→ GAME_INTRO
→ COUNTDOWN
→ ROUND_ACTIVE
→ PLAYER_ACTION
→ ANSWERING
→ ROUND_LOCKED
→ CALCULATE_RESULT
→ SHOW_ROUND_RESULT
→ UPDATE_LEADERBOARD
→ NEXT_ROUND
→ NEXT_GAME
→ GAME_RESULT
→ WINNER_CEREMONY

The engine must own:

- Room state
- Player state
- Current game
- Current round
- Timer
- Turns
- Actions
- Answers
- Validation
- Scores
- Rankings
- Winner
- Tie handling
- Timeout
- Elimination
- Disconnect
- Reconnect
- Completion
- Game transitions

Prevent:

- Race conditions
- Duplicate submissions
- Double scoring
- Incorrect winner calculation
- Incorrect timer behavior
- Repeated rounds
- Stale state
- Client-side winner manipulation
- Broken transitions

--------------------------------------------------
10. GAMES
--------------------------------------------------

Rebuild all games from scratch with clear, deterministic rules.

GAME 1 — «حدس بزن»

A hidden/blurred image gradually becomes clearer.

Players submit guesses.

Earlier correct guesses receive higher scores.

Rules must clearly define:

- Guess validation
- Duplicate answers
- Timing
- Score
- Incorrect guesses
- Round completion
- Tie handling

--------------------------------------------------

GAME 2 — «اسم‌فامیل سرعتی»

Players receive a letter.

Categories are presented.

Players enter answers under a time limit.

Validate:

- Empty answer
- Duplicate answer
- Invalid answer
- Time expiration
- Simultaneous submission

Scoring must be deterministic.

--------------------------------------------------

GAME 3 — «قایم‌باشک»

One hidden choice/location is selected.

Other players attempt to identify it.

Clues progressively reduce possible choices.

Earlier correct guesses receive more points.

--------------------------------------------------

GAME 4 — «کلمه ممنوعه»

One player explains a target word.

Certain forbidden words cannot be used.

Other players guess the target.

Track:

- Correct guess
- Forbidden word
- Time
- Skip
- Score

--------------------------------------------------

GAME 5 — «دوز — نبرد قلمرو»

Create a more strategic multiplayer version of Tic-Tac-Toe.

Use a larger grid.

Support multiple players.

Players claim cells.

Create strategic effects and special cells.

Possible win condition:

- Four connected cells
- Territory score
- Round score

Rules must be clear and deterministic.

--------------------------------------------------

GAME 6 — «یک کلمه، چند سرنخ»

Reveal clues progressively.

Players can submit guesses.

Earlier correct guesses receive more points.

Prevent repeated submissions from generating additional points.

--------------------------------------------------

GAME 7 — «چشمک»

Exactly 8 players.

One player is secretly selected as the wink player.

The wink action is a UI action.

Do NOT use camera detection.

Selected players receive a private visual indication.

Other players attempt to identify the wink player.

Provide limited accusation attempts.

The hidden role must remain private.

Never reveal secret information through:

- UI
- animations
- leaderboard
- network state
- spectator state
- result previews

--------------------------------------------------

GAME 8 — «جاسوس»

6–8 players.

One player is secretly the spy.

The spy does not know the secret topic.

Other players know the topic.

Players interact through clues/questions.

Then voting begins.

If the spy is identified, they receive one final opportunity to guess the topic.

If the spy guesses correctly, the spy can still win.

Clearly define:

- Spy selection
- Topic visibility
- Turn order
- Clue rules
- Voting
- Tie
- Spy final guess
- Score

--------------------------------------------------

GAME 9 — «بازی سرعتی نهایی»

Create a fast reaction-based final game.

Use:

- Speed
- Accuracy
- Reaction
- Precision

The final round can have higher scoring weight.

This creates a meaningful comeback opportunity.

--------------------------------------------------
11. COMEBACK SYSTEM
--------------------------------------------------

A player who is behind must never feel that the game is already over.

Introduce comeback mechanics.

Examples:

«وقت جبرانه! 🔥»

«فقط ۸ امتیاز تا نفر بالاتر»

«راند نهایی امتیاز بیشتری دارد»

Use comeback mechanics fairly.

Do not artificially guarantee a comeback.

--------------------------------------------------
12. LIVE LEADERBOARD
--------------------------------------------------

Leaderboard should be animated.

After every round:

- Scores animate
- Ranking changes animate
- Player positions transition smoothly
- New score is highlighted
- Rank movement is shown

Example:

«رضا از رتبه ۵ → رتبه ۳ ⬆️»

Do not overuse animation.

--------------------------------------------------
13. ACHIEVEMENTS
--------------------------------------------------

Achievements must not only reward winning.

Create achievements for:

- Fastest answer
- Highest accuracy
- Best comeback
- Longest streak
- Team contribution
- Most improvement
- Participation
- Playing with new colleagues

Examples:

⚡ سریع‌ترین پاسخ
🎯 دقیق‌ترین بازیکن
🔥 بهترین کام‌بک
🤝 هم‌تیمی همراه
🧠 ذهن خلاق
🌱 بیشترین پیشرفت
🏆 قهرمان دورهمی
🧩 حل‌کننده تیمی
🤗 هم‌بازی جدید

Never publicly shame users.

Never use:

- Worst player
- Loser
- Weakest player
- Most mistakes

--------------------------------------------------
14. PERSONAL PROGRESS
--------------------------------------------------

Each player should have a profile.

Show:

- Games played
- Games won
- Accuracy
- Best score
- Best streak
- Personal records
- Achievements
- Favorite games
- Improvement

Examples:

«رکورد شخصیت رو شکستی! 🔥»

«امروز از دفعه قبل سریع‌تر بودی.»

«یک قدم تا Achievement بعدی!»

--------------------------------------------------
15. TEAM AND COLLABORATIVE GAMES
--------------------------------------------------

Introduce team-based experiences.

Examples:

«هم‌فکری»
«زنجیره تیمی»
«ماموریت مشترک»

Some challenges should reward:

- Communication
- Cooperation
- Shared problem solving
- Collective success

Example:

If the entire room reaches a shared score:

«همه با هم به هدف رسیدید! 🎉»

The platform should create the feeling:

«ما با هم برنده شدیم.»

--------------------------------------------------
16. CROSS-TEAM CONNECTION
--------------------------------------------------

Create an optional feature:

«این بار با یک هم‌تیمی جدید بازی کن»

Allow players to occasionally play with colleagues outside their normal team.

Never force this.

Use:

- Random teammate pairing
- Cross-team matchmaking
- Mixed-team games
- New colleague achievements

Goal:

Create more opportunities for natural interaction across organizational boundaries.

--------------------------------------------------
17. WEEKLY CHALLENGES
--------------------------------------------------

Create lightweight optional weekly challenges.

Examples:

«این هفته با ۳ هم‌تیمی جدید بازی کن.»

«یک بازی تیمی انجام بده.»

«یک رکورد شخصی جدید ثبت کن.»

«در ۳ دورهمی شرکت کن.»

Challenges should feel fun.

They must never feel like work assignments.

--------------------------------------------------
18. TEAM EVENTS
--------------------------------------------------

Create optional team competitions.

Example:

«نبرد تیم‌ها»

Teams can participate in friendly competitions.

Team score can be calculated from multiple games.

The tone must remain friendly.

Do not create toxic rivalry.

Use:

«کدوم تیم بیشتر با هم بازی می‌کنه؟»

rather than:

«کدوم تیم بقیه رو شکست می‌ده؟»

--------------------------------------------------
19. SOCIAL PRESENCE
--------------------------------------------------

Create subtle social signals.

Show:

- Online players
- Active rooms
- Players currently playing
- Recent achievements
- Recent records

Examples:

«۱۲ هم‌تیمی در حال بازی هستند»

«۳ دورهمی فعال»

«امروز ۲۴ بازی انجام شده»

This should create a sense of community.

--------------------------------------------------
20. FEEDBACK LOOP
--------------------------------------------------

After each game provide lightweight feedback:

👍 دوست داشتم
😐 معمولی بود
👎 نیاز به بهتر شدن دارد

Also:

«چه بازی‌ای دوست داری به میدان هم‌تیمی‌ها اضافه بشه؟»

Use feedback as a future product improvement mechanism.

--------------------------------------------------
21. ORGANIZATIONAL CULTURE
--------------------------------------------------

The platform should support positive organizational culture naturally.

Potential cultural outcomes:

- Stronger colleague relationships
- Better cross-team communication
- More informal interaction
- Collaboration
- Participation
- Sense of belonging
- Creativity
- Positive energy
- Shared experiences
- Friendly competition
- Team spirit

Do NOT explicitly preach organizational culture during gameplay.

The user should never feel like:

«دارم آموزش فرهنگ سازمانی می‌بینم.»

Instead:

«دارم با همکارام بازی می‌کنم.»

The cultural benefit should emerge naturally from the experience.

--------------------------------------------------
22. GAME CONTENT
--------------------------------------------------

Use Persian words, concepts and culturally familiar references.

Some content may subtly reference:

- Technology
- Banking
- Innovation
- Product
- Customer
- Team
- Collaboration
- Creativity
- Projects
- Learning
- Problem solving

But do not turn games into corporate quizzes.

--------------------------------------------------
23. MICROCOPY
--------------------------------------------------

Use warm Persian microcopy.

Examples:

«همه آماده‌ان؟»

«۳...۲...۱... بزن بریم!»

«این راند مال تو بود!»

«چه کام‌بکی! 🔥»

«فقط چند امتیاز تا صدر جدول!»

«راند بعدی هنوز مونده!»

«یک هم‌تیمی جدید وارد شد! 👋»

«قهرمان دورهمی مشخص شد! 🏆»

«تبریک به همه هم‌تیمی‌ها! 🎉»

--------------------------------------------------
24. WINNER CEREMONY
--------------------------------------------------

Do not end with a generic result page.

Create a premium animated winner ceremony.

Show:

🏆 قهرمان دورهمی

Player avatar

Player name

Final score

Achievements

Then recognize other players:

⚡ سریع‌ترین
🎯 دقیق‌ترین
🔥 بهترین کام‌بک
🤝 بهترین هم‌تیمی
🌱 بیشترین پیشرفت

Final message:

«تبریک به همه هم‌تیمی‌ها! 🎉»

Secondary message:

«مهم‌تر از امتیاز، لحظه‌هایی بود که کنار هم ساختیم.»

Actions:

«دوباره بازی کنیم»
«انتخاب بازی‌های جدید»
«دورهمی جدید»

--------------------------------------------------
25. ANIMATION SYSTEM
--------------------------------------------------

Animations are a major part of the product quality.

Create a unified animation system for:

- Page transitions
- Game entry
- Countdown
- Timer
- Score changes
- Correct answers
- Incorrect answers
- Rank changes
- Achievement unlock
- Player join
- Player leave
- Game transitions
- Winner ceremony
- Comeback moments

Animations must be:

- Fast
- Smooth
- Meaningful
- Consistent
- Premium

Avoid excessive animations that slow down gameplay.

--------------------------------------------------
26. SOUND DESIGN
--------------------------------------------------

If supported, add optional subtle sound effects.

Examples:

- Countdown
- Correct answer
- Wrong answer
- Achievement
- Rank increase
- Game start
- Winner ceremony

Always provide:

Mute / Unmute

Never make sound mandatory.

--------------------------------------------------
27. ACCESSIBILITY
--------------------------------------------------

Support:

- RTL
- Keyboard navigation
- Clear focus states
- Sufficient contrast
- Reduced motion
- Readable Persian typography
- Large touch targets
- Clear game states

Do not communicate critical information using color alone.

--------------------------------------------------
28. RESPONSIVE DESIGN
--------------------------------------------------

The platform must work beautifully on:

- Desktop
- Laptop
- Tablet
- Mobile

Game layouts must adapt naturally.

Prioritize gameplay visibility.

--------------------------------------------------
29. ERROR AND EDGE CASE HANDLING
--------------------------------------------------

Thoroughly test:

- Simultaneous answers
- Duplicate answers
- Empty answers
- Invalid answers
- Timeout
- Exact-time submissions
- Disconnect
- Reconnect
- Refresh
- Browser close
- Network delay
- Host leaves
- Host reconnects
- Player leaves
- Player joins late
- Full room
- Duplicate player
- Invalid room code
- Insufficient players
- Tie
- Repeated round
- Repeated submission
- Stale state
- Race condition
- Game transition failure
- Final result failure

Every state must have a graceful UI.

Never leave users stuck on:

- Loading
- Countdown
- Result
- Lobby
- Game transition

--------------------------------------------------
30. QA AND SELF-TESTING
--------------------------------------------------

After implementation, perform a full end-to-end audit.

Test the platform as:

1. Room creator
2. Player
3. Late player
4. Disconnected player
5. Reconnected player
6. Winner
7. Player who loses
8. Player who ties
9. Player who submits at the last millisecond

Test the entire journey:

HOME
→ CREATE ROOM
→ SELECT GAMES
→ INVITE
→ LOBBY
→ READY
→ COUNTDOWN
→ GAME
→ RESULT
→ LEADERBOARD
→ NEXT GAME
→ FINAL RESULT
→ WINNER CEREMONY
→ REMATCH

Fix root causes.

Do not hide bugs with UI workarounds.

Do not leave placeholder logic.

Do not implement fake multiplayer behavior.

--------------------------------------------------
31. PERFORMANCE
--------------------------------------------------

Clean up:

- Timers
- Intervals
- Event listeners
- Subscriptions
- Animation frames
- Multiplayer listeners

Prevent:

- Memory leaks
- Duplicate listeners
- Timer duplication
- State synchronization issues
- Unnecessary re-renders

The game must remain smooth during long sessions.

--------------------------------------------------
32. VISUAL DESIGN
--------------------------------------------------

Overall visual language:

Premium
Friendly
Playful
Modern
Social
Cinematic
Energetic

Use:

- Rich gradients
- Soft shadows
- Glass layers where appropriate
- Rounded surfaces
- High-quality icons
- Strong Persian typography
- Character artwork
- Subtle depth
- Premium lighting
- Game-show inspired moments

Avoid:

- Generic SaaS dashboard appearance
- Excessive glassmorphism
- Cheap neon
- Casino aesthetics
- Childish cartoon UI
- Excessive dark gaming UI
- Corporate dashboard feeling

The existing character artwork should remain a central emotional asset.

--------------------------------------------------
33. PRODUCT EMOTIONAL GOAL
--------------------------------------------------

Every major screen should answer one question:

"Why would a colleague want to play again?"

The answer should come from:

- Fun
- Social connection
- Competition
- Recognition
- Curiosity
- Personal improvement
- Team interaction
- New experiences

The platform should create the feeling:

«این بازی برای خود ما، همکارهای بهسازان ملت ساخته شده.»

--------------------------------------------------
34. FINAL PRODUCT PRINCIPLE
--------------------------------------------------

The platform is NOT simply a collection of games.

It is:

A social experience for colleagues.

The most important principle is:

«ما بازی را ساختیم تا همکارها بیشتر با هم ارتباط بگیرند، نه اینکه فقط امتیاز بیشتری بگیرند.»

Therefore:

FUN FIRST.
PEOPLE FIRST.
CONNECTION FIRST.
COMPETITION SHOULD BE FRIENDLY.
CULTURE SHOULD EMERGE NATURALLY.

Build a product that colleagues genuinely want to open, invite each other to, play repeatedly, talk about and share with other colleagues.

Do not stop at creating static screens.

Build the complete interactive experience, game logic, states, transitions, scoring, multiplayer behavior, social layer, animations and QA system.

Finally, review the entire product from the perspective of a real Behsazan Mellat colleague and refine anything that feels:

- Generic
- Boring
- Corporate
- Confusing
- Unnecessarily complicated
- Childish
- Competitive in a negative way
- Visually inconsistent
- Technically fragile

The final result should feel polished enough to be presented internally as a real Behsazan Mellat digital product.
```
