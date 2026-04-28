# KMIT Club Hub

A comprehensive, centralized club management system for Keshav Memorial Institute of Technology. Designed to streamline club activities, event registrations, and communication between students, club coordinators, and administrators.

## 🚀 Key Features

### User Roles & Authentication
- **Role-Based Access Control (RBAC):** Unified user management system supporting **Student**, **Coordinator**, and **Admin** roles.
- **Secure Authentication:** JWT-based authentication with bcrypt password hashing.
- **Role-Specific Dashboards:** Tailored UI experiences depending on the logged-in user's role.

### Club & Event Management
- **Centralized Hub:** View all active clubs, their descriptions, and executive teams.
- **Event Lifecycle:** Coordinators can propose events, Admins approve them, and Students register.
- **Dynamic Calendar:** Interactive calendar showing all upcoming, approved events.
- **Public & Private Galleries:** Curated image galleries for clubs.

### Communication & Engagement
- **Interactive Polls:** Clubs can create polls for members to vote and gather feedback.
- **Feedback System:** Dedicated channels for general inquiries, complaints, and appreciations.
- **Live Notifications:** Alerts for event updates, poll creations, and feedback responses.

### 🤖 Local AI RAG Chatbot
A standout feature of KMIT Club Hub is the built-in, fully local AI Assistant.
- Powered by `@xenova/transformers` running directly in the Node.js process.
- **No External Dependencies:** Uses an in-memory vector store (no need for Pinecone or external vector DBs).
- **Retrieval-Augmented Generation (RAG):** Automatically ingests live club data, event schedules, and FAQs from MongoDB, providing users with instant, accurate answers about campus activities.

---

## 🏗 System Architecture

KMIT Club Hub is built on the **MERN** stack (MongoDB, Express, React, Node.js).

### Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, CSS Modules, React Router, Context API.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas, Mongoose ODM.
- **AI / Machine Learning:** Hugging Face local pipelines (`all-MiniLM-L6-v2`).

### High-Level Flow
1. **Client Tier:** React SPA communicates with the backend via RESTful APIs.
2. **API Layer:** Express routes intercepted by JWT/Role-based middleware.
3. **Data Layer:** Mongoose models enforce schema validation and relationships.
4. **AI Layer:** A background chron-job synchronizes the MongoDB data with the local vector memory to keep chatbot responses up to date.

---

## 🛠 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Local or Atlas cluster)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KmitClubHub
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/kmitclubhub
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

---

## 🗄 Database Design

The system relies heavily on a relational structure implemented in NoSQL via Mongoose `ObjectIds`.
*   **Users:** Single collection governing Students, Coordinators, and Admins via the `role` enum.
*   **Clubs & Events:** Core entities. Clubs have a 1-to-Many relationship with Events.
*   **Engagement:** Polls, Feedback, and Gallery models link back to specific Clubs and Users.
*   **Transactions:** Collections like `LeaveRequest` and `MembershipApproval` track state changes.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---
*Developed for Keshav Memorial Institute of Technology.*
