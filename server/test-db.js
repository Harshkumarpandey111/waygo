const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    const options = {
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`✅ Connected successfully: ${conn.connection.host}`);
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
  } catch (error) {
    console.error(`❌ Connection failed: ${error.message}`);
    console.error('Full error:', error);
  }
};

testConnection();