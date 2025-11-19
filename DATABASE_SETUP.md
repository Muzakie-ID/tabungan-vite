# Tabungan Bersama - Panduan Database Setup

## 🗄️ PostgreSQL Setup

### Windows (Using PostgreSQL Installer)

1. **Download & Install**
   - Download dari https://www.postgresql.org/download/windows/
   - Jalankan installer
   - Set password untuk user `postgres`
   - Default port: 5432

2. **Verify Installation**
   ```bash
   psql --version
   ```

3. **Create Database**
   ```bash
   psql -U postgres
   CREATE DATABASE tabungan;
   \q
   ```

### Alternative: Using SQLite (Lebih Mudah untuk Development)

Edit `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
```

SQLite tidak perlu setup khusus!

---

## 🔧 Prisma Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed data
npx prisma db seed
```

---

## 👀 Lihat Database dengan Prisma Studio

```bash
cd backend
npx prisma studio
```
Buka browser ke `http://localhost:5555`

---

## 📋 Database Schema Summary

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Goals Table
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  targetAmount BIGINT NOT NULL,
  currentAmount BIGINT DEFAULT 0,
  targetDate TIMESTAMP NOT NULL,
  type VARCHAR DEFAULT 'INDIVIDUAL',
  createdBy UUID REFERENCES users(id)
);

-- SharedGoals Table
CREATE TABLE shared_goals (
  id UUID PRIMARY KEY,
  goalId UUID UNIQUE REFERENCES goals(id)
);

-- SharedGoalMembers Table
CREATE TABLE shared_goal_members (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES users(id),
  sharedGoalId UUID REFERENCES shared_goals(id)
);

-- GoalInvitations Table
CREATE TABLE goal_invitations (
  id UUID PRIMARY KEY,
  sharedGoalId UUID REFERENCES shared_goals(id),
  invitedEmail VARCHAR NOT NULL,
  invitedByUserId UUID REFERENCES users(id),
  status VARCHAR DEFAULT 'PENDING',
  expiresAt TIMESTAMP NOT NULL
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  goalId UUID REFERENCES goals(id),
  userId UUID REFERENCES users(id),
  amount BIGINT NOT NULL,
  type VARCHAR NOT NULL,
  note TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## 🔗 Connection Strings

### PostgreSQL Local
```
postgresql://username:password@localhost:5432/tabungan
```

### PostgreSQL Remote (Render/Railway)
```
postgresql://user:password@host:port/database
```

### SQLite Local
```
file:./dev.db
```

### MongoDB (jika ingin switch)
```
mongodb+srv://user:password@cluster.mongodb.net/tabungan
```

---

## 🧪 Test Data

```bash
# Insert test users (dari terminal PostgreSQL)
psql -U postgres -d tabungan

INSERT INTO users (id, email, name, password) VALUES
('1', 'usera@test.com', 'User A', '$2a$10$...');
('2', 'userb@test.com', 'User B', '$2a$10$...');
```

---

## 🆘 Troubleshooting

| Error | Fix |
|-------|-----|
| connection refused | PostgreSQL tidak running, jalankan: `pg_ctl -D "C:\Program Files\PostgreSQL\data" start` |
| role "postgres" does not exist | Reinstall PostgreSQL dengan option create user |
| database does not exist | Jalankan: `CREATE DATABASE tabungan;` |
| permission denied | Check user privileges atau use `ALTER ROLE postgres SUPERUSER;` |

---

## 🚀 Advanced: Database Backups

```bash
# Backup
pg_dump -U postgres -h localhost tabungan > backup.sql

# Restore
psql -U postgres -d tabungan < backup.sql
```

---

**Database sudah siap! 🎉**
