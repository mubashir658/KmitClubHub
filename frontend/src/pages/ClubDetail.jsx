"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./ClubDetail.module.css"

const ClubDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    fetchClub()
  }, [id])

  const fetchClub = async () => {
    try {
      const response = await axios.get(`/api/clubs/${id}`)
      setClub(response.data)
    } catch (error) {
      setError("Failed to load club details")
      console.error("Error fetching club:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== "student") {
      setError("Only students can enroll in clubs")
      return
    }

    setEnrolling(true)
    try {
      await axios.post(`/api/clubs/${id}/join`)
      alert("Enrollment request submitted successfully!")
      fetchClub() // Refresh club data
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit enrollment request")
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading club details...</div>
  }

  if (error && !club) {
    return <div className="error">{error}</div>
  }

  const isAlreadyMember = user && club.members?.some((member) => member._id === user.id)

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
            <div className={styles.clubStats}>
              <span className={styles.memberCount}>{club.members?.length || 0} Members</span>
              <span className={styles.coordinator}>
                Coordinator: {club.coordinator?.name} ({club.coordinator?.rollNo})
              </span>
            </div>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {/* Club Highlights */}
        {club.highlights && club.highlights.length > 0 && (
          <div className={styles.section}>
            <h2>Highlights</h2>
            <ul className={styles.highlights}>
              {club.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Gallery */}
        {club.gallery && club.gallery.length > 0 && (
          <div className={styles.section}>
            <h2>Gallery</h2>
            <div className={styles.gallery}>
              {club.gallery.map((image, index) => (
                <div key={index} className={styles.galleryItem}>
                  <img src={image || "/placeholder.svg"} alt={`${club.name} event ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coordinator Info */}
        <div className={styles.section}>
          <h2>Coordinator Information</h2>
          <div className={styles.coordinatorCard}>
            <div className={styles.coordinatorInfo}>
              <h3>{club.coordinator?.name}</h3>
              <p>Roll No: {club.coordinator?.rollNo}</p>
              <p>Email: {club.coordinator?.email}</p>
            </div>
          </div>
        </div>

        {/* Members */}
        {club.members && club.members.length > 0 && (
          <div className={styles.section}>
            <h2>Members ({club.members.length})</h2>
            <div className={styles.membersGrid}>
              {club.members.map((member) => (
                <div key={member._id} className={styles.memberCard}>
                  <h4>{member.name}</h4>
                  <p>{member.rollNo}</p>
                  <p>
                    {member.branch} - {member.year} Year
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enrollment Button */}
        {user?.role === "student" && (
          <div className={styles.enrollSection}>
            {isAlreadyMember ? (
              <button className={`${styles.enrollBtn} ${styles.enrolled}`} disabled>
                Already a Member ✓
              </button>
            ) : (
              <button className={styles.enrollBtn} onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? "Submitting Request..." : "Enroll in Club"}
              </button>
            )}
          </div>
        )}

        {!user && (
          <div className={styles.enrollSection}>
            <button className={styles.enrollBtn} onClick={() => navigate("/login")}>
              Login to Enroll
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClubDetail
