# ═══════════════════════════════════════════════════════════════════
# SKILLSATHI — Admin Panel Feature Reference Document
# Smart Adaptive Career Roadmap Generator (SCR Project)
# ═══════════════════════════════════════════════════════════════════
# PURPOSE: This file documents ALL admin panel functionality that has
# been implemented across the full stack (Database → Backend → Frontend).
# Give this file to any AI assistant for complete project context.
# ═══════════════════════════════════════════════════════════════════

## TECH STACK
- Frontend: React 19 (Vite), Tailwind CSS v4, Framer Motion, lucide-react
- Backend: ASP.NET Core 9 Web API (C#), Entity Framework Core, PostgreSQL (Npgsql), BCrypt.Net-Next, JWT
- ML Service: Python FastAPI + scikit-learn
- Admin Credentials: email=admin@gmail.com, password=admin@123

────────────────────────────────────────────────────────────────────
## 1. DATABASE SCHEMA (database/init.sql)
────────────────────────────────────────────────────────────────────

### Tables Created for Admin Panel Features:

```sql
-- Weekly Quiz Quests (admin creates MCQ quests for users)
CREATE TABLE weekly_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    end_date TIMESTAMP NOT NULL,
    reward_tokens INT DEFAULT 100
);

-- MCQ Questions linked to weekly quests
CREATE TABLE quest_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_quest_id UUID REFERENCES weekly_quests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_option CHAR(1) NOT NULL,  -- 'A','B','C','D'
    points INT DEFAULT 25
);

-- User quiz submissions (score + time tracking for leaderboard)
CREATE TABLE quest_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    weekly_quest_id UUID REFERENCES weekly_quests(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    total_points INT DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken_seconds INT DEFAULT 0,
    UNIQUE(user_id, weekly_quest_id)
);

-- Token shop rewards (admin creates, users redeem with tokens)
CREATE TABLE redeemable_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    token_cost INT NOT NULL,
    reward_url VARCHAR(500)
);

-- User redemption history
CREATE TABLE user_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES redeemable_rewards(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin audit log (tracks all admin actions)
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    admin_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Modified `users` table columns (added):
- `tokens INT DEFAULT 0` — Token wallet balance for reward redemption
- `phone_number VARCHAR(15)` — Registration field
- `education_level VARCHAR(50)` — Registration field
- `field_of_study VARCHAR(100)` — Registration field

────────────────────────────────────────────────────────────────────
## 2. BACKEND MODELS (backend/Models/)
────────────────────────────────────────────────────────────────────

### Files created:
- `WeeklyQuest.cs` — Entity with Id, Title, Description, EndDate, RewardTokens; nav props: Questions, Submissions
- `QuestQuestion.cs` — Entity with Id, WeeklyQuestId, QuestionText, OptionA-D, CorrectOption, Points
- `QuestSubmission.cs` — Entity with Id, UserId, WeeklyQuestId, Score, TotalPoints, CompletedAt, TimeTakenSeconds
- `RedeemableReward.cs` — Entity with Id, Title, Description, TokenCost, RewardUrl
- `UserRedemption.cs` — Entity with Id, UserId, RewardId, RedeemedAt; nav props: User, Reward
- `AdminAuditLog.cs` — Entity with Id, AdminId, AdminName, Action, Details, Timestamp

### Modified:
- `User.cs` — Added `Tokens (int)`, `PhoneNumber`, `EducationLevel`, `FieldOfStudy` properties

────────────────────────────────────────────────────────────────────
## 3. BACKEND CONTROLLERS (backend/Controllers/)
────────────────────────────────────────────────────────────────────

### AdminController.cs — Full CRUD + Telemetry (JWT [Authorize] protected)
Every endpoint checks `IsAdmin` flag via `GetRequestingAdmin()` helper.
All mutations log to `admin_audit_logs` via `LogAdminAction()`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/health | System health: checks C# API, PostgreSQL, ML service (with latency ms) |
| GET | /api/admin/audit-logs | Returns last 100 admin audit log entries |
| GET | /api/admin/users | Full user registry with skills, active quest, redemptions, quest count |
| POST | /api/admin/users/{id}/tokens | Update user token balance (requires Amount + Reason) |
| POST | /api/admin/users/{id}/toggle-admin | Toggle admin role for a user |
| DELETE | /api/admin/users/{id} | Delete a user account |
| POST | /api/admin/courses | Create learning resource |
| PUT | /api/admin/courses/{id} | Update learning resource |
| DELETE | /api/admin/courses/{id} | Delete learning resource |
| POST | /api/admin/careers | Create career role |
| PUT | /api/admin/careers/{id} | Update career role |
| DELETE | /api/admin/careers/{id} | Delete career role |
| GET | /api/admin/quests | List all weekly quests with questions |
| POST | /api/admin/quests | Create weekly quest |
| PUT | /api/admin/quests/{id} | Update weekly quest |
| DELETE | /api/admin/quests/{id} | Delete weekly quest |
| POST | /api/admin/quests/{questId}/questions | Add MCQ question to quest |
| DELETE | /api/admin/questions/{id} | Delete a question |
| POST | /api/admin/rewards | Create redeemable reward |
| PUT | /api/admin/rewards/{id} | Update reward |
| DELETE | /api/admin/rewards/{id} | Delete reward |

### WeeklyQuestsController.cs — User-facing quiz endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/weeklyquests | List all quests with questions |
| POST | /api/weeklyquests/{id}/submit | Grade MCQ answers, award tokens, save submission |
| GET | /api/weeklyquests/{id}/leaderboard | Leaderboard ranked by score desc, time asc |

### RewardsController.cs — Token shop endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/rewards/catalog | List all rewards |
| GET | /api/rewards/my-redemptions | User's redeemed items |
| POST | /api/rewards/{id}/redeem | Redeem reward (deducts tokens) |

────────────────────────────────────────────────────────────────────
## 4. FRONTEND API SERVICE (frontend/src/services/api.js)
────────────────────────────────────────────────────────────────────

### Admin API functions added:
```javascript
getAdminUsers()              // GET /api/admin/users
getAdminHealth()             // GET /api/admin/health
getAdminAuditLogs()          // GET /api/admin/audit-logs
updateUserTokens(userId, amount, reason)  // POST /api/admin/users/{id}/tokens
toggleUserAdmin(userId)      // POST /api/admin/users/{id}/toggle-admin
deleteAdminUser(userId)      // DELETE /api/admin/users/{id}
```

### Quest & Reward API functions:
```javascript
getWeeklyQuests()            // GET /api/weeklyquests
submitQuest(questId, answers) // POST /api/weeklyquests/{id}/submit
getLeaderboard(questId)      // GET /api/weeklyquests/{id}/leaderboard
getRewardsCatalog()          // GET /api/rewards/catalog
getMyRedemptions()           // GET /api/rewards/my-redemptions
redeemReward(rewardId)       // POST /api/rewards/{id}/redeem
```

────────────────────────────────────────────────────────────────────
## 5. FRONTEND VIEWS (frontend/src/views/)
────────────────────────────────────────────────────────────────────

### Admin.jsx — Main Admin Console Manager
- Tab-based interface with 5 tabs: Dashboard, Skills & Resources, User Registry, Quest Workshop, Reward Merchant
- Default tab is "Dashboard" which renders AdminDashboard component
- Skills tab: CRUD for skills and learning resources
- Users tab: Searchable user table + clickable eye icon opens UserDetailDrawer
- Quest Workshop tab: Create weekly quests, add MCQ questions, delete quests/questions
- Reward Merchant tab: Create/delete shop rewards with token costs

### AdminDashboard.jsx — Analytics & Telemetry Dashboard
- 4 metric cards: Total Adventurers, Active Trials, Total Redemptions, Token Circulation
- Live System Health panel: checks C# Gateway, PostgreSQL DB, Python ML Service (shows latency in ms)
- System Audit Timeline: vertical timeline of recent admin actions from audit_logs table

### UserDetailDrawer.jsx — Slide-over User Inspector
- Right-side slide-over drawer opened from User Registry
- Shows: user level, XP, token balance, active career target, full skill tree with levels
- Shows: redeemed items list, quest completion count
- Quick Actions: Adjust tokens (with reason field), Toggle admin role, Delete account

### WeeklyQuest.jsx — User-facing Quiz Page
- Lists available weekly quests with countdown timer
- MCQ quiz interface with A/B/C/D option selection
- Auto-grades on submit, shows score, awards tokens
- Leaderboard tab: ranked by score (desc) then completion speed (asc)

### TokenShop.jsx — Token Reward Shop
- Catalog grid of redeemable rewards with token costs
- Redeem button (disabled if insufficient tokens)
- "My Vault" section showing previously redeemed items

────────────────────────────────────────────────────────────────────
## 6. APP.JSX INTEGRATION
────────────────────────────────────────────────────────────────────

### Sidebar Navigation:
- Admin users see a "Guild Master" nav item (ShieldAlert icon)
- When currentPage === 'admin', sidebar hides the user character widget (avatar, LV, XP bar, Stats Attributes) and shows a "MASTER TERMINAL / Registry Controller" admin identity widget instead

### Page Routing:
```jsx
case 'weeklyquest': return <WeeklyQuest userProfile={userProfile} />;
case 'tokenshop': return <TokenShop userProfile={userProfile} />;
case 'admin': return <Admin currentUser={userProfile} />;
```

### State Management:
- `userProfile.tokens` — tracked in state, updated on quiz completion or shop redemption
- `userProfile.isAdmin` — controls visibility of admin nav link

────────────────────────────────────────────────────────────────────
## 7. AUTHENTICATION FLOW (Recently Overhauled)
────────────────────────────────────────────────────────────────────

### Login.jsx — Dedicated login page
- Fields: Email, Password
- Features: Password eye toggle (Eye/EyeOff icons), "Remember Me" checkbox, "Forgot Password?" link
- Framer Motion page load animation
- Client-side validation: email regex, password required

### SignUp.jsx — Dedicated registration page
- Fields: Full Name, Email, Password, Confirm Password, Phone Number, Education Level (dropdown), Field of Study
- Features: Dual password visibility toggles, staggered Framer Motion animations, responsive 2-column grid
- Client-side validation: all required, email regex, password >= 6 chars, password match, phone 10-15 digits
- Education dropdown options: High School, Diploma, Bachelor's, Master's, PhD, Other

### AuthController.cs — Server-side validation
- Email format regex check
- Password minimum 6 characters
- Password == ConfirmPassword match
- Phone number 10-15 digits regex
- Duplicate email check (409 Conflict)
- BCrypt password hashing
- JWT token generation (7-day expiry)

### RegisterRequest DTO fields:
Name, Email, Password, ConfirmPassword, PhoneNumber, EducationLevel, FieldOfStudy

────────────────────────────────────────────────────────────────────
## 8. EF CORE CONTEXT (backend/Data/AppDbContext.cs)
────────────────────────────────────────────────────────────────────

### DbSets added:
```csharp
DbSet<WeeklyQuest> WeeklyQuests
DbSet<QuestQuestion> QuestQuestions
DbSet<QuestSubmission> QuestSubmissions
DbSet<RedeemableReward> RedeemableRewards
DbSet<UserRedemption> UserRedemptions
DbSet<AdminAuditLog> AdminAuditLogs
```

### Key Relationships configured in OnModelCreating:
- QuestQuestion → WeeklyQuest (Cascade delete)
- QuestSubmission → User + WeeklyQuest (Cascade, Unique on user+quest)
- UserRedemption → User + RedeemableReward (Cascade)

────────────────────────────────────────────────────────────────────
## 9. KEY DESIGN DECISIONS
────────────────────────────────────────────────────────────────────

- Admin panel is a SEPARATE layout from regular user dashboard (sidebar transforms)
- Weekly Quests are MCQ-only for automated grading
- Leaderboard ranks by: score DESC, then completion time ASC
- Token shop rewards are mock benefits (resume reviews, prep guides)
- All admin CRUD operations are audit-logged with admin name + action + details
- Admin cannot revoke their own admin rights (self-protection)
- System health checks ML service by hitting /docs endpoint and measuring latency
