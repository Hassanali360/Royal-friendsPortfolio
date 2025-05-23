const mongoose = require('mongoose');
require('dotenv').config();
const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1); // Exit the process if the connection fails
  }
};

module.exports = connectToDb;
