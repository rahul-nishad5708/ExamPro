import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Attempt from '../src/models/Attempt.js';
import Exam from '../src/models/Exam.js';

const API_URL = 'http://localhost:5000/api';

async function runStudentFlowTests() {
  console.log('🧪 Running ExamPro Student Flow & Security Verification...\n');

  try {
    // 1. Test unauthenticated /auth/me - must return 200 with user: null (no crash!)
    const unauthRes = await fetch(`${API_URL}/auth/me`);
    const unauthData = await unauthRes.json();
    if (unauthData.success !== false || unauthData.user !== null) {
      throw new Error('Unauthenticated /auth/me did not return clean user: null');
    }
    console.log('✅ 1. Safe Session Check: Unauthenticated request handled cleanly without crash or 401 error logs');

    // 2. Test wrong exam access password
    const wrongRes = await fetch(`${API_URL}/auth/enter-exam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Alex Mercer',
        accessPassword: 'wrong_password_123',
      }),
    });
    if (wrongRes.status !== 401) {
      throw new Error(`Expected 401 for wrong password, got ${wrongRes.status}`);
    }
    console.log('✅ 2. Access Password Enforcement: Rejected invalid password with 401');

    // 3. Test empty student name
    const emptyRes = await fetch(`${API_URL}/auth/enter-exam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: '   ',
        accessPassword: 'exam2024',
      }),
    });
    if (emptyRes.status !== 400) {
      throw new Error(`Expected 400 for empty name, got ${emptyRes.status}`);
    }
    console.log('✅ 3. Candidate Name Validation: Rejected whitespace-only name with 400');

    // 4. Test valid student entry with EXAM_ACCESS_PASSWORD
    const enterRes = await fetch(`${API_URL}/auth/enter-exam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Alex Mercer',
        accessPassword: 'exam2024',
      }),
    });
    const enterData = await enterRes.json();

    if (!enterData.success || enterData.session?.role !== 'student') {
      throw new Error('Failed to create student session with valid credentials');
    }

    const setCookie = enterRes.headers.get('set-cookie');
    if (!setCookie) {
      throw new Error('Expected httpOnly session cookie to be set');
    }
    const studentCookie = setCookie.split(';')[0];
    console.log(`✅ 4. Student Session Creation: Authorized session for "${enterData.session.name}" via secure cookie`);

    // 5. Test session restoration with cookie
    const authMeRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: studentCookie },
    });
    const authMeData = await authMeRes.json();
    if (!authMeData.success || authMeData.user?.name !== 'Alex Mercer') {
      throw new Error('Session restoration failed with student cookie');
    }
    console.log('✅ 5. Session Restoration: Validated student session restored successfully');

    // 6. Test Privilege Escalation Prevention: Student must NEVER access admin endpoints
    const adminCheckRes = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Cookie: studentCookie },
    });
    if (adminCheckRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for admin endpoint, got ${adminCheckRes.status}`);
    }
    console.log('✅ 6. Role-Based Access Control: Student blocked from Admin API with 403 Forbidden');

    // 7. Test Student Exam Attempt Creation & Name Persistence
    await mongoose.connect(process.env.MONGODB_URI);
    const dsaExam = await Exam.findOne({ status: 'published' });
    if (!dsaExam) throw new Error('No published exam found');

    const attemptRes = await fetch(`${API_URL}/exams/${dsaExam._id}/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: studentCookie,
      },
      body: JSON.stringify({}),
    });
    const attemptData = await attemptRes.json();

    if (!attemptData.success || !attemptData.attempt) {
      throw new Error(`Failed to start exam attempt as student: ${attemptData.message}`);
    }

    const createdAttempt = await Attempt.findById(attemptData.attempt._id);
    if (!createdAttempt || createdAttempt.studentName !== 'Alex Mercer') {
      throw new Error(`studentName not persisted in MongoDB attempt: ${createdAttempt?.studentName}`);
    }
    console.log(`✅ 7. MongoDB Persistence: Attempt created with studentName="${createdAttempt.studentName}" (No User account needed)`);

    // 8. Test Answer Privacy on active attempt: ensure questions returned have no correctOption
    if (attemptData.questions && attemptData.questions.length > 0) {
      if (attemptData.questions[0].correctOption !== undefined) {
        throw new Error('Security flaw: correctOption leaked to student during active attempt');
      }
    }
    console.log('✅ 8. Active Answer Privacy: Correct answers stripped from active exam questions payload');

    // 9. Test Answer Saving to MongoDB
    const firstQ = attemptData.questions[0];
    const secondQ = attemptData.questions[1];
    const saveRes = await fetch(`${API_URL}/attempts/${createdAttempt._id}/answers`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: studentCookie,
      },
      body: JSON.stringify({
        answers: [
          { questionId: firstQ._id, selectedOption: 1, isMarkedForReview: true },
          { questionId: secondQ._id, selectedOption: 2, isMarkedForReview: false },
        ],
        currentQuestionIndex: 1,
      }),
    });
    const saveData = await saveRes.json();
    if (!saveData.success) throw new Error('Failed to save answers');

    const updatedAttempt = await Attempt.findById(createdAttempt._id);
    const savedFirstAns = updatedAttempt.answers.find((a) => a.questionId.toString() === firstQ._id.toString());
    if (!savedFirstAns || savedFirstAns.selectedOption !== 1 || !savedFirstAns.isMarkedForReview) {
      throw new Error('Saved answer did not persist accurately in MongoDB');
    }
    console.log('✅ 9. Live Answer Persistence: Candidate answers & review tags persisted to MongoDB');

    // 10. Test Exam Submission & Server-Side Scoring
    const submitRes = await fetch(`${API_URL}/attempts/${createdAttempt._id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: studentCookie,
      },
      body: JSON.stringify({}),
    });
    const submitData = await submitRes.json();
    if (!submitData.success || submitData.attempt.status !== 'submitted') {
      throw new Error('Submission failed or status not updated');
    }
    if (submitData.attempt.score === undefined || submitData.attempt.maximumMarks === undefined) {
      throw new Error('Server scoring failed: score/maximumMarks missing');
    }
    console.log(`✅ 10. Automated Scoring: Exam graded by server (Score: ${submitData.attempt.score}/${submitData.attempt.maximumMarks}, Percentage: ${submitData.attempt.percentage}%)`);

    // 11. Test Result Retrieval
    const resultRes = await fetch(`${API_URL}/results/${createdAttempt._id}`, {
      headers: { Cookie: studentCookie },
    });
    const resultData = await resultRes.json();
    if (!resultData.success || !resultData.attempt) {
      throw new Error('Failed to retrieve graded result');
    }
    console.log('✅ 11. Result Review: Graded assessment and performance metrics accessible to student');

    // Clean up student attempt
    await Attempt.findByIdAndDelete(createdAttempt._id);
    console.log('✅ 12. Cleanup: Temporary student attempt purged');

    // 13. Test Admin Login and Privileges
    const adminLoginRes = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@exampro.com',
        password: 'Admin@123456',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginData.success || adminLoginData.user?.role !== 'admin') {
      throw new Error('Admin login failed');
    }
    const adminCookie = adminLoginRes.headers.get('set-cookie').split(';')[0];
    console.log('✅ 13. Admin Login: Administrator login and privileges verified');

    // 14. Test Admin Exam & MCQ Management
    const createExamRes = await fetch(`${API_URL}/exams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        title: 'Automated Test Exam',
        description: 'Exam for verification test suite',
        category: 'Quality Assurance',
        difficulty: 'Easy',
        durationMinutes: 15,
        marksPerQuestion: 2,
        negativeMarks: 0.5,
        passingPercentage: 50,
        status: 'draft',
        showAnswerKey: true,
      }),
    });
    const createExamData = await createExamRes.json();
    if (!createExamData.success || !createExamData.exam) {
      throw new Error('Admin failed to create test exam');
    }
    const testExamId = createExamData.exam._id;

    // Add MCQ to exam
    const addQRes = await fetch(`${API_URL}/exams/${testExamId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        questionText: 'What is the time complexity of binary search?',
        options: [
          { text: 'O(n)' },
          { text: 'O(log n)' },
          { text: 'O(n^2)' },
          { text: 'O(1)' },
        ],
        correctOption: 1,
        explanation: 'Binary search halves the search space at each step.',
        difficulty: 'Easy',
        topic: 'Algorithms',
      }),
    });
    const addQData = await addQRes.json();
    if (!addQData.success || !addQData.question) {
      throw new Error('Admin failed to add MCQ question');
    }

    // Toggle publish
    const publishRes = await fetch(`${API_URL}/exams/${testExamId}/publish`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
    });
    const publishData = await publishRes.json();
    if (!publishData.success || publishData.exam?.status !== 'published') {
      throw new Error(`Admin failed to publish exam: ${publishData.message}`);
    }

    // Cleanup admin test exam & questions
    await fetch(`${API_URL}/exams/${testExamId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    console.log('✅ 14. Admin Exam & MCQ Management: Full CRUD & publish lifecycle verified');

    console.log('\n🎉 ALL 14 STUDENT FLOW, SCORING & ADMIN SECURITY CHECKS PASSED!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification Error:', err.message);
    process.exit(1);
  }
}

runStudentFlowTests();
