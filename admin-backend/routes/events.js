const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const adminAuth = require('../middleware/adminAuth');

// Get all events
router.get('/', adminAuth, async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
});

// Add new event
router.post('/', adminAuth, async (req, res) => {
  const { title, date } = req.body;
  if (!title || !date) return res.status(400).json({ message: 'Title and date required' });
  const event = new Event({ title, date });
  await event.save();
  res.json({ message: 'Event added', event });
});

// Delete event
router.delete('/:id', adminAuth, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: 'Event deleted' });
});

module.exports = router;