
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./ClubDetail.module.css"

const ClubDetail = () => {
  const { id } = useParams()
  const { user, token, updateUser } = useAuth()
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrollForm, setEnrollForm] = useState({ year: "", branch: "", section: "" })
  const [enrollMsg, setEnrollMsg] = useState("")

  useEffect(() => {
    fetchClub()
    fetchEvents()
    // eslint-disable-next-line
  }, [id])

  const fetchClub = async () => {
    try {
      const response = await axios.get(`/api/clubs/${id}`)
      setClub(response.data)
    } catch (error) {
      setError("Failed to load club details")
    } finally {
      setLoading(false)
    }
  }

  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])

  const fetchEvents = async () => {
    try {
      // fetch approved events for this club
      const res = await axios.get(`/api/events/club/${id}`)
      const now = new Date()
      const approved = Array.isArray(res.data) ? res.data : []
      const upcoming = []
      const past = []
      approved.forEach(evt => {
        const evtDate = new Date(evt.date)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        if (evtDate >= today) {
          upcoming.push(evt)
        } else {
          past.push(evt)
        }
      })
      upcoming.sort((a,b)=> new Date(a.date) - new Date(b.date))
      past.sort((a,b)=> new Date(b.date) - new Date(a.date))
      setUpcomingEvents(upcoming)
      setPastEvents(past)
    } catch (e) {
      console.error('Failed to load events for club', e)
    }
  }

  const handleEnrollChange = (e) => {
    setEnrollForm({ ...enrollForm, [e.target.name]: e.target.value })
  }

  const submitEnrollment = async (e) => {
    e.preventDefault()
    setEnrollMsg("")
    try {
      // If user's academic info already set, do not resend fields
      const body = (!user?.academicInfoSet) ? {
        year: enrollForm.year ? Number(enrollForm.year) : undefined,
        branch: enrollForm.branch || undefined,
        section: enrollForm.section || undefined
      } : {}

      const res = await axios.post(`/api/clubs/${id}/enroll`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setEnrollMsg('Enrolled successfully!')
      setEnrollForm({ year: "", branch: "", section: "" })
      setEnrollOpen(false)
      
      // Update the user context with the new clubs data
      if (res.data.user) {
        updateUser({
          joinedClubs: res.data.user.joinedClubs,
          year: res.data.user.year,
          branch: res.data.user.branch,
          section: res.data.user.section,
          academicInfoSet: res.data.user.academicInfoSet
        })
      }
      
      // Refresh the page to show updated enrollment status
      window.location.reload()
    } catch (err) {
      setEnrollMsg(err.response?.data?.message || 'Enrollment failed')
    }
  }

  if (loading) return <div className="loading">Loading club details...</div>
  if (error && !club) return <div className="error">{error}</div>

  const isStudent = user && user.role === 'student'
  const enrollmentEnabled = club?.enrollmentOpen
  const isAlreadyEnrolled = user && user.joinedClubs && user.joinedClubs.some(club => club._id === id)

  return (
    <div className={styles.clubDetail}>
      <div className="container">
        {/* Club Header */}
        <div className={styles.clubHeader}>
          <div className={styles.clubLogo}>
            <img src={club.logoUrl || "/placeholder.svg"} alt={club.name} />
          </div>
          <div className={styles.clubInfo}>
            <h1 className={styles.clubName}>{club.name}</h1>
            <p className={styles.clubDescription}>{club.description}</p>
            
            {/* Coordinator Information */}
            {club.coordinators && club.coordinators.length > 0 && (
              <div className={styles.coordinatorInfo}>
                <span className={styles.coordinatorLabel}>Coordinator:</span>
                <span className={styles.coordinatorName}>
                  {club.coordinators.map(coordinator => coordinator.name).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Enrollment section */}
        <div className={styles.section}>
          <h2>Enrollment</h2>
          {!isStudent && (
            <p className={styles.note}>Login as student to enroll.</p>
          )}
          {isStudent && (
            <>
              {isAlreadyEnrolled ? (
                <div className={styles.enrollmentStatus}>
                  <p className={styles.success}>✅ You are already enrolled in this club!</p>
                </div>
              ) : (
                <>
                  <p>Status: {enrollmentEnabled ? 'Open' : 'Closed'}</p>
                  <button
                    className={styles.enrollBtn}
                    disabled={!enrollmentEnabled}
                    onClick={() => setEnrollOpen(!enrollOpen)}
                  >
                    {enrollOpen ? 'Hide Form' : 'Enroll in Club'}
                  </button>
                  {enrollOpen && enrollmentEnabled && (
                    <form onSubmit={submitEnrollment} className={styles.enrollForm}>
                      <div className={styles.formRow}>
                        {!user?.academicInfoSet ? (
                          <>
                            <div className={styles.formGroup}>
                              <label>Year</label>
                              <input
                                type="number"
                                min="1"
                                max="4"
                                name="year"
                                value={enrollForm.year}
                                onChange={handleEnrollChange}
                                className={styles.input}
                                placeholder="Enter your year"
                                required
                              />
                            </div>
                            <div className={styles.formGroup}>
                              <label>Branch</label>
                              <select
                                name="branch"
                                value={enrollForm.branch}
                                onChange={handleEnrollChange}
                                className={styles.input}
                                required
                              >
                                <option value="">Select Branch</option>
                                <option value="CSE">CSE</option>
                                <option value="IT">IT</option>
                                <option value="CSM">CSM</option>
                                <option value="CSD">CSD</option>
                              </select>
                            </div>
                            <div className={styles.formGroup}>
                              <label>Section</label>
                              <select
                                name="section"
                                value={enrollForm.section}
                                onChange={handleEnrollChange}
                                className={styles.input}
                                required
                              >
                                <option value="">Select Section</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                              </select>
                            </div>
                          </>
                        ) : (
                          <div className={styles.formGroup}>
                            <div className={styles.note}>
                              Using saved academic info: Year {user?.year || '-'}, Branch {user?.branch || '-'}, Section {user?.section || '-'}
                            </div>
                          </div>
                        )}
                      </div>
                      <button type="submit" className={styles.submitBtn}>Submit Enrollment</button>
                      {enrollMsg && <div className={styles.note}>{enrollMsg}</div>}
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Team Heads */}
        {club.teamHeads && club.teamHeads.length > 0 && (
          <div className={styles.section}>
            <h2>Team Heads</h2>
            <ul>
              {club.teamHeads.map((head, idx) => (
                <li key={idx}>
                  <strong>{head.name}</strong> ({head.rollNumber}) - {head.designation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Past Events with images */}
        {pastEvents.length > 0 && (
          <div className={styles.section}>
            <h2>Past Events</h2>
            <div className={styles.eventsGrid}>
              {pastEvents.map((evt) => (
                <div key={evt._id} className={styles.eventCard}>
                  <div className={styles.eventImage}>
                    {evt.imageUrl && evt.imageUrl.trim() !== '' ? (
                      <img 
                        src={evt.imageUrl} 
                        alt={evt.title}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div className={styles.eventPlaceholder} style={{ display: (evt.imageUrl && evt.imageUrl.trim() !== '') ? 'none' : 'flex' }}>📅</div>
                  </div>
                  <div className={styles.eventInfoBlock}>
                    <h4>{evt.title}</h4>
                    <p className={styles.eventMeta}><span>{new Date(evt.date).toLocaleDateString()}</span> • <span>{evt.time}</span> • <span>{evt.venue}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events with images */}
        {upcomingEvents.length > 0 && (
          <div className={styles.section}>
            <h2>Upcoming Events</h2>
            <div className={styles.eventsGrid}>
              {upcomingEvents.map((evt) => (
                <div key={evt._id} className={styles.eventCard}>
                  <div className={styles.eventImage}>
                    {evt.imageUrl && evt.imageUrl.trim() !== '' ? (
                      <img 
                        src={evt.imageUrl} 
                        alt={evt.title}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div className={styles.eventPlaceholder} style={{ display: (evt.imageUrl && evt.imageUrl.trim() !== '') ? 'none' : 'flex' }}>📅</div>
                  </div>
                  <div className={styles.eventInfoBlock}>
                    <h4>{evt.title}</h4>
                    <p className={styles.eventMeta}><span>{new Date(evt.date).toLocaleDateString()}</span> • <span>{evt.time}</span> • <span>{evt.venue}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClubDetail
