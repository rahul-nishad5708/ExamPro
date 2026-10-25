import mongoose from 'mongoose';
import app from './app.js';
import config from './config/index.js';
import connectDB from './config/db.js';

import User from './models/User.js';

let server;

const ensureAdminAccount = async () => {
  try {
    const adminEmail = (config.admin.email || '').trim().toLowerCase();
    const adminPassword = config.admin.password;
    if (!adminEmail || !adminPassword) return;

    let admin = await User.findOne({
      $or: [{ role: 'admin' }, { email: adminEmail }]
    });

    if (admin) {
      if (admin.email !== adminEmail) {
        admin.email = adminEmail;
        admin.name = config.admin.name || admin.name;
        admin.password = adminPassword;
        await admin.save();
        console.log(`👤 Admin credentials synchronized to: ${adminEmail}`);
      }
    } else {
      await User.create({
        name: config.admin.name || 'ExamPro Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true,
      });
      console.log(`👤 Admin account initialized: ${adminEmail}`);
    }
  } catch (err) {
    console.warn('⚠️ Admin auto-sync notice:', err.message);
  }
};

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Ensure admin user matches configuration
    await ensureAdminAccount();

    // Start Express server
    server = app.listen(config.port, () => {
      console.log(`🚀 ExamPro server running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Allowed Client URL: ${config.clientUrl}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown handling (SIGTERM for Render/Docker/Kubernetes, SIGINT for Ctrl+C)
const handleGracefulShutdown = async (signal) => {
  console.log(`\n🛑 [${signal}] Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('🔒 Express HTTP server closed.');
      try {
        await mongoose.connection.close(false);
        console.log('🔒 MongoDB connection cleanly terminated.');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during database disconnect:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();

