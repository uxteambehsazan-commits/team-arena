MASTER QA / BUG FIX / USER EXPERIENCE TEST PROMPT
PRODUCT: «میدان هم‌تیمی‌ها»
TAGLINE: «چند دقیقه دورهمی، کلی رقابت»

============================================================
MISSION
============================================================

این اپلیکیشن را از صفر تا صد مانند یک محصول واقعی و Production-Ready تست کن.

هدف اصلی:

کاربر نباید در هیچ مرحله‌ای با تجربه بد، گیج‌کننده، ناقص، غیرمنطقی، کند، خراب یا بن‌بست مواجه شود.

این فقط یک QA Report نیست.

تو باید:

FIND → REPRODUCE → DIAGNOSE → FIX → RETEST → REGRESSION TEST

انجام دهی.

اگر باگی پیدا شد:
1. علت آن را پیدا کن.
2. همان مشکل را اصلاح کن.
3. دوباره همان سناریو را اجرا کن.
4. سناریوهای مرتبط را نیز تست کن.
5. مطمئن شو اصلاح جدید باعث خراب شدن بخش دیگری نشده است.
6. سپس سراغ تست بعدی برو.

فقط گزارش «این مشکل وجود دارد» قابل قبول نیست.
تا جای ممکن خودت مشکل را در کد، State، Logic، UI، Interaction یا Data Flow اصلاح کن.

در پایان فقط زمانی محصول را قابل انتشار بدان که تمام Critical و High Issues برطرف شده باشند.

============================================================
0. PRODUCT-WIDE QUALITY GATE
============================================================

قبل از هر چیز کل اپلیکیشن را Audit کن.

بررسی کن:

- هیچ صفحه ناقصی وجود نداشته باشد.
- هیچ Button بدون عملکرد وجود نداشته باشد.
- هیچ Link خراب نباشد.
- هیچ Interaction جعلی نباشد.
- هیچ State اشتباهی نمایش داده نشود.
- هیچ داده Hard-coded در جایی که باید Dynamic باشد وجود نداشته باشد.
- هیچ Loading بی‌نهایت وجود نداشته باشد.
- هیچ صفحه Blank نشود.
- هیچ Modal بدون امکان خروج وجود نداشته باشد.
- هیچ Toast یا Message خارج از صفحه نمایش داده نشود.
- هیچ Overflow ناخواسته وجود نداشته باشد.
- هیچ متن بریده یا Overlap وجود نداشته باشد.
- هیچ وضعیت Dead-End وجود نداشته باشد.

تمام مسیرهای کاربر باید به State معتبر بعدی منتقل شوند.

============================================================
1. ARCHITECTURE AUDIT
============================================================

ساختار داخلی اپ را بررسی کن.

اطمینان حاصل کن که:

- Room State مرکزی باشد.
- Player State مرکزی باشد.
- Game State مرکزی باشد.
- Round State مرکزی باشد.
- Timer State مرکزی باشد.
- Score State مرکزی باشد.
- Selection State مرکزی باشد.
- Admin State مرکزی باشد.
- Feedback State مرکزی باشد.

UI نباید خودش Winner را تعیین کند.

UI نباید خودش Score نهایی را محاسبه کند.

UI نباید Stateهای مستقل و متناقض برای یک مفهوم مهم داشته باشد.

منطق بازی باید از Presentation Layer جدا باشد.

============================================================
2. GAME ENGINE STATE MACHINE
============================================================

State Machine را کامل تست کن:

LOBBY
↓
GAME_CONFIGURATION
↓
GAME_START
↓
PLAYERS_READY
↓
GAME_INTRO
↓
COUNTDOWN
↓
ROUND_ACTIVE
↓
PLAYER_ACTION / ANSWERING
↓
ROUND_LOCKED
↓
CALCULATE_RESULT
↓
SHOW_ROUND_RESULT
↓
UPDATE_LEADERBOARD
↓
NEXT_ROUND
↓
NEXT_GAME
↓
GAME_RESULT
↓
WINNER_CEREMONY
↓
FINAL_RESULT
↓
FEEDBACK
↓
LOBBY

هیچ Transition نباید:

- Skip ناخواسته داشته باشد.
- دوبار اجرا شود.
- گیر کند.
- باعث Duplicate Result شود.
- باعث Duplicate Score شود.
- باعث نمایش صفحه اشتباه شود.

هر State باید:

- Entry condition
- Exit condition
- Valid actions
- Invalid actions
- Timeout behavior
- Error behavior
- Recovery behavior

داشته باشد.

============================================================
3. ROOM CREATION TEST
============================================================

ساخت دورهمی را تست کن.

سناریوها:

- ساخت Room
- انتخاب یک بازی
- انتخاب چند بازی
- انتخاب همه بازی‌ها
- حذف بازی
- تغییر ترتیب بازی‌ها
- ایجاد Room بدون بازی
- Refresh
- Back
- ورود مجدد
- ایجاد چند Room
- Room Code
- Invite Link

بررسی کن:

- Room ID یکتا باشد.
- Room Code معتبر باشد.
- بازی‌ها دقیقاً مطابق Selection باشند.
- ترتیب بازی‌ها حفظ شود.
- داده‌های Room از بین نروند.
- Room اشتباه به کاربر نمایش داده نشود.

============================================================
4. GAME SELECTION TEST
============================================================

بخش انتخاب بازی را کامل تست کن.

بازی‌های فعلی:

1. حدس بزن
2. اسم‌فامیل سرعتی
3. قایم‌باشک
4. کلمه ممنوعه
5. دوز — نبرد قلمرو
6. یک کلمه، چند سرنخ
7. چشمک
8. جاسوس
9. بازی سرعتی نهایی

تست کن:

- انتخاب بازی
- حذف بازی
- انتخاب دوباره
- انتخاب چند بازی
- انتخاب همه بازی‌ها
- جلوگیری از Duplicate
- ترتیب Selection
- Counter
- Chipها
- × حذف
- Swipe
- Arrow
- Previous
- Next
- Slider State

حتماً بررسی کن:

LEFT ARROW = Previous
RIGHT ARROW = Next

و:

Swipe Right = Previous
Swipe Left = Next

Selection نباید با تغییر Slide پاک شود.

============================================================
5. GAME START CTA
============================================================

دکمه:

«🚀 بزن بریم!»

را تست کن.

اگر هیچ بازی انتخاب نشده:

- Disabled
- امکان Start وجود نداشته باشد.

اگر حداقل یک بازی انتخاب شده:

- Enabled
- Room شروع شود.

بعد از Click:

- فقط یک Start Event ایجاد شود.
- Double Click باعث دوبار شروع شدن نشود.
- بازی‌ها دقیقاً طبق ترتیب Selection اجرا شوند.

============================================================
6. LOBBY TEST
============================================================

Lobby را با:

1 نفر
2 نفر
3 نفر
4 نفر
6 نفر
8 نفر
حداکثر تعداد مجاز

تست کن.

بررسی:

- ورود بازیکن جدید
- خروج بازیکن
- Refresh
- Reconnect
- تغییر Avatar
- تغییر نام
- Host
- انتقال Host
- Late Join
- Duplicate Player
- Player Count
- Ready State

تمام کاربران باید State یکسانی از Room ببینند.

============================================================
7. MULTIPLAYER SYNCHRONIZATION
============================================================

یکی از مهم‌ترین تست‌ها.

اپ را با چند Player همزمان تست کن.

بررسی:

- Start Game
- Countdown
- Timer
- Questions
- Answers
- Turns
- Votes
- Actions
- Scores
- Leaderboard
- Round End
- Game End

همه بازیکنان باید State صحیح و هماهنگ ببینند.

تست با:

- Normal Network
- Slow Network
- High Latency
- Temporary Disconnect
- Reconnect
- Refresh
- Multiple Tabs

انجام شود.

============================================================
8. TIMER TEST
============================================================

تمام Timerها را تست کن.

سناریو:

T = 10
T = 5
T = 3
T = 2
T = 1
T = 0

در T=0:

- Input بسته شود.
- Action بعدی پذیرفته نشود.
- Result محاسبه شود.
- Timer منفی نشود.
- Timer دوبار اجرا نشود.

Race Condition تست شود:

بازیکن دقیقاً در لحظه T=0 پاسخ دهد.

نتیجه باید deterministic باشد.

============================================================
9. SIMULTANEOUS ACTION TEST
============================================================

دو یا چند بازیکن همزمان:

- Answer
- Vote
- Select
- Accuse
- Click
- Submit

انجام دهند.

بررسی کن:

- Duplicate event ایجاد نشود.
- Score دوبار ثبت نشود.
- Winner اشتباه نشود.
- UI بین دو State گیر نکند.

============================================================
10. GAME 1 — حدس بزن
============================================================

تست کن:

- نمایش تصویر
- نمایش سرنخ
- Timer
- Answer
- Correct Answer
- Wrong Answer
- Empty Answer
- Multiple Submit
- Timeout
- Score
- Tie
- Round End
- Next Round

پاسخ درست و غلط باید دقیقاً امتیاز صحیح داشته باشد.

============================================================
11. GAME 2 — اسم‌فامیل سرعتی
============================================================

تست کن:

- Letter / Prompt
- Answer input
- Timer
- Submit
- Empty answers
- Duplicate answers
- Invalid answers
- Timeout
- Simultaneous answers
- Score
- Ranking

هیچ Answer دوبار ثبت نشود.

============================================================
12. GAME 3 — قایم‌باشک
============================================================

تست کن:

- نمایش سرنخ
- انتخاب
- Correct / Wrong
- Timer
- Score
- Round transition
- Simultaneous selection

انتخاب بازیکن نباید باعث نمایش State خصوصی به سایر بازیکنان شود.

============================================================
13. GAME 4 — کلمه ممنوعه
============================================================

تست کن:

- کارت کلمه
- کلمات ممنوعه
- توضیح دادن
- تشخیص کلمه ممنوعه
- Timer
- Correct
- Wrong
- Skip
- Score
- Round transition

بازیکن نباید بتواند کلمه ممنوعه را از State خصوصی به بازیکنان غیرمجاز نمایش دهد.

============================================================
14. GAME 5 — دوز — نبرد قلمرو
============================================================

تست کن:

- Board
- Turn
- Valid Move
- Invalid Move
- Occupied Cell
- Simultaneous Click
- Turn Timeout
- Win
- Draw
- Score
- Reset
- Next Round

هیچ بازیکنی نباید بتواند خارج از Turn خودش بازی کند.

============================================================
15. GAME 6 — یک کلمه، چند سرنخ
============================================================

تست کن:

- Reveal clue
- Answer
- Correct
- Wrong
- Timer
- Score
- Early answer
- Late answer
- Multiple submit

امتیاز باید مطابق منطق تعریف‌شده محاسبه شود.

============================================================
16. GAME 7 — چشمک
============================================================

CRITICAL SECRET-STATE TEST

این بازی باید با دقیقاً 8 بازیکن تست شود.

Role:

1 Wink Player
7 Normal Players

تست کن:

- Role assignment
- Private role visibility
- Wink action
- Target selection
- Private notification
- Accusation
- Mistakes
- Timer
- Win condition
- Lose condition
- Round end

CRITICAL:

بازیکن عادی نباید هیچ راهی برای فهمیدن Role بازیکن چشمک داشته باشد مگر از طریق Gameplay.

Role نباید:

- در DOM عمومی
- URL
- Query String
- Public State
- Shared Client State
- Console
- Visible API payload

قابل مشاهده باشد.

============================================================
17. GAME 8 — جاسوس
============================================================

CRITICAL SECRET-STATE TEST

6 تا 8 بازیکن.

یک Spy.

Spy نباید Topic را بداند.

سایر بازیکنان Topic را می‌دانند.

تست کن:

- Role assignment
- Topic visibility
- Private state
- Questions
- Answers
- Voting
- Vote count
- Spy identification
- Final Spy Guess
- Spy correct guess
- Spy win
- Spy wrong guess
- Non-spy win

CRITICAL:

اطلاعات محرمانه نباید به Client بازیکن Spy ارسال شود.

اطلاعات Spy نباید برای سایر بازیکنان ارسال شود.

============================================================
18. GAME 9 — بازی سرعتی نهایی
============================================================

تمام موارد:

- Countdown
- Timer
- Fast Answer
- Wrong Answer
- Correct Answer
- Simultaneous Answer
- Timeout
- Score
- Winner
- Final Result

تست شود.

============================================================
19. SCORING ENGINE
============================================================

Scoring را مستقل از UI تست کن.

برای هر Game:

- Correct
- Wrong
- Timeout
- Bonus
- Penalty
- Tie
- Elimination
- Completion

بررسی شود.

هیچ Score نباید:

- دوبار ثبت شود.
- بعد از Finalization تغییر کند.
- با Refresh تغییر کند.
- با Reconnect تغییر کند.
- توسط Client قابل دستکاری باشد.

============================================================
20. WINNER ENGINE
============================================================

Winner باید فقط از State معتبر و Score معتبر تعیین شود.

تست:

- Single winner
- Tie
- Multiple winners
- Zero score
- Negative score اگر مجاز است
- Timeout
- Disconnect
- Final round
- Final game

Winner نباید توسط UI محاسبه شود.

============================================================
21. LEADERBOARD
============================================================

تست:

- Ranking
- Score
- Tie-break
- Real-time update
- Round result
- Game result
- Final result

Leaderboard نباید بین کاربران اختلاف داشته باشد.

اگر دو بازیکن Score برابر دارند، Tie-break باید deterministic باشد.

============================================================
22. DISCONNECT / RECONNECT
============================================================

سناریوهای زیر را تست کن:

A:
Player disconnects in Lobby.

B:
Player disconnects during Countdown.

C:
Player disconnects during Round.

D:
Player disconnects before Answer.

E:
Player disconnects after Answer.

F:
Host disconnects.

G:
Player reconnects.

H:
Player refreshes browser.

I:
Player opens another tab.

هیچ‌کدام نباید باعث:

- Duplicate Player
- Lost Score
- Broken Room
- Stuck Game
- Wrong Winner

شوند.

============================================================
23. REFRESH TEST
============================================================

در تمام Stateها Browser Refresh انجام بده:

Lobby
Countdown
Round
Answer
Result
Leaderboard
Next Game
Final Result
Feedback

بعد از Refresh:

- State صحیح بازی restore شود.
- کاربر دوباره به همان Room برگردد.
- Score خراب نشود.
- Answer دوباره ثبت نشود.

============================================================
24. CHEAT / EXPLOIT TEST
============================================================

تلاش کن کاربر بتواند:

- Score را تغییر دهد.
- Timer را دور بزند.
- Answer را دوبار ارسال کند.
- Role مخفی را ببیند.
- Topic مخفی را ببیند.
- Vote را تغییر دهد.
- بعد از Timeout پاسخ دهد.
- خارج از Turn بازی کند.
- Winner را تغییر دهد.
- Game را دوباره Start کند.
- Request تکراری ارسال کند.

تمام موارد باید Block شوند.

============================================================
25. FEEDBACK AFTER EVERY GAME
============================================================

بعد از پایان هر بازی، قبل از رفتن به بازی بعدی:

FEEDBACK SCREEN

نمایش داده شود:

«این بازی چطور بود؟ 🎮»

Rating:

⭐
⭐⭐
⭐⭐⭐
⭐⭐⭐⭐
⭐⭐⭐⭐⭐

Quick Tags:

😊 سرگرم‌کننده بود
⚡ سریع و هیجان‌انگیز بود
🤝 مناسب دورهمی بود
🧠 چالش‌برانگیز بود
🎯 قوانین واضح بود
🐛 مشکل یا باگ داشت
💡 پیشنهاد دارم

Comment:

«نظرت رو برامون بنویس...»

حداکثر 500 کاراکتر.

Buttons:

«ثبت بازخورد»

و:

«فعلاً رد می‌کنم»

بعد از Submit:

«مرسی هم‌تیمی! 💜»

اطمینان حاصل کن Feedback واقعاً ذخیره شود.

============================================================
26. FEEDBACK DATA TEST
============================================================

برای هر Feedback:

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

به شکل صحیح ذخیره شود.

Feedback بازیکن A نباید با بازیکن B اشتباه شود.

============================================================
27. ADMIN LOGIN
============================================================

Admin Login را تست کن.

ویژگی‌ها:

- Username
- Password
- Password masked
- Login
- Logout
- Invalid credentials
- Empty fields
- Wrong password
- Session expiration

اطلاعات Credential نباید:

- در UI عمومی
- صفحه اصلی
- Source Code
- Public State
- Local data قابل مشاهده عمومی
- پیام Error

نمایش داده شود.

از نمایش Credential واقعی در متن، UI یا گزارش‌ها خودداری کن.

برای Production، Credential نباید به صورت Hard-coded در Client باقی بماند و باید از Authentication امن / Server-side Secret استفاده شود.

============================================================
28. ADMIN DASHBOARD
============================================================

Admin باید بتواند گزارش‌های واقعی را مشاهده کند.

Dashboard:

- تعداد کاربران
- تعداد دورهمی‌ها
- تعداد بازی‌ها
- میانگین رضایت
- میانگین Rating
- Completion Rate
- تعداد Feedback
- تعداد Bug Report
- تعداد Suggestion

هیچ داده Fake نمایش داده نشود.

اگر داده‌ای وجود ندارد:

«هنوز داده‌ای برای نمایش وجود ندارد.»

============================================================
29. PLAYER PERFORMANCE REPORT
============================================================

Admin باید بتواند عملکرد کاربران را مشاهده کند.

Columns:

- Player
- Games Played
- Wins
- Score
- Average Response Time
- Participation
- Achievements
- Last Activity

Filters:

- Game
- Date
- Player
- Score
- Rating

Sorting باید واقعاً کار کند.

============================================================
30. GAME ANALYTICS
============================================================

برای هر یک از 9 بازی:

- Games Played
- Players
- Average Rating
- Average Completion
- Average Score
- Average Response Time
- Feedback Count
- Bug Reports
- Suggestions

نمایش داده شود.

فقط از داده واقعی استفاده کن.

============================================================
31. ADMIN FEEDBACK CENTER
============================================================

Admin باید بتواند:

- Ratingها را ببیند.
- Commentها را ببیند.
- Tagها را ببیند.
- Game مربوطه را ببیند.
- تاریخ را ببیند.
- Bug Reportها را جدا کند.
- Feedback را Filter کند.

Filter:

All
Positive
Neutral
Negative
Bug
Suggestion

============================================================
32. USER SUGGESTIONS
============================================================

Admin باید Suggestions کاربران را ببیند.

Status:

جدید
در حال بررسی
در حال اجرا
اعمال شد
فعلاً امکان اجرا ندارد

تغییر Status باید واقعی باشد.

============================================================
33. BUG REPORT SYSTEM
============================================================

اگر کاربر:

«🐛 مشکل یا باگ داشت»

را انتخاب کرد:

Feedback باید به عنوان Bug Report ذخیره شود.

Admin باید بتواند آن را مشاهده و بررسی کند.

============================================================
34. ADMIN DATA ACCURACY
============================================================

اطمینان حاصل کن:

Game count
Player count
Feedback count
Rating
Score
Wins
Completion

همگی از Data Source واقعی محاسبه شوند.

هیچ KPI دستی یا Hard-coded نباشد.

============================================================
35. ADMIN ACCESS CONTROL
============================================================

Normal User:

نباید:

- Admin Dashboard
- Player Reports
- Feedback Center
- Analytics
- Admin Controls

را ببیند.

Admin:

دسترسی کامل Admin داشته باشد.

Logout:

بعد از Logout تمام Admin-only screens غیرقابل دسترسی باشند.

============================================================
36. RTL / PERSIAN QA
============================================================

کل اپ را در RTL تست کن.

بررسی:

- متن فارسی
- Alignment
- Direction
- Numbers
- Timer
- Arrows
- Slider
- Chips
- Tables
- Forms
- Modal
- Toast
- Icons

فلش‌های Navigation را با RTL اشتباه نکن.

اعداد مهم نباید Mirror شوند.

============================================================
37. MOBILE QA
============================================================

حداقل این حالت‌ها را تست کن:

360px
375px
390px
414px
768px

بررسی:

- No horizontal overflow
- No clipped button
- No text overlap
- No image distortion
- No broken chips
- No hidden CTA
- No inaccessible modal
- No keyboard overlap

Keyboard موبایل نباید:

- Input را بپوشاند.
- دکمه Submit را پنهان کند.
- Layout را خراب کند.

============================================================
38. ACCESSIBILITY
============================================================

تمام Buttonها:

- قابل کلیک
- قابل تشخیص
- دارای Label
- دارای Focus State

باشند.

Touch targetها مناسب باشند.

برای Icon-only Buttonها Tooltip / Accessible Label وجود داشته باشد.

============================================================
39. LOADING / EMPTY / ERROR STATES
============================================================

برای تمام بخش‌ها تست کن:

LOADING
EMPTY
ERROR
SUCCESS

هیچ صفحه‌ای نباید فقط Blank شود.

مثلاً:

Loading:
«در حال آماده‌سازی بازی...»

Empty:
«هنوز داده‌ای برای نمایش وجود ندارد.»

Error:
«یه مشکلی پیش اومد. دوباره تلاش کن.»

Success:
«با موفقیت انجام شد.»

============================================================
40. DOUBLE CLICK / RAPID CLICK TEST
============================================================

روی تمام CTAهای مهم چند بار سریع کلیک کن:

Start
Select
Submit
Vote
Next
Ready
Login
Remove

هیچ Event نباید دوبار اجرا شود.

============================================================
41. BACK BUTTON TEST
============================================================

Browser Back و Navigation Back را در تمام Stateهای حساس تست کن.

Back نباید:

- Game را خراب کند.
- Score را پاک کند.
- Round را دوباره شروع کند.
- Feedback را Duplicate کند.
- Room را Destroy کند.

در صورت نیاز Confirmation Dialog نمایش بده.

============================================================
42. ANIMATION QA
============================================================

تمام Animationها را بررسی کن.

Animation نباید:

- Functional interaction را Block کند.
- Timer را عقب بیندازد.
- باعث Double Click شود.
- باعث Layout Shift شدید شود.
- روی موبایل Performance را خراب کند.

Animation باید:

- Smooth
- Short
- Premium
- Predictable

باشد.

============================================================
43. PERFORMANCE QA
============================================================

بررسی کن:

- Memory Leak
- Excessive re-render
- Unnecessary state updates
- Large image loading
- Animation performance
- Long lists
- Repeated event listeners
- Timer cleanup

Timerها و Event Listenerها بعد از خروج از صفحه باید Cleanup شوند.

============================================================
44. DATA PERSISTENCE
============================================================

بررسی کن:

- Room
- Players
- Scores
- Game State
- Selection
- Feedback
- Admin State

در شرایط مناسب Persist و Restore شوند.

اطلاعات قدیمی نباید وارد Session جدید شود.

============================================================
45. REGRESSION TEST
============================================================

بعد از هر Bug Fix:

1. همان Bug را دوباره تست کن.
2. Feature مربوطه را تست کن.
3. Featureهای وابسته را تست کن.
4. کل Flow را دوباره اجرا کن.

مثلاً اگر Timer را اصلاح کردی:

- تمام 9 بازی
- Score
- Result
- Winner
- Feedback
- Multiplayer

دوباره تست شود.

============================================================
46. COMPLETE END-TO-END USER JOURNEY
============================================================

مثل یک کاربر واقعی از ابتدا تا انتها بازی کن:

OPEN APP
↓
MAIN PAGE
↓
SELECT GAMES
↓
CREATE ROOM
↓
INVITE PLAYERS
↓
LOBBY
↓
READY
↓
COUNTDOWN
↓
GAME 1
↓
ROUND RESULT
↓
FEEDBACK
↓
GAME 2
↓
FEEDBACK
↓
...
↓
LAST GAME
↓
FINAL RESULT
↓
WINNER CEREMONY
↓
FEEDBACK
↓
PLAY AGAIN / NEW ROOM / EXIT

هیچ مرحله‌ای نباید:

- گیج‌کننده
- بدون توضیح
- بدون CTA
- بدون Navigation
- بدون Feedback
- یا دارای Dead-End

باشد.

============================================================
47. TEST FROM MULTIPLE USER PERSPECTIVES
============================================================

محصول را از این دیدگاه‌ها تست کن:

1. Host
2. Normal Player
3. First-time User
4. Returning User
5. Late Joiner
6. Disconnected Player
7. Reconnected Player
8. Winner
9. Loser
10. Tied Player
11. Admin

هر نقش باید تجربه منطقی و کامل داشته باشد.

============================================================
48. BAD UX HUNT
============================================================

عمداً به دنبال تجربه‌های بد بگرد.

موارد زیر را پیدا و اصلاح کن:

- کاربر نمی‌داند قدم بعدی چیست.
- Button واضح نیست.
- Loading طولانی است.
- Feedback ندارد.
- Error نامفهوم است.
- اطلاعات بیش از حد است.
- متن بریده است.
- Animation آزاردهنده است.
- Navigation گیج‌کننده است.
- User فکر می‌کند Action انجام نشده در حالی که انجام شده.
- User نمی‌فهمد بازی انتخاب شده یا نه.
- User نمی‌فهمد نوبت چه کسی است.
- User نمی‌فهمد چقدر زمان باقی مانده.
- User نمی‌فهمد برنده چه کسی است.
- User نمی‌فهمد چرا امتیاز گرفته/نگرفته.
- User نمی‌فهمد بازی بعدی چیست.

هر مورد را اصلاح کن.

============================================================
49. GAME EXPERIENCE QUALITY CHECK
============================================================

برای هر بازی این سؤال‌ها را بررسی کن:

آیا کاربر در 3 ثانیه اول می‌فهمد باید چه کار کند؟

آیا هدف بازی واضح است؟

آیا Timer قابل فهم است؟

آیا نوبت مشخص است؟

آیا Action اصلی واضح است؟

آیا Feedback فوری وجود دارد؟

آیا Result قابل فهم است؟

آیا Score قابل فهم است؟

آیا Transition به Round بعدی واضح است؟

آیا کاربر هیچ‌وقت نمی‌پرسد:
«الان باید چی کار کنم؟»

اگر چنین تجربه‌ای وجود دارد، UI/UX را اصلاح کن.

============================================================
50. FINAL QUALITY GATE
============================================================

در پایان تمام تست‌ها را دوباره اجرا کن.

Acceptance Criteria:

CRITICAL BUGS = 0
HIGH BUGS = 0
BROKEN GAME FLOWS = 0
BROKEN ADMIN FLOWS = 0
BROKEN SECRET STATES = 0
DUPLICATE SCORE BUGS = 0
DUPLICATE SUBMISSION BUGS = 0
BROKEN TIMER BUGS = 0
UNEXPECTED DEAD-ENDS = 0
MAJOR MOBILE ISSUES = 0
MAJOR RTL ISSUES = 0

همچنین:

✓ تمام 9 بازی قابل اجرا باشند.
✓ تمام بازی‌ها State Machine صحیح داشته باشند.
✓ Multiplayer Sync صحیح باشد.
✓ Score دقیق باشد.
✓ Winner دقیق باشد.
✓ Tie handling صحیح باشد.
✓ Secret information محافظت شود.
✓ Feedback بعد از هر بازی ثبت شود.
✓ Admin گزارش‌های واقعی ببیند.
✓ Normal User به Admin Data دسترسی نداشته باشد.
✓ Selection Game صحیح باشد.
✓ Slider صحیح باشد.
✓ CTAها صحیح باشند.
✓ Refresh/Disconnect/Recover صحیح باشد.
✓ Mobile UX صحیح باشد.
✓ RTL صحیح باشد.
✓ هیچ Dead-End وجود نداشته باشد.

============================================================
51. MOST IMPORTANT RULE
============================================================

اگر هر مشکلی پیدا کردی:

DO NOT ONLY REPORT IT.

FIX IT.

سپس:

RETEST IT.

سپس:

RUN REGRESSION TEST.

تا زمانی که مشکل واقعاً برطرف نشده است، تست را Pass نکن.

============================================================
52. FINAL SELF-AUDIT
============================================================

قبل از اعلام موفقیت، از خودت بپرس:

«اگر من یک کارمند بهسازان ملت باشم و برای اولین بار وارد این اپ شوم،
آیا در هیچ مرحله‌ای احساس سردرگمی، انتظار بی‌دلیل، خطای غیرقابل فهم،
از دست رفتن امتیاز، از دست رفتن بازی، دوباره‌کاری یا تجربه ناخوشایند خواهم داشت؟»

اگر پاسخ حتی در یک سناریو «بله» است:

مشکل را پیدا کن،
اصلاح کن،
دوباره تست کن.

============================================================
53. PUBLISH
============================================================

پس از اتمام موفق تست:

- تمام Fixها را روی همین اپلیکیشن اعمال کن.
- نسخه قبلی منتشرشده را Update کن.
- اپلیکیشن جدید یا Duplicate ایجاد نکن.
- تمام تغییرات را حفظ کن.
- تمام بازی‌ها و پنل Admin را مجدداً Verify کن.
- سپس نسخه نهایی را Publish کن.

این تست باید به عنوان یک Full Production Readiness Test انجام شود،
نه صرفاً یک بررسی ظاهری UI.
یک نکته خیلی مهم برای Figma Make

در این پرامپت عمداً روی این چرخه تأکید شده:

پیدا کن → بازتولید کن → علت را پیدا کن → اصلاح کن → دوباره تست کن → Regression Test

چون اگر فقط بنویسی «کل اپ را تست کن»، ممکن است Figma Make تعدادی مشکل را گزارش کند ولی واقعاً اصلاحشان نکند. این نسخه صراحتاً می‌گوید گزارش باگ به‌تنهایی قابل قبول نیست و بعد از هر Fix باید دوباره همان سناریو و بخش‌های وابسته تست شوند.

همچنین سه بخش را به‌عنوان Critical در نظر گرفته‌ام که برای جلوگیری از تجربه بد کاربر اهمیت ویژه دارند:

Synchronization و Multiplayer
Score / Winner / Timer
اطلاعات محرمانه بازی‌های «چشمک» و «جاسوس»

این سه مورد اگر درست نباشند، حتی با UI بسیار زیبا، تجربه کاربر خراب می‌شود.