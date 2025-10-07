import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Images from "./pages/Images"
import Calendar from "./pages/Calendar"
import ClubDetail from "./pages/ClubDetail"
import StudentDashboard from "./pages/StudentDashboard"
import StudentProfile from "./pages/StudentProfile"
import StudentClubs from "./pages/StudentClubs"
import CoordinatorDashboard from "./pages/CoordinatorDashboard"
import CoordinatorMembers from "./pages/CoordinatorMembers"
import AdminDashboard from "./pages/AdminDashboard"
import AdminClubs from "./pages/AdminClubs"
import CreateCoordinator from "./pages/CreateCoordinator"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleSelect from "./pages/RoleSelect"
import StudentFeedback from "./pages/StudentFeedback"
import CoordinatorFeedback from "./pages/CoordinatorFeedback"
import AdminFeedback from "./pages/AdminFeedback"
import StudentPolls from "./pages/StudentPolls"
import CoordinatorPolls from "./pages/CoordinatorPolls"
import AdminPolls from "./pages/AdminPolls"
import CoordinatorEvents from "./pages/CoordinatorEvents"
import AdminEvents from "./pages/AdminEvents"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/images" element={<Images />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/clubs/:id" element={<ClubDetail />} />

              {/* Student Routes */}
              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Routes>
                      <Route path="dashboard" element={<StudentDashboard />} />
                      <Route path="" element={<StudentDashboard />} />
                      <Route path="clubs" element={<StudentClubs />} />
                      <Route path="calendar" element={<Calendar />} />
                      <Route path="feedback" element={<StudentFeedback />} />
                      <Route path="polls" element={<StudentPolls />} />
                      <Route path="profile" element={<StudentProfile />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Coordinator Routes */}
              <Route
                path="/coordinator/*"
                element={
                  <ProtectedRoute allowedRoles={["coordinator"]}>
                    <Routes>
                      <Route path="dashboard" element={<CoordinatorDashboard />} />
                      <Route path="" element={<CoordinatorDashboard />} />
                      <Route path="members" element={<CoordinatorMembers />} />
                      <Route path="events" element={<CoordinatorEvents />} />
                      <Route path="feedback" element={<CoordinatorFeedback />} />
                      <Route path="polls" element={<CoordinatorPolls />} />
                      <Route path="my-club" element={<CoordinatorMembers />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="" element={<AdminDashboard />} />
                      <Route path="create-coordinator" element={<CreateCoordinator />} />
                      <Route path="clubs" element={<AdminClubs />} />
                      <Route path="events" element={<AdminEvents />} />
                      <Route path="users" element={<AdminDashboard />} />
                      <Route path="feedback" element={<AdminFeedback />} />
                      <Route path="polls" element={<AdminPolls />} />
                      <Route path="analytics" element={<AdminDashboard />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Create Coordinator Route */}
              <Route
                path="/admin/create-coordinator"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <CreateCoordinator />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route for unmatched paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
