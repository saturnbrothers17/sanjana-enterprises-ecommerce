# Turso Database Setup Guide

## Prerequisites
1. Create a Turso account at [turso.tech](https://turso.tech)
2. Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`

## Setup Steps

### 1. Create a Database
```bash
turso db create sanjana-enterprises
```

### 2. Get Database URL
```bash
turso db show sanjana-enterprises --url
```

### 3. Create Auth Token
```bash
turso db tokens create sanjana-enterprises
```

### 4. Update Environment Variables
Update your `.env` file with the values from steps 2 and 3:

```env
# Turso Database Configuration
TURSO_DATABASE_URL=libsql://your-database-url-here
TURSO_AUTH_TOKEN=your-auth-token-here

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-here

# App Configuration
PORT=3000
NODE_ENV=development
```

### 5. Test the Connection
The application will automatically create the required tables when you start the server:

```bash
npm start
```

## Database Schema

The application will create the following tables:

### users
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `name` (TEXT NOT NULL)
- `email` (TEXT UNIQUE NOT NULL)
- `phone` (TEXT)
- `password` (TEXT NOT NULL) - bcrypt hashed
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### user_sessions
- `id` (TEXT PRIMARY KEY)
- `user_id` (INTEGER)
- `session_data` (TEXT)
- `expires_at` (DATETIME)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

## Features

✅ **Secure Authentication**
- Password hashing with bcrypt (12 rounds)
- Session-based authentication
- Input validation and sanitization
- SQL injection protection

✅ **User Registration**
- Email uniqueness validation
- Password strength requirements
- Phone number storage
- Terms & conditions agreement

✅ **User Login**
- Email/password authentication
- Session management
- Remember login state
- Redirect to intended page after login

✅ **Security Features**
- Environment variable configuration
- Secure session cookies
- Password visibility toggle
- CSRF protection ready

## Usage

1. Users can register with name, email, phone, and password
2. Passwords are securely hashed before storage
3. Login creates a session that persists across requests
4. User data is available in all templates via `req.user`
5. Protected routes redirect to login if not authenticated

## Admin Access

For testing, you can create an admin user by registering with any email and password. The system is ready for role-based access control if needed in the future.
