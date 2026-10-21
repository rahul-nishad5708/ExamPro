import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import Exam from '../src/models/Exam.js';
import Question from '../src/models/Question.js';
import PracticeTest from '../src/models/PracticeTest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IOT_EXAM_ID = '6ad934fdae8e9b79f4db18be';

function parseAnswerToIndex(rawAns, optionsLength) {
  if (!rawAns) return 0;
  const cleaned = rawAns.trim();
  const upper = cleaned.toUpperCase();

  // Single letter checks
  if (upper === 'A' || upper.startsWith('A,') || upper.startsWith('A ') || upper.startsWith('A/')) return 0;
  if (upper === 'B' || upper.startsWith('B,') || upper.startsWith('B ') || upper.startsWith('B/')) return 1;
  if (upper === 'C' || upper.startsWith('C,') || upper.startsWith('C ') || upper.startsWith('C/')) return 2;
  if (upper === 'D' || upper.startsWith('D,') || upper.startsWith('D ') || upper.startsWith('D/')) return 3;

  // Phrases like "a, b, and c" or "a, b, and d" or "a, b, c, and d"
  if (cleaned.toLowerCase().includes('a, b, c, and d')) {
    // If all are correct, any option is valid, default to 0
    return 0;
  }
  if (cleaned.toLowerCase().startsWith('a,')) {
    return 0;
  }
  if (cleaned.toLowerCase().startsWith('b,')) {
    return 1;
  }
  if (cleaned.toLowerCase().startsWith('c,')) {
    return 2;
  }
  if (cleaned.toLowerCase().startsWith('d,')) {
    return 3;
  }

  return 0;
}

async function run() {
  console.log('📖 Reading iot_questions.tsv...');
  const tsvPath = path.resolve(__dirname, 'iot_questions.tsv');
  const fileContent = fs.readFileSync(tsvPath, 'utf8');
  const lines = fileContent.trim().split('\n');

  console.log(`Found ${lines.length} lines (1 header + ${lines.length - 1} questions).`);

  const questionsToInsert = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split('\t');
    const category = parts[0]?.trim() || 'IoT';
    const qType = parts[1]?.trim() || 'MCQ';
    const week = parts[2]?.trim() || '1';
    const qNum = parts[3]?.trim() || `${i}`;
    const questionText = parts[4]?.trim();
    const optA = parts[5]?.trim();
    const optB = parts[6]?.trim();
    const optC = parts[7]?.trim();
    const optD = parts[8]?.trim();
    const rawAnswer = parts[9]?.trim();
    const explanation = parts[10]?.trim() || '';

    if (!questionText) {
      console.warn(`Line ${i + 1} has empty question text!`);
      continue;
    }

    const options = [];
    if (optA) options.push({ text: optA });
    if (optB) options.push({ text: optB });
    if (optC) options.push({ text: optC });
    if (optD) options.push({ text: optD });

    if (options.length < 2) {
      console.warn(`Line ${i + 1} has fewer than 2 options:`, options);
      continue;
    }

    const correctIndex = parseAnswerToIndex(rawAnswer, options.length);
    if (correctIndex >= options.length) {
      console.warn(`Line ${i + 1} correctIndex ${correctIndex} out of bounds (${options.length})`);
    }

    let finalExplanation = explanation;
    if (rawAnswer && (rawAnswer.includes(',') || rawAnswer.length > 1)) {
      finalExplanation = `[Accepted/Correct: ${rawAnswer}] ${explanation}`.trim();
    }

    questionsToInsert.push({
      examId: new mongoose.Types.ObjectId(IOT_EXAM_ID),
      questionText,
      options,
      correctOption: correctIndex,
      explanation: finalExplanation.slice(0, 3000),
      difficulty: qType === 'MSQ' ? 'Hard' : 'Medium',
      topic: `Week ${week}`,
      order: questionsToInsert.length,
    });
  }

  console.log(`✅ Prepared ${questionsToInsert.length} questions for insertion.`);

  // Connect to DB
  await connectDB();
  console.log('✅ Connected to MongoDB.');

  const exam = await Exam.findById(IOT_EXAM_ID);
  if (!exam) {
    throw new Error(`Exam with ID ${IOT_EXAM_ID} not found!`);
  }
  console.log(`Target Exam Found: "${exam.title}" (${exam._id})`);

  // Clear any existing questions for this exam
  const deleted = await Question.deleteMany({ examId: IOT_EXAM_ID });
  console.log(`Cleared ${deleted.deletedCount} existing questions for IOT exam.`);

  // Insert questions
  const inserted = await Question.insertMany(questionsToInsert);
  console.log(`🎉 Successfully inserted ${inserted.length} questions into Question collection!`);

  // Update Exam totalQuestions and marksPerQuestion if needed
  exam.totalQuestions = inserted.length;
  exam.status = 'published';
  exam.instructions = '1. This exam contains 165 comprehensive IoT multiple-choice questions from NPTEL Week 1 to Week 12.\n2. Review each question carefully.\n3. Click Submit when you have completed all questions.';
  await exam.save();
  console.log(`✅ Updated Exam "${exam.title}": totalQuestions = ${exam.totalQuestions}, status = ${exam.status}`);

  // Also create/update a Practice Test version so students can practice with instant feedback!
  const practiceQuestions = questionsToInsert.map((q, idx) => ({
    questionText: q.questionText,
    options: q.options,
    correctOption: q.correctOption,
    explanation: q.explanation,
    difficulty: q.difficulty,
    topic: q.topic,
    marks: 1,
    negativeMarks: 0,
    order: idx + 1,
  }));

  const existingPt = await PracticeTest.findOne({ title: 'Internet of Things (IoT) Full Question Bank' });
  if (existingPt) {
    existingPt.questions = practiceQuestions;
    existingPt.status = 'published';
    await existingPt.save();
    console.log(`✅ Updated existing Practice Test: "${existingPt.title}" with ${practiceQuestions.length} questions.`);
  } else {
    await PracticeTest.create({
      title: 'Internet of Things (IoT) Full Question Bank',
      description: 'Comprehensive NPTEL-based IoT Practice Drill with 165 questions spanning Week 1 to Week 12 with instant step-by-step explanations.',
      subject: 'Internet of Things',
      difficulty: 'Medium',
      topics: ['Sensors & Actuators', 'Protocols & Addressing', 'RFID & 6LoWPAN', 'Wireless Sensor Networks', 'Cloud & Fog Computing', 'Smart Grid & AgriSens', 'IIoT & Big Data'],
      allowChangeAnswer: true,
      marksPerQuestion: 1,
      negativeMarks: 0,
      timeLimitMinutes: 0, // Un-timed drill
      status: 'published',
      questions: practiceQuestions,
    });
    console.log(`✅ Created new Practice Test: "Internet of Things (IoT) Full Question Bank" with ${practiceQuestions.length} questions.`);
  }

  console.log('\n🎉 ALL IOT QUESTIONS SUCCESSFULLY ADDED TO THE DATABASE!');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Error inserting questions:', err);
  process.exit(1);
});
