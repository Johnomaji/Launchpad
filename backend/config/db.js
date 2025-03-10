const mongoose = require('mongoose');


// Fallback to local MongoDB instance if MONGO_URI environment variable is not set
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
// DEPRECATED OPTIONS
//      useNewUrlParser: true,
//      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
