# Backend - EduHub (E-book Management System)

RESTful API for the EduHub platform, built with **Node.js**, **Express**, and **PostgreSQL**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure .env file (see Environment Variables below)

# Run development server
npm run dev

# Or run directly
node server.mjs
```

## 🧪 Test Users

| Role | Email | Password |
|------|-------|----------|
| Student | `student@test.com` | `Password@123` |
| Teacher | `teacher@test.com` | `Password@123` |
| Admin | `admin@test.com` | `Password@123` |

## ✨ Features

- **JWT Authentication** - Secure login, signup, password reset with OTP
- **Role-Based Access** - Student (0), Teacher (1), Admin (2)
- **Email Service** - SMTP integration for OTP and welcome emails
- **Admin APIs** - User management, statistics, role updates
- **Resource Management** - Books and notes upload/retrieval

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── routes/         # API route definitions
│   ├── model/          # PostgreSQL models
│   ├── middleware/     # Auth, error handling
│   ├── config/         # DB & env configuration
│   ├── mail/           # Email templates
│   └── utils/          # Helper functions
├── scripts/            # DB seeding scripts
└── server.mjs          # Entry point
```

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your_jwt_secret
PORT=8000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_NAME=EduHub
FROM_EMAIL=your_email@gmail.com
```

## 📜 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Send OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| GET | `/api/auth/me` | Get current user |
| DELETE | `/api/auth/me` | Delete account |
| GET | `/api/users` | List users (Admin) |
| GET | `/api/users/:id` | Get user details (Admin) |
