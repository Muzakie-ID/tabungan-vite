# 📊 Tabungan Bersama - System Diagrams & Visual Guides

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    React Application                        │  │
│  │  - LoginPage         - DashboardPage                        │  │
│  │  - RegisterPage      - GoalCard Component                   │  │
│  │  - Modals (animations via Framer Motion)                    │  │
│  │  - Tailwind CSS styling (responsive)                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              ↕                                    │
│                    HTTP REST API (Axios)                          │
└──────────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────────┐
│                    SERVER (Express.js)                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Routes (Endpoints)                             │  │
│  │  - POST /auth/register        POST /auth/login             │  │
│  │  - POST /goals                GET /goals                   │  │
│  │  - PUT /goals/:id             DELETE /goals/:id            │  │
│  │  - POST /shared-goals         GET /shared-goals            │  │
│  │  - POST /goals/:id/transactions                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              ↕                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │         Middleware & Business Logic                         │  │
│  │  - JWT Authentication (authMiddleware)                      │  │
│  │  - Data Validation                                          │  │
│  │  - Authorization Checks                                     │  │
│  │  - Error Handling                                           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              ↕                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           Prisma ORM (Data Access)                          │  │
│  │  - Query building                                           │  │
│  │  - Data transformation                                      │  │
│  │  - Relationship management                                  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL/SQLite)                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Users │ Goals │ SharedGoals │ Members │ Invitations       │  │
│  │  Transactions │ Notifications                               │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌────────────────────────────────────────────────────────────────┐
│ USER REGISTRATION / LOGIN FLOW                                 │
└────────────────────────────────────────────────────────────────┘

1. USER ENTERS CREDENTIALS
   ┌─────────────────────┐
   │ Email: user@ex.com  │
   │ Password: ****      │
   └────────────┬────────┘
                │
                ▼
2. FRONTEND SENDS
   POST /auth/login
   { email, password }
                │
                ▼
3. BACKEND RECEIVES
   - Find user by email
   - Compare password hash
                │
                ▼
        ┌───────────────────┐
        │ Credentials Valid?│
        └───┬───────────────┘
           ┌┴──────┐
          NO      YES
           │        │
           ▼        ▼
      ERROR      GENERATE JWT
    401 Unauth  Token = sign({ id, email })
                │
                ▼
           RETURN
         { token, user }
                │
                ▼
      4. FRONTEND STORES
         localStorage.token
         localStorage.user
                │
                ▼
      5. FUTURE REQUESTS
         Headers:
         { Authorization: "Bearer <token>" }
                │
                ▼
      6. MIDDLEWARE VERIFIES
         verify(token, secret)
                │
                ▼
         ┌──────────────┐
         │ Valid Token? │
         └──┬────────┬──┘
           YES       NO
            │         │
            ▼         ▼
         ACCESS   REJECT
         GRANT     401
```

---

## 👥 Shared Goal Creation & Invitation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ SHARED GOAL WORKFLOW                                            │
└─────────────────────────────────────────────────────────────────┘

USER A (Creator):
┌──────────────────────────────┐
│ 1. Fill Goal Form             │
│    - Title                    │
│    - Target Amount            │
│    - Target Date              │
│    - Type: "Bersama"          │
│    - Invite: userb@test.com   │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ 2. Click "Buat Tujuan"        │
│    POST /shared-goals         │
└──────────┬───────────────────┘
           │
           ▼
  BACKEND PROCESSES:
  - Create Goal (type: SHARED)
  - Create SharedGoal entry
  - Add User A as member (creator)
  - Create invitation (PENDING)
  - Expire in 7 days
           │
           ▼
  SUCCESS - User A sees goal
           │
           ▼
        ┌──────────────────────┐
USER B  │ 1. Login             │
        │ 2. Dashboard loads   │
        │ 3. See "📬 Undangan" │
        └──────────┬───────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │ 2. View Invitation       │
        │    - Goal title          │
        │    - Target amount       │
        │    - Invited by User A   │
        └──────────┬──────────────┘
                   │
            ┌──────┴──────┐
            │             │
      ACCEPT         REJECT
    (Terima)        (Tolak)
            │             │
            ▼             ▼
      POST /accept   POST /reject
            │             │
            ▼             ▼
      User B Added    Invitation
      as member       REJECTED
            │
            ▼
      Goal appears in
      User B Dashboard
            │
            ▼
    ┌─────────────────┐
    │ BOTH USERS SEE: │
    │ - Goal progress │
    │ - Members       │
    │ - Transactions  │
    └─────────────────┘
```

---

## 💰 Transaction & Progress Flow

```
USER ADDS INCOME/WITHDRAWAL:

┌────────────────────────────┐
│ User clicks "+ Tambah"     │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Modal Opens                     │
│ - Select type (INCOME/WITHDRAWAL)
│ - Enter amount                  │
│ - Add note (optional)           │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ POST /goals/:id/transactions    │
│ { amount, type, note }          │
└──────────┬─────────────────────┘
           │
           ▼
  BACKEND:
  - Create Transaction record
  - Calculate amount change
  - Update Goal.currentAmount
           │
           ▼
        ┌─────────────────────────┐
        │ 200 OK                  │
        │ { transaction data }    │
        └──────────┬──────────────┘
                   │
                   ▼
  FRONTEND:
  - Close modal
  - Refresh goal data
  - Animate progress bar
           │
           ▼
  ┌────────────────────────────┐
  │ DASHBOARD UPDATES:         │
  │ - Current amount: Rp X     │
  │ - Progress: Y%             │
  │ - Members contributed      │
  │ - Transaction history      │
  └────────────────────────────┘
```

---

## 🎨 Component Hierarchy

```
App (Main)
│
├─ Routes
│  │
│  ├─ /login ──→ LoginPage
│  │   │
│  │   └─ Form inputs
│  │   └─ Error display
│  │   └─ Loading state
│  │
│  ├─ /register ──→ RegisterPage
│  │   │
│  │   └─ Form inputs (name)
│  │   └─ Validation
│  │   └─ Error handling
│  │
│  └─ /dashboard ──→ DashboardPage
│     │
│     ├─ Header
│     │   └─ User info
│     │   └─ Logout button
│     │
│     ├─ InvitationsPanel (Conditional)
│     │   ├─ Invitation cards
│     │   ├─ Accept button
│     │   └─ Reject button
│     │
│     ├─ Tabs
│     │   ├─ Individual Goals
│     │   └─ Shared Goals
│     │
│     ├─ "Buat Tujuan Baru" Button
│     │   └─ Opens CreateGoalModal
│     │
│     ├─ GoalsGrid
│     │   └─ GoalCard[] (mapped)
│     │       ├─ Goal info
│     │       ├─ Progress bar
│     │       ├─ Members (if shared)
│     │       ├─ "+ Tambah" button
│     │       │   └─ Opens AddTransactionModal
│     │       ├─ "Detail" button
│     │       └─ "Delete" button (if creator)
│     │
│     ├─ CreateGoalModal
│     │   ├─ Form inputs
│     │   ├─ Radio: Goal type
│     │   ├─ Conditional: Invite emails
│     │   └─ Submit button
│     │
│     └─ AddTransactionModal
│         ├─ Radio: Income/Withdrawal
│         ├─ Amount input
│         ├─ Note input
│         └─ Submit button
│
└─ Routing & API calls (axios)
```

---

## 📊 Data Flow Diagram

```
USER ACTION → STATE UPDATE → RE-RENDER → UI CHANGE

Example: User adds Rp 50,000 income

1. User clicks "+ Tambah"
   │
   └─→ setShowAddTransaction(true)

2. Modal opens with form
   │
   └─→ User fills form & clicks "Simpan"

3. POST /goals/:id/transactions
   │
   └─→ { amount: 50000, type: "INCOME" }

4. Backend processes
   │
   ├─→ Create transaction
   └─→ Update goal.currentAmount += 50000

5. Response returns
   │
   └─→ Frontend receives: { id, amount, type, ... }

6. State updates
   │
   ├─→ setLoading(false)
   ├─→ setShowAddTransaction(false)
   └─→ fetchData() [refresh goals]

7. Component re-renders
   │
   ├─→ New goal.currentAmount loaded
   ├─→ Progress bar recalculates
   ├─→ Framer Motion animates progress
   └─→ UI shows Rp X,XXX,000

8. Visual Feedback
   │
   └─→ Success animation + updated UI
```

---

## 🔄 State Management Flow

```
FRONTEND STATE MANAGEMENT:

localStorage
├─ token (JWT)
├─ user (object)
│  └─ { id, email, name }
└─ [persists across sessions]

DashboardPage State:
├─ goals (Goal[])
├─ sharedGoals (SharedGoal[])
├─ invitations (Invitation[])
├─ loading (boolean)
├─ activeTab ('individual' | 'shared')
└─ showCreateModal (boolean)

Component States:
├─ LoginPage: email, password, error, loading
├─ GoalCard: showAddTransaction, loading
├─ CreateGoalModal: formData, error, loading
└─ AddTransactionModal: amount, type, loading

API Calls (axios):
├─ authAPI.login/register
├─ goalsAPI.create/read/update/delete
├─ goalsAPI.addTransaction
└─ sharedGoalsAPI.create/accept/reject
```

---

## 🗄️ Database Relationships

```
Users (1) ──── (many) Goals
│
├─ User creates individual goals
├─ User creates shared goals
├─ User is member of shared goals
└─ User makes transactions

Goals (1) ──── (0 or 1) SharedGoals
│
├─ Individual goal: no SharedGoal
└─ Shared goal: has SharedGoal

SharedGoals (1) ──── (many) SharedGoalMembers
│
└─ Each shared goal has multiple members

SharedGoals (1) ──── (many) GoalInvitations
│
├─ Track who was invited
└─ Status: PENDING, ACCEPTED, REJECTED

Goals (1) ──── (many) Transactions
│
├─ Each goal has income transactions
└─ Each goal has withdrawal transactions

Users (1) ──── (many) Transactions
│
└─ Track who made each transaction
```

---

## 🎬 Page Navigation Map

```
       ┌──────────────────┐
       │   Landing Page   │
       │  (if not auth)   │
       └────────┬─────────┘
                │
           ┌────┴────┐
           │          │
           ▼          ▼
    ┌────────────┐ ┌────────────┐
    │ LoginPage  │ │RegisterPage│
    │ (existing) │ │  (new user)│
    └─────┬──────┘ └──────┬─────┘
          │                │
          └────────┬───────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  DashboardPage       │
        │  (main app)          │
        └──────────┬───────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
    ┌──────────────┐    ┌───────────────┐
    │Individual    │    │Shared Goals   │
    │Goals Tab     │    │Tab            │
    │              │    │               │
    │+ Buat Tujuan │    │+ Buat Tujuan  │
    │- Goal cards  │    │- Undangan     │
    │- + Tambah    │    │- Goal cards   │
    │- Details     │    │- + Tambah     │
    │- Delete      │    │- Details      │
    └──────────────┘    │- Delete       │
                        └───────────────┘

Modals (overlays):
├─ CreateGoalModal
│  └─ Triggered by "Buat Tujuan" button
├─ AddTransactionModal
│  └─ Triggered by "+ Tambah" button
└─ InvitationsPanel
   └─ Shows on Dashboard if invitations pending
```

---

## ⏱️ Typical User Session Timeline

```
TIME    USER A              USER B
────────────────────────────────────
T0      Opens app           
        ↓
        Logs in
        ↓
        Sees Dashboard
        
T1                         Opens app
                            ↓
                            Logs in
                            ↓
                            Sees Dashboard
                            ↓
                            No invitations yet

T2      Clicks "Buat Tujuan"
        ↓
        Creates "Liburan Bali"
        ↓
        Type: Bersama
        ↓
        Invites userb@test.com
        ↓
        Goal created ✓

T3                         Refreshes page
                            ↓
                            Sees invitation! 📬
                            ↓
                            Clicks "Terima"
                            ↓
                            Added to goal

T4      Clicks "+ Tambah"
        ↓
        Adds Rp 50,000
        ↓
        Progress: 50%

T5                         Adds Rp 30,000
                            ↓
                            Both see: Rp 80k
                            ↓
                            Progress: 80%

T6      Both view dashboard
        - See shared goal
        - See members
        - See total: Rp 80k
        - See contributions
```

---

## 🔐 Authentication Token Flow

```
┌─────────────────────────────────────┐
│ User logs in                        │
└────────────┬────────────────────────┘
             │
             ▼
    ┌───────────────────────┐
    │ Backend verifies      │
    │ email & password      │
    └────────┬──────────────┘
             │
             ▼
    ┌─────────────────────────────────┐
    │ Generate JWT token              │
    │ sign({                          │
    │   id: "user123",                │
    │   email: "user@test.com"        │
    │ }, SECRET, {                    │
    │   expiresIn: "7d"               │
    │ })                              │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────┐
    │ Return token to frontend        │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────┐
    │ Frontend stores in localStorage │
    │ localStorage.token = TOKEN      │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────┐
    │ Subsequent API calls            │
    │ Headers: {                      │
    │   "Authorization": "Bearer {}" │
    │ }                               │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────┐
    │ Backend middleware verifies     │
    │ token signature & expiration    │
    └────────┬──────────────────────────┘
             │
        ┌────┴─────┐
        │           │
      VALID       EXPIRED/
        │         INVALID
        │           │
        ▼           ▼
      GRANT       REJECT
      ACCESS      (401)
      (200)
```

---

## 📱 Responsive Design Breakpoints

```
Mobile (< 768px):
├─ Single column layout
├─ Stack components vertically
├─ Full-width buttons
├─ Larger touch targets (44px+)
└─ Simplified navigation

Tablet (768px - 1024px):
├─ 2 column grid
├─ Balanced spacing
├─ Medium-sized buttons
└─ Adaptive navigation

Desktop (> 1024px):
├─ 3 column grid
├─ Generous spacing
├─ Normal button sizes
└─ Full navigation
```

---

**Visual Guide Complete! 🎨**

Use these diagrams to understand the flow and structure of the application.
