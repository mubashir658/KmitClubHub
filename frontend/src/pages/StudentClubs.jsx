"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./StudentClubs.module.css"

const StudentClubs = () => {
  const { user } = useAuth()
  const [joinedClubs, setJoinedClubs] = useState([])
  const [allClubs, setAllClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [selectedClub, setSelectedClub] = useState(null)
  const [leaveReason, setLeaveReason] = useState("")
  const [submittingLeave, setSubmittingLeave] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clubsRes, allClubsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/clubs"),
        axios.get("http://localhost:5000/api/clubs")
      ])

      setAllClubs(allClubsRes.data)

      // Filter clubs that the user has joined
      const userClubIds = user.joinedClubs?.map(club => club._id) || []
      const joined = clubsRes.data.filter(club => userClubIds.includes(club._id))
      setJoinedClubs(joined)

    } catch (err) {
      console.error("Error fetching clubs:", err)
      setError("Failed to load clubs")
    } finally {
      setLoading(false)
    }
  }

  const handleRequestLeaveClub = (clubId) => {
    const club = allClubs.find(c => c._id === clubId)
    setSelectedClub(club)
    setLeaveReason("")
    setShowLeaveModal(true)
  }

  const submitLeaveRequest = async () => {
    if (!selectedClub) return

    setSubmittingLeave(true)
    try {
      console.log("Submitting leave request for club:", selectedClub._id, "with reason:", leaveReason)
      const response = await axios.post(`http://localhost:5000/api/clubs/${selectedClub._id}/request-leave`, { 
        reason: leaveReason 
      })
      console.log("Leave request response:", response.data)
      alert("Leave request submitted successfully! Waiting for coordinator approval.")
      setShowLeaveModal(false)
      setSelectedClub(null)
      setLeaveReason("")
      fetchData() // Refresh data
    } catch (err) {
      console.error("Error submitting leave request:", err)
      console.error("Error response:", err.response?.data)
      alert(err.response?.data?.message || "Failed to submit leave request")
    } finally {
      setSubmittingLeave(false)
    }
  }

  const cancelLeaveRequest = () => {
    setShowLeaveModal(false)
    setSelectedClub(null)
    setLeaveReason("")
  }

  const handleJoinClub = async (clubId, clubKey) => {
    try {
      await axios.post(`http://localhost:5000/api/clubs/${clubId}/join`, { clubKey })
      alert("Successfully joined the club!")
      fetchData() // Refresh data
    } catch (err) {
      console.error("Error joining club:", err)
      alert(err.response?.data?.message || "Failed to join club")
    }
  }

  if (loading) {
    return <div className="loading">Loading clubs...</div>
  }

  return (
    <div className={styles.clubsContainer}>
      <div className={styles.header}>
        <h1>My Clubs</h1>
        <p>Manage your club memberships and discover new clubs</p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Joined Clubs Section */}
      <div className={styles.section}>
        <h2>Joined Clubs ({joinedClubs.length})</h2>
        {joinedClubs.length > 0 ? (
          <div className={styles.clubsGrid}>
            {joinedClubs.map((club) => (
              <div key={club._id} className={styles.clubCard}>
                <div className={styles.clubHeader}>
                  <div className={styles.clubLogo}>
                    <img 
                      src={club.logoUrl || "/placeholder.svg"} 
                      alt={club.name}
                      onError={(e) => {
                        e.target.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  <div className={styles.clubInfo}>
                    <h3>{club.name}</h3>
                    <p>{club.description}</p>
                    <div className={styles.clubStats}>
                      <span className={styles.category}>{club.category}</span>
                      <span className={styles.members}>
                        {club.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.clubActions}>
                  <Link 
                    to={`/clubs/${club._id}`} 
                    className={styles.viewBtn}
                  >
                    View Club
                  </Link>
                  <button
                    onClick={() => handleRequestLeaveClub(club._id)}
                    className={styles.leaveBtn}
                  >
                    Request to Leave
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏢</div>
            <h3>No clubs joined yet</h3>
            <p>Browse available clubs below and join the ones that interest you!</p>
          </div>
        )}
      </div>

      {/* Available Clubs Section */}
      <div className={styles.section}>
        <h2>Available Clubs</h2>
        <p>Discover and join new clubs</p>
        
        <div className={styles.clubsGrid}>
          {allClubs.map((club) => {
            const isJoined = joinedClubs.some(joinedClub => joinedClub._id === club._id)
            const isEnrollmentOpen = club.enrollmentOpen
            
            return (
              <div key={club._id} className={`${styles.clubCard} ${isJoined ? styles.joined : ''}`}>
                <div className={styles.clubHeader}>
                  <div className={styles.clubLogo}>
                    <img 
                      src={club.logoUrl || "/placeholder.svg"} 
                      alt={club.name}
                      onError={(e) => {
                        e.target.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  <div className={styles.clubInfo}>
                    <h3>{club.name}</h3>
                    <p>{club.description}</p>
                    <div className={styles.clubStats}>
                      <span className={styles.category}>{club.category}</span>
                      <span className={styles.members}>
                        {club.members?.length || 0} members
                      </span>
                      {!isEnrollmentOpen && (
                        <span className={styles.enrollmentClosed}>Enrollment Closed</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={styles.clubActions}>
                  <Link 
                    to={`/clubs/${club._id}`} 
                    className={styles.viewBtn}
                  >
                    View Details
                  </Link>
                  {isJoined ? (
                    <span className={styles.joinedBadge}>Joined</span>
                  ) : isEnrollmentOpen ? (
                    <button
                      onClick={() => {
                        const clubKey = prompt(`Enter the club key for ${club.name}:`)
                        if (clubKey) {
                          handleJoinClub(club._id, clubKey)
                        }
                      }}
                      className={styles.joinBtn}
                    >
                      Join Club
                    </button>
                  ) : (
                    <span className={styles.closedBadge}>Enrollment Closed</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Request to Leave Club</h3>
              <button 
                className={styles.closeButton}
                onClick={cancelLeaveRequest}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <p>You are requesting to leave: <strong>{selectedClub?.name}</strong></p>
              
              <div className={styles.formGroup}>
                <label htmlFor="leaveReason">Reason for leaving (optional):</label>
                <textarea
                  id="leaveReason"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Please provide a reason for leaving the club..."
                  rows={4}
                  className={styles.reasonTextarea}
                />
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button
                onClick={cancelLeaveRequest}
                className={styles.cancelButton}
                disabled={submittingLeave}
              >
                Cancel
              </button>
              <button
                onClick={submitLeaveRequest}
                className={styles.submitButton}
                disabled={submittingLeave}
              >
                {submittingLeave ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentClubs
