"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const AdminDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [clubs, setClubs] = useState([])
  const [users, setUsers] = useState([])
  const [pendingEvents, setPendingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const path = location.pathname.split("/").pop()
    setActiveTab(path === "admin" ? "dashboard" : path)
  }, [location])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clubsRes, usersRes, eventsRes] = await Promise.all([
        axios.get("/api/clubs"),
        axios.get("/api/users"),
        axios.get("/api/events/admin/pending"),
      ])

      setClubs(clubsRes.data)
      setUsers(usersRes.data)
      setPendingEvents(eventsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventApproval = async (eventId, action) => {
    try {
      await axios.put(`/api/events/${eventId}/approve`, { action })
      alert(`Event ${action}d successfully!`)
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} event`)
    }
  }

  const DashboardHome = () => (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.name}! Manage the entire KMIT Club Hub here.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{clubs.length}</h3>
          <p>Total Clubs</p>
        </div>
        <div className={styles.statCard}>
          <h3>{users.filter((u) => u.role === "student").length}</h3>
          <p>Students</p>
        </div>
        <div className={styles.statCard}>
          <h3>{users.filter((u) => u.role === "coordinator").length}</h3>
          <p>Coordinators</p>
        </div>
        <div className={styles.statCard}>
          <h3>{pendingEvents.length}</h3>
          <p>Pending Events</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Pending Event Approvals</h2>
        {pendingEvents.length > 0 ? (
          <div className={styles.eventsList}>
            {pendingEvents.slice(0, 5).map((event) => (
              <div key={event._id} className={styles.eventItem}>
                <div className={styles.eventInfo}>
                  <h4>{event.title}</h4>
                  <p>
                    <strong>Club:</strong> {event.club.name}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Venue:</strong> {event.venue}
                  </p>
                </div>
                <div className={styles.eventActions}>
                  <button className={styles.approveBtn} onClick={() => handleEventApproval(event._id, "approve")}>
                    Approve
                  </button>
                  <button className={styles.rejectBtn} onClick={() => handleEventApproval(event._id, "reject")}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No pending events for approval.</p>
        )}
      </div>

      <div className={styles.section}>
        <h2>Recent Activity</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <p>New club registration requests: 2</p>
          </div>
          <div className={styles.activityItem}>
            <p>Active events this month: {pendingEvents.length + 5}</p>
          </div>
          <div className={styles.activityItem}>
            <p>Total student participation: 85%</p>
          </div>
        </div>
      </div>
    </div>
  )

  const ClubManagement = () => {
    const [clubForm, setClubForm] = useState({
      name: "",
      description: "",
      logoUrl: "",
      coordinatorId: "",
      highlights: "",
    })

    // Club Key Management State
    const [clubKeys, setClubKeys] = useState([]);
    const [showKey, setShowKey] = useState({});
    const [editKey, setEditKey] = useState({});
    const [newKey, setNewKey] = useState({});

    useEffect(() => {
      // Fetch club keys for admin
      axios.get("/api/clubs/admin/club-keys", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => setClubKeys(res.data))
        .catch(() => setClubKeys([]));
    }, []);

    const handleShowKey = (clubId) => {
      setShowKey(prev => ({ ...prev, [clubId]: !prev[clubId] }));
    };

    const handleEditKey = (clubId) => {
      setEditKey(prev => ({ ...prev, [clubId]: true }));
      setNewKey(prev => ({ ...prev, [clubId]: clubKeys.find(c => c._id === clubId)?.clubKey || "" }));
    };

    const handleKeyChange = (clubId, value) => {
      setNewKey(prev => ({ ...prev, [clubId]: value }));
    };

    const handleSaveKey = async (clubId) => {
      try {
        await axios.put(`/api/clubs/admin/update-club-key/${clubId}`, { clubKey: newKey[clubId] }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEditKey(prev => ({ ...prev, [clubId]: false }));
        // Refresh keys
        const res = await axios.get("/api/clubs/admin/club-keys", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setClubKeys(res.data);
      } catch (err) {
        alert("Failed to update club key");
      }
    };

    const handleClubSubmit = async (e) => {
      e.preventDefault()
      try {
        const clubData = {
          ...clubForm,
          highlights: clubForm.highlights.split("\n").filter((h) => h.trim()),
        }

        await axios.post("/api/clubs", clubData)
        alert("Club created successfully!")
        setClubForm({
          name: "",
          description: "",
          logoUrl: "",
          coordinatorId: "",
          highlights: "",
        })
        fetchData()
      } catch (error) {
        alert(error.response?.data?.message || "Failed to create club")
      }
    }

    const availableCoordinators = users.filter((user) => user.role === "student" && !user.coordinatingClub)

    return (
      <div className={styles.section}>
        <h1>Club Management</h1>

        <div className={styles.clubForm}>
          <h2>Create New Club</h2>
          <form onSubmit={handleClubSubmit}>
            <div className={styles.formGroup}>
              <label>Club Name</label>
              <input
                type="text"
                value={clubForm.name}
                onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                required
                className={styles.formControl}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={clubForm.description}
                onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                required
                className={styles.formControl}
                rows="4"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Logo URL</label>
              <input
                type="url"
                value={clubForm.logoUrl}
                onChange={(e) => setClubForm({ ...clubForm, logoUrl: e.target.value })}
                required
                className={styles.formControl}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Coordinator</label>
              <select
                value={clubForm.coordinatorId}
                onChange={(e) => setClubForm({ ...clubForm, coordinatorId: e.target.value })}
                required
                className={styles.formControl}
              >
                <option value="">Select Coordinator</option>
                {availableCoordinators.map((coordinator) => (
                  <option key={coordinator._id} value={coordinator._id}>
                    {coordinator.name} ({coordinator.rollNo})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Highlights (one per line)</label>
              <textarea
                value={clubForm.highlights}
                onChange={(e) => setClubForm({ ...clubForm, highlights: e.target.value })}
                className={styles.formControl}
                rows="4"
                placeholder="Enter highlights, one per line"
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Create Club
            </button>
          </form>
        </div>

        <div className={styles.section}>
          <h2>Club Keys Management</h2>
          <div className={styles.clubsGrid}>
            {clubKeys.map(club => (
              <div key={club._id} className={styles.clubCard}>
                <h3>{club.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {editKey[club._id] ? (
                    <>
                      <input
                        type="text"
                        value={newKey[club._id] || ""}
                        onChange={e => handleKeyChange(club._id, e.target.value)}
                        className={styles.formControl}
                        style={{ width: 120 }}
                      />
                      <button onClick={() => handleSaveKey(club._id)} className={styles.submitBtn}>Save</button>
                      <button onClick={() => setEditKey(prev => ({ ...prev, [club._id]: false }))}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <input
                        type={showKey[club._id] ? "text" : "password"}
                        value={club.clubKey}
                        readOnly
                        className={styles.formControl}
                        style={{ width: 120 }}
                      />
                      <button onClick={() => handleShowKey(club._id)}>
                        {showKey[club._id] ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => handleEditKey(club._id)} className={styles.submitBtn}>Edit</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Existing Clubs</h2>
          <div className={styles.clubsGrid}>
            {clubs.map((club) => (
              <div key={club._id} className={styles.clubCard}>
                <img src={club.logoUrl || "/placeholder.svg"} alt={club.name} />
                <div className={styles.clubInfo}>
                  <h3>{club.name}</h3>
                  <p>Coordinator: {club.coordinator?.name}</p>
                  <p>Members: {club.members?.length || 0}</p>
                  <p>Created: {new Date(club.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const EventManagement = () => (
    <div className={styles.section}>
      <h1>Event Management</h1>

      <div className={styles.section}>
        <h2>Pending Approvals</h2>
        {pendingEvents.length > 0 ? (
          <div className={styles.eventsList}>
            {pendingEvents.map((event) => (
              <div key={event._id} className={styles.eventItem}>
                <div className={styles.eventInfo}>
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                  <p>
                    <strong>Club:</strong> {event.club.name}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong> {event.time}
                  </p>
                  <p>
                    <strong>Venue:</strong> {event.venue}
                  </p>
                  <p>
                    <strong>Created by:</strong> {event.createdBy.name}
                  </p>
                </div>
                <div className={styles.eventActions}>
                  <button className={styles.approveBtn} onClick={() => handleEventApproval(event._id, "approve")}>
                    Approve
                  </button>
                  <button className={styles.rejectBtn} onClick={() => handleEventApproval(event._id, "reject")}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No pending events for approval.</p>
        )}
      </div>
    </div>
  )

  const UserManagement = () => (
    <div className={styles.section}>
      <h1>User Management</h1>

      <div className={styles.userStats}>
        <div className={styles.statCard}>
          <h3>{users.filter((u) => u.role === "student").length}</h3>
          <p>Students</p>
        </div>
        <div className={styles.statCard}>
          <h3>{users.filter((u) => u.role === "coordinator").length}</h3>
          <p>Coordinators</p>
        </div>
        <div className={styles.statCard}>
          <h3>{users.filter((u) => u.role === "admin").length}</h3>
          <p>Admins</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2>All Users</h2>
        <div className={styles.usersTable}>
          <div className={styles.tableHeader}>
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Details</span>
            <span>Joined</span>
          </div>
          {users.map((user) => (
            <div key={user._id} className={styles.tableRow}>
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span className={`${styles.role} ${styles[user.role]}`}>{user.role}</span>
              <span>
                {user.role === "student" && `${user.rollNo} - ${user.branch}`}
                {user.role === "coordinator" && user.coordinatingClub?.name}
              </span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const Analytics = () => {
    const studentCount = users.filter((u) => u.role === "student").length
    const coordinatorCount = users.filter((u) => u.role === "coordinator").length
    const totalMembers = clubs.reduce((sum, club) => sum + (club.members?.length || 0), 0)
    const avgMembersPerClub = clubs.length > 0 ? (totalMembers / clubs.length).toFixed(1) : 0

    return (
      <div className={styles.section}>
        <h1>Analytics</h1>

        <div className={styles.analyticsGrid}>
          <div className={styles.analyticsCard}>
            <h3>User Statistics</h3>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <span>Total Students:</span>
                <span>{studentCount}</span>
              </div>
              <div className={styles.statItem}>
                <span>Total Coordinators:</span>
                <span>{coordinatorCount}</span>
              </div>
              <div className={styles.statItem}>
                <span>Active Users:</span>
                <span>{users.filter((u) => u.isActive).length}</span>
              </div>
            </div>
          </div>

          <div className={styles.analyticsCard}>
            <h3>Club Statistics</h3>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <span>Total Clubs:</span>
                <span>{clubs.length}</span>
              </div>
              <div className={styles.statItem}>
                <span>Total Members:</span>
                <span>{totalMembers}</span>
              </div>
              <div className={styles.statItem}>
                <span>Avg Members/Club:</span>
                <span>{avgMembersPerClub}</span>
              </div>
            </div>
          </div>

          <div className={styles.analyticsCard}>
            <h3>Most Active Clubs</h3>
            <div className={styles.clubRanking}>
              {clubs
                .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
                .slice(0, 5)
                .map((club, index) => (
                  <div key={club._id} className={styles.rankItem}>
                    <span>#{index + 1}</span>
                    <span>{club.name}</span>
                    <span>{club.members?.length || 0} members</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Admin Dashboard</h3>
        </div>
        <nav className={styles.sidebarNav}>
          <Link to="/admin/dashboard" className={activeTab === "dashboard" ? styles.active : ""}>
            Dashboard
          </Link>
          <Link to="/admin/clubs" className={activeTab === "clubs" ? styles.active : ""}>
            Clubs
          </Link>
          <Link to="/admin/events" className={activeTab === "events" ? styles.active : ""}>
            Events
          </Link>
          <Link to="/admin/users" className={activeTab === "users" ? styles.active : ""}>
            Users
          </Link>
          <Link to="/admin/analytics" className={activeTab === "analytics" ? styles.active : ""}>
            Analytics
          </Link>
        </nav>
      </div>

      <div className={styles.content}>
        <Routes>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="clubs" element={<ClubManagement />} />
          <Route path="events" element={<EventManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="" element={<DashboardHome />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard
