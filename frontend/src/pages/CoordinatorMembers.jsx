
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const CoordinatorMembers = () => {
  const { user } = useAuth()
  const [club, setClub] = useState(null)
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    logoUrl: '',
    category: '',
    instagram: '',
    teamHeads: []
  })

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
          const clubResponse = await axios.get(`/api/clubs/${user.coordinatingClub}`)
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
        const clubsResponse = await axios.get('/api/clubs')
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
      
      // Try to get leave requests (optional - don't fail if this doesn't work)
      try {
        console.log("Fetching leave requests...")
        const leaveRequestsResponse = await axios.get(`/api/clubs/leave-requests/pending`)
        console.log("Leave requests response:", leaveRequestsResponse.data)
        setLeaveRequests(leaveRequestsResponse.data)
      } catch (leaveError) {
        console.warn('Could not fetch leave requests:', leaveError)
        console.warn('Leave error response:', leaveError.response?.data)
        setLeaveRequests([]) // Set empty array if leave requests fail
      }
      
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
      await axios.post(`/api/clubs/${club._id}/toggle-enrollment`, {}, {
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

  const handleLeaveRequest = async (requestId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this leave request?`)) {
      return
    }

    try {
      await axios.put(`/api/clubs/leave-requests/${requestId}`, { action })
      alert(`Leave request ${action}d successfully!`)
      fetchClubData() // Refresh data
    } catch (error) {
      console.error('Leave request handling error:', error)
      alert(error.response?.data?.message || `Failed to ${action} leave request`)
    }
  }

  const handleEditClub = () => {
    setEditForm({
      name: club.name || '',
      description: club.description || '',
      logoUrl: club.logoUrl || '',
      category: club.category || '',
      instagram: club.instagram || '',
      teamHeads: Array.isArray(club.teamHeads) ? club.teamHeads : []
    })
    setShowEditModal(true)
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addTeamHead = () => {
    setEditForm(prev => ({
      ...prev,
      teamHeads: [...(prev.teamHeads || []), { name: '', rollNumber: '', designation: '' }]
    }))
  }

  const updateTeamHead = (index, field, value) => {
    setEditForm(prev => ({
      ...prev,
      teamHeads: prev.teamHeads.map((th, i) => i === index ? { ...th, [field]: value } : th)
    }))
  }

  const removeTeamHead = (index) => {
    setEditForm(prev => ({
      ...prev,
      teamHeads: prev.teamHeads.filter((_, i) => i !== index)
    }))
  }

  const handleSaveClub = async () => {
    setUpdating(true)
    try {
      const response = await axios.put(`/api/clubs/${club._id}`, editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      
      setClub(response.data.club)
      setShowEditModal(false)
      alert('Club information updated successfully!')
    } catch (error) {
      console.error('Club update error:', error)
      alert(error.response?.data?.message || 'Failed to update club information')
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
            <button
              className={styles.editBtn}
              onClick={handleEditClub}
              style={{ 
                background: '#3498db', 
                color: 'white', 
                border: 'none', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Edit Club Information
            </button>
            <button
              onClick={toggleEnrollment}
              disabled={updating}
              className={styles.submitBtn}
              style={{
                marginLeft: '1rem',
                background: club.enrollmentOpen ? '#e74c3c' : '#27ae60',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              {updating ? 'Updating...' : club.enrollmentOpen ? 'Deactivate Enrollment' : 'Activate Enrollment'}
            </button>
            <span style={{ marginLeft: '0.75rem', alignSelf: 'center', color: club.enrollmentOpen ? '#27ae60' : '#e67e22', fontWeight: 600 }}>
              Status: {club.enrollmentOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>

      {/* Pending Leave Requests */}
      {leaveRequests.length > 0 && (
        <div className={styles.section}>
          <h2>Pending Leave Requests ({leaveRequests.length})</h2>
          <div className={styles.leaveRequestsGrid}>
            {leaveRequests.map((request) => (
              <div key={request._id} className={styles.leaveRequestCard}>
                <div className={styles.requestInfo}>
                  <h4>{request.student.name}</h4>
                  <p>Roll No: {request.student.rollNo}</p>
                  <p>Branch: {request.student.branch}</p>
                  <p>Year: {request.student.year}</p>
                  {request.reason && (
                    <div className={styles.reason}>
                      <strong>Reason:</strong> {request.reason}
                    </div>
                  )}
                  <p className={styles.requestDate}>
                    Requested: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={styles.requestActions}>
                  <button
                    onClick={() => handleLeaveRequest(request._id, 'approve')}
                    className={styles.approveBtn}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleLeaveRequest(request._id, 'reject')}
                    className={styles.rejectBtn}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Club Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
              Edit Club Information
            </h2>
            
            <div className={styles.formContainer}>
              <div className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Club Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    placeholder="Enter club name"
                    className={styles.formControl}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    placeholder="Enter club description"
                    className={styles.formControl}
                    rows="3"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Logo URL</label>
                  <input
                    type="url"
                    name="logoUrl"
                    value={editForm.logoUrl}
                    onChange={handleEditFormChange}
                    placeholder="Enter logo URL"
                    className={styles.formControl}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditFormChange}
                    className={styles.formControl}
                  >
                    <option value="">Select Category</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                    <option value="Social">Social</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Instagram Handle</label>
                  <input
                    type="text"
                    name="instagram"
                    value={editForm.instagram}
                    onChange={handleEditFormChange}
                    placeholder="@instagram_handle"
                    className={styles.formControl}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Team Heads</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(editForm.teamHeads || []).map((head, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Name"
                          value={head.name || ''}
                          onChange={(e) => updateTeamHead(idx, 'name', e.target.value)}
                          className={styles.formControl}
                        />
                        <input
                          type="text"
                          placeholder="Roll Number"
                          value={head.rollNumber || ''}
                          onChange={(e) => updateTeamHead(idx, 'rollNumber', e.target.value)}
                          className={styles.formControl}
                        />
                        <input
                          type="text"
                          placeholder="Designation"
                          value={head.designation || ''}
                          onChange={(e) => updateTeamHead(idx, 'designation', e.target.value)}
                          className={styles.formControl}
                        />
                        <button
                          type="button"
                          onClick={() => removeTeamHead(idx)}
                          className={styles.deleteBtn}
                          style={{ padding: '0.6rem 0.9rem' }}
                          title="Remove team head"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addTeamHead}
                      className={styles.submitBtn}
                      style={{ alignSelf: 'flex-start' }}
                    >
                      + Add Team Head
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className={styles.cancelBtn}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveClub} 
                  className={styles.submitBtn}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Club'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoordinatorMembers
