const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Ye line check karne ke liye hai ki link sahi aa raha hai ya nahi
    console.log("Connecting to:", process.env.MONGO_URI); 
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;