const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const adminAuth = require('../middleware/adminAuth');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'aldardashahouse',
  api_key: '624543795867867',
  api_secret: '7NY8UzkVzv4JpKjuilak91QCPkk'
});

// Set up storage for multer to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let resourceType = 'image';
    let public_id = Date.now() + '-' + file.originalname.replace(/\.[^/.]+$/, "");
    if (file.mimetype === 'application/pdf') {
      resourceType = 'raw';
      public_id += '.pdf'; // Ensure .pdf extension
    }
    return {
      folder: 'events',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      resource_type: resourceType,
      public_id: public_id
    };
  }
});

const upload = multer({ storage });

// Get all events
router.get('/', adminAuth, async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
});

// Add new event
router.post('/', adminAuth, async (req, res) => {
  const { title, date, details, fileUrl } = req.body;
  if (!title || !date || !details) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  const event = new Event({ title, date, details, fileUrl });
  await event.save();
  res.json({ message: 'Event added', event });
});

// Delete event
router.delete('/:id', adminAuth, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: 'Event deleted' });
});

// Upload file
router.post('/upload', adminAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  const fileUrl = req.file.path; // This is the Cloudinary URL
  res.json({ fileUrl });
});

module.exports = router;