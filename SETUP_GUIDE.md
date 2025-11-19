# 🚀 SETUP LENGKAP - Tabungan Bersama

## Step 1: Download & Explore Project

```bash
# Dari folder project
cd c:\laragon\www\tabungan

# Lihat struktur
ls
```

**File-file penting:**
- `README.md` - Dokumentasi lengkap
- `QUICKSTART.md` - Setup cepat
- `DATABASE_SETUP.md` - Setup database
- `API_DOCUMENTATION.md` - API reference
- `ARCHITECTURE.md` - Technical guide

---

## Step 2: Install Dependencies

### Backend Dependencies

```bash
cd c:\laragon\www\tabungan\backend

# Install npm packages
npm install

# Expected packages:
# ✓ express
# ✓ cors
# ✓ dotenv
# ✓ jsonwebtoken
# ✓ bcryptjs
# ✓ prisma
# ✓ @prisma/client
```

### Frontend Dependencies

```bash
cd c:\laragon\www\tabungan\frontend

# Install npm packages
npm install

# Expected packages:
# ✓ react
# ✓ react-dom
# ✓ react-router-dom
# ✓ axios
# ✓ framer-motion
# ✓ tailwindcss
```

---

## Step 3: Database Setup

### Option A: PostgreSQL (Recommended for Production)

**1. Install PostgreSQL**
- Download dari: https://www.postgresql.org/download/windows/
- Jalankan installer
- Ingat password untuk user `postgres`

**2. Buat Database**
```bash
# Buka Command Prompt / PowerShell
psql -U postgres

# Jalankan di PostgreSQL prompt:
CREATE DATABASE tabungan;
\q
```

**3. Update Backend .env**
```bash
cd c:\laragon\www\tabungan\backend

# Edit file .env (buat dari .env.example)
# Pastikan DATABASE_URL sesuai:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/tabungan"
```

### Option B: SQLite (Recommended for Quick Start)

**Lebih mudah - tidak perlu setup!**

**Edit `backend/.env`:**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_key_dev"
PORT=5000
NODE_ENV="development"
```

SQLite akan create file `dev.db` secara otomatis.

---

## Step 4: Prisma Setup

```bash
cd c:\laragon\www\tabungan\backend

# Generate Prisma Client
npx prisma generate

# Buat & jalankan migration
npx prisma migrate dev --name init

# Output should show:
# ✓ Created ./prisma/migrations/...
# ✓ Successfully created 7 tables
```

---

## Step 5: Mulai Development Servers

### Terminal 1 - Backend

```bash
cd c:\laragon\www\tabungan\backend
npm run dev

# Output expected:
# 🚀 Server running on http://localhost:5000
# ✓ Connected to database
```

### Terminal 2 - Frontend

```bash
cd c:\laragon\www\tabungan\frontend
npm run dev

# Output expected:
# ✓ Vite dev server running at:
# ➜  Local:   http://localhost:3000
```

**Buka browser ke:** `http://localhost:3000` ✅

---

## Step 6: Test User Flow

### User A - Create Shared Goal

1. **Register**
   - Email: `usera@test.com`
   - Name: `User A`
   - Password: `password123`

2. **Login**
   - Email: `usera@test.com`
   - Password: `password123`

3. **Create Shared Goal**
   - Click: "Buat Tujuan Baru"
   - Tipe: Select "Bersama"
   - Judul: "Liburan Bersama ke Bali"
   - Target: 10000000 (Rp)
   - Target Date: [Pick 3 months from now]
   - Email Diundang: `userb@test.com`
   - Click: "Buat Tujuan"

4. **Add Transaction**
   - Click: "+ Tambah" di goal card
   - Type: INCOME ➕
   - Amount: 5000000
   - Note: "Uang gaji Januari"
   - Click: "Simpan"

---

### User B - Accept Invitation

1. **Register**
   - Email: `userb@test.com`
   - Name: `User B`
   - Password: `password123`

2. **Login**
   - Email: `userb@test.com`
   - Password: `password123`

3. **Accept Invitation**
   - Lihat panel "📬 Undangan Tabungan Bersama"
   - Click: "✓ Terima"
   - Goal sekarang muncul di tab "👥 Tujuan Bersama"

4. **Add Contribution**
   - Click: "+ Tambah" di shared goal card
   - Type: INCOME ➕
   - Amount: 3000000
   - Note: "Uang tabungan Januari"
   - Click: "Simpan"

---

### Verify Results

✅ **Dashboard A (User A)**
- Tab "Tujuan Bersama" shows goal
- Members: User A 👑, User B
- Total: Rp 8,000,000 (5M + 3M)
- Progress: ~80% (8M / 10M)

✅ **Dashboard B (User B)**
- Tab "Tujuan Bersama" shows same goal
- Members: User A 👑, User B
- Total: Rp 8,000,000
- Contributions visible

---

## Step 7: Fitur yang Bisa Ditest

### Individual Goals
```
✓ Create goal
✓ Add income
✓ Add withdrawal
✓ Edit goal
✓ Delete goal
✓ View progress
```

### Shared Goals
```
✓ Create shared goal
✓ Invite multiple users
✓ Receive & accept invitations
✓ View shared members
✓ Add shared transactions
✓ See combined progress
✓ Creator can edit/delete
```

### Authentication
```
✓ Register
✓ Login
✓ Logout
✓ Token persistence
✓ Protected routes
```

---

## 🛠️ Troubleshooting Guide

### Problem: "Cannot find module 'react'"

**Solution:**
```bash
cd frontend
npm install
```

### Problem: Database connection error

**Check:**
1. PostgreSQL running? `pg_ctl status`
2. DATABASE_URL correct? Check `.env`
3. Try SQLite: `DATABASE_URL="file:./dev.db"`

### Problem: Port already in use

**Port 3000:**
```bash
# Kill process
lsof -i :3000
kill -9 <PID>
```

**Port 5000:**
```bash
# Kill process
lsof -i :5000
kill -9 <PID>
```

### Problem: Prisma migration error

**Solution:**
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Problem: Frontend doesn't connect to backend

**Check:**
1. Backend running di port 5000?
2. CORS enabled? (Yes, in backend setup)
3. Check network tab di DevTools
4. Try: `http://localhost:5000/api/health`

---

## 📊 Browser DevTools

### Check API Calls
1. Open DevTools (F12)
2. Go to Network tab
3. Login to see POST request
4. Check response status

### Check Storage
1. Open DevTools (F12)
2. Go to Application tab
3. localStorage → see `token` and `user`

### Console Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Any red errors? Check logs

---

## 🎯 Next Steps (Enhancement Ideas)

- [ ] Add Redux for state management
- [ ] WebSocket for real-time updates
- [ ] Email notifications
- [ ] File upload for receipts
- [ ] Charts/analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Payment integration

---

## 📞 Support

**Masalah? Cek:**
1. Terminal error messages
2. Browser console (F12)
3. Check `.env` configuration
4. Documentation files
5. DATABASE_SETUP.md
6. API_DOCUMENTATION.md

---

## ✅ Checklist

- [ ] Dependencies installed (backend)
- [ ] Dependencies installed (frontend)
- [ ] .env created & configured
- [ ] Database setup done
- [ ] Prisma migration successful
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 3000)
- [ ] Can register account
- [ ] Can login
- [ ] Can create goal
- [ ] Can create shared goal
- [ ] Can invite user
- [ ] Can accept invitation
- [ ] Can add transaction
- [ ] Can see updated progress

---

## 🎉 Selamat!

Aplikasi **Tabungan Bersama** sudah siap digunakan!

Mulai wujudkan impian bersama-sama! 💰✨

**Happy Saving! 🚀**
