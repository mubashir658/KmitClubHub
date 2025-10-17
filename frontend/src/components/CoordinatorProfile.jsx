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
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState({ current: false, next: false, confirm: false })
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
    }
  }, [user])

  // Fetch fresh user data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("/api/users/profile")
        updateUser(response.data)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }
    
    if (user) {
      fetchUserProfile()
    }
  }, [])

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
      console.log('Sending profile update request:', {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        profilePhoto: formData.profilePhoto ? 'Base64 image data' : 'No image'
      });

      const response = await axios.put("/api/users/profile", {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        profilePhoto: formData.profilePhoto
      })

      console.log('Profile update response:', response.data);
      setMessage("Profile updated successfully!")
      
      // Update the user context with the response data
      updateUser({
        ...user,
        ...response.data
      })

      // Refresh the form data with the updated user data
      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        department: response.data.department || "",
        profilePhoto: response.data.profilePhoto || ""
      })

    } catch (err) {
      console.error("Profile update error:", err)
      console.error("Error response:", err.response?.data)
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
      console.log('Sending password update request:', {
        currentPassword: passwordData.currentPassword ? 'Provided' : 'Not provided',
        newPassword: passwordData.newPassword ? 'Provided' : 'Not provided'
      });

      await axios.put("/api/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      console.log('Password update successful');
      setMessage("Password updated successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

    } catch (err) {
      console.error("Password update error:", err)
      console.error("Error response:", err.response?.data)
      setError(err.response?.data?.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }


  if (!user) {
    return <div className="loading">Loading profile...</div>
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>Coordinator Profile</h1>
        <p>Manage your profile information and security settings</p>
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
              <p>{formData.email}</p>
              <p>{formData.phone || "No phone number"}</p>
              <p>{formData.department || "No department"}</p>
              <span className={styles.roleBadge}>Coordinator</span>
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
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className={styles.profileForm}>
                <h3>Edit Profile Information</h3>
                
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
                  <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword.current ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    aria-label={showPassword.current ? "Hide password" : "Show password"}
                    style={{ position: 'absolute', right: 10, top: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    {showPassword.current ? '🙈' : '👁️'}
                  </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newPassword">New Password</label>
                  <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword.next ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, next: !prev.next }))}
                    aria-label={showPassword.next ? "Hide password" : "Show password"}
                    style={{ position: 'absolute', right: 10, top: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    {showPassword.next ? '🙈' : '👁️'}
                  </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                    aria-label={showPassword.confirm ? "Hide password" : "Show password"}
                    style={{ position: 'absolute', right: 10, top: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    {showPassword.confirm ? '🙈' : '👁️'}
                  </button>
                  </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoordinatorProfile
