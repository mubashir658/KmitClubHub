# KMIT Club Hub Backend

## Database Structure

The application uses a single `User` model for all user types (admin, coordinator, student) with role-based access control.

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  rollNo: String (unique),
  email: String (unique),
  passwordHash: String,
  role: String (enum: ['student', 'coordinator', 'admin']),
  profilePhoto: String,
  year: Number (required for students),
  branch: String (required for students),
  clubs: [ObjectId] (references to Club),
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication System

### Admin Setup
1. Run the admin seed script to create the default admin user:
   ```bash
   npm run seed-admin
   ```
2. Default admin credentials:
   - Roll No: `ADMIN001`
   - Password: `admin123`
   - Email: `admin@kmit.in`

### User Registration
- **Students**: Can register themselves using the `/register` endpoint
- **Coordinators**: Created by admin using `/create-coordinator` endpoint
- **Admin**: Pre-seeded, no registration needed

### Login
All users (admin, coordinator, student) login using their roll number and password via the `/login` endpoint.

### Password Management
- Coordinators and students can change their passwords using `/change-password` endpoint
- Admin can create coordinators with temporary passwords that they can change later

## API Endpoints

### Public Routes
- `POST /auth/register` - Student registration
- `POST /auth/login` - User login

### Protected Routes
- `GET /auth/profile` - Get user profile
- `POST /auth/change-password` - Change password
- `POST /auth/create-coordinator` - Admin creates coordinator (admin only)

## Role-Based Access

### Admin
- Can create coordinators
- Full access to all features
- Can manage clubs and events

### Coordinator
- Can manage their assigned club
- Can create events for their club
- Can view club registrations

### Student
- Can register for events
- Can view clubs and events
- Can provide feedback

## Database Models

### Core Models
- `User` - Single model for all user types
- `Club` - Club information and coordinators
- `Event` - Club events with registrations
- `Feedback` - User feedback for clubs
- `Poll` - Club polls and voting
- `Notification` - User notifications
- `Gallery` - Club gallery images
- `StudentRegister` - Event registrations

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/kmitclubhub
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

3. Seed the admin user:
   ```bash
   npm run seed-admin
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## Security Features

- Password hashing using bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Unique constraints on email and roll number 