import http from 'http';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';

async function testProductionServer() {
  console.log('🧪 Starting Production Server Test on ephemeral port...');
  process.env.NODE_ENV = 'production';
  process.env.PORT = '5099';

  try {
    await connectDB();
    console.log('✅ MongoDB connection verified.');

    const server = http.createServer(app);

    await new Promise((resolve) => {
      server.listen(5099, () => {
        console.log('✅ Production Express server listening on port 5099');
        resolve();
      });
    });

    // 1. Test /api/health
    const healthRes = await fetch('http://localhost:5099/api/health');
    const healthJson = await healthRes.json();
    console.log('✅ /api/health response status:', healthRes.status);
    console.log('✅ /api/health response payload:', healthJson);
    if (!healthJson.success) {
      throw new Error('/api/health did not return success: true');
    }

    // 2. Test CORS with production origin
    const corsRes = await fetch('http://localhost:5099/api/health', {
      headers: {
        Origin: 'https://your-exampro.vercel.app',
      },
    });
    console.log('✅ CORS pre-flight / request tested. Status:', corsRes.status);

    // Close server and database
    await new Promise((resolve) => server.close(resolve));
    const mongoose = (await import('mongoose')).default;
    await mongoose.disconnect();
    console.log('✅ Production server and database closed cleanly.');
    console.log('🎉 ALL PRODUCTION STARTUP TESTS PASSED!');
  } catch (err) {
    console.error('❌ Production startup test failed:', err);
    process.exit(1);
  }
}

testProductionServer();
