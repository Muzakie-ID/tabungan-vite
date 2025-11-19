# Tabungan Bersama - Shared Savings Goals Application

🎯 Aplikasi modern untuk mengelola tujuan tabungan bersama dengan fitur animasi dan design yang menarik.

## 🌟 Fitur Utama

✅ **Autentikasi & Registrasi** - Sistem login/signup dengan JWT  
✅ **Tujuan Pribadi** - Kelola tujuan tabungan individu  
✅ **Tujuan Bersama** - Buat dan kelola tabungan dengan teman/keluarga  
✅ **Undangan** - Sistem undangan dengan accept/reject  
✅ **Transaksi** - Catat pemasukan dan penarikan  
✅ **Progress Tracking** - Visualisasi progress dengan progress bar animasi  
✅ **Real-time Updates** - Dashboard dinamis dengan data terbaru  
✅ **Responsive Design** - Bekerja sempurna di mobile & desktop  
✅ **Smooth Animations** - Animasi dengan Framer Motion  

## 📋 User Flow

```
1. Pengguna A & B → Registrasi akun
2. A → Login & buat tujuan "Bersama" dengan invite B
3. B → Login & lihat undangan dari A
4. B → Accept undangan
5. A & B → Tambah pemasukan (A: 50k, B: 30k)
6. Keduanya → Lihat total (80k) & kontribusi masing-masing
7. A (creator) → Bisa edit/hapus tujuan
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (jsonwebtoken)
- **Password**: bcryptjs

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Routing**: React Router
- **HTTP Client**: Axios
- **Build Tool**: Vite

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm atau yarn
- PostgreSQL (atau database lainnya via Prisma)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi database

# Setup Prisma
npx prisma migrate dev --name init

# Run development server
npm run dev
# Server berjalan di http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Pastikan backend berjalan di port 5000
npm run dev
# Frontend berjalan di http://localhost:3000
```

## 📁 Struktur Project

```
tabungan/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   └── routes/
│   │       ├── auth.routes.ts
│   │       ├── goal.routes.ts
│   │       └── sharedGoal.routes.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── api/
│   │   │   └── auth.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   └── components/
│   │       ├── CreateGoalModal.tsx
│   │       ├── GoalCard.tsx
│   │       ├── AddTransactionModal.tsx
│   │       └── InvitationsPanel.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register        - Registrasi user
POST   /api/auth/login           - Login user
GET    /api/auth/me              - Get user info
```

### Goals (Pribadi)
```
POST   /api/goals                - Buat goal baru
GET    /api/goals                - Get all goals user
GET    /api/goals/:id            - Get goal detail
PUT    /api/goals/:id            - Update goal
DELETE /api/goals/:id            - Delete goal
POST   /api/goals/:id/transactions - Add transaction
```

### Shared Goals
```
POST   /api/shared-goals         - Buat shared goal + kirim undangan
GET    /api/shared-goals         - Get shared goals user
GET    /api/shared-goals/invitations - Get undangan pending
POST   /api/shared-goals/invitations/:id/accept - Accept undangan
POST   /api/shared-goals/invitations/:id/reject - Reject undangan
```

## 🎨 UI Components

- **LoginPage** - Form login dengan animasi smooth
- **RegisterPage** - Form registrasi dengan validation
- **DashboardPage** - Dashboard utama dengan tabs
- **GoalCard** - Card animasi untuk setiap goal
- **CreateGoalModal** - Modal untuk buat goal baru
- **AddTransactionModal** - Modal untuk tambah transaksi
- **InvitationsPanel** - Panel undangan dengan action buttons

## 🎯 Database Schema

### Users
```sql
- id (PK)
- email (UNIQUE)
- name
- password (hashed)
- createdAt
- updatedAt
```

### Goals
```sql
- id (PK)
- title
- description
- targetAmount
- currentAmount
- targetDate
- type (INDIVIDUAL | SHARED)
- createdBy (FK to Users)
```

### SharedGoals
```sql
- id (PK)
- goalId (FK to Goals)
```

### SharedGoalMembers
```sql
- id (PK)
- userId (FK to Users)
- sharedGoalId (FK to SharedGoals)
- role (creator | member)
```

### GoalInvitations
```sql
- id (PK)
- sharedGoalId (FK)
- invitedEmail
- invitedByUserId (FK)
- status (PENDING | ACCEPTED | REJECTED)
- expiresAt
```

### Transactions
```sql
- id (PK)
- goalId (FK)
- userId (FK)
- amount
- type (INCOME | WITHDRAWAL)
- note
- createdAt
```

## 🚀 Deployment

### Backend (Heroku/Railway)
```bash
cd backend
git init
npm install -g heroku
heroku login
heroku create app-name
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Upload dist folder ke Vercel atau Netlify
```

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing dengan bcryptjs
- ✅ CORS configuration
- ✅ Authorization checks on endpoints
- ✅ Input validation
- ✅ Secure token storage in localStorage

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/tabungan
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Backend
lsof -i :5000
kill -9 <PID>

# Frontend
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error
- Pastikan PostgreSQL running
- Check DATABASE_URL di .env
- Run: `npx prisma migrate dev`

### CORS Error
- Pastikan backend CORS setting benar
- Check API_URL di frontend

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 License

MIT License - Bebas untuk pembelajaran dan komersial

## 👨‍💻 Author

Created with ❤️ untuk memudahkan mengelola tabungan bersama

---

**Selamat menggunakan Tabungan Bersama! 💰✨**
