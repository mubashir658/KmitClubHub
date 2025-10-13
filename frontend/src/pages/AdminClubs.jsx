
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"
import { getImageUrl } from "../utils/imageUtils"

const AdminClubs = () => {
  const { user } = useAuth()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingClub, setEditingClub] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingClub, setDeletingClub] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    logoUrl: ''
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Club name is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Club description is required'
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Club category is required'
    }
    
    if (!imageFile && !formData.logoUrl.trim()) {
      newErrors.logoUrl = 'Please upload an image or provide an image URL'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      alert('You are not logged in. Please log in first.')
      return
    }
    
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      alert('Only administrators can create clubs.')
      return
    }
    
    console.log('User token:', token)
    console.log('User from context:', user)
    
    setSubmitting(true)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('category', formData.category)
      
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      } else if (formData.logoUrl) {
        formDataToSend.append('logoUrl', formData.logoUrl)
      }
      
      // Generate a random club key
      const clubKey = Math.random().toString(36).substring(2, 8).toUpperCase()
      formDataToSend.append('clubKey', clubKey)
      
      const response = await axios.post('http://localhost:5000/api/clubs', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Add the new club to the list
      setClubs(prev => [response.data, ...prev])
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        category: '',
        logoUrl: ''
      })
      setImagePreview(null)
      setImageFile(null)
      setErrors({})
      setShowCreateModal(false)
      
      alert('Club created successfully!')
    } catch (error) {
      console.error('Error creating club:', error)
      console.error('Error response:', error.response)
      
      let errorMessage = 'Failed to create club'
      
      if (error.response?.status === 401) {
        errorMessage = 'You are not authorized. Please log in as an admin.'
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid data provided'
      } else if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check if the server is running.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingClub(null)
    setFormData({
      name: '',
      description: '',
      category: '',
      logoUrl: ''
    })
    setImagePreview(null)
    setImageFile(null)
    setErrors({})
  }

  const closeDeleteModal = () => {
    setShowDeleteConfirm(false)
    setDeletingClub(null)
  }

  const openEditModal = (club) => {
    setEditingClub(club)
    setFormData({
      name: club.name,
      description: club.description,
      category: club.category,
      logoUrl: club.logoUrl
    })
    setImagePreview(null)
    setImageFile(null)
    setErrors({})
    setShowEditModal(true)
  }

  const openDeleteModal = (club) => {
    setDeletingClub(club)
    setShowDeleteConfirm(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      alert('You are not logged in. Please log in first.')
      return
    }
    
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      alert('Only administrators can edit clubs.')
      return
    }
    
    setSubmitting(true)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('category', formData.category)
      
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      } else if (formData.logoUrl) {
        formDataToSend.append('logoUrl', formData.logoUrl)
      }
      
      const response = await axios.put(`http://localhost:5000/api/clubs/${editingClub._id}`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Update the club in the list
      setClubs(prev => prev.map(club => 
        club._id === editingClub._id ? response.data : club
      ))
      
      // Reset form and close modal
      closeModal()
      
      alert('Club updated successfully!')
    } catch (error) {
      console.error('Error updating club:', error)
      console.error('Error response:', error.response)
      
      let errorMessage = 'Failed to update club'
      
      if (error.response?.status === 401) {
        errorMessage = 'You are not authorized. Please log in as an admin.'
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid data provided'
      } else if (error.response?.status === 404) {
        errorMessage = 'Club not found.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    
    try {
      await axios.delete(`http://localhost:5000/api/clubs/${deletingClub._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      // Remove the club from the list
      setClubs(prev => prev.filter(club => club._id !== deletingClub._id))
      
      closeDeleteModal()
      
      alert('Club deleted successfully!')
    } catch (error) {
      console.error('Error deleting club:', error)
      console.error('Error response:', error.response)
      
      let errorMessage = 'Failed to delete club'
      
      if (error.response?.status === 401) {
        errorMessage = 'You are not authorized. Please log in as an admin.'
      } else if (error.response?.status === 404) {
        errorMessage = 'Club not found.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      alert(errorMessage)
    } finally {
      setDeleting(false)
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
        <div className={styles.sectionHeader}>
          <div>
            <h2>Club Enrollment Control</h2>
            <p>Toggle enrollment status for each club. When enabled, students can enroll in the club.</p>
          </div>
          <button 
            className={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            Create Club
          </button>
        </div>
        
        <div className={styles.clubsGrid}>
          {clubs.map((club) => (
            <div key={club._id} className={styles.clubCard}>
              <div className={styles.clubHeader}>
                <div className={styles.clubLogo}>
                  <img 
                    src={getImageUrl(club.logoUrl)} 
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
                
                <div className={styles.actionButtons}>
                  <button
                    className={`${styles.toggleBtn} ${club.enrollmentOpen ? styles.deactivate : styles.activate}`}
                    onClick={() => toggleEnrollment(club._id, club.enrollmentOpen)}
                    disabled={updating[club._id]}
                  >
                    {updating[club._id] ? 'Updating...' : 
                     club.enrollmentOpen ? 'Deactivate Enrollment' : 'Activate Enrollment'}
                  </button>
                  
                  <button
                    className={styles.editBtn}
                    onClick={() => openEditModal(club)}
                    title="Edit Club"
                  >
                    Edit
                  </button>
                  
                  <button
                    className={styles.deleteBtn}
                    onClick={() => openDeleteModal(club)}
                    title="Delete Club"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Club Modal */}
      {showEditModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Club</h2>
              <button className={styles.closeBtn} onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="edit-name">Club Name *</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`${styles.formControl} ${errors.name ? styles.errorInput : ''}`}
                  placeholder="Enter club name"
                />
                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-description">Club Description *</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`${styles.formControl} ${errors.description ? styles.errorInput : ''}`}
                  placeholder="Enter club description"
                  rows="4"
                />
                {errors.description && <span className={styles.fieldError}>{errors.description}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-category">Category *</label>
                <select
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`${styles.formControl} ${errors.category ? styles.errorInput : ''}`}
                >
                  <option value="">Select a category</option>
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Literary">Literary</option>
                  <option value="Arts">Arts</option>
                  <option value="Music">Music</option>
                  <option value="Dance">Dance</option>
                  <option value="Drama">Drama</option>
                  <option value="Photography">Photography</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <span className={styles.fieldError}>{errors.category}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-image">Club Logo</label>
                <input
                  type="file"
                  id="edit-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.formControl}
                />
                {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
                {editingClub?.logoUrl && !imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={getImageUrl(editingClub.logoUrl)} alt="Current" />
                    <p>Current logo</p>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-logoUrl">Or Image URL</label>
                <input
                  type="url"
                  id="edit-logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  className={`${styles.formControl} ${errors.logoUrl ? styles.errorInput : ''}`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.logoUrl && <span className={styles.fieldError}>{errors.logoUrl}</span>}
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className={styles.submitBtn}>
                  {submitting ? 'Updating...' : 'Update Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={closeDeleteModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Delete Club</h2>
              <button className={styles.closeBtn} onClick={closeDeleteModal}>×</button>
            </div>
            
            <div className={styles.deleteContent}>
              <div className={styles.warningIcon}>⚠️</div>
              <h3>Are you sure you want to delete this club?</h3>
              <p>Club: <strong>{deletingClub?.name}</strong></p>
              <p className={styles.warningText}>
                This action cannot be undone. All club data, members, and events will be permanently deleted.
              </p>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  onClick={closeDeleteModal} 
                  className={styles.cancelBtn}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleDelete} 
                  className={styles.deleteBtn}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Club'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Club Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Club</h2>
              <button className={styles.closeBtn} onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Club Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`${styles.formControl} ${errors.name ? styles.errorInput : ''}`}
                  placeholder="Enter club name"
                />
                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Club Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`${styles.formControl} ${errors.description ? styles.errorInput : ''}`}
                  placeholder="Enter club description"
                  rows="4"
                />
                {errors.description && <span className={styles.fieldError}>{errors.description}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`${styles.formControl} ${errors.category ? styles.errorInput : ''}`}
                >
                  <option value="">Select a category</option>
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Literary">Literary</option>
                  <option value="Arts">Arts</option>
                  <option value="Music">Music</option>
                  <option value="Dance">Dance</option>
                  <option value="Drama">Drama</option>
                  <option value="Photography">Photography</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <span className={styles.fieldError}>{errors.category}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="image">Club Logo *</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.formControl}
                />
                {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="logoUrl">Or Image URL</label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  className={`${styles.formControl} ${errors.logoUrl ? styles.errorInput : ''}`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.logoUrl && <span className={styles.fieldError}>{errors.logoUrl}</span>}
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className={styles.submitBtn}>
                  {submitting ? 'Creating...' : 'Create Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminClubs
