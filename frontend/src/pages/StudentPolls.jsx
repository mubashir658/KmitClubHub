"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import styles from "./Dashboard.module.css"

const StudentPolls = () => {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/polls/active", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
        setPolls(res.data)
      } catch (e) {
        setPolls([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const vote = async (pollId, optionId) => {
    try {
      await axios.post(
        `/api/polls/${pollId}/vote`,
        { optionId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      alert("Vote submitted successfully!")
      // Refresh polls to show updated results
      const res = await axios.get("/api/polls/active", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      setPolls(res.data)
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
      <h1>Active Polls - Vote & View Results</h1>
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
      
      {polls.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No active polls available at the moment.
        </div>
      )}
    </div>
  )
}

export default StudentPolls
