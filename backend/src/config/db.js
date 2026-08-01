const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillforge').trim();
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`[SkillForge] MongoDB connected → ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

module.exports = connectDB;
