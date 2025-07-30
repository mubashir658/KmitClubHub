"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import EventCard from "../components/EventCard"
import styles from "./Dashboard.module.css"

const StudentDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [clubs, setClubs] = useState([])
  const [events, setEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const path = location.pathname.split("/").pop()
    setActiveTab(path === "student" ? "dashboard" : path)
  }, [location])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clubsRes, eventsRes] = await Promise.all([axios.get("/api/clubs"), axios.get("/api/events")])

      setClubs(clubsRes.data)
      setEvents(eventsRes.data)

      // Filter events for clubs the user has joined
      const userClubIds = user.joinedClubs?.map((club) => club._id) || []
      const userEvents = eventsRes.data.filter((event) => userClubIds.includes(event.club._id))
      setMyEvents(userEvents)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventRegister = async (eventId) => {
    try {
      await axios.post(`/api/events/${eventId}/register`)
      alert("Successfully registered for event!")
      fetchData() // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || "Failed to register for event")
    }
  }

  const DashboardHome = () => (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Welcome back, {user.name}!</h1>
        <p>Here's what's happening in your clubs</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{user.joinedClubs?.length || 0}</h3>
          <p>Clubs Joined</p>
        </div>
        <div className={styles.statCard}>
          <h3>{myEvents.length}</h3>
          <p>Upcoming Events</p>
        </div>
        <div className={styles.statCard}>
          <h3>{user.badges?.length || 0}</h3>
          <p>Badges Earned</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2>My Clubs</h2>
        {user.joinedClubs && user.joinedClubs.length > 0 ? (
          <div className={styles.clubsList}>
            {user.joinedClubs.map((club) => (
              <div key={club._id} className={styles.clubItem}>
                <img src={club.logoUrl || "/placeholder.svg"} alt={club.name} />
                <div>
                  <h4>{club.name}</h4>
                  <p>{club.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>
            You haven't joined any clubs yet. <Link to="/">Browse clubs</Link>
          </p>
        )}
      </div>

      <div className={styles.section}>
        <h2>Upcoming Events</h2>
        {myEvents.length > 0 ? (
          <div className={styles.eventsGrid}>
            {myEvents.slice(0, 3).map((event) => (
              <EventCard key={event._id} event={event} onRegister={handleEventRegister} />
            ))}
          </div>
        ) : (
          <p>No upcoming events from your clubs.</p>
        )}
      </div>
    </div>
  )

  const MyClubs = () => (
    <div className={styles.section}>
      <h1>My Clubs</h1>
      {user.joinedClubs && user.joinedClubs.length > 0 ? (
        <div className={styles.clubsGrid}>
          {user.joinedClubs.map((club) => (
            <div key={club._id} className={styles.clubCard}>
              <img src={club.logoUrl || "/placeholder.svg"} alt={club.name} />
              <div className={styles.clubInfo}>
                <h3>{club.name}</h3>
                <p>{club.description}</p>
                <Link to={`/clubs/${club._id}`} className={styles.viewBtn}>
                  View Club
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>You haven't joined any clubs yet.</p>
          <Link to="/" className={styles.browseBtn}>
            Browse Clubs
          </Link>
        </div>
      )}
    </div>
  )

  const Calendar = () => {
    const [showMyEvents, setShowMyEvents] = useState(false)
    const displayEvents = showMyEvents ? myEvents : events

    return (
      <div className={styles.section}>
        <div className={styles.calendarHeader}>
          <h1>Event Calendar</h1>
          <div className={styles.toggleSwitch}>
            <button className={!showMyEvents ? styles.active : ""} onClick={() => setShowMyEvents(false)}>
              All Events
            </button>
            <button className={showMyEvents ? styles.active : ""} onClick={() => setShowMyEvents(true)}>
              My Events
            </button>
          </div>
        </div>

        <div className={styles.eventsGrid}>
          {displayEvents.map((event) => (
            <EventCard key={event._id} event={event} onRegister={handleEventRegister} />
          ))}
        </div>
      </div>
    )
  }

  const Profile = () => {
    const [profileData, setProfileData] = useState({
      name: user.name || "",
      profilePhoto: user.profilePhoto || "",
    })

    const handleProfileUpdate = async (e) => {
      e.preventDefault()
      try {
        await axios.put("/api/users/profile", profileData)
        alert("Profile updated successfully!")
      } catch (error) {
        alert("Failed to update profile")
      }
    }

    return (
      <div className={styles.section}>
        <h1>My Profile</h1>
        <div className={styles.profileContainer}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.profilePhoto}>
                <img
                  src={profileData.profilePhoto || "/placeholder.svg?height=100&width=100&query=profile"}
                  alt="Profile"
                />
              </div>
              <div className={styles.profileInfo}>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <p>
                  {user.rollNo} - {user.branch} {user.section}
                </p>
                <p>Year {user.year}</p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className={styles.profileForm}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className={styles.formControl}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Profile Photo URL</label>
                <input
                  type="url"
                  value={profileData.profilePhoto}
                  onChange={(e) => setProfileData({ ...profileData, profilePhoto: e.target.value })}
                  className={styles.formControl}
                  placeholder="Enter image URL"
                />
              </div>

              <button type="submit" className={styles.updateBtn}>
                Update Profile
              </button>
            </form>
          </div>

          <div className={styles.badgesSection}>
            <h3>My Badges</h3>
            {user.badges && user.badges.length > 0 ? (
              <div className={styles.badgesGrid}>
                {user.badges.map((badge) => (
                  <div key={badge._id} className={styles.badge}>
                    <img src={badge.iconUrl || "/placeholder.svg"} alt={badge.name} />
                    <p>{badge.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No badges earned yet. Participate in events to earn badges!</p>
            )}
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
          <h3>Student Dashboard</h3>
        </div>
        <nav className={styles.sidebarNav}>
          <Link to="/student/dashboard" className={activeTab === "dashboard" ? styles.active : ""}>
            Dashboard
          </Link>
          <Link to="/student/clubs" className={activeTab === "clubs" ? styles.active : ""}>
            My Clubs
          </Link>
          <Link to="/student/calendar" className={activeTab === "calendar" ? styles.active : ""}>
            Event Calendar
          </Link>
          <Link to="/student/profile" className={activeTab === "profile" ? styles.active : ""}>
            Profile
          </Link>
        </nav>
      </div>

      <div className={styles.content}>
        <Routes>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="clubs" element={<MyClubs />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="profile" element={<Profile />} />
          <Route path="" element={<DashboardHome />} />
        </Routes>
      </div>
    </div>
  )
}

export default StudentDashboard
