# API Documentation

## 📡 REST API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## 🎯 Goals Endpoints

### Create Goal
```http
POST /goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Liburan ke Bali",
  "description": "Liburan keluarga 1 minggu",
  "targetAmount": 5000000,
  "targetDate": "2024-06-30T00:00:00Z"
}
```

**Response (201):**
```json
{
  "id": "goal-uuid",
  "title": "Liburan ke Bali",
  "description": "Liburan keluarga 1 minggu",
  "targetAmount": 5000000,
  "currentAmount": 0,
  "targetDate": "2024-06-30T00:00:00Z",
  "type": "INDIVIDUAL",
  "createdBy": "user-uuid",
  "createdAt": "2024-01-15T10:30:00Z",
  "transactions": []
}
```

---

### Get All Goals
```http
GET /goals
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "goal-uuid",
    "title": "Liburan ke Bali",
    "targetAmount": 5000000,
    "currentAmount": 1500000,
    "type": "INDIVIDUAL",
    ...
  }
]
```

---

### Get Goal Detail
```http
GET /goals/:id
Authorization: Bearer <token>
```

---

### Update Goal
```http
PUT /goals/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Liburan ke Lombok",
  "targetAmount": 4000000,
  "targetDate": "2024-07-15T00:00:00Z"
}
```

---

### Delete Goal
```http
DELETE /goals/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Goal deleted successfully"
}
```

---

### Add Transaction
```http
POST /goals/:id/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000,
  "type": "INCOME",
  "note": "Gaji bulan Januari"
}
```

**Response (201):**
```json
{
  "id": "transaction-uuid",
  "goalId": "goal-uuid",
  "userId": "user-uuid",
  "amount": 50000,
  "type": "INCOME",
  "note": "Gaji bulan Januari",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## 👥 Shared Goals Endpoints

### Create Shared Goal
```http
POST /shared-goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Liburan Bersama",
  "description": "Liburan dengan teman",
  "targetAmount": 10000000,
  "targetDate": "2024-06-30T00:00:00Z",
  "invitedEmails": ["userb@test.com", "userc@test.com"]
}
```

**Response (201):**
```json
{
  "goal": {
    "id": "goal-uuid",
    "title": "Liburan Bersama",
    ...
  },
  "sharedGoal": {
    "id": "shared-goal-uuid",
    "goalId": "goal-uuid"
  },
  "invitations": [
    {
      "id": "invitation-uuid",
      "sharedGoalId": "shared-goal-uuid",
      "invitedEmail": "userb@test.com",
      "status": "PENDING",
      "expiresAt": "2024-01-22T10:30:00Z"
    }
  ]
}
```

---

### Get Shared Goals
```http
GET /shared-goals
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "shared-goal-uuid",
    "goalId": "goal-uuid",
    "goal": {
      "id": "goal-uuid",
      "title": "Liburan Bersama",
      "targetAmount": 10000000,
      "currentAmount": 2000000,
      "type": "SHARED"
    },
    "members": [
      {
        "id": "member-uuid",
        "userId": "user-uuid",
        "user": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@test.com"
        },
        "role": "creator"
      },
      {
        "id": "member-uuid-2",
        "userId": "user-uuid-2",
        "user": {
          "id": "user-uuid-2",
          "name": "Jane Doe",
          "email": "jane@test.com"
        },
        "role": "member"
      }
    ]
  }
]
```

---

### Get Pending Invitations
```http
GET /shared-goals/invitations
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "invitation-uuid",
    "sharedGoalId": "shared-goal-uuid",
    "invitedEmail": "userb@test.com",
    "invitedByUserId": "creator-uuid",
    "status": "PENDING",
    "expiresAt": "2024-01-22T10:30:00Z",
    "sharedGoal": {
      "id": "shared-goal-uuid",
      "goal": {
        "id": "goal-uuid",
        "title": "Liburan Bersama",
        "targetAmount": 10000000
      },
      "members": [...]
    }
  }
]
```

---

### Accept Invitation
```http
POST /shared-goals/invitations/:id/accept
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "invitation-uuid",
  "status": "ACCEPTED",
  "acceptedAt": "2024-01-15T11:00:00Z",
  "sharedGoal": {
    ...
  }
}
```

---

### Reject Invitation
```http
POST /shared-goals/invitations/:id/reject
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "invitation-uuid",
  "status": "REJECTED"
}
```

---

## ❌ Error Responses

### Unauthorized (401)
```json
{
  "error": "No token provided"
}
```

### Forbidden (403)
```json
{
  "error": "Not authorized to update this goal"
}
```

### Not Found (404)
```json
{
  "error": "Goal not found"
}
```

### Validation Error (400)
```json
{
  "error": "Missing required fields"
}
```

### Conflict (409)
```json
{
  "error": "Email already registered"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error"
}
```

---

## 🧪 Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Get Current User
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create Goal
curl -X POST http://localhost:5000/api/goals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Goal","targetAmount":1000000,"targetDate":"2024-12-31T00:00:00Z"}'
```

---

## 📚 Query Parameters

### Pagination (untuk future enhancement)
```
GET /goals?page=1&limit=10
```

### Filtering
```
GET /goals?type=SHARED
```

### Sorting
```
GET /goals?sort=createdAt&order=desc
```

---

**API Documentation Complete! 🚀**
