
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Profile.module.css"

const StudentProfile = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    year: "",
    branch: "",
    section: "",
    profilePhoto: ""
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        rollNo: user.rollNo || "",
        year: user.year || "",
        branch: user.branch || "",
        section: user.section || "",
        profilePhoto: user.profilePhoto || ""
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB')
        return
      }
      
      // Clear any previous errors
      setError('')
      
      // Convert image to base64 for storage
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          profilePhoto: event.target.result // This will be the base64 string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      // Update basic profile info (name, profilePhoto)
      if (formData.name !== user.name || formData.profilePhoto !== user.profilePhoto) {
        await axios.put("/api/users/profile", {
          name: formData.name,
          profilePhoto: formData.profilePhoto
        })
      }

      // Update academic info (year, branch, section)
      const academicUpdate = {}
      if (formData.year !== user.year) academicUpdate.year = formData.year
      if (formData.branch !== user.branch) academicUpdate.branch = formData.branch
      if (formData.section !== user.section) academicUpdate.section = formData.section

      if (Object.keys(academicUpdate).length > 0) {
        await axios.put("/api/auth/update-profile", academicUpdate)
      }

      setMessage("Profile updated successfully!")
      
      // Update the user context with new data
      updateUser({
        ...user,
        name: formData.name,
        year: formData.year,
        branch: formData.branch,
        section: formData.section,
        profilePhoto: formData.profilePhoto
      })

    } catch (err) {
      console.error("Profile update error:", err)
      setError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const branchOptions = [
    "CSE", "IT", "CSM", "CSD"
  ]

  const yearOptions = [1, 2, 3, 4]

  const sectionOptions = ["A", "B", "C", "D", "E"]

  if (!user) {
    return <div className="loading">Loading profile...</div>
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>My Profile</h1>
        <p>Update your personal and academic information</p>
      </div>

      {message && <div className={styles.successMessage}>{message}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.profileContent}>
        <div className={styles.profileInfo}>
          <div className={styles.avatarSection}>
             <div className={styles.avatar}>
               {formData.profilePhoto && formData.profilePhoto.startsWith('data:image') ? (
                 <img 
                   src={formData.profilePhoto} 
                   alt="Profile" 
                 />
               ) : (
                 <div className={styles.avatarPlaceholder}>
                   {formData.name.charAt(0).toUpperCase()}
                 </div>
               )}
             </div>
            <div className={styles.avatarInfo}>
              <h3>{formData.name}</h3>
              <p>{formData.rollNo}</p>
              <p>{formData.email}</p>
            </div>
          </div>

          <div className={styles.badgesSection}>
            <h4>Badges Earned</h4>
            <div className={styles.badges}>
              {user.badges && user.badges.length > 0 ? (
                user.badges.map((badge, index) => (
                  <span key={index} className={styles.badge}>
                    {badge}
                  </span>
                ))
              ) : (
                <p>No badges earned yet</p>
              )}
            </div>
          </div>

          <div className={styles.clubsSection}>
            <h4>Joined Clubs</h4>
            <div className={styles.clubs}>
              {user.joinedClubs && user.joinedClubs.length > 0 ? (
                user.joinedClubs.map((club) => (
                  <div key={club._id} className={styles.clubItem}>
                    <span>{club.name}</span>
                  </div>
                ))
              ) : (
                <p>Not joined any clubs yet</p>
              )}
            </div>
          </div>
        </div>

        <form className={styles.profileForm} onSubmit={handleSubmit}>
          <div className={styles.formSection}>
            <h3>Personal Information</h3>
            
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
              <label htmlFor="rollNo">Roll Number</label>
              <input
                type="text"
                id="rollNo"
                name="rollNo"
                value={formData.rollNo}
                disabled
                className={styles.disabledInput}
              />
              <small>Roll number cannot be changed</small>
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
                   <img src={formData.profilePhoto} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginTop: '10px' }} />
                   <small>Image preview</small>
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
          </div>

          <div className={styles.formSection}>
            <h3>Academic Information</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="year">Year</label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
              >
                <option value="">Select Year</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="branch">Branch</label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
              >
                <option value="">Select Branch</option>
                {branchOptions.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="section">Section</label>
              <select
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
              >
                <option value="">Select Section</option>
                {sectionOptions.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
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
      </div>
    </div>
  )
}

export default StudentProfile
