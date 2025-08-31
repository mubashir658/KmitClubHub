"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const CoordinatorPolls = () => {
  const { user } = useAuth()
  const [polls, setPolls] = useState([])
  const [form, setForm] = useState({ question: "", options: ["", ""] })
  const [loading, setLoading] = useState(true)
  const [club, setClub] = useState(null)
  const [error, setError] = useState(null)

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
      
    } catch (error) {
      console.error('Error fetching club data:', error)
      setError('Failed to load club data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const load = async () => {
    if (!club) return
    
    try {
      const res = await axios.get(`http://localhost:5000/api/polls/club`, { 
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
      })
      setPolls(res.data)
    } catch (e) {
      console.error('Error loading polls:', e)
      setPolls([])
    }
  }

  useEffect(() => {
    fetchClubData()
  }, [])

  useEffect(() => {
    if (club) {
      load()
    }
  }, [club])

  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, ""] }))
  const updateOption = (i, v) => setForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? v : o)) }))

  const create = async (e) => {
    e.preventDefault()
    if (!club) {
      alert("No club assigned. Cannot create poll.")
      return
    }
    
    const cleanOptions = form.options.map((t) => t.trim()).filter(Boolean)
    if (!form.question.trim() || cleanOptions.length < 2) {
      alert("Provide a question and at least two options")
      return
    }
    try {
      await axios.post(
        "http://localhost:5000/api/polls/club",
        { 
          question: form.question, 
          options: cleanOptions
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      setForm({ question: "", options: ["", ""] })
      await load()
    } catch (e) {
      alert(e.response?.data?.message || "Failed to create poll")
    }
  }

  const vote = async (pollId, optionId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/polls/${pollId}/vote`,
        { optionId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      alert("Vote submitted successfully!")
      // Refresh polls to show updated results
      await load()
    } catch (e) {
      alert(e.response?.data?.message || "Failed to submit vote")
    }
  }

  const getTotalVotes = (poll) => {
    return poll.options?.reduce((total, option) => total + (option.votes || 0), 0) || 0
  }

  const getPercentage = (votes, total) => {
    if (total === 0) return 0
    return Math.round((votes / total) * 100)
  }

  if (loading) {
    return <div className="loading">Loading club data...</div>
  }

  if (error) {
    return (
      <div className={styles.dashboardHome}>
        <div className={styles.welcomeSection}>
          <h1>Club Polls</h1>
          <p>Create and manage polls for your club</p>
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
          <h1>Club Polls</h1>
          <p>Create and manage polls for your club</p>
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
        <h1>Club Polls</h1>
        <p>Create and manage polls for {club.name}</p>
      </div>

      <div className={styles.section}>
        <div className={styles.eventForm}>
          <h2>Create Poll</h2>
          <form onSubmit={create}>
            <div className={styles.formGroup}>
              <label>Question</label>
              <input
                type="text"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className={styles.formControl}
                required
              />
            </div>
            {form.options.map((opt, idx) => (
              <div className={styles.formGroup} key={idx}>
                <label>Option {idx + 1}</label>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  className={styles.formControl}
                  required
                />
              </div>
            ))}
            <button type="button" onClick={addOption} style={{ marginRight: '10px' }}>Add Option</button>
            <button type="submit" className={styles.submitBtn}>Create Poll</button>
          </form>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Club Polls - Vote & View Results</h2>
        <div className={styles.eventsList}>
          {polls.map((poll) => {
            const totalVotes = getTotalVotes(poll)
            return (
              <div key={poll._id} className={styles.eventItem} style={{ 
                border: '2px solid #e9ecef', 
                borderRadius: '12px', 
                padding: '20px',
                marginBottom: '20px',
                backgroundColor: '#fff'
              }}>
                <div className={styles.eventInfo}>
                  <h4 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>
                    {poll.question}
                  </h4>
                  <p style={{ marginBottom: '15px', color: '#666' }}>
                    <strong>Status:</strong> {poll.status}
                    {poll.clubId && <span> - {poll.clubId.name}</span>}
                  </p>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Total Votes: {totalVotes}</strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {poll.options?.map((option) => {
                      const percentage = getPercentage(option.votes || 0, totalVotes)
                      return (
                        <div key={option._id} style={{
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          padding: '15px',
                          backgroundColor: '#f8f9fa',
                          position: 'relative'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '500', fontSize: '14px' }}>{option.text}</span>
                            <button
                              onClick={() => vote(poll._id, option._id)}
                              style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Vote
                            </button>
                          </div>
                          
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ fontWeight: '500' }}>{option.votes || 0} votes</span>
                            <span style={{ marginLeft: '10px', color: '#666' }}>({percentage}%)</span>
                          </div>
                          
                          <div style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: '#e9ecef',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: '#007bff',
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {polls.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No polls created yet. Create your first poll above!
          </div>
        )}
      </div>
    </div>
  )
}

export default CoordinatorPolls
