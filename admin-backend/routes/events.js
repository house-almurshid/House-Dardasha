const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const ImageKit = require('imagekit');

const upload = multer({ storage: multer.memoryStorage() });

const imagekit = new ImageKit({
  publicKey: "public_LnwB1ARWQI1my8HYBQwQJbet/WE=",
  privateKey: "private_04ATe/zjw6DbNQxtVDrtnttx7MM=",
  urlEndpoint: "https://ik.imagekit.io/aldardashahouse"
});

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
router.post('/upload', adminAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

  try {
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer, // Buffer from multer memory storage
      fileName: req.file.originalname,
      folder: "/events"
    });

    res.json({ fileUrl: uploadResponse.url });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed.', error: err.message });
  }
});

module.exports = router;