import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import User from '../src/models/User.js';

const syncAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/exampro';
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@exampro.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'ExamPro Admin';

    console.log(`📡 Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoDB.`);

    // Find any existing admin, or a user with either the target email or previous admin email
    let admin = await User.findOne({
      $or: [
        { role: 'admin' },
        { email: adminEmail },
        { email: 'admin@exampro.com' }
      ]
    });

    if (admin) {
      console.log(`Found existing admin user (ID: ${admin._id}, Current Email: ${admin.email})`);
      admin.name = adminName;
      admin.email = adminEmail;
      admin.password = adminPassword; // Triggers pre('save') bcrypt hashing
      admin.role = 'admin';
      admin.isActive = true;
      await admin.save();
      console.log(`✅ Successfully updated admin account:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true,
      });
      console.log(`✅ Successfully created new admin account:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    }

    await mongoose.connection.close();
    console.log(`🔒 MongoDB connection closed.`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error syncing admin account:`, error);
    process.exit(1);
  }
};

syncAdmin();
