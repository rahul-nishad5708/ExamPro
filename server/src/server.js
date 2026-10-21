import mongoose from 'mongoose';
import app from './app.js';
import config from './config/index.js';
import connectDB from './config/db.js';

let server;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

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

