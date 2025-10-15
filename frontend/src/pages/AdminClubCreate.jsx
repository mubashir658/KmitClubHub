import { useState } from "react"
import axios from "axios"
import styles from "./Dashboard.module.css"

const AdminClubCreate = () => {
  const [processing, setProcessing] = useState({})
  const [imageError, setImageError] = useState("")
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    category: "",
    instagram: "",
    clubKey: "",
    logoUrl: ""
  })

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

  const handleCreateClub = async (e) => {
    e.preventDefault()
    setProcessing(prev => ({ ...prev, create: true }))
    try {
      await axios.post('/api/clubs/admin/create', createFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('Club created successfully!')
      setCreateFormData({
        name: "",
        description: "",
        category: "",
        instagram: "",
        clubKey: "",
        logoUrl: ""
      })
      setImageError("")
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create club')
    } finally {
      setProcessing(prev => ({ ...prev, create: false }))
    }
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Add New Club</h1>
        <p>Create a new club and set its details</p>
      </div>

      <div className={styles.section}>
        <form onSubmit={handleCreateClub} className={styles.createForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Club Name *</label>
              <input 
                type="text" 
                value={createFormData.name} 
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })} 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Category *</label>
              <input 
                type="text" 
                value={createFormData.category} 
                onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description *</label>
            <textarea 
              rows="4" 
              value={createFormData.description} 
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })} 
              required 
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Instagram (optional)</label>
              <input 
                type="url" 
                value={createFormData.instagram} 
                onChange={(e) => setCreateFormData({ ...createFormData, instagram: e.target.value })} 
                placeholder="https://instagram.com/club" 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Club Key *</label>
              <input 
                type="text" 
                value={createFormData.clubKey} 
                onChange={(e) => setCreateFormData({ ...createFormData, clubKey: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="clubLogo">Club Logo (optional)</label>
              <input type="file" id="clubLogo" accept="image/*" onChange={handleLogoChange} />
              <small>Select an image file (max 2MB)</small>
              {imageError && <div className={styles.errorMessage}>{imageError}</div>}
              {createFormData.logoUrl && (
                <div className={styles.imagePreview}>
                  <img 
                    src={createFormData.logoUrl} 
                    alt="Logo preview" 
                    style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} 
                  />
                  <div style={{ marginTop: '10px' }}>
                    <small>Image preview</small>
                    <button 
                      type="button" 
                      onClick={() => setCreateFormData(prev => ({ ...prev, logoUrl: '' }))} 
                      className={styles.removePhotoButton}
                      style={{ marginLeft: '10px' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button 
              type="submit" 
              disabled={processing.create} 
              className={styles.submitBtn}
            >
              {processing.create ? 'Creating...' : 'Create Club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminClubCreate


