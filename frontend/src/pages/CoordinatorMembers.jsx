"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const CoordinatorMembers = () => {
  const { user } = useAuth()
  const [club, setClub] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchClubData()
  }, [])

  const fetchClubData = async () => {
    try {
      console.log('User data:', user)
      console.log('User coordinatingClub:', user.coordinatingClub)
      
      let coordinatorClub = null
      
      // First try to get club using coordinatingClub field
      if (user.coordinatingClub) {
        try {
          const clubResponse = await axios.get(`http://localhost:5000/api/clubs/${user.coordinatingClub}`)
          coordinatorClub = clubResponse.data
          console.log('Found club via coordinatingClub field:', coordinatorClub.name)
        } catch (error) {
          console.log('Error fetching club via coordinatingClub:', error.message)
        }
      }
      
      // If coordinatingClub is null or invalid, try alternative approach
      if (!coordinatorClub) {
        console.log('No coordinatingClub found or invalid, trying alternative approach...')
        
        // Get all clubs and find the one this coordinator manages
        const clubsResponse = await axios.get('http://localhost:5000/api/clubs')
        coordinatorClub = clubsResponse.data.find(club => 
          club.coordinators && club.coordinators.includes(user._id)
        )
        
        if (coordinatorClub) {
          console.log('Found club via coordinators array:', coordinatorClub.name)
        }
      }
      
      if (!coordinatorClub) {
        setError('No club assigned to this coordinator. Please contact an administrator.')
        setLoading(false)
        return
      }
      
      setClub(coordinatorClub)
      
      // Get members of this club
      const membersResponse = await axios.get(`http://localhost:5000/api/clubs/${coordinatorClub._id}/members`)
      setMembers(membersResponse.data)
      
    } catch (error) {
      console.error('Error fetching club data:', error)
      setError('Failed to load club data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleEnrollment = async () => {
    setUpdating(true)
    try {
      await axios.post(`http://localhost:5000/api/clubs/${club._id}/toggle-enrollment`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      
      // Update local state
      setClub(prev => ({ ...prev, enrollmentOpen: !prev.enrollmentOpen }))
      
      alert(`Enrollment ${!club.enrollmentOpen ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update enrollment status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading club data...</div>
  }

  if (error) {
    return (
      <div className={styles.dashboardHome}>
        <div className={styles.welcomeSection}>
          <h1>Member Management</h1>
          <p>Manage club members and enrollment settings</p>
        </div>
        <div className={styles.section}>
          <div className={styles.error}>
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={fetchClubData} className={styles.retryBtn}>
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className={styles.dashboardHome}>
        <div className={styles.welcomeSection}>
          <h1>Member Management</h1>
          <p>Manage club members and enrollment settings</p>
        </div>
        <div className={styles.section}>
          <div className={styles.error}>
            <h3>No Club Found</h3>
            <p>No club has been assigned to this coordinator. Please contact an administrator to assign you to a club.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Member Management</h1>
        <p>Manage {club.name} members and enrollment settings</p>
      </div>

      {/* Club Info and Enrollment Control */}
      <div className={styles.section}>
        <div className={styles.clubCard}>
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
              onClick={toggleEnrollment}
              disabled={updating}
            >
              {updating ? 'Updating...' : 
               club.enrollmentOpen ? 'Deactivate Enrollment' : 'Activate Enrollment'}
            </button>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className={styles.section}>
        <h2>Club Members ({members.length})</h2>
        {members.length > 0 ? (
          <div className={styles.membersGrid}>
            {members.map((member) => (
              <div key={member._id} className={styles.memberCard}>
                <div className={styles.memberInfo}>
                  <h4>{member.name}</h4>
                  <p>Roll No: {member.rollNo}</p>
                  <p>Branch: {member.branch}</p>
                  <p>Year: {member.year}</p>
                  <p>Email: {member.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No members found for this club.</p>
        )}
      </div>
    </div>
  )
}

export default CoordinatorMembers
