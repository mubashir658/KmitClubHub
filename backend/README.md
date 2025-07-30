# KMIT Club Hub Backend

Fresh, clean authentication system for KMIT Club Hub.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```env
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/kmit-club-hub?retryWrites=true&w=majority
   JWT_SECRET=kmit-secret-key-2024
   PORT=5000
   ```

3. **Start server:**
   ```bash
   npm run dev
   ```

4. **Test authentication:**
   ```bash
   node test-auth.js
   ```

## API Endpoints

- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login user (requires role)
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/health` - Health check

## Features

- ✅ Role-based authentication (Student, Coordinator, Admin)
- ✅ Separate MongoDB collections for each role
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ Error handling
- ✅ Clean, modular code structure

## Test Credentials

After running the test script, you can use:
- Email: `test@student.com`
- Password: `password123`
- Role: `student` 