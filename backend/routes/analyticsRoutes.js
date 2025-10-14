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

// Get analytics summary data
router.get('/summary', auth, requireRole(['admin']), async (req, res) => {
  try {
    const clubId = req.query.clubId;
    
    const [clubs, coordinators, students, events, upcomingEvents] = await Promise.all([
      Club.find(clubId ? { _id: clubId } : {}).countDocuments(),
      User.find({ 
        role: 'coordinator', 
        ...(clubId ? { coordinatingClub: clubId } : {}) 
      }).countDocuments(),
      User.find({ 
        role: 'student', 
        ...(clubId ? { clubs: clubId } : {}) 
      }).countDocuments(),
      Event.find(clubId ? { club: clubId } : {}).countDocuments(),
      Event.find({ 
        ...(clubId ? { club: clubId } : {}), 
        date: { $gte: new Date() } 
      }).countDocuments()
    ]);

    res.json({
      totalClubs: clubs,
      totalCoordinators: coordinators,
      totalStudents: students,
      totalEvents: events,
      upcomingEvents: upcomingEvents
    });
  } catch (error) {
    console.error('Error fetching summary data:', error);
    res.status(500).json({ message: 'Error fetching summary data', error: error.message });
  }
});

// Get events per club data
router.get('/events-per-club', auth, requireRole(['admin']), async (req, res) => {
  try {
    const clubId = req.query.clubId;
    
    let events;
    if (clubId) {
      events = await Event.find({ club: clubId }).populate('club', 'name');
    } else {
      events = await Event.find().populate('club', 'name');
    }

    const clubEventCount = events.reduce((acc, event) => {
      const clubName = event.club?.name || 'Unknown Club';
      acc[clubName] = (acc[clubName] || 0) + 1;
      return acc;
    }, {});

    const eventsPerClub = Object.entries(clubEventCount)
      .map(([name, events]) => ({ name, events }))
      .sort((a, b) => b.events - a.events);

    res.json(eventsPerClub);
  } catch (error) {
    console.error('Error fetching events per club:', error);
    res.status(500).json({ message: 'Error fetching events per club', error: error.message });
  }
});

// Get student growth data
router.get('/student-growth', auth, requireRole(['admin']), async (req, res) => {
  try {
    const clubId = req.query.clubId;
    const clubQuery = clubId ? { clubs: clubId } : {};
    
    const students = await User.find({ 
      role: 'student', 
      ...clubQuery 
    }).select('createdAt');
    
    const now = new Date();
    const monthlyData = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthStudents = students.filter(student => {
        const studentDate = new Date(student.createdAt);
        return studentDate.getMonth() === date.getMonth() && 
               studentDate.getFullYear() === date.getFullYear();
      });

      monthlyData.push({
        month: monthName,
        students: monthStudents.length
      });
    }

    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching student growth:', error);
    res.status(500).json({ message: 'Error fetching student growth', error: error.message });
  }
});

// Get student distribution by club
router.get('/student-distribution', auth, requireRole(['admin']), async (req, res) => {
  try {
    const clubId = req.query.clubId;
    
    if (clubId) {
      // If filtering by specific club, return single club data
      const club = await Club.findById(clubId);
      const studentCount = await User.find({ 
        role: 'student', 
        clubs: clubId 
      }).countDocuments();
      
      res.json([{
        name: club?.name || 'Unknown Club',
        value: 100,
        count: studentCount
      }]);
    } else {
      // Get distribution across all clubs
      const clubs = await Club.find();
      const distribution = [];
      
      for (const club of clubs) {
        const studentCount = await User.find({ 
          role: 'student', 
          clubs: club._id 
        }).countDocuments();
        if (studentCount > 0) {
          distribution.push({
            name: club.name,
            count: studentCount
          });
        }
      }
      
      const totalStudents = distribution.reduce((sum, item) => sum + item.count, 0);
      
      const distributionWithPercentages = distribution.map(item => ({
        name: item.name,
        value: totalStudents > 0 ? Math.round((item.count / totalStudents) * 100) : 0,
        count: item.count
      }));

      res.json(distributionWithPercentages);
    }
  } catch (error) {
    console.error('Error fetching student distribution:', error);
    res.status(500).json({ message: 'Error fetching student distribution', error: error.message });
  }
});

// Get insights data
router.get('/insights', auth, requireRole(['admin']), async (req, res) => {
  try {
    const clubId = req.query.clubId;
    const clubQuery = clubId ? { club: clubId } : {};
    const userClubQuery = clubId ? { clubs: clubId } : {};
    
    const [events, students] = await Promise.all([
      Event.find(clubQuery).populate('club', 'name'),
      User.find({ role: 'student', ...userClubQuery })
    ]);

    // Find top performing club
    const clubEventCount = events.reduce((acc, event) => {
      const clubName = event.club?.name || 'Unknown Club';
      if (!acc[clubName]) {
        acc[clubName] = { events: 0, participants: 0 };
      }
      acc[clubName].events += 1;
      acc[clubName].participants += event.registeredStudents?.length || 0;
      return acc;
    }, {});

    const topClub = Object.entries(clubEventCount)
      .sort((a, b) => b[1].events - a[1].events)[0];

    // Calculate growth (mock calculation)
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = new Date().getFullYear();
    
    const currentMonthStudents = students.filter(s => {
      const date = new Date(s.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
    
    const lastMonthStudents = students.filter(s => {
      const date = new Date(s.createdAt);
      return date.getMonth() === lastMonth && date.getFullYear() === currentYear;
    }).length;
    
    const growthPercentage = lastMonthStudents > 0 
      ? Math.round(((currentMonthStudents - lastMonthStudents) / lastMonthStudents) * 100)
      : 0;

    // Calculate average attendance
    const totalParticipants = events.reduce((sum, event) => 
      sum + (event.registeredStudents?.length || 0), 0);
    const averageAttendance = events.length > 0 ? Math.round(totalParticipants / events.length) : 0;

    const insights = [
      {
        title: "Top Performing Club",
        value: topClub ? topClub[0] : "N/A",
        description: topClub ? `${topClub[1].events} events, ${topClub[1].participants} participants` : "No data available",
        icon: "🏆",
        color: "from-yellow-400 to-orange-500"
      },
      {
        title: "Participation Growth",
        value: `${growthPercentage >= 0 ? '+' : ''}${growthPercentage}%`,
        description: "this month",
        icon: "📈",
        color: "from-green-400 to-blue-500"
      },
      {
        title: "Average Attendance",
        value: `${averageAttendance} students`,
        description: "per event",
        icon: "👥",
        color: "from-purple-400 to-pink-500"
      }
    ];

    res.json(insights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ message: 'Error fetching insights', error: error.message });
  }
});

// Get recent activity data
router.get('/recent-activity', auth, requireRole(['admin']), async (req, res) => {
  try {
    const clubId = req.query.clubId;
    const clubQuery = clubId ? { club: clubId } : {};
    
    const events = await Event.find(clubQuery)
      .populate('club', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title date createdAt club registeredStudents');

    const recentActivity = events.map(event => ({
      date: event.createdAt,
      club: event.club?.name || 'Unknown Club',
      action: `Event: ${event.title}`,
      participants: event.registeredStudents?.length || 0
    }));

    res.json(recentActivity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Error fetching recent activity', error: error.message });
  }
});

module.exports = router;


