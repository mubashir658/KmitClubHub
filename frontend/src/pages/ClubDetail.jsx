"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./ClubDetail.module.css"

const ClubDetail = () => {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrollForm, setEnrollForm] = useState({ year: "", branch: "" })
  const [enrollMsg, setEnrollMsg] = useState("")

  useEffect(() => {
    fetchClub()
    // eslint-disable-next-line
  }, [id])

  const fetchClub = async () => {
    try {
      const response = await axios.get(`/api/clubs/${id}`)
      setClub(response.data)
    } catch (error) {
      setError("Failed to load club details")
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollChange = (e) => {
    setEnrollForm({ ...enrollForm, [e.target.name]: e.target.value })
  }

  const submitEnrollment = async (e) => {
    e.preventDefault()
    setEnrollMsg("")
    try {
      const res = await axios.post(`/api/clubs/${id}/enroll`, {
        year: enrollForm.year ? Number(enrollForm.year) : undefined,
        branch: enrollForm.branch || undefined
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setEnrollMsg('Enrolled successfully')
      // refresh user state optionally
    } catch (err) {
      setEnrollMsg(err.response?.data?.message || 'Enrollment failed')
    }
  }

  if (loading) return <div className="loading">Loading club details...</div>
  if (error && !club) return <div className="error">{error}</div>

  const isStudent = user && user.role === 'student'
  const enrollmentEnabled = club?.enrollmentOpen

  return (
    <div className={styles.clubDetail}>
      <div className="container">
        {/* Club Header */}
        <div className={styles.clubHeader}>
          <div className={styles.clubLogo}>
            <img src={club.logoUrl || "/placeholder.svg"} alt={club.name} />
          </div>
          <div className={styles.clubInfo}>
            <h1 className={styles.clubName}>{club.name}</h1>
            <p className={styles.clubDescription}>{club.description}</p>
          </div>
        </div>

        {/* Enrollment section */}
        <div className={styles.section}>
          <h2>Enrollment</h2>
          {!isStudent && (
            <p className={styles.note}>Login as student to enroll.</p>
          )}
          {isStudent && (
            <>
              <p>Status: {enrollmentEnabled ? 'Open' : 'Closed'}</p>
              <button
                className={styles.enrollBtn}
                disabled={!enrollmentEnabled}
                onClick={() => setEnrollOpen(!enrollOpen)}
              >
                {enrollOpen ? 'Hide Form' : 'Enroll in Club'}
              </button>
              {enrollOpen && enrollmentEnabled && (
                <form onSubmit={submitEnrollment} className={styles.enrollForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Year</label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        name="year"
                        value={enrollForm.year}
                        onChange={handleEnrollChange}
                        className={styles.input}
                        placeholder="Enter your year"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Branch</label>
                      <input
                        type="text"
                        name="branch"
                        value={enrollForm.branch}
                        onChange={handleEnrollChange}
                        className={styles.input}
                        placeholder="Enter your branch"
                      />
                    </div>
                  </div>
                  <button type="submit" className={styles.submitBtn}>Submit Enrollment</button>
                  {enrollMsg && <div className={styles.note}>{enrollMsg}</div>}
                </form>
              )}
            </>
          )}
        </div>

        {/* Team Heads */}
        {club.teamHeads && club.teamHeads.length > 0 && (
          <div className={styles.section}>
            <h2>Team Heads</h2>
            <ul>
              {club.teamHeads.map((head, idx) => (
                <li key={idx}>
                  <strong>{head.name}</strong> ({head.rollNumber}) - {head.designation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Past Events */}
        {club.eventsConducted && club.eventsConducted.length > 0 && (
          <div className={styles.section}>
            <h2>Past Events</h2>
            <ul>
              {club.eventsConducted.map((event, idx) => (
                <li key={idx}>{event}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upcoming Events */}
        {club.upcomingEvents && club.upcomingEvents.length > 0 && (
          <div className={styles.section}>
            <h2>Upcoming Events</h2>
            <ul>
              {club.upcomingEvents.map((event, idx) => (
                <li key={idx}>{event}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClubDetail
