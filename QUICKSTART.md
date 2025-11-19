# Tabungan Bersama - Quick Start Guide

## ⚡ Instalasi Cepat

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

**Edit `.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/tabungan"
JWT_SECRET="your_secret_key_12345"
PORT=5000
NODE_ENV="development"
```

**Setup Database:**
```bash
npx prisma migrate dev --name init
```

**Jalankan Server:**
```bash
npm run dev
```
✅ Backend siap di `http://localhost:5000`

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
✅ Frontend siap di `http://localhost:3000`

---

## 🧪 Test User Accounts

```
User A:
Email: usera@test.com
Password: password123

User B:
Email: userb@test.com
Password: password123
```

---

## 📝 Test Flow

1. **Buka 2 browser tabs** (atau private windows)
   - Tab 1: http://localhost:3000 (User A)
   - Tab 2: http://localhost:3000 (User B)

2. **User A:**
   - Login dengan usera@test.com
   - Klik "Buat Tujuan Baru"
   - Pilih "Bersama"
   - Isi form dan masukkan userb@test.com sebagai invitee
   - Klik "Buat Tujuan"

3. **User B:**
   - Login dengan userb@test.com
   - Lihat panel undangan dengan goal dari User A
   - Klik "Terima"
   - Goal sekarang muncul di tab "Tujuan Bersama"

4. **Kedua User:**
   - Klik "+ Tambah" di goal card
   - Tambah pemasukan (Income)
   - Lihat progress bar update real-time
   - Lihat kontribusi masing-masing

---

## 🎨 Features to Test

✅ **Authentication**
- Register akun baru
- Login
- Token persist

✅ **Goals**
- Create individual goals
- Create shared goals
- Edit goals
- Delete goals

✅ **Shared Features**
- Send invitations via email
- Accept/reject invitations
- Multi-member collaboration
- View member list

✅ **Transactions**
- Add income
- Add withdrawal
- View transaction history
- Real-time balance update

✅ **Animations**
- Page transitions
- Card hover effects
- Progress bar animations
- Modal animations

---

## 🔧 Common Commands

```bash
# Backend
npm run dev              # Start dev server
npm run build            # Build TypeScript
npm start                # Run compiled code

# Frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npx prisma studio       # Open Prisma GUI
npx prisma migrate dev   # Run migrations
npx prisma db push       # Sync with existing database
```

---

## 📊 Database Seeding (Optional)

```bash
# Buat file seed
# backend/prisma/seed.ts

# Run seed
npx prisma db seed
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 sudah terpakai | Ubah di vite.config.ts → server.port |
| Port 5000 sudah terpakai | Ubah di .env → PORT=5001 |
| Database connection error | Pastikan PostgreSQL running & DATABASE_URL benar |
| Module not found | Jalankan `npm install` di folder yang sesuai |
| Prisma error | Jalankan `npx prisma migrate dev` |

---

## 📱 Responsive Testing

```bash
# Frontend - Buka DevTools (F12)
# Klik toggle device toolbar (Ctrl+Shift+M)
# Test di berbagai ukuran layar:
# - iPhone 12 (390px)
# - iPad (768px)
# - Desktop (1920px)
```

---

## 🚀 Production Deployment

### Deploy Backend (Railway/Render)
1. Push code ke GitHub
2. Connect GitHub repo ke Railway/Render
3. Set environment variables
4. Auto-deploy on push

### Deploy Frontend (Vercel/Netlify)
1. Push code ke GitHub
2. Import repo ke Vercel/Netlify
3. Set build command: `npm run build`
4. Set output: `dist`

---

## 💡 Tips

- Use **Prisma Studio** untuk visualisasi database:
  ```bash
  npx prisma studio
  ```

- Check API calls di browser DevTools → Network tab

- Use **Redux DevTools** untuk state management (jika ditambahkan)

- Cache busting: Ctrl+Shift+R untuk hard refresh

---

## 📞 Support

Jika ada error:
1. Cek console (browser F12 atau terminal)
2. Check `.env` configuration
3. Pastikan database running
4. Baca error message dengan teliti

**Happy coding! 🎉**
