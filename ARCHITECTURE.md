# Architecture & Development Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  - Components (Goal, Modal, Invitation)                     │
│  - Pages (Login, Register, Dashboard)                       │
│  - API Client (axios)                                       │
│  - State Management (localStorage)                          │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP (REST API)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express + TypeScript)                 │
│  - Routes (auth, goals, shared-goals)                       │
│  - Middleware (authentication)                              │
│  - Controllers (business logic)                             │
│  - Database (Prisma ORM)                                    │
└────────────────────┬────────────────────────────────────────┘
                     │ Prisma
                     ▼
┌─────────────────────────────────────────────────────────────┐
│        Database (PostgreSQL / SQLite)                       │
│  - Users, Goals, SharedGoals, Transactions, Invitations     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

### Backend
```
backend/
├── src/
│   ├── server.ts              # Entry point
│   ├── middleware/
│   │   └── auth.middleware.ts # JWT verification
│   └── routes/
│       ├── auth.routes.ts     # /api/auth
│       ├── goal.routes.ts     # /api/goals
│       └── sharedGoal.routes.ts # /api/shared-goals
├── prisma/
│   └── schema.prisma          # Data models
├── package.json
└── tsconfig.json
```

### Frontend
```
frontend/
├── src/
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   ├── index.css              # Tailwind + custom
│   ├── api/
│   │   └── auth.ts            # API client
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── DashboardPage.tsx
│   └── components/
│       ├── CreateGoalModal.tsx
│       ├── GoalCard.tsx
│       ├── AddTransactionModal.tsx
│       └── InvitationsPanel.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## 🔄 Data Flow

### Authentication Flow
```
1. User Input (Email, Password)
           ↓
2. Frontend: POST /auth/login
           ↓
3. Backend: Verify credentials
           ↓
4. Generate JWT Token
           ↓
5. Frontend: Store token in localStorage
           ↓
6. Set Authorization header for future requests
```

### Goal Creation Flow (Shared)
```
1. User fills form (title, target, invites)
           ↓
2. Frontend: POST /shared-goals
           ↓
3. Backend:
   - Create Goal (type: SHARED)
   - Create SharedGoal entry
   - Add creator as member
   - Create invitations (PENDING)
           ↓
4. Frontend: Display success message
           ↓
5. User B receives notification
```

### Transaction Flow
```
1. User clicks "+ Tambah"
           ↓
2. Modal opens for amount & type
           ↓
3. Frontend: POST /goals/:id/transactions
           ↓
4. Backend:
   - Create Transaction record
   - Update Goal currentAmount
           ↓
5. Frontend: Refresh data & update UI
           ↓
6. Real-time progress update (if WebSocket implemented)
```

---

## 🔐 Security Implementation

### JWT Authentication
```typescript
// Token generation
const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Middleware verification
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.id;
};
```

### Password Hashing
```typescript
// Registration
const hashedPassword = await bcrypt.hash(password, 10);

// Login
const isValid = await bcrypt.compare(password, user.password);
```

### Authorization
```typescript
// Check if user owns the goal
if (goal.createdBy !== req.userId) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

---

## 🎨 Component Architecture

### GoalCard Component
```
GoalCard
├── Header (title, type icon)
├── Progress Bar (animated)
├── Details (target amount, dates)
├── Members (if shared)
└── Actions (Add, Detail, Delete buttons)
```

### CreateGoalModal Component
```
CreateGoalModal
├── Title & Close button
├── Form Inputs
│   ├── Goal type (radio)
│   ├── Title
│   ├── Description
│   ├── Target amount
│   ├── Target date
│   └── Invited emails (conditional)
└── Submit button
```

### DashboardPage Component
```
DashboardPage
├── Header (logout)
├── Invitations Panel (conditional)
├── Tabs (Individual / Shared)
├── Create Goal Button
└── Goals Grid
    └── GoalCard[] (map)
```

---

## 🧪 Testing Strategy

### Unit Tests (Frontend)
```typescript
// Example: GoalCard component
describe('GoalCard', () => {
  it('should display goal title', () => {
    render(<GoalCard goal={mockGoal} />);
    expect(screen.getByText('Liburan')).toBeInTheDocument();
  });

  it('should calculate correct progress', () => {
    // Progress = (current / target) * 100
    // 1500000 / 5000000 = 30%
  });
});
```

### Integration Tests (Backend)
```typescript
// Example: Create goal endpoint
describe('POST /goals', () => {
  it('should create goal with valid token', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${token}`)
      .send(goalData);
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
```

### E2E Tests (Full Flow)
```typescript
// Cypress example
describe('Shared Goal Flow', () => {
  it('should complete full workflow', () => {
    // Login A
    // Create shared goal
    // Login B
    // Accept invitation
    // Add transactions
    // Verify totals
  });
});
```

---

## 🚀 Performance Optimization

### Frontend
- **Code Splitting**: React.lazy() for route-based splitting
- **Image Optimization**: SVG icons instead of PNGs
- **Caching**: localStorage for persistent data
- **Debouncing**: Avoid duplicate API calls
- **Memoization**: React.memo for expensive components

### Backend
- **Database Indexing**: INDEX on frequently queried fields
- **Connection Pooling**: Prisma client reuse
- **Query Optimization**: Select only needed fields
- **Pagination**: Limit response size
- **Caching**: Redis for session data (future)

---

## 📊 Database Optimization

### Indexes
```sql
-- Add these for better query performance
CREATE INDEX idx_goals_created_by ON goals(created_by);
CREATE INDEX idx_shared_goal_members_user_id ON shared_goal_members(user_id);
CREATE INDEX idx_transactions_goal_id ON transactions(goal_id);
CREATE INDEX idx_goal_invitations_email ON goal_invitations(invited_email);
```

### Query Optimization
```typescript
// ❌ Bad: N+1 problem
const goals = await prisma.goal.findMany();
for (const goal of goals) {
  const txns = await prisma.transaction.findMany({
    where: { goalId: goal.id }
  });
}

// ✅ Good: Single query with include
const goals = await prisma.goal.findMany({
  include: { transactions: true }
});
```

---

## 🔄 State Management

### Current: localStorage (Simple)
```typescript
// Store
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Retrieve
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));
```

### Future Enhancement: Redux or Zustand
```typescript
// Redux example
const user = useSelector(state => state.auth.user);
const dispatch = useDispatch();
dispatch(setUser(userData));
```

---

## 🛠️ Development Workflow

### Adding a New Feature

1. **Backend**
   ```bash
   # 1. Update schema.prisma
   # 2. Create migration
   npx prisma migrate dev --name add_feature
   # 3. Create route handler
   # 4. Add validation
   # 5. Test with Postman/cURL
   ```

2. **Frontend**
   ```bash
   # 1. Create API method in api/auth.ts
   # 2. Create component
   # 3. Add routing if needed
   # 4. Style with Tailwind
   # 5. Add Framer Motion animations
   # 6. Test in browser
   ```

---

## 📚 Code Standards

### TypeScript
```typescript
// Always use types
interface Goal {
  id: string;
  title: string;
  targetAmount: bigint; // Use bigint for money
}

// Use enums for fixed values
enum GoalType {
  INDIVIDUAL = 'INDIVIDUAL',
  SHARED = 'SHARED',
}
```

### React Components
```typescript
// Functional components with hooks
export default function MyComponent({ prop }: { prop: string }) {
  const [state, setState] = useState('');
  
  return (
    <div className="space-y-4">
      {/* Components */}
    </div>
  );
}
```

### Tailwind Classes
```jsx
// Use consistent spacing
className="p-4 mb-6"  // Good
className="padding: 16px; margin-bottom: 24px;"  // Bad

// Responsive design
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## 🐛 Debugging Tips

### Frontend
```javascript
// React DevTools extension
// Redux DevTools (if implemented)
// Console logging
console.log('Component state:', state);

// React Profiler
import { Profiler } from 'react';
```

### Backend
```typescript
// Prisma Studio
npx prisma studio

// Console logging
console.error('Error:', error);

// Postman for API testing
```

---

**Happy Development! 🎉**
