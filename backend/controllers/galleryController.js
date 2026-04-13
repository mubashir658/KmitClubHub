const Gallery = require('../models/Gallery');
const Club = require('../models/Club');

// Upload images (using express-fileupload)
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({ message: 'No images provided' });
    }

    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

    // Determine clubId: prefer user's coordinatingClub, fallback to body
    const clubId = req.user.coordinatingClub || req.body.clubId;
    if (!clubId) return res.status(400).json({ message: 'Club ID is required' });

    // Check if the user is Traces of Lenses coordinator
    let isApproved = false;
    if (req.user.role === 'admin') {
      isApproved = true;
    } else if (clubId) {
      const club = await Club.findById(clubId);
      if (club && club.clubKey === 'PC12355') {
        isApproved = true;
      }
    }

    const saved = [];

    for (const file of images) {
      // convert buffer to base64 data URL (similar to profile storage)
      const mime = file.mimetype || 'image/jpeg';
      const base64 = file.data.toString('base64');
      const dataUrl = `data:${mime};base64,${base64}`;

      const g = new Gallery({
        clubId,
        imageUrl: dataUrl,
        caption: req.body.caption || '',
        uploadedBy: req.user.userId,
        approved: isApproved
      });

      await g.save();
      saved.push({ _id: g._id, url: g.imageUrl, approved: isApproved });
    }

    res.json({ success: true, images: saved });
  } catch (err) {
    console.error('Gallery upload error:', err);
    res.status(500).json({ message: 'Failed to upload images', error: err.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const id = req.params.id;
    const img = await Gallery.findById(id);
    if (!img) return res.status(404).json({ message: 'Image not found' });

    // Only allow deletion by uploader or club coordinator/admin
    const isUploader = String(img.uploadedBy) === String(req.user.userId);
    const isCoordinatorOfClub = String(req.user.coordinatingClub) === String(img.clubId);
    if (!isUploader && !isCoordinatorOfClub && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Gallery.findByIdAndDelete(id);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    console.error('Gallery delete error:', err);
    res.status(500).json({ message: 'Failed to delete image', error: err.message });
  }
};

exports.listByClub = async (req, res) => {
  try {
    const clubId = req.params.clubId || req.user.coordinatingClub;
    if (!clubId) return res.status(400).json({ message: 'Club ID required' });

    // Show all images (pending and approved) for a specific club internally
    const images = await Gallery.find({ clubId }).sort({ uploadedAt: -1 }).lean();
    res.json({ images });
  } catch (err) {
    console.error('Gallery list error:', err);
    res.status(500).json({ message: 'Failed to list images', error: err.message });
  }
};

exports.listAllImages = async (req, res) => {
  try {
    // Only approved ones for the public page
    const images = await Gallery.find({ approved: true }).sort({ uploadedAt: -1 }).lean();
    res.json({ images });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list all images', error: err.message });
  }
};

exports.listPendingImages = async (req, res) => {
  try {
    const clubId = req.user.coordinatingClub;
    if (req.user.role !== 'admin') {
      const club = await Club.findById(clubId);
      if (!club || club.clubKey !== 'PC12355') {
        return res.status(403).json({ message: 'Forbidden: Only Traces of Lenses coordinator can review pending images' });
      }
    }
    const images = await Gallery.find({ approved: false }).populate('clubId', 'name').sort({ uploadedAt: 1 }).lean();
    res.json({ images });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list pending images', error: err.message });
  }
};

exports.approveImage = async (req, res) => {
  try {
    const clubId = req.user.coordinatingClub;
    if (req.user.role !== 'admin') {
      const club = await Club.findById(clubId);
      if (!club || club.clubKey !== 'PC12355') {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    const id = req.params.id;
    await Gallery.findByIdAndUpdate(id, { approved: true });
    res.json({ success: true, message: 'Image approved' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve image', error: err.message });
  }
};
