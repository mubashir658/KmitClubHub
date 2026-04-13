import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import styles from "./Images.module.css"

// Static sampleImages removed in favor of dynamic backend loading

const CoordinatorGallery = () => {
  const { user } = useAuth()
  const [images, setImages] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [statusMsg, setStatusMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [isPhotographyClub, setIsPhotographyClub] = useState(false)
  const [pendingImages, setPendingImages] = useState([])

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        if (user?.coordinatingClub) {
          // Fetch club details to check if they are Traces of Lenses (PC12355)
          const clubRes = await axios.get(`/api/clubs/${user.coordinatingClub}`)
          const isPhotoClub = clubRes.data?.clubKey === 'PC12355'
          setIsPhotographyClub(isPhotoClub)

          // Fetch their club's images
          const galleryRes = await axios.get(`/api/gallery/club/${user.coordinatingClub}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          
          if (galleryRes.data?.images) {
            const dbImages = galleryRes.data.images.map(img => ({
              id: img._id,
              src: img.imageUrl,
              approved: img.approved
            }))
            setImages(dbImages)
          }

          // If photography club, fetch pending images across all clubs
          if (isPhotoClub) {
            const pendingRes = await axios.get('/api/gallery/pending', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            setPendingImages(pendingRes.data?.images || [])
          }
        }
      } catch (err) {
        console.error('Failed to fetch gallery data:', err)
      }
    }

    fetchGalleryData()
  }, [user])

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/gallery/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setPendingImages(prev => prev.filter(img => img._id !== id))
      setStatusMsg("Image approved successfully")
      setErrorMsg("")
      
      // If it was their own club's image, update the local status
      setImages(prev => prev.map(img => img.id === id ? { ...img, approved: true } : img))
    } catch (err) {
      console.error("Approve failed:", err)
      setErrorMsg("Failed to approve image")
    }
  }

  const handleRejectPending = async (id) => {
    try {
      await axios.delete(`/api/gallery/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setPendingImages(prev => prev.filter(img => img._id !== id))
      setStatusMsg("Image rejected successfully")
      setErrorMsg("")
    } catch (err) {
      console.error("Reject failed:", err)
      setErrorMsg("Failed to reject image")
    }
  }

  const handleFileSelect = (e) => {
    setErrorMsg("")
    setStatusMsg("")
    const files = Array.from(e.target.files || [])
    const previews = files.map((file, i) => ({
      id: `local-${Date.now()}-${i}`,
      src: URL.createObjectURL(file),
      file,
    }))
    setSelectedFiles(previews)
  }

  const uploadSelected = async () => {
    if (!selectedFiles.length) {
      setErrorMsg('Please select one or more images to upload.')
      return
    }

    setUploading(true)
    setStatusMsg('Uploading...')
    setErrorMsg("")

    // Optimistically add previews to gallery so user sees them immediately
    setImages(prev => [...selectedFiles, ...prev])

    try {
      const form = new FormData()
      selectedFiles.forEach((p) => form.append('images', p.file))
      if (user?.coordinatingClub) form.append('clubId', user.coordinatingClub)

      const res = await axios.post('/api/gallery/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // If backend returns saved items, reconcile ids (best-effort)
      if (res?.data?.images) {
        const saved = res.data.images.map((it) => ({ id: it._id || it.id, src: it.url || it.path || it.src, approved: it.approved }))
        setImages(prev => [...saved, ...prev.filter(i => String(i.id).startsWith('local-') === false)])
      }

      setSelectedFiles([])
      setStatusMsg(isPhotographyClub ? 'Upload completed' : 'Upload completed. Your images are pending approval from the Traces of Lenses coordinator.')
    } catch (err) {
      console.warn('Upload error (backend may be missing):', err)
      setErrorMsg('Upload failed to server — previews were kept locally.')
      setStatusMsg('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    // remove locally
    setImages(prev => prev.filter(img => img.id !== id))
    try {
      if (String(id).startsWith('sample-') || String(id).startsWith('local-')) return
      await axios.delete(`/api/gallery/${id}`)
    } catch (err) {
      console.warn('Delete request failed or endpoint missing', err)
      setErrorMsg('Failed to delete on server (may not exist).')
    }
  }

  return (
    <div className={styles.imagesPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>Gallery Management</h1>
          <p>Upload and manage photos for your club.</p>
        </div>

        {user?.role === 'coordinator' ? (
          <section className={styles.uploadArea}>
            <div className={styles.uploadRow}>
              <label className={styles.btnPrimary}>
                Select Images
                <input className={styles.fileInput} type="file" multiple accept="image/*" onChange={handleFileSelect} />
              </label>

              <button className={styles.btnPrimary} onClick={uploadSelected} disabled={uploading || !selectedFiles.length}>
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length ? `(${selectedFiles.length})` : ''}`}
              </button>

              {selectedFiles.length > 0 && (
                <div className={styles.previewList}>
                  {selectedFiles.map(s => (
                    <img key={s.id} src={s.src} alt="preview" className={styles.previewThumb} />
                  ))}
                </div>
              )}
            </div>

            {statusMsg && <div className={styles.statusMsg}>{statusMsg}</div>}
            {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
          </section>
        ) : (
          <p>You must be a coordinator to manage the gallery.</p>
        )}

        {isPhotographyClub && pendingImages.length > 0 && (
          <section className={styles.uploadArea} style={{ marginTop: '2rem' }}>
            <h2>Pending Approvals</h2>
            <div className={styles.imageGrid}>
              {pendingImages.map((img) => (
                <div key={img._id} className={styles.imageCard} style={{ position: 'relative' }}>
                  <img src={img.imageUrl} alt="pending" className={styles.eventImage} />
                  <div className={styles.imageInfo} style={{ textAlign: 'center' }}>
                    <p style={{ margin: '5px 0' }}>By: {img.clubId?.name || 'Unknown'}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                      <button className={styles.btnPrimary} onClick={() => handleApprove(img._id)}>Approve</button>
                      <button className={styles.btnDanger} onClick={() => handleRejectPending(img._id)}>Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>My Club's Gallery</h2>
        <section className={styles.imageGrid}>
          {images.map((img) => (
            <div key={img.id} className={styles.imageCard} style={{ position: 'relative' }}>
              <img src={img.src} alt="gallery" className={styles.eventImage} style={{ opacity: img.approved === false ? 0.6 : 1 }} />
                {!img.approved && !String(img.id).startsWith('local-') && (
                  <div style={{ position: 'absolute', top: 10, right: 10, background: '#ff9800', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    Pending
                  </div>
                )}
                <div className={styles.imageInfo}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button className={styles.btnDanger} onClick={() => handleDelete(img.id)}>Delete</button>
                  </div>
                </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

export default CoordinatorGallery
