# KMIT Club Hub

A comprehensive club management system for Keshav Memorial Institute of Technology.

## Features

### Public Pages (No Login Required)
- **Home Page**: Welcome page with club overview and recent events
- **Images/Gallery**: View photos from events and activities
- **Calendar**: Interactive calendar showing upcoming events

### Authentication System
- **Role-Based Login**: Separate login for Student, Coordinator, and Admin roles
- **Role Selection**: Users first select their role, then login
- **Separate Collections**: Each role has its own MongoDB collection
- **Simplified Student Registration**: Only requires name, email, roll number, and password
- **Secure Authentication**: JWT-based authentication with proper password hashing

### User Roles

#### Student
- **Simple Registration**: Name, email, roll number, and password only
- **Collection**: `students` in MongoDB
- View clubs and events
- Request club membership
- Register for events
- Access student dashboard

#### Coordinator
- **Collection**: `coordinators` in MongoDB
- Manage club details
- Create and manage events
- Handle membership requests
- Access coordinator dashboard

#### Admin
- **Collection**: `admins` in MongoDB
- Full system access
- Approve events and clubs
- Manage all users
- Access admin dashboard

## Application Structure

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation with Home, Images, Calendar, Login
│   │   ├── ClubCard.jsx        # Club display cards
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── pages/
│   │   ├── Home.jsx           # Public home page
│   │   ├── RoleSelect.jsx     # Role selection before login
│   │   ├── Login.jsx          # Role-specific login page
│   │   ├── Signup.jsx         # Simplified student registration
│   │   ├── Images.jsx         # Gallery page
│   │   ├── Calendar.jsx       # Event calendar
│   │   └── ClubDetail.jsx     # Club details (requires login)
│   └── context/
│       └── AuthContext.jsx    # Authentication state management
```

### Backend (Node.js + Express)
```
backend/
├── controllers/
│   ├── authController.js      # Role-based authentication logic
│   ├── clubController.js      # Club management
│   └── eventController.js     # Event management
├── models/
│   ├── Student.js            # Student model (students collection)
│   ├── Coordinator.js        # Coordinator model (coordinators collection)
│   ├── Admin.js              # Admin model (admins collection)
│   ├── Club.js               # Club model
│   └── Event.js              # Event model
├── routes/
│   ├── authRoutes.js         # Authentication endpoints
│   ├── clubRoutes.js         # Club endpoints
│   └── eventRoutes.js        # Event endpoints
└── utils/
    └── middleware.js         # Authentication middleware
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/kmit-club-hub
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

5. **Seed Test Users** (Optional)
   ```bash
   cd backend
   node seed-users.js
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Start the frontend development server**
```bash
   cd frontend
npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration (simplified)
- `POST /api/auth/login` - Role-based login (requires role parameter)
- `GET /api/auth/profile` - Get user profile (protected)

### Clubs
- `GET /api/clubs` - Get all clubs
- `GET /api/clubs/:id` - Get club by ID
- `POST /api/clubs` - Create club (admin only)
- `POST /api/clubs/:clubId/join` - Request membership (student only)

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (coordinator only)
- `POST /api/events/:eventId/register` - Register for event (student only)

## Authentication Flow

1. **Public Access**: Users can browse Home, Images, and Calendar without login
2. **Login Process**: 
   - Click "Login" in navbar → Role selection page
   - Select role (Student/Coordinator/Admin) → Login form for that role
   - Enter credentials → Role-specific dashboard
3. **Registration**: Students can sign up with minimal information
4. **Protected Access**: Club details and dashboards require authentication
5. **Role-Based Routing**: After login, users are redirected to their appropriate dashboard
6. **Session Management**: JWT tokens are stored in localStorage for persistent sessions

## Student Registration Form

The student registration form is simplified and only requires:
- **Full Name**: Student's complete name
- **Email Address**: Valid email for account access
- **Roll Number**: Student's unique roll number
- **Password**: Secure password (minimum 6 characters)
- **Confirm Password**: Password confirmation

## Database Collections

### Students Collection
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  rollNo: String (unique),
  createdAt: Date
}
```

### Coordinators Collection
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  club: String,
  createdAt: Date
}
```

### Admins Collection
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  createdAt: Date
}
```

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Role-based access control
- Separate collections for each role
- Protected routes with automatic redirects
- Input validation and sanitization
- Duplicate email prevention across all collections
- Duplicate roll number prevention for students

## Test Users

After running the seed script, you can test with these credentials:

### Students
- `test.student1@kmit.com` / `password123`
- `test.student2@kmit.com` / `password123`

### Coordinators
- `test.coordinator1@kmit.com` / `password123`
- `test.coordinator2@kmit.com` / `password123`

### Admins
- `test.admin1@kmit.com` / `password123`
- `test.admin2@kmit.com` / `password123`

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **File Upload**: express-fileupload
- **Validation**: express-validator
