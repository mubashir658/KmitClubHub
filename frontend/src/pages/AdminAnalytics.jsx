import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import styles from "./AdminAnalytics.module.css"

const AdminAnalytics = () => {
  const { user } = useAuth()
  const [selectedClub, setSelectedClub] = useState("all")
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Analytics data states
  const [summaryData, setSummaryData] = useState({
    totalClubs: 0,
    totalCoordinators: 0,
    totalStudents: 0,
    totalEvents: 0,
    upcomingEvents: 0,
  })
  const [eventsPerClub, setEventsPerClub] = useState([])
  const [studentGrowth, setStudentGrowth] = useState([])
  const [studentDistribution, setStudentDistribution] = useState([])
  const [insights, setInsights] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  // Colors for charts
  const COLORS = ["#6C63FF", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"]

  useEffect(() => {
    fetchClubs()
    fetchAnalyticsData()
  }, [])

  useEffect(() => {
    if (selectedClub) {
      fetchAnalyticsData()
    }
  }, [selectedClub])

  const fetchClubs = async () => {
    try {
      const response = await axios.get("/api/clubs")
      setClubs(response.data)
    } catch (error) {
      console.error("Error fetching clubs:", error)
    }
  }

  const fetchAnalyticsData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const clubFilter = selectedClub === "all" ? "" : `?clubId=${selectedClub}`
      
      const [
        summaryRes,
        eventsRes,
        growthRes,
        distributionRes,
        insightsRes,
        activityRes,
      ] = await Promise.all([
        axios.get(`/api/admin/analytics/summary${clubFilter}`),
        axios.get(`/api/admin/analytics/events-per-club${clubFilter}`),
        axios.get(`/api/admin/analytics/student-growth${clubFilter}`),
        axios.get(`/api/admin/analytics/student-distribution${clubFilter}`),
        axios.get(`/api/admin/analytics/insights${clubFilter}`),
        axios.get(`/api/admin/analytics/recent-activity${clubFilter}`),
      ])

      setSummaryData(summaryRes.data)
      setEventsPerClub(eventsRes.data)
      setStudentGrowth(growthRes.data)
      setStudentDistribution(distributionRes.data)
      setInsights(insightsRes.data)
      setRecentActivity(activityRes.data)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      setError("Failed to load analytics data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleClubChange = (e) => {
    setSelectedClub(e.target.value)
  }

  if (loading) {
    return (
      <div className={styles.analyticsContainer}>
        <div className={styles.loadingContainer}>
          <div className="text-center">
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Loading analytics dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.analyticsContainer}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Analytics Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              View overall system statistics and performance insights.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <select
              value={selectedClub}
              onChange={handleClubChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value="all">All Clubs</option>
              {clubs.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Clubs</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{summaryData.totalClubs}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏫</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Coordinators</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{summaryData.totalCoordinators}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨‍🏫</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{summaryData.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👩‍🎓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{summaryData.totalEvents}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎉</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Upcoming Events</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{summaryData.upcomingEvents}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🕒</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Events per Club Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Events per Club</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventsPerClub}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="events" fill="#6C63FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Student Growth Line Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Student Registrations Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={studentGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="students" 
                stroke="#6C63FF" 
                strokeWidth={3}
                dot={{ fill: "#6C63FF", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Student Distribution Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Student Distribution by Club</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={studentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {studentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Insights Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Key Insights</h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r ${insight.color} rounded-xl p-4 text-white`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <h4 className="font-semibold">{insight.title}</h4>
                    <p className="text-lg font-bold">{insight.value}</p>
                    <p className="text-sm opacity-90">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Club</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Action/Event</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Participants</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(activity.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-medium">{activity.club}</td>
                  <td className="py-3 px-4 text-gray-600">{activity.action}</td>
                  <td className="py-3 px-4 text-gray-600">{activity.participants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
