/**
 * ============================================
 * DATABASE CONFIGURATION
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * This file handles connecting to MongoDB using Mongoose.
 * 
 * WHAT IS MONGOOSE?
 * Mongoose is an ODM (Object Data Modeling) library that:
 * - Provides a schema-based solution for MongoDB
 * - Handles connection to the database
 * - Gives us helpful methods to create, read, update, delete data
 * 
 * WHY USE A SEPARATE CONFIG FILE?
 * - Keeps database logic separate from main server code
 * - Makes it easy to change database settings in one place
 * - Can be reused across different parts of the app
 */

const mongoose = require('mongoose');

/**
 * Connects to MongoDB database
 * 
 * @async - This function is asynchronous (uses async/await)
 * 
 * We use async/await because connecting to a database takes time.
 * JavaScript continues running other code while waiting (non-blocking).
 */
const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise
    // We await it to pause execution until connection is established
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options prevent deprecation warnings
      // useNewUrlParser and useUnifiedTopology are now defaults in Mongoose 6+
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    // If connection fails, log the error and exit the process
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // process.exit(1) stops the server
    // 1 = exit with failure, 0 = exit with success
    process.exit(1);
  }
};

// Export the function so other files can use it
// This is CommonJS syntax (used in Node.js)
module.exports = connectDB;
