import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./CoordinatorProfile.module.css"

const CoordinatorProfile = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    profilePhoto: ""
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [stats, setStats] = useState({
    totalEvents: 0,
    approvedEvents: 0,
    pendingEvents: 0,
    feedbackReceived: 0
  })
  const [clubInfo, setClubInfo] = useState({
    name: "",
    mission: "",
    memberCount: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        profilePhoto: user.profilePhoto || ""
      })
      fetchStats()
      fetchClubInfo()
      fetchRecentActivities()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const [eventsRes, feedbackRes] = await Promise.all([
        axios.get("/api/events/coordinator/my-events", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get("/api/feedback/coordinator", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ])

      const events = eventsRes.data
      const approvedEvents = events.filter(event => event.status === 'approved').length
      const pendingEvents = events.filter(event => event.status === 'pending').length

      setStats({
        totalEvents: events.length,
        approvedEvents,
        pendingEvents,
        feedbackReceived: feedbackRes.data.length
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchClubInfo = async () => {
    try {
      if (user.coordinatingClub) {
        const res = await axios.get(`/api/clubs/${user.coordinatingClub}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const club = res.data
        setClubInfo({
          name: club.name,
          mission: club.description || "No mission statement available",
          memberCount: club.members ? club.members.length : 0
        })
      }
    } catch (error) {
      console.error("Error fetching club info:", error)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const [eventsRes, pollsRes] = await Promise.all([
        axios.get("/api/events/coordinator/my-events", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get("/api/polls/coordinator/my-polls", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ])

      const activities = []
      
      // Add recent events
      eventsRes.data.slice(0, 3).forEach(event => {
        activities.push({
          type: "event",
          title: `Created event: ${event.title}`,
          date: new Date(event.createdAt).toLocaleDateString(),
          icon: "📅"
        })
      })

      // Add recent polls
      pollsRes.data.slice(0, 2).forEach(poll => {
        activities.push({
          type: "poll",
          title: `Created poll: ${poll.question}`,
          date: new Date(poll.createdAt).toLocaleDateString(),
          icon: "📊"
        })
      })

      // Sort by date and take latest 5
      activities.sort((a, b) => new Date(b.date) - new Date(a.date))
      setRecentActivities(activities.slice(0, 5))
    } catch (error) {
      console.error("Error fetching recent activities:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB')
        return
      }
      
      setError('')
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          profilePhoto: event.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      await axios.put("/api/users/profile", {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        profilePhoto: formData.profilePhoto
      })

      setMessage("Profile updated successfully!")
      
      updateUser({
        ...user,
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        profilePhoto: formData.profilePhoto
      })

    } catch (err) {
      console.error("Profile update error:", err)
      setError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match")
      setLoading(false)
      return
    }

    try {
      await axios.put("/api/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      setMessage("Password updated successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

    } catch (err) {
      console.error("Password update error:", err)
      setError(err.response?.data?.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const downloadProfile = () => {
    const profileData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      role: "Coordinator",
      club: clubInfo.name,
      stats: stats,
      lastUpdated: new Date().toLocaleDateString()
    }

    const dataStr = JSON.stringify(profileData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${formData.name}_profile.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!user) {
    return <div className="loading">Loading profile...</div>
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>🧾 My Profile</h1>
        <p>Manage your coordinator profile and view your statistics</p>
      </div>

      {message && <div className={styles.successMessage}>{message}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.profileContent}>
        {/* Profile Overview Card */}
        <div className={styles.profileOverview}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {formData.profilePhoto && formData.profilePhoto.startsWith('data:image') ? (
                <img src={formData.profilePhoto} alt="Profile" />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className={styles.avatarInfo}>
              <h3>{formData.name}</h3>
              <p>{clubInfo.name}</p>
              <p>{formData.email}</p>
              <p>{formData.phone || "No phone number"}</p>
              <p>{formData.department || "No department"}</p>
              <span className={styles.roleBadge}>Coordinator</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            <h4>Quick Stats</h4>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{stats.totalEvents}</span>
                <span className={styles.statLabel}>Total Events</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{stats.approvedEvents}</span>
                <span className={styles.statLabel}>Approved</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{stats.pendingEvents}</span>
                <span className={styles.statLabel}>Pending</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{stats.feedbackReceived}</span>
                <span className={styles.statLabel}>Feedback</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={styles.mainContent}>
          {/* Tab Navigation */}
          <div className={styles.tabNavigation}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Edit Profile
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'password' ? styles.active : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'club' ? styles.active : ''}`}
              onClick={() => setActiveTab('club')}
            >
              Club Info
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'activities' ? styles.active : ''}`}
              onClick={() => setActiveTab('activities')}
            >
              Recent Activities
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className={styles.profileForm}>
                <h3>Edit My Profile</h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className={styles.disabledInput}
                  />
                  <small>Email cannot be changed</small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Enter your department"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="profilePhoto">Profile Photo</label>
                  <input
                    type="file"
                    id="profilePhoto"
                    name="profilePhoto"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <small>Select an image file (max 2MB)</small>
                  {formData.profilePhoto && formData.profilePhoto.startsWith('data:image') && (
                    <div className={styles.imagePreview}>
                      <img src={formData.profilePhoto} alt="Preview" />
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, profilePhoto: '' }))}
                        className={styles.removePhotoButton}
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.saveButton}
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordUpdate} className={styles.passwordForm}>
                <h3>Change Password</h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.saveButton}
                  >
                    {loading ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'club' && (
              <div className={styles.clubInfo}>
                <h3>Club Information</h3>
                <div className={styles.clubDetails}>
                  <div className={styles.clubItem}>
                    <h4>Club Name</h4>
                    <p>{clubInfo.name}</p>
                  </div>
                  <div className={styles.clubItem}>
                    <h4>Mission</h4>
                    <p>{clubInfo.mission}</p>
                  </div>
                  <div className={styles.clubItem}>
                    <h4>Members Count</h4>
                    <p>{clubInfo.memberCount} members</p>
                  </div>
                </div>
                <div className={styles.clubActions}>
                  <button className={styles.viewClubButton}>
                    View Public Profile
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div className={styles.activities}>
                <h3>Recent Activities</h3>
                {recentActivities.length > 0 ? (
                  <div className={styles.activitiesList}>
                    {recentActivities.map((activity, index) => (
                      <div key={index} className={styles.activityItem}>
                        <span className={styles.activityIcon}>{activity.icon}</span>
                        <div className={styles.activityContent}>
                          <p className={styles.activityTitle}>{activity.title}</p>
                          <p className={styles.activityDate}>{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No recent activities found.</p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button onClick={downloadProfile} className={styles.downloadButton}>
              📄 Download Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoordinatorProfile
