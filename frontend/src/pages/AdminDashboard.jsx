"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"
import AdminFeedback from "./AdminFeedback"
import AdminPolls from "./AdminPolls"

/*My New Admin Users Component*/


/*End of My New Admin Users Component*/

const AdminDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [clubs, setClubs] = useState([])
  const [users, setUsers] = useState([])
  const [pendingEvents, setPendingEvents] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
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

      <div className={styles.functionalityGrid}>
        <Link to="/admin/create-coordinator" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Create Coordinator</h3>
            <p>Add new coordinators and assign them to clubs</p>
            <div className={styles.cardIcon}>👥</div>
          </div>
        </Link>

        <Link to="/admin/clubs" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Club Management</h3>
            <p>Create, edit, and manage all clubs</p>
            <div className={styles.cardIcon}>🏢</div>
          </div>
        </Link>

        <Link to="/admin/events" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Event Management</h3>
            <p>Approve and manage club events</p>
            <div className={styles.cardIcon}>📅</div>
          </div>
        </Link>

        <Link to="/admin/users" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>User Management</h3>
            <p>View and manage all users</p>
            <div className={styles.cardIcon}>👤</div>
          </div>
        </Link>

        <Link to="/admin/feedback" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Feedback Management</h3>
            <p>Oversee feedback escalations</p>
            <div className={styles.cardIcon}>💬</div>
          </div>
        </Link>

        <Link to="/admin/polls" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Poll Management</h3>
            <p>Create polls for coordinators or clubs</p>
            <div className={styles.cardIcon}>📊</div>
          </div>
        </Link>

        <Link to="/admin/analytics" className={styles.functionCard}>
          <div className={styles.cardContent}>
            <h3>Analytics</h3>
            <p>View system statistics and insights</p>
            <div className={styles.cardIcon}>📈</div>
          </div>
        </Link>
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
}

export default AdminDashboard
