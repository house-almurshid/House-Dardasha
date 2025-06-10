require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const username = 'admin'; // Change if you want a different username
    const password = 'yourpassword'; // Change to your desired password

    // Check if admin already exists
    let admin = await Admin.findOne({ username });
    if (admin) {
      console.log('Admin user already exists.');
    } else {
      admin = new Admin({ username, password });
      await admin.save();
      console.log('Admin user created!');
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });