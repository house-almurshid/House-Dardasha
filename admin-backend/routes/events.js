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
  params: {
    folder: 'events', // Cloudinary folder name
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto'
  }
});

const upload = multer({ storage });

// Get all events
router.get('/', adminAuth, async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
});

// Add new event
router.post('/', adminAuth, upload.single('file'), async (req, res) => {
  console.log('BODY:', req.body);
  console.log('FILE:', req.file);
  const { title, date, details } = req.body;
  if (!title || !date || !details) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  let fileUrl = '';
  if (req.file) {
    fileUrl = req.file.path; // Cloudinary URL
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