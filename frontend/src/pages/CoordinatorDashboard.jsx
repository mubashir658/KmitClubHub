"use client"

import { useState, useEffect } from "react"
import { Routes, Route, Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const CoordinatorDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [membershipRequests, setMembershipRequests] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const path = location.pathname.split("/").pop()
    setActiveTab(path === "coordinator" ? "dashboard" : path)
  }, [location])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [requestsRes, eventsRes] = await Promise.all([
        axios.get("/api/clubs/requests/pending"),
        axios.get("/api/events"),
      ])

      setMembershipRequests(requestsRes.data)
      setEvents(eventsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMembershipRequest = async (requestId, action) => {
    try {
      await axios.put(`/api/clubs/requests/${requestId}`, { action })
      alert(`Request ${action}d successfully!`)
      fetchData() // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} request`)
    }
  }

  const DashboardHome = () => (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Coordinator Dashboard</h1>
        <p>Welcome, {user.name}! Manage your club activities here.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{membershipRequests.length}</h3>
          <p>Pending Requests</p>
        </div>
        <div className={styles.statCard}>
          <h3>{user.coordinatingClub?.members?.length || 0}</h3>
          <p>Club Members</p>
        </div>
        <div className={styles.statCard}>
          <h3>{events.filter((e) => e.club._id === user.coordinatingClub?._id).length}</h3>
          <p>Club Events</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Recent Membership Requests</h2>
        {membershipRequests.length > 0 ? (
          <div className={styles.requestsList}>
            {membershipRequests.slice(0, 5).map((request) => (
              <div key={request._id} className={styles.requestItem}>
                <div className={styles.requestInfo}>
                  <h4>{request.student.name}</h4>
                  <p>
                    {request.student.rollNo} - {request.student.branch} {request.student.section}
                  </p>
                </div>
                <div className={styles.requestActions}>
                  <button className={styles.approveBtn} onClick={() => handleMembershipRequest(request._id, "approve")}>
                    Approve
                  </button>
                  <button className={styles.rejectBtn} onClick={() => handleMembershipRequest(request._id, "reject")}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No pending membership requests.</p>
        )}
      </div>
    </div>
  )

  const Members = () => (
    <div className={styles.section}>
      <h1>Club Members</h1>
      {user.coordinatingClub?.members && user.coordinatingClub.members.length > 0 ? (
        <div className={styles.membersGrid}>
          {user.coordinatingClub.members.map((member) => (
            <div key={member._id} className={styles.memberCard}>
              <h4>{member.name}</h4>
              <p>{member.rollNo}</p>
              <p>
                {member.branch} - Year {member.year}
              </p>
              <p>{member.email}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No members in your club yet.</p>
      )}

      <div className={styles.section}>
        <h2>Pending Membership Requests</h2>
        {membershipRequests.length > 0 ? (
          <div className={styles.requestsList}>
            {membershipRequests.map((request) => (
              <div key={request._id} className={styles.requestItem}>
                <div className={styles.requestInfo}>
                  <h4>{request.student.name}</h4>
                  <p>
                    {request.student.rollNo} - {request.student.branch} {request.student.section}
                  </p>
                  <p>{request.student.email}</p>
                </div>
                <div className={styles.requestActions}>
                  <button className={styles.approveBtn} onClick={() => handleMembershipRequest(request._id, "approve")}>
                    Approve
                  </button>
                  <button className={styles.rejectBtn} onClick={() => handleMembershipRequest(request._id, "reject")}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No pending membership requests.</p>
        )}
      </div>
    </div>
  )

  const Events = () => {
    const [eventForm, setEventForm] = useState({
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      imageUrl: "",
    })

    const handleEventSubmit = async (e) => {
      e.preventDefault()
      try {
        await axios.post("/api/events", eventForm)
        alert("Event created and submitted for approval!")
        setEventForm({
          title: "",
          description: "",
          date: "",
          time: "",
          venue: "",
          imageUrl: "",
        })
        fetchData()
      } catch (error) {
        alert(error.response?.data?.message || "Failed to create event")
      }
    }

    const clubEvents = events.filter((event) => event.club._id === user.coordinatingClub?._id)

    return (
      <div className={styles.section}>
        <h1>Event Management</h1>

        <div className={styles.eventForm}>
          <h2>Create New Event</h2>
          <form onSubmit={handleEventSubmit}>
            <div className={styles.formGroup}>
              <label>Event Title</label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                required
                className={styles.formControl}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                required
                className={styles.formControl}
                rows="4"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                  className={styles.formControl}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Time</label>
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  required
                  className={styles.formControl}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Venue</label>
              <input
                type="text"
                value={eventForm.venue}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                required
                className={styles.formControl}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Event Image URL (Optional)</label>
              <input
                type="url"
                value={eventForm.imageUrl}
                onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                className={styles.formControl}
                placeholder="Enter image URL"
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Create Event
            </button>
          </form>
        </div>

        <div className={styles.section}>
          <h2>Club Events</h2>
          {clubEvents.length > 0 ? (
            <div className={styles.eventsList}>
              {clubEvents.map((event) => (
                <div key={event._id} className={styles.eventItem}>
                  <div className={styles.eventInfo}>
                    <h4>{event.title}</h4>
                    <p>{event.description}</p>
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
                      <strong>Status:</strong>
                      <span className={`${styles.status} ${styles[event.status]}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div className={styles.eventStats}>
                    <span>{event.registeredStudents?.length || 0} registered</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No events created yet.</p>
          )}
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
          <h3>Coordinator Dashboard</h3>
        </div>
        <nav className={styles.sidebarNav}>
          <Link to="/coordinator/dashboard" className={activeTab === "dashboard" ? styles.active : ""}>
            Dashboard
          </Link>
          <Link to="/coordinator/members" className={activeTab === "members" ? styles.active : ""}>
            Members
          </Link>
          <Link to="/coordinator/events" className={activeTab === "events" ? styles.active : ""}>
            Events
          </Link>
        </nav>
      </div>

      <div className={styles.content}>
        <Routes>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="members" element={<Members />} />
          <Route path="events" element={<Events />} />
          <Route path="" element={<DashboardHome />} />
        </Routes>
      </div>
    </div>
  )
}

export default CoordinatorDashboard
