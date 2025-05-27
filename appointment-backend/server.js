import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('MongoDB connected'))
  .catch(err=>console.error('MongoDB connection error:', err));

// Appointment Schema
const AppointmentSchema = new mongoose.Schema({
  visitor_name: String,
  contact: String,
  email: String,
  address: String,
  company_type: String,
  recipient_name: String,
  recipient_email: String,
  recipient_address: String,
  purpose: String,
  meeting_pref: String,
  date1: String,
  time1: String,
  time2: String,
  date2: String,
  time3: String,
  time4: String,
  extra: String,
  trackingID: String,
  status: String,
  submitted_at: String
});
const Appointment = mongoose.model('Appointment', AppointmentSchema);

// Create appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.json({ success: true, trackingID: appointment.trackingID });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all appointments (for admin)
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ submitted_at: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update appointment by trackingID (PATCH)
app.patch('/api/appointments/:trackingID', async (req, res) => {
  try {
    const updated = await Appointment.findOneAndUpdate(
      { trackingID: req.params.trackingID },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, error: 'Appointment not found' });
    res.json({ success: true, appointment: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000; // Change 4000 to 5000 or another free port
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));