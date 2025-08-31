"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import styles from "./Dashboard.module.css"

const AdminPolls = () => {
  const [polls, setPolls] = useState([])
  const [clubs, setClubs] = useState([])
  const [form, setForm] = useState({ question: "", options: ["", ""], scope: "all", clubIds: [] })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [pollRes, clubsRes] = await Promise.all([
        axios.get("/api/polls/manage", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        axios.get("/api/clubs"),
      ])
      setPolls(pollRes.data)
      setClubs(clubsRes.data || [])
    } catch (e) {
      console.error("Error loading data:", e)
      setPolls([])
      setClubs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, ""] }))
  const updateOption = (i, v) => setForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? v : o)) }))

  const create = async (e) => {
    e.preventDefault()
    const cleanOptions = form.options.map((t) => t.trim()).filter(Boolean)
    if (!form.question.trim() || cleanOptions.length < 2) {
      alert("Provide a question and at least two options")
      return
    }
    try {
      await axios.post(
        "/api/polls",
        { question: form.question, options: cleanOptions, scope: form.scope, clubIds: form.scope === "club" ? form.clubIds : undefined },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      setForm({ question: "", options: ["", ""], scope: "all", clubIds: [] })
      await load()
    } catch (e) {
      alert(e.response?.data?.message || "Failed to create poll")
    }
  }

  const vote = async (pollId, optionId) => {
    try {
      await axios.post(
        `/api/polls/${pollId}/vote`,
        { optionId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      alert("Vote submitted successfully!")
      await load() // Refresh polls to show updated results
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

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className={styles.section}>
      <h1>Admin Polls</h1>
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
          <div className={styles.formGroup}>
            <label>Audience</label>
            <select
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              className={styles.formControl}
            >
              <option value="all">All Clubs</option>
              <option value="coordinators">Coordinators</option>
              <option value="club">Specific Club</option>
            </select>
          </div>
          {form.scope === "club" && (
            <div className={styles.formGroup}>
              <label>Select Clubs (choose one or more)</label>
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 12,
                  maxHeight: 200,
                  overflowY: 'auto',
                  background: '#fff'
                }}
              >
                <div style={{ marginBottom: 12, color: '#666', fontSize: '14px', fontWeight: '500' }}>
                  Available Clubs: {clubs.length}
                </div>
                {clubs && clubs.length > 0 ? (
                  clubs.map((club) => {
                    const checked = form.clubIds.includes(club._id)
                    return (
                      <label key={club._id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 10, 
                        marginBottom: 10, 
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '4px',
                        backgroundColor: checked ? '#f0f8ff' : 'transparent',
                        border: checked ? '1px solid #007bff' : '1px solid transparent'
                      }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...form.clubIds, club._id]
                              : form.clubIds.filter(id => id !== club._id)
                            setForm({ ...form, clubIds: next })
                          }}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{club.name}</span>
                      </label>
                    )
                  })
                ) : (
                  <div style={{ color: '#777', textAlign: 'center', padding: '20px' }}>
                    No clubs available
                  </div>
                )}
              </div>
            </div>
          )}
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

      <div className={styles.section}>
        <h2>Active Polls - Vote & View Results</h2>
        <div className={styles.eventsList}>
          {polls.filter(p => p.status === 'active').map((poll) => {
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
                    <strong>Scope:</strong> {poll.scope}
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
        
        {polls.filter(p => p.status === 'active').length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No active polls available. Create a new poll above!
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPolls
