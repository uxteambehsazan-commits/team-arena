ADMIN PANEL + FEEDBACK & ANALYTICS SYSTEM
FOR «میدان هم‌تیمی‌ها»

Update the existing «میدان هم‌تیمی‌ها» game platform.

DO NOT redesign the existing application.

Preserve the current visual identity, homepage structure, game artwork, avatars, game screens, producer page and existing game experience.

Add the following functionality as a seamless extension of the current product.

==================================================
1. ADMIN LOGIN ENTRY
==================================================

Add a small, elegant Admin Login icon/button in the
TOP-RIGHT CORNER of the application.

The icon must be subtle and professional.

Suggested icon:
- Shield / Admin / Settings style icon
- Minimal
- Premium
- Consistent with the existing UI
- Clearly recognizable as an administrator area

Do NOT make it visually dominant.

Tooltip on hover:

«ورود مدیر»

Clicking the icon opens:

ADMIN LOGIN MODAL / PAGE

==================================================
2. ADMIN LOGIN
==================================================

Create a secure-looking admin authentication screen.

Use these credentials for the prototype:

Username:
manoosi

Password:
Manoos!13650515

IMPORTANT:

NEVER display these credentials anywhere to normal users.

Do not show them:

- On homepage
- In game screens
- In help
- In source-like visible UI
- In error messages
- In tooltips
- In onboarding
- In feedback screens

Only the administrator login form should accept them.

Login form:

نام کاربری
کلمه عبور

Buttons:

«ورود به پنل مدیریت»

Secondary action:

«بازگشت»

Password field must be masked.

Use a show/hide password icon.

==================================================
3. LOGIN VALIDATION
==================================================

If credentials are correct:

Open Admin Dashboard.

If username is incorrect:

«نام کاربری یا کلمه عبور صحیح نیست.»

If password is incorrect:

Show the same generic authentication error.

DO NOT reveal which credential is wrong.

Prevent unlimited rapid login attempts in the UI.

Show loading state during authentication.

==================================================
4. ADMIN DASHBOARD
==================================================

Create a premium administrative dashboard.

Title:

«داشبورد مدیریت»

Subtitle:

«گزارش عملکرد و بازخورد هم‌تیمی‌ها»

The dashboard should feel like a product analytics center,
NOT a generic corporate admin template.

Use the existing visual identity of «میدان هم‌تیمی‌ها».

==================================================
5. TOP KPI CARDS
==================================================

Show high-level metrics:

«تعداد بازیکنان»

«تعداد دورهمی‌ها»

«تعداد بازی‌های انجام‌شده»

«میانگین امتیاز رضایت»

«میانگین امتیاز تجربه بازی»

«نرخ تکمیل بازی»

Each KPI should have:

- Current value
- Small contextual indicator
- Trend when data exists
- Clean visual hierarchy

Do NOT invent fake data if real data does not exist.

If the application is in demo mode,
clearly label demo/sample data.

==================================================
6. PLAYER PERFORMANCE REPORT
==================================================

Create a section:

«گزارش عملکرد بازیکنان»

Show:

- Player name
- Number of games played
- Games completed
- Wins
- Total score
- Average score
- Average response time
- Participation frequency
- Achievements
- Last activity

Allow sorting by:

- بیشترین بازی
- بیشترین امتیاز
- بیشترین برد
- بیشترین مشارکت
- آخرین فعالیت

Allow search by player name.

Allow filtering by:

- بازه زمانی
- بازی
- تعداد بازیکنان
- وضعیت مشارکت

==================================================
7. GAME PERFORMANCE ANALYTICS
==================================================

Create:

«گزارش عملکرد بازی‌ها»

For every game show:

Game name
Number of plays
Completion rate
Average score
Average duration
Average player count
Average satisfaction
Number of feedback responses

Games:

حدس بزن
اسم‌فامیل سرعتی
قایم‌باشک
کلمه ممنوعه
دوز — نبرد قلمرو
یک کلمه، چند سرنخ
چشمک
جاسوس
بازی سرعتی نهایی

Use visual charts where useful.

Examples:

- Bar chart
- Line chart
- Donut chart
- Trend cards

Keep charts simple and readable.

==================================================
8. FEEDBACK CENTER
==================================================

Create a major section:

«بازخورد هم‌تیمی‌ها»

This section must collect and display feedback submitted
after games.

Each feedback item should include:

- Player
- Game
- Date
- Rating
- Selected feedback tags
- Written suggestion
- Optional category
- Status

Feedback categories:

«تجربه بازی»

«قوانین بازی»

«سرعت و عملکرد»

«طراحی و رابط کاربری»

«هیجان و جذابیت»

«پیشنهاد بازی جدید»

«مشکل یا باگ»

==================================================
9. FEEDBACK FILTERS
==================================================

Allow admin to filter feedback by:

- Game
- Rating
- Date
- Feedback category
- Positive feedback
- Negative feedback
- Suggestions
- Bug reports

Allow sorting by:

- جدیدترین
- قدیمی‌ترین
- کمترین امتیاز
- بیشترین امتیاز

==================================================
10. USER SUGGESTIONS
==================================================

Create a dedicated section:

«پیشنهادات هم‌تیمی‌ها»

Show suggestions submitted by users.

Each suggestion should have:

- Suggestion text
- Player name if available
- Date
- Related game
- Category
- Status

Statuses:

«جدید»

«در حال بررسی»

«در حال اجرا»

«اعمال شد»

«فعلاً امکان اجرا ندارد»

Allow admin to change the status.

==================================================
11. IMPORTANT — FEEDBACK AFTER EVERY GAME
==================================================

At the END of EVERY GAME SESSION,
before returning to the lobby or next game,
show a beautiful feedback experience.

DO NOT make it feel like a boring survey.

Create a short, friendly interaction.

Headline:

«این راند چطور بود؟ 🎮»

Subheadline:

«نظر تو کمک می‌کنه دورهمی‌های بعدی بهتر بشن.»

==================================================
12. GAME RATING
==================================================

Ask:

«چقدر از این بازی لذت بردی؟»

Use an attractive 1–5 rating interaction.

Prefer:

★★★★★

or an interactive visual rating component.

The interaction should be animated.

When the user selects a rating,
provide subtle positive feedback.

==================================================
13. FEEDBACK TAGS
==================================================

After rating, show optional quick tags.

Examples:

«خیلی سرگرم‌کننده بود»

«رقابتش جذاب بود»

«خیلی سریع بود»

«قوانینش واضح نبود»

«سخت بود»

«آسان بود»

«دوست داشتم دوباره بازی کنم»

«نیاز به بهبود دارد»

«بیشتر از این بازی بگذارید»

«ایده بازی جدید دارم»

Allow multiple selections.

==================================================
14. OPEN SUGGESTION
==================================================

Add optional text field:

«اگر پیشنهادی برای بهتر شدن بازی داری، برامون بنویس.»

Placeholder:

«مثلاً دوست داشتم زمان این راند کمی بیشتر باشد...»

This field must be optional.

Character limit:

500 characters.

Show character counter.

==================================================
15. BUG REPORT
==================================================

Add optional quick action:

«گزارش مشکل»

If selected, open a compact form:

«چه مشکلی دیدی؟»

Allow user to describe the issue.

Include current:

- Game
- Round
- Approximate time
- Relevant context

automatically when possible.

The user should not need to manually enter technical information.

==================================================
16. SUBMIT FEEDBACK
==================================================

Primary CTA:

«ثبت بازخورد»

Secondary:

«فعلاً رد می‌کنم»

After submission show:

«مرسی هم‌تیمی! 💜»

And:

«بازخوردت ثبت شد و در بهتر شدن دورهمی‌های بعدی به ما کمک می‌کنه.»

Do NOT force users to write text.

Rating should be quick.

==================================================
17. FEEDBACK MICRO-INTERACTIONS
==================================================

Make the feedback experience delightful.

Use:

- Smooth transitions
- Small scale animations
- Rating interaction animation
- Success animation
- Subtle particles or glow
- Friendly microcopy

Do NOT use excessive animation.

The feedback process should take approximately
5–10 seconds.

==================================================
18. FEEDBACK DATA MODEL
==================================================

Each feedback record should conceptually contain:

feedbackId
playerId
playerName
gameId
gameName
sessionId
roundId
rating
selectedTags
comment
feedbackCategory
isBugReport
createdAt
status

Ensure the structure is consistent and reusable.

==================================================
19. ADMIN FEEDBACK DETAIL
==================================================

When admin clicks a feedback item,
open a detail drawer/modal.

Show:

Game
Player
Rating
Tags
Comment
Date
Session
Category
Status

Allow:

«تغییر وضعیت»

and:

«علامت‌گذاری برای بررسی»

==================================================
20. INSIGHTS SECTION
==================================================

Add:

«بینش‌های کلیدی»

This section should summarize patterns from collected feedback.

Examples:

- محبوب‌ترین بازی‌ها
- بازی‌هایی با بیشترین مشارکت
- بازی‌هایی با بالاترین رضایت
- بازی‌هایی با بیشترین پیشنهاد بهبود
- پرتکرارترین مشکلات
- پرتکرارترین پیشنهادها

IMPORTANT:

Only calculate insights from actual collected data.

Do NOT fabricate conclusions.

If insufficient data exists:

«هنوز داده کافی برای ارائه این بینش وجود ندارد.»

==================================================
21. ADMIN NAVIGATION
==================================================

Admin panel navigation:

داشبورد
عملکرد بازیکنان
عملکرد بازی‌ها
بازخوردها
پیشنهادات
گزارش مشکلات
بینش‌ها

Add:

«خروج از پنل مدیریت»

==================================================
22. ADMIN ACCESS
==================================================

Normal users must never accidentally enter the admin dashboard.

Admin UI must be visually separated from the game experience.

When admin logs out:

Return to homepage.

Admin session state should be cleared appropriately.

==================================================
23. RESPONSIVE DESIGN
==================================================

Admin dashboard must work on:

Desktop
Laptop
Tablet

Prioritize desktop because this is an internal management dashboard.

==================================================
24. PERSIAN / RTL
==================================================

Everything must support Persian RTL.

Use:

- Proper Persian typography
- Correct RTL layout
- Correct Persian numbers where appropriate
- Proper spacing
- Correct alignment

Do not mirror icons that should remain directional.

==================================================
25. IMPORTANT DATA PRINCIPLE
==================================================

Do NOT generate fake user feedback,
fake ratings or fake performance data and present them as real.

If this is currently a frontend prototype,
create a clearly defined mock/demo data layer.

Make it easy to replace with a real backend later.

The architecture should separate:

UI
from
DATA
from
AUTHENTICATION
from
ANALYTICS

==================================================
26. SECURITY REQUIREMENT
==================================================

For prototype purposes, use the supplied credentials.

However, structure the authentication logic so that
real production authentication can later replace it.

DO NOT expose the password in the visible UI.

DO NOT display credentials in error messages.

DO NOT include credentials in feedback data.

DO NOT show credentials in admin analytics.

==================================================
27. PRESERVE EXISTING PRODUCT
==================================================

DO NOT modify:

- Existing homepage composition
- Existing game artwork
- Existing avatar artwork
- Existing producer page
- Existing game visual identity
- Existing game rules unless required to connect feedback
- Existing navigation unrelated to admin

Only extend the product.

==================================================
28. FINAL GAME FLOW
==================================================

Every completed game must follow:

GAME
↓
ROUND RESULT
↓
FINAL GAME RESULT
↓
FEEDBACK
↓
FEEDBACK SUCCESS
↓
NEXT GAME / LOBBY

If the user chooses «فعلاً رد می‌کنم»:

GAME
↓
FINAL RESULT
↓
NEXT GAME / LOBBY

Never block the user permanently because of feedback.

==================================================
29. PRODUCT IMPROVEMENT LOOP
==================================================

Design the entire system around this loop:

PLAY
↓
RATE
↓
FEEDBACK
↓
ANALYZE
↓
IDENTIFY PROBLEMS
↓
IMPROVE GAME
↓
RELEASE UPDATE
↓
PLAY AGAIN

The admin dashboard should make this loop visible.

==================================================
30. FINAL UX QUALITY
==================================================

The Admin experience must feel:

- Premium
- Clean
- Professional
- Friendly
- Modern
- Data-driven
- Consistent with «میدان هم‌تیمی‌ها»

The feedback experience must feel:

- Human
- Fast
- Fun
- Friendly
- Non-intrusive

The user should feel:

«نظر من واقعاً در بهتر شدن این بازی تأثیر دارد.»

==================================================
FINAL INSTRUCTION
==================================================

Implement all of the above in the existing project.

Do not create a separate application.

Do not remove existing functionality.

Do not replace existing artwork.

Integrate the Admin Panel and Feedback System
into the current «میدان هم‌تیمی‌ها» experience.

After implementation:

1. Test admin login.
2. Test incorrect credentials.
3. Test correct credentials.
4. Test admin logout.
5. Test dashboard.
6. Test player analytics.
7. Test game analytics.
8. Test feedback collection.
9. Test ratings.
10. Test suggestions.
11. Test bug reports.
12. Test feedback filtering.
13. Test feedback status changes.
14. Test final-game feedback flow.
15. Test skipping feedback.
16. Test responsive layouts.
17. Test RTL.
18. Test refresh.
19. Test navigation.
20. Test that normal users cannot see admin credentials.
21. Test that feedback is correctly associated with the correct player and game.
22. Test that feedback never blocks game completion.

Fix all discovered bugs.

Do not only report bugs.

Find → reproduce → diagnose → fix → retest.

Finally:

SAVE ALL CHANGES.

PUBLISH THE UPDATED APPLICATION.

UPDATE THE PREVIOUSLY PUBLISHED VERSION.

DO NOT CREATE A NEW SEPARATE APPLICATION.

FINAL ACTION:
PUBLISH AND UPDATE THE PREVIOUSLY PUBLISHED APPLICATION.