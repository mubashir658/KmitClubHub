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

  console.log('ClubDetail mounted with ID:', id)

  useEffect(() => {
    fetchClub()
    // eslint-disable-next-line
  }, [id])

  const fetchClub = async () => {
    console.log('Fetching club with ID:', id)
    try {
      const response = await axios.get(`/api/clubs/${id}`)
      console.log('Club data received:', response.data)
      setClub(response.data)
    } catch (error) {
      console.error("Error fetching club:", error)
      setError("Failed to load club details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading club details...</div>
  if (error && !club) return <div className="error">{error}</div>

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
            {club.instagramLink && (
              <a href={club.instagramLink} target="_blank" rel="noopener noreferrer" className={styles.instagramLink}>
                Instagram
              </a>
            )}
          </div>
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
