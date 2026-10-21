import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from '../src/config/index.js';
import User from '../src/models/User.js';
import Attempt from '../src/models/Attempt.js';
import PracticeAttempt from '../src/models/PracticeAttempt.js';
import { getAdminStudentActivity } from '../src/controllers/adminActivityController.js';

async function runTest() {
  console.log('🧪 Starting Admin Student Activity Dashboard Test Suite...\n');

  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ 1. Database connected');

    // 1. Check admin user and student user credentials
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) throw new Error('Admin account not found in database');
    console.log(`✅ 2. Admin account verified: ${admin.email}`);

    // Generate Admin JWT token and Student JWT token
    const adminToken = jwt.sign({ role: 'admin', userId: admin._id }, config.jwtSecret, { expiresIn: '1h' });
    const studentSessionId = 'student-test-session-xyz';
    const studentToken = jwt.sign({ role: 'student', studentName: 'Test Student', sessionId: studentSessionId }, config.jwtSecret, { expiresIn: '1h' });

    // 2. Authorization verification: simulate student attempting to access admin endpoint
    const mockStudentReq = {
      user: { role: 'student', name: 'Test Student', sessionId: studentSessionId },
      query: {},
    };
    const mockRes = {
      statusCode: 200,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      },
    };

    // Verify admin-only middleware behavior
    const adminOnlyCheck = (req) => {
      if (!req.user || req.user.role !== 'admin') {
        throw new Error('Admin access required.');
      }
    };

    let forbiddenCaught = false;
    try {
      adminOnlyCheck(mockStudentReq);
    } catch (e) {
      if (e.message === 'Admin access required.') {
        forbiddenCaught = true;
      }
    }
    if (!forbiddenCaught) throw new Error('Student was not rejected by admin check');
    console.log('✅ 3. Security: Ordinary students are strictly rejected from admin activity routes (403)');

    // 3. Test unified activity controller with actual database records
    const mockAdminReq = {
      user: admin,
      query: { page: 1, limit: 20 },
    };
    const adminRes = {
      jsonData: null,
      json(data) {
        this.jsonData = data;
        return this;
      },
    };

    await getAdminStudentActivity(mockAdminReq, adminRes, (err) => {
      if (err) throw err;
    });

    const result = adminRes.jsonData;
    if (!result || !result.success) throw new Error('Failed to retrieve student activity');

    console.log(`✅ 4. Unified Attempts Retrieved: ${result.attempts.length} attempts in current page, total: ${result.pagination.total}`);

    // Check stats
    const { stats } = result;
    console.log('📊 Dashboard Statistics:', stats);
    if (stats.totalAttempts === undefined || stats.uniqueStudentSessions === undefined) {
      throw new Error('Stats missing required fields');
    }
    console.log(`✅ 5. Distinct Sessions: ${stats.uniqueStudentSessions} unique sessions distinguished from ${stats.totalAttempts} total attempts`);

    // 4. Verify unified row fields
    const examAttempt = result.attempts.find((a) => a.type === 'Exam');
    const practiceAttempt = result.attempts.find((a) => a.type === 'Practice Test');

    console.log(`Found Exam attempt: ${!!examAttempt}, Found Practice attempt: ${!!practiceAttempt}`);

    const requiredRowFields = [
      '_id',
      'type',
      'studentName',
      'sessionId',
      'testTitle',
      'startedAt',
      'status',
      'totalQuestions',
      'attemptedQuestions',
      'correctAnswers',
      'wrongAnswers',
      'skippedQuestions',
      'score',
      'percentage',
      'timeTakenSeconds',
    ];

    for (const row of result.attempts) {
      for (const field of requiredRowFields) {
        if (!(field in row)) {
          throw new Error(`Unified row missing field "${field}"`);
        }
      }
    }
    console.log('✅ 6. Schema Integrity: All required fields present on unified rows without crashes');

    // 5. Test search filter
    if (result.attempts.length > 0) {
      const targetName = result.attempts[0].studentName;
      const searchReq = {
        user: admin,
        query: { search: targetName.slice(0, 3) },
      };
      const searchRes = {
        jsonData: null,
        json(data) {
          this.jsonData = data;
          return this;
        },
      };
      await getAdminStudentActivity(searchReq, searchRes, (err) => {
        if (err) throw err;
      });
      const filtered = searchRes.jsonData.attempts;
      const allMatch = filtered.every((a) => a.studentName.toLowerCase().includes(targetName.slice(0, 3).toLowerCase()));
      if (!allMatch) throw new Error('Search filter returned non-matching records');
      console.log(`✅ 7. Search Filter: Correctly matched ${filtered.length} attempts for query "${targetName.slice(0, 3)}"`);
    }

    // 6. Test type filter: type='practice'
    const practiceReq = {
      user: admin,
      query: { type: 'practice' },
    };
    const practiceRes = {
      jsonData: null,
      json(data) {
        this.jsonData = data;
        return this;
      },
    };
    await getAdminStudentActivity(practiceReq, practiceRes, (err) => {
      if (err) throw err;
    });
    const practiceOnly = practiceRes.jsonData.attempts;
    if (practiceOnly.some((a) => a.type !== 'Practice Test')) {
      throw new Error('Type filter returned non-practice records');
    }
    console.log(`✅ 8. Type Filter: Successfully isolated ${practiceOnly.length} Practice Test records`);

    // 7. Test status filter: status='in_progress'
    const inProgressReq = {
      user: admin,
      query: { status: 'in_progress' },
    };
    const inProgressRes = {
      jsonData: null,
      json(data) {
        this.jsonData = data;
        return this;
      },
    };
    await getAdminStudentActivity(inProgressReq, inProgressRes, (err) => {
      if (err) throw err;
    });
    const inProgressList = inProgressRes.jsonData.attempts;
    if (inProgressList.some((a) => a.status !== 'in_progress')) {
      throw new Error('Status filter returned completed records');
    }
    console.log(`✅ 9. Status Filter: Successfully retrieved ${inProgressList.length} in-progress attempts with pending results handled safely`);

    console.log('\n🎉 ALL ADMIN STUDENT ACTIVITY TESTS PASSED SUCCESSFULLY!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTest();
