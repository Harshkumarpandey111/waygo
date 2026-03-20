const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    // Use strict TLS options for Atlas plus IPv4
    const options = {
      tls: true,
      tlsInsecure: false,
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      appName: 'WayGoServer',
    };

    console.log('🔍 MongoDB URI:', process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

module.exports = connectDB;