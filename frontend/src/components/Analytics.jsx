import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import styles from './Analytics.module.css';

const Analytics = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState({
    userRoles: [],
    eventStatus: [],
    clubEvents: [],
    monthlyTrends: [],
    feedbackSentiment: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color schemes for different charts
  const COLORS = {
    userRoles: ['#8884d8', '#82ca9d', '#ffc658'],
    eventStatus: ['#ff7300', '#00c49f', '#ff6b6b'],
    clubEvents: ['#0088fe', '#00c49f', '#ffbb28', '#ff7300', '#8884d8', '#82ca9d', '#ffc658', '#ff6b6b'],
    feedbackSentiment: ['#00c49f', '#ffbb28', '#ff6b6b']
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching analytics data...');
      
      // Fetch analytics data from the dedicated endpoint
      const response = await axios.get('/api/analytics/dashboard');
      console.log('Analytics response:', response.data);
      
      const data = response.data;

      setAnalyticsData({
        userRoles: data.userRoles || [],
        eventStatus: data.eventStatus || [],
        clubEvents: data.clubEvents || [],
        monthlyTrends: data.monthlyTrends || [],
        feedbackSentiment: data.feedbackSentiment || []
      });
      
      console.log('Analytics data set:', {
        userRoles: data.userRoles || [],
        eventStatus: data.eventStatus || [],
        clubEvents: data.clubEvents || [],
        monthlyTrends: data.monthlyTrends || [],
        feedbackSentiment: data.feedbackSentiment || []
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError(`Failed to load analytics data: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.loadingSpinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h2>⚠️ Error Loading Analytics</h2>
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={fetchAnalyticsData}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Check if we have any data to display
  const hasData = analyticsData.userRoles.length > 0 || 
                  analyticsData.eventStatus.length > 0 || 
                  analyticsData.clubEvents.length > 0 || 
                  analyticsData.monthlyTrends.length > 0 || 
                  analyticsData.feedbackSentiment.length > 0;

  return (
    <motion.div
      className={styles.analyticsContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <button 
              className={styles.backButton}
              onClick={() => navigate(-1)}
            >
              ← Back to Dashboard
            </button>
            <h1>Analytics Dashboard</h1>
            <p>Comprehensive insights into your KMIT Club Hub</p>
          </div>
          <button 
            className={styles.refreshButton}
            onClick={fetchAnalyticsData}
            disabled={loading}
          >
            {loading ? '🔄' : '↻'} Refresh
          </button>
        </div>
      </div>

      {!hasData && !loading && !error && (
        <div className={styles.noDataContainer}>
          <div className={styles.noDataContent}>
            <h2>📊 No Data Available</h2>
            <p>There's no data to display yet. This could be because:</p>
            <ul>
              <li>No users have been registered yet</li>
              <li>No events have been created</li>
              <li>No feedback has been submitted</li>
            </ul>
            <p>Try creating some data first, then refresh the analytics.</p>
          </div>
        </div>
      )}

      <div className={styles.chartsGrid}>
        {/* User Role Distribution */}
        <motion.div className={styles.chartCard} variants={cardVariants}>
          <h3>User Role Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.userRoles}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.userRoles.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.userRoles[index % COLORS.userRoles.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Event Status Overview */}
        <motion.div className={styles.chartCard} variants={cardVariants}>
          <h3>Event Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.eventStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Club-wise Event Distribution */}
        <motion.div className={styles.chartCard} variants={cardVariants}>
          <h3>Club-wise Event Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.clubEvents} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="events" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Event Trends */}
        <motion.div className={styles.chartCard} variants={cardVariants}>
          <h3>Monthly Event Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="events" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="approved" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Feedback Sentiment Breakdown */}
        <motion.div className={styles.chartCard} variants={cardVariants}>
          <h3>Feedback Sentiment Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.feedbackSentiment}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.feedbackSentiment.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.feedbackSentiment[index % COLORS.feedbackSentiment.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Summary Stats */}
        <motion.div className={styles.chartCard} variants={cardVariants}>
          <h3>Quick Stats</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <h4>{analyticsData.userRoles.reduce((sum, role) => sum + role.value, 0)}</h4>
              <p>Total Users</p>
            </div>
            <div className={styles.statItem}>
              <h4>{analyticsData.eventStatus.reduce((sum, status) => sum + status.value, 0)}</h4>
              <p>Total Events</p>
            </div>
            <div className={styles.statItem}>
              <h4>{analyticsData.clubEvents.length}</h4>
              <p>Active Clubs</p>
            </div>
            <div className={styles.statItem}>
              <h4>{analyticsData.feedbackSentiment.reduce((sum, sentiment) => sum + sentiment.value, 0)}</h4>
              <p>Total Feedback</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Analytics;
