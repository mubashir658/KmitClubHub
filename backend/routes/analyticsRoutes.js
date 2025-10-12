const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../utils/middleware');
const User = require('../models/User');
const Event = require('../models/Event');
const Feedback = require('../models/Feedback');
const Club = require('../models/Club');

// Get analytics data for admin dashboard
router.get('/dashboard', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Get all data in parallel
    const [users, events, feedback, clubs] = await Promise.all([
      User.find().select('role createdAt'),
      Event.find().populate('club', 'name').select('status date createdAt'),
      Feedback.find().select('type status createdAt'),
      Club.find().select('name')
    ]);

    // User role distribution
    const userRoleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const userRoles = Object.entries(userRoleDistribution).map(([role, count]) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: count
    }));

    // Event status distribution
    const eventStatusDistribution = events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {});

    const eventStatus = Object.entries(eventStatusDistribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));

    // Club-wise event distribution
    const clubEventDistribution = events.reduce((acc, event) => {
      const clubName = event.club?.name || 'Unknown Club';
      acc[clubName] = (acc[clubName] || 0) + 1;
      return acc;
    }, {});

    const clubEvents = Object.entries(clubEventDistribution)
      .map(([club, count]) => ({ name: club, events: count }))
      .sort((a, b) => b.events - a.events)
      .slice(0, 10); // Top 10 clubs

    // Monthly event trends (last 12 months)
    const monthlyTrends = getMonthlyTrends(events);

    // Feedback sentiment analysis (mock implementation)
    const feedbackSentiment = analyzeFeedbackSentiment(feedback);

    // Additional metrics
    const totalUsers = users.length;
    const totalEvents = events.length;
    const totalFeedback = feedback.length;
    const totalClubs = clubs.length;
    const activeEvents = events.filter(e => e.status === 'approved').length;
    const pendingEvents = events.filter(e => e.status === 'pending').length;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = users.filter(user => user.createdAt >= sevenDaysAgo).length;
    const recentEvents = events.filter(event => event.createdAt >= sevenDaysAgo).length;
    const recentFeedback = feedback.filter(fb => fb.createdAt >= sevenDaysAgo).length;

    res.json({
      userRoles,
      eventStatus,
      clubEvents,
      monthlyTrends,
      feedbackSentiment,
      summary: {
        totalUsers,
        totalEvents,
        totalFeedback,
        totalClubs,
        activeEvents,
        pendingEvents,
        recentUsers,
        recentEvents,
        recentFeedback
      }
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ message: 'Error fetching analytics data', error: error.message });
  }
});

// Get detailed event analytics
router.get('/events', auth, requireRole(['admin']), async (req, res) => {
  try {
    const events = await Event.find()
      .populate('club', 'name')
      .populate('createdBy', 'name')
      .select('title status date createdAt club createdBy registeredStudents');

    // Event participation rate
    const participationRate = events.reduce((acc, event) => {
      const rate = event.registeredStudents ? event.registeredStudents.length : 0;
      return acc + rate;
    }, 0) / events.length || 0;

    // Most popular events
    const popularEvents = events
      .filter(e => e.registeredStudents)
      .sort((a, b) => (b.registeredStudents?.length || 0) - (a.registeredStudents?.length || 0))
      .slice(0, 5)
      .map(event => ({
        title: event.title,
        club: event.club?.name,
        participants: event.registeredStudents?.length || 0,
        date: event.date
      }));

    // Event creation trends by month
    const creationTrends = getEventCreationTrends(events);

    res.json({
      participationRate: Math.round(participationRate * 100) / 100,
      popularEvents,
      creationTrends,
      totalEvents: events.length
    });
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    res.status(500).json({ message: 'Error fetching event analytics', error: error.message });
  }
});

// Get user engagement analytics
router.get('/users', auth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('role createdAt year branch');
    
    // User registration trends
    const registrationTrends = getRegistrationTrends(users);
    
    // User distribution by year (for students)
    const students = users.filter(u => u.role === 'student');
    const yearDistribution = students.reduce((acc, student) => {
      if (student.year) {
        acc[student.year] = (acc[student.year] || 0) + 1;
      }
      return acc;
    }, {});

    // User distribution by branch (for students)
    const branchDistribution = students.reduce((acc, student) => {
      if (student.branch) {
        acc[student.branch] = (acc[student.branch] || 0) + 1;
      }
      return acc;
    }, {});

    res.json({
      registrationTrends,
      yearDistribution: Object.entries(yearDistribution).map(([year, count]) => ({
        year: `Year ${year}`,
        count
      })),
      branchDistribution: Object.entries(branchDistribution).map(([branch, count]) => ({
        branch,
        count
      })),
      totalUsers: users.length
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ message: 'Error fetching user analytics', error: error.message });
  }
});

// Helper functions
function getMonthlyTrends(events) {
  const now = new Date();
  const months = [];
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === date.getMonth() && 
             eventDate.getFullYear() === date.getFullYear();
    });

    months.push({
      month: monthName,
      events: monthEvents.length,
      approved: monthEvents.filter(e => e.status === 'approved').length,
      pending: monthEvents.filter(e => e.status === 'pending').length,
      rejected: monthEvents.filter(e => e.status === 'rejected').length
    });
  }
  
  return months;
}

function analyzeFeedbackSentiment(feedback) {
  // Mock sentiment analysis - in a real app, you'd use NLP services
  const total = feedback.length;
  const positive = Math.floor(total * 0.6);
  const neutral = Math.floor(total * 0.25);
  const negative = total - positive - neutral;

  return [
    { name: 'Positive', value: positive },
    { name: 'Neutral', value: neutral },
    { name: 'Negative', value: negative }
  ];
}

function getEventCreationTrends(events) {
  const now = new Date();
  const trends = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.createdAt);
      return eventDate.getMonth() === date.getMonth() && 
             eventDate.getFullYear() === date.getFullYear();
    });

    trends.push({
      month: monthName,
      created: monthEvents.length
    });
  }
  
  return trends;
}

function getRegistrationTrends(users) {
  const now = new Date();
  const trends = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const monthUsers = users.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === date.getMonth() && 
             userDate.getFullYear() === date.getFullYear();
    });

    trends.push({
      month: monthName,
      registered: monthUsers.length
    });
  }
  
  return trends;
}

module.exports = router;


