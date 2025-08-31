"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const AdminClubs = () => {
  const { user } = useAuth()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/clubs')
      setClubs(response.data)
    } catch (error) {
      console.error('Error fetching clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEnrollment = async (clubId, currentStatus) => {
    setUpdating(prev => ({ ...prev, [clubId]: true }))
    try {
      await axios.post(`http://localhost:5000/api/clubs/${clubId}/toggle-enrollment`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      
      // Update local state
      setClubs(prev => prev.map(club => 
        club._id === clubId 
          ? { ...club, enrollmentOpen: !club.enrollmentOpen }
          : club
      ))
      
      alert(`Enrollment ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update enrollment status')
    } finally {
      setUpdating(prev => ({ ...prev, [clubId]: false }))
    }
  }

  if (loading) {
    return <div className="loading">Loading clubs...</div>
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Club Management</h1>
        <p>Manage enrollment settings for all clubs</p>
      </div>

      <div className={styles.section}>
        <h2>Club Enrollment Control</h2>
        <p>Toggle enrollment status for each club. When enabled, students can enroll in the club.</p>
        
        <div className={styles.clubsGrid}>
          {clubs.map((club) => (
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
                </div>
              </div>
              
              <div className={styles.clubActions}>
                <div className={styles.enrollmentStatus}>
                  <span className={styles.statusLabel}>Enrollment Status:</span>
                  <span className={`${styles.status} ${club.enrollmentOpen ? styles.active : styles.inactive}`}>
                    {club.enrollmentOpen ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <button
                  className={`${styles.toggleBtn} ${club.enrollmentOpen ? styles.deactivate : styles.activate}`}
                  onClick={() => toggleEnrollment(club._id, club.enrollmentOpen)}
                  disabled={updating[club._id]}
                >
                  {updating[club._id] ? 'Updating...' : 
                   club.enrollmentOpen ? 'Deactivate Enrollment' : 'Activate Enrollment'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminClubs
