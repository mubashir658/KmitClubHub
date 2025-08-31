"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import EventCard from "../components/EventCard"
import styles from "./Dashboard.module.css"
import StudentFeedback from "./StudentFeedback"
import StudentPolls from "./StudentPolls"

const StudentDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [clubs, setClubs] = useState([])
  const [events, setEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
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

      <div className={styles.functionalityGrid}>
        <Link to="/student/clubs" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>My Clubs</h3>
            <p>View and manage your joined clubs</p>
            <div className={styles.cardIcon}>🏢</div>
          </div>
        </Link>

        <Link to="/student/calendar" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Event Calendar</h3>
            <p>Browse and register for events</p>
            <div className={styles.cardIcon}>📅</div>
          </div>
        </Link>

        <Link to="/student/feedback" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Send Feedback</h3>
            <p>Provide feedback to your clubs</p>
            <div className={styles.cardIcon}>💬</div>
          </div>
        </Link>

        <Link to="/student/polls" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Vote in Polls</h3>
            <p>Participate in club polls</p>
            <div className={styles.cardIcon}>📊</div>
          </div>
        </Link>

        <Link to="/student/profile" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>My Profile</h3>
            <p>Update your profile and view badges</p>
            <div className={styles.cardIcon}>👤</div>
          </div>
        </Link>
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
}

export default StudentDashboard
