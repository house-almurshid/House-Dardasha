const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign(
    { id: admin._id, username: admin.username, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // expires in 1 hour
  );
  res.json({ token });
});

module.exports = router;