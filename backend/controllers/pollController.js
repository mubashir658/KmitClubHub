const Poll = require('../models/Poll');
const Club = require('../models/Club');

// Create poll (admin: scope all/coordinators/club, coordinator: club)
exports.createPoll = async (req, res) => {
  try {
    const { question, options, scope = 'club', clubId, clubIds } = req.body;
    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Question and at least two options are required' });
    }

    // Role-based constraints
    let finalScope = scope;
    let finalClubId = clubId || null;
    if (req.user.role === 'coordinator') {
      finalScope = 'club';
      // For coordinators, always use their coordinatingClub
      finalClubId = req.user.coordinatingClub;
      
      // Validate coordinator has a club assigned
      if (!finalClubId) {
        return res.status(400).json({ message: 'No club assigned to this coordinator' });
      }
      
      const club = await Club.findById(finalClubId);
      if (!club) return res.status(404).json({ message: 'Club not found' });
      
      // No need to check coordinators array since we have coordinatingClub field
      // The coordinatingClub field is the source of truth for coordinator-club relationship
    }

    if (req.user.role === 'admin') {
      if (finalScope === 'club') {
        const ids = Array.isArray(clubIds) && clubIds.length > 0 ? clubIds : (finalClubId ? [finalClubId] : []);
        if (ids.length === 0) {
          return res.status(400).json({ message: 'Provide at least one clubId when scope is club' });
        }
        const docs = ids.map(id => ({
          scope: 'club',
          clubId: id,
          question,
          options: options.map(text => ({ text })),
          createdBy: req.user.userId,
        }));
        const created = await Poll.insertMany(docs);
        return res.status(201).json(created);
      }
    }

    const poll = await Poll.create({
      scope: finalScope,
      clubId: finalClubId,
      question,
      options: options.map(text => ({ text })),
      createdBy: req.user.userId,
    });
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// List active polls for student (club scope for their clubs, or global/all/coordinators when applicable)
exports.getActivePollsForUser = async (req, res) => {
  try {
    const role = req.user.role;
    let filter = { status: 'active' };
    if (role === 'student') {
      // Show all-club polls and specific club polls for any club the student is in
      const userClubIds = req.user.joinedClubs ? req.user.joinedClubs.map(club => club._id) : [];
      filter.$or = [
        { scope: 'all' },
        { scope: 'club', clubId: { $in: userClubIds } },
      ];
    } else if (role === 'coordinator') {
      filter.$or = [ { scope: 'all' }, { scope: 'coordinators' } ];
    } else if (role === 'admin') {
      // admins can see all active
    }
    const polls = await Poll.find(filter).populate('clubId', 'name');
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Vote
exports.vote = async (req, res) => {
  try {
    const { optionId } = req.body;
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.status !== 'active') return res.status(400).json({ message: 'Poll is not active' });

    // Prevent double vote by same user
    const already = poll.votes.find(v => String(v.userId) === req.user.userId);
    if (already) return res.status(400).json({ message: 'Already voted' });

    // Find option index
    const idx = poll.options.findIndex(o => String(o._id) === optionId);
    if (idx === -1) return res.status(400).json({ message: 'Invalid option' });

    poll.options[idx].votes = (poll.options[idx].votes || 0) + 1;
    poll.votes.push({ userId: req.user.userId, optionIndex: idx });
    await poll.save();
    res.json({ message: 'Vote recorded', poll });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Coordinator: list their club polls
exports.getCoordinatorClubPolls = async (req, res) => {
  try {
    // For coordinators, always use their coordinatingClub
    const coordinatorClubId = req.user.coordinatingClub;
    
    if (!coordinatorClubId) {
      return res.status(400).json({ message: 'No club assigned to this coordinator' });
    }
    
    const filter = { 
      scope: 'club',
      clubId: coordinatorClubId
    };
    
    const polls = await Poll.find(filter).populate('clubId', 'name');
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: manage list (all polls)
exports.adminList = async (req, res) => {
  try {
    const polls = await Poll.find().populate('clubId', 'name');
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


