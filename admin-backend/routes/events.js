const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log('Uploads folder created:', dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 307200 }, // 300 KB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// Serve uploaded files statically
router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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
    fileUrl = `/api/events/uploads/${req.file.filename}`;
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
  const fileUrl = `/api/events/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

module.exports = router;