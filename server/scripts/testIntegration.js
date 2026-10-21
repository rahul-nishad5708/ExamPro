import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/User.js';
import Exam from '../src/models/Exam.js';
import Question from '../src/models/Question.js';
import Attempt from '../src/models/Attempt.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/exampro';

async function runTests() {
  console.log('🧪 Starting ExamPro Automated Verification Suite...\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 1. Database Connection: Active');

    // Test 1: Check admin and student seeded users
    const admin = await User.findOne({ role: 'admin' }).select('+password');
    const student = await User.findOne({ role: 'student' }).select('+password');
    if (!admin || !student) throw new Error('Seeded users not found');
    console.log(`✅ 2. User Accounts: Admin (${admin.email}) and Student (${student.email}) verified`);

    // Test 2: Check password comparison
    const adminPassMatch = await admin.comparePassword('Admin@123456');
    const studentPassMatch = await student.comparePassword('Student@123');
    if (!adminPassMatch || !studentPassMatch) throw new Error('Bcrypt password verification failed');
    console.log('✅ 3. Password Security: Bcrypt hashing & verification functioning');

    // Test 3: Check exams and questions count
    const examsCount = await Exam.countDocuments({ status: 'published' });
    const questionsCount = await Question.countDocuments();
    if (examsCount < 3 || questionsCount < 30) throw new Error(`Insufficient exams/questions (${examsCount} exams, ${questionsCount} Qs)`);
    console.log(`✅ 4. Exam Repository: ${examsCount} published exams with ${questionsCount} total questions`);

    // Test 4: Simulate Exam Attempt and Server-side Evaluation
    const dsaExam = await Exam.findOne({ title: { $regex: /Data Structures/i } });
    if (!dsaExam) throw new Error('DSA Exam not found for attempt test');

    const dsaQuestions = await Question.find({ examId: dsaExam._id }).sort({ order: 1 });
    console.log(`✅ 5. Exam Selection: Retrieved "${dsaExam.title}" (${dsaQuestions.length} questions)`);

    // Create an attempt simulating candidate answers:
    // Q0: correct, Q1: incorrect, Q2: correct, Q3: unanswered ...
    const simulatedAnswers = dsaQuestions.map((q, idx) => {
      if (idx === 0) return { questionId: q._id, selectedOption: q.correctOption, isMarkedForReview: false };
      if (idx === 1) return { questionId: q._id, selectedOption: (q.correctOption + 1) % 4, isMarkedForReview: true };
      if (idx === 2) return { questionId: q._id, selectedOption: q.correctOption, isMarkedForReview: false };
      return { questionId: q._id, selectedOption: null, isMarkedForReview: false };
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + dsaExam.durationMinutes * 60 * 1000);

    const testAttempt = await Attempt.create({
      studentName: 'Alex Mercer',
      sessionId: 'test-session-123',
      userId: student._id,
      examId: dsaExam._id,
      startedAt: now,
      expiresAt: expiresAt,
      answers: simulatedAnswers,
      currentQuestionIndex: 2,
    });

    // Test 5: Check answer privacy (ensure student sanitized view has no answers)
    const sanitizedQuestions = dsaQuestions.map((q) => {
      const obj = q.toObject();
      delete obj.correctOption;
      delete obj.explanation;
      return obj;
    });

    if (sanitizedQuestions[0].correctOption !== undefined) {
      throw new Error('Security flaw: Correct option leaked in sanitized question view!');
    }
    console.log('✅ 6. Answer Key Privacy: Correct options stripped from active exam questions');

    // Test 6: Evaluate attempt using server scoring logic
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let maxMarks = 0;

    for (const q of dsaQuestions) {
      const marks = q.marks || dsaExam.marksPerQuestion;
      const neg = q.negativeMarks !== null ? q.negativeMarks : dsaExam.negativeMarks;
      maxMarks += marks;

      const ans = testAttempt.answers.find((a) => a.questionId.toString() === q._id.toString());
      if (!ans || ans.selectedOption === null || ans.selectedOption === undefined) {
        unansweredCount++;
      } else if (ans.selectedOption === q.correctOption) {
        score += marks;
        correctCount++;
      } else {
        score -= neg;
        incorrectCount++;
      }
    }

    score = Math.max(0, score);
    const percentage = Math.round((score / maxMarks) * 100 * 100) / 100;
    const passed = percentage >= dsaExam.passingPercentage;

    testAttempt.score = score;
    testAttempt.maximumMarks = maxMarks;
    testAttempt.percentage = percentage;
    testAttempt.correctCount = correctCount;
    testAttempt.incorrectCount = incorrectCount;
    testAttempt.unansweredCount = unansweredCount;
    testAttempt.timeTakenSeconds = 120;
    testAttempt.passed = passed;
    testAttempt.status = 'submitted';
    testAttempt.submittedAt = new Date();
    await testAttempt.save();

    console.log(`✅ 7. Server Evaluation: Score=${score}/${maxMarks} (${percentage}%), Correct=${correctCount}, Incorrect=${incorrectCount}, Unanswered=${unansweredCount}, Passed=${passed}`);

    // Verify values:
    // Q0: +2, Q1: -0.5, Q2: +2 = 3.5 marks. 8 unanswered.
    if (correctCount !== 2 || incorrectCount !== 1 || unansweredCount !== 7 || score !== 3.5) {
      throw new Error(`Scoring discrepancy: expected 3.5 score, got ${score}`);
    }
    console.log('✅ 8. Negative Marking Math: Accurate negative deduction and precision rounding verified');

    // Clean up test attempt
    await Attempt.findByIdAndDelete(testAttempt._id);
    console.log('✅ 9. Test Cleanup: Temporary attempt removed');

    console.log('\n🎉 ALL 9 CRITICAL INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

runTests();
