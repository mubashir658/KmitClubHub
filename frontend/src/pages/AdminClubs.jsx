
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const AdminClubs = () => {
  const { user } = useAuth()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [imageError, setImageError] = useState("")

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      const response = await axios.get('/api/clubs')
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
      await axios.post(`/api/clubs/${clubId}/toggle-enrollment`, {}, {
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image size should be less than 2MB')
      return
    }
    setImageError("")
    const reader = new FileReader()
    reader.onload = (event) => {
      setCreateFormData(prev => ({ ...prev, logoUrl: event.target.result }))
    }
    reader.readAsDataURL(file)
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
      {/* Manage Enrollment Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Manage Club Enrollment</h2>
        </div>
        <div className={styles.usersTable}>
          <div className={styles.tableHeader}>
            <div>Club</div>
            <div>Category</div>
            <div>Enrollment</div>
            <div>Action</div>
          </div>
          {clubs && clubs.length > 0 ? (
            clubs.map((club) => (
              <div key={club._id} className={styles.tableRow}>
                <div>
                  <strong>{club.name}</strong>
                </div>
                <div>{club.category}</div>
                <div>
                  <span className={`${styles.role} ${club.enrollmentOpen ? styles.roleStudent : styles.roleAdmin}`}>
                    {club.enrollmentOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => toggleEnrollment(club._id, club.enrollmentOpen)}
                    disabled={!!updating[club._id]}
                    className={club.enrollmentOpen ? styles.deleteBtn : styles.submitBtn}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    {updating[club._id]
                      ? 'Updating...'
                      : club.enrollmentOpen
                        ? 'Deactivate Enrollment'
                        : 'Activate Enrollment'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏢</div>
              <h3>No clubs found</h3>
              <p>Create a club to manage enrollment.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default AdminClubs
