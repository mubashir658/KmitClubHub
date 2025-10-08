const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Increased limit for base64 images

// Handle payload too large errors specifically
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      message: 'Request entity too large. Image file is too big. Please use an image smaller than 2MB.' 
    });
  }
  next(err);
});

// MongoDB connection with default URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kmitclubhub';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

console.log('MONGODB_URI:', MONGODB_URI);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));
app.use('/api/polls', require('./routes/pollRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'KMIT Club Hub API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  // Handle specific error types
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      message: 'Request entity too large. Image file is too big. Please use an image smaller than 2MB.' 
    });
  }
  
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});