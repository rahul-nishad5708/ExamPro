import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import PracticeTest from '../src/models/PracticeTest.js';
import User from '../src/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/exampro';

const samplePracticeTests = [
  {
    title: 'JavaScript ES6+ & Modern React Drill',
    description: 'Sharpen your knowledge of JavaScript closures, asynchronous event loops, promises, React hooks, and component lifecycles with instant explanation feedback.',
    subject: 'Web Development',
    difficulty: 'Medium',
    topics: ['JavaScript', 'React', 'ES6', 'Asynchronous JS'],
    allowChangeAnswer: false, // Locks first selection to prevent score inflation
    marksPerQuestion: 2,
    negativeMarks: 0,
    timeLimitMinutes: 0,
    status: 'published',
    questions: [
      {
        questionText: 'What is the output of `typeof null` in standard JavaScript?',
        options: [
          { text: '"null"' },
          { text: '"undefined"' },
          { text: '"object"' },
          { text: '"number"' },
        ],
        correctOption: 2,
        explanation: 'In JavaScript, `typeof null` returns "object" due to a historical bug in the initial JavaScript implementation where objects had a type tag of 0, and null was represented as the NULL pointer (0x00).',
        difficulty: 'Easy',
        topic: 'JavaScript Basics',
        marks: 2,
        order: 1,
      },
      {
        questionText: 'Which React hook should be used to run side effects that need to synchronously mutate the DOM before the browser paints?',
        options: [
          { text: 'useEffect' },
          { text: 'useLayoutEffect' },
          { text: 'useMemo' },
          { text: 'useCallback' },
        ],
        correctOption: 1,
        explanation: '`useLayoutEffect` fires synchronously after all DOM mutations but before the browser paints screen updates. It is ideal for measuring DOM layout or preventing visual flicker.',
        difficulty: 'Medium',
        topic: 'React Hooks',
        marks: 2,
        order: 2,
      },
      {
        questionText: 'How does the JavaScript Event Loop prioritize Microtasks (e.g., Promise callbacks) relative to Macrotasks (e.g., setTimeout)?',
        options: [
          { text: 'Macrotasks always execute before any microtasks' },
          { text: 'Microtasks and macrotasks run in parallel via multi-threading' },
          { text: 'The microtask queue is drained completely after the current task finishes and before the next macrotask is processed' },
          { text: 'Microtasks are deferred until the browser is idle' },
        ],
        correctOption: 2,
        explanation: 'All microtasks in the microtask queue are executed to completion before the event loop advances to the next task in the macrotask queue or performs rendering updates.',
        difficulty: 'Hard',
        topic: 'Asynchronous JS',
        marks: 2,
        order: 3,
      },
      {
        questionText: 'What happens when you pass an empty dependency array `[]` to `useEffect`?',
        options: [
          { text: 'The effect runs on every single render' },
          { text: 'The effect runs only once after the initial render and cleanup runs when the component unmounts' },
          { text: 'The effect is skipped entirely and never executed' },
          { text: 'It causes an infinite re-render loop' },
        ],
        correctOption: 1,
        explanation: 'An empty dependency array tells React that the effect does not depend on any props or state, so it only runs once when the component mounts and cleans up when it unmounts.',
        difficulty: 'Easy',
        topic: 'React Hooks',
        marks: 2,
        order: 4,
      },
      {
        questionText: 'In React 18 and 19, what is the primary role of the `useTransition` hook?',
        options: [
          { text: 'To animate CSS page transitions' },
          { text: 'To mark state updates as non-blocking transitions so the UI remains responsive' },
          { text: 'To transition components between server and client components' },
          { text: 'To serialize React elements into HTML strings' },
        ],
        correctOption: 1,
        explanation: '`useTransition` allows developers to mark UI state updates as non-urgent transitions, keeping urgent inputs like typing and clicking responsive while heavy re-renders happen in the background.',
        difficulty: 'Medium',
        topic: 'React 18/19',
        marks: 2,
        order: 5,
      },
    ],
  },
  {
    title: 'Data Structures & Algorithms Rapid Drill',
    description: 'Test your understanding of time complexity, search trees, hash tables, and graph traversal strategies.',
    subject: 'Computer Science',
    difficulty: 'Hard',
    topics: ['Data Structures', 'Algorithms', 'Trees', 'Time Complexity'],
    allowChangeAnswer: false,
    marksPerQuestion: 3,
    negativeMarks: 1,
    timeLimitMinutes: 0,
    status: 'published',
    questions: [
      {
        questionText: 'What is the average and worst-case time complexity of searching for an element in a balanced Red-Black Tree or AVL Tree?',
        options: [
          { text: 'O(1) average, O(N) worst-case' },
          { text: 'O(log N) average, O(log N) worst-case' },
          { text: 'O(N log N) average, O(N^2) worst-case' },
          { text: 'O(log N) average, O(N) worst-case' },
        ],
        correctOption: 1,
        explanation: 'Balanced binary search trees like AVL and Red-Black trees strictly guarantee O(log N) height, ensuring search, insertion, and deletion operations remain O(log N) even in the worst case.',
        difficulty: 'Medium',
        topic: 'Trees',
        marks: 3,
        order: 1,
      },
      {
        questionText: 'Which graph algorithm is optimal for finding the shortest path in a weighted graph containing non-negative edge weights?',
        options: [
          { text: "Dijkstra's Algorithm" },
          { text: 'Breadth-First Search (BFS)' },
          { text: 'Bellman-Ford Algorithm' },
          { text: "Floyd-Warshall Algorithm" },
        ],
        correctOption: 0,
        explanation: "Dijkstra's Algorithm finds the shortest path from a single source to all vertices in a weighted graph with non-negative weights in O((V + E) log V) using a priority queue (min-heap).",
        difficulty: 'Medium',
        topic: 'Graph Algorithms',
        marks: 3,
        order: 2,
      },
      {
        questionText: 'What is the primary trade-off of using Open Addressing with Quadratic Probing versus Separate Chaining in Hash Tables?',
        options: [
          { text: 'Quadratic probing eliminates hash collisions completely' },
          { text: 'Open addressing provides superior cache locality without linked list pointer overhead, but degrades faster as load factor exceeds 0.7' },
          { text: 'Separate chaining requires twice as much CPU memory bandwidth' },
          { text: 'Open addressing allows infinite elements without resizing' },
        ],
        correctOption: 1,
        explanation: 'Open addressing stores all elements directly in the contiguous table array, offering excellent cache locality, but performance drops sharply when the load factor increases beyond 0.7 to 0.8.',
        difficulty: 'Hard',
        topic: 'Hash Tables',
        marks: 3,
        order: 3,
      },
      {
        questionText: 'Which sorting algorithm has a worst-case time complexity of O(N log N) and is also stable?',
        options: [
          { text: 'Quicksort' },
          { text: 'Heapsort' },
          { text: 'Merge Sort' },
          { text: 'Selection Sort' },
        ],
        correctOption: 2,
        explanation: 'Merge Sort divides the array into halves, sorts them recursively, and merges them in O(N log N) time in all cases (worst, average, and best) while maintaining element order stability.',
        difficulty: 'Easy',
        topic: 'Sorting',
        marks: 3,
        order: 4,
      },
    ],
  },
  {
    title: 'MongoDB & Database Architecture Concepts',
    description: 'Master MongoDB indexing, aggregation pipelines, document schemas, and transaction isolation.',
    subject: 'Database Systems',
    difficulty: 'Medium',
    topics: ['MongoDB', 'Databases', 'Indexing', 'Aggregations'],
    allowChangeAnswer: false,
    marksPerQuestion: 2,
    negativeMarks: 0,
    timeLimitMinutes: 0,
    status: 'published',
    questions: [
      {
        questionText: 'When creating a compound index in MongoDB on `{ status: 1, createdAt: -1 }`, which query can efficiently leverage this index?',
        options: [
          { text: 'Only queries filtering solely on `createdAt`' },
          { text: 'Queries filtering on `status` alone, or filtering on `status` and sorting by `createdAt`' },
          { text: 'Queries filtering by any random field' },
          { text: 'Only queries that perform full text search' },
        ],
        correctOption: 1,
        explanation: 'MongoDB compound indexes adhere to the Prefix Rule: queries must filter on the leading keys of the index (`status`) to leverage the index structure.',
        difficulty: 'Medium',
        topic: 'Indexing',
        marks: 2,
        order: 1,
      },
      {
        questionText: 'Which aggregation pipeline stage is used in MongoDB to reshape an array field into multiple documents?',
        options: [
          { text: '$project' },
          { text: '$unwind' },
          { text: '$group' },
          { text: '$lookup' },
        ],
        correctOption: 1,
        explanation: '`$unwind` deconstructs an array field from the input documents to output a document for each element in the array.',
        difficulty: 'Easy',
        topic: 'Aggregation',
        marks: 2,
        order: 2,
      },
      {
        questionText: 'What is a "Covered Query" in MongoDB?',
        options: [
          { text: 'A query where all requested fields are satisfied entirely from an index without inspecting any documents' },
          { text: 'A query protected by SSL/TLS encryption' },
          { text: 'A query executed inside a multi-document ACID transaction' },
          { text: 'A query that scans the entire collection' },
        ],
        correctOption: 0,
        explanation: 'A covered query can be fulfilled entirely from an index because all the query fields and projected fields are present in the index, allowing MongoDB to bypass disk document retrieval entirely.',
        difficulty: 'Hard',
        topic: 'Performance Optimization',
        marks: 2,
        order: 3,
      },
    ],
  },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  const admin = await User.findOne({ role: 'admin' });
  const adminId = admin ? admin._id : null;

  for (const testData of samplePracticeTests) {
    const existing = await PracticeTest.findOne({ title: testData.title });
    if (existing) {
      console.log(`Updating practice test: "${testData.title}"`);
      Object.assign(existing, testData);
      existing.createdBy = adminId;
      await existing.save();
    } else {
      console.log(`Creating practice test: "${testData.title}"`);
      await PracticeTest.create({
        ...testData,
        createdBy: adminId,
      });
    }
  }

  const count = await PracticeTest.countDocuments();
  console.log(`✅ Practice test seeding complete! Total practice tests in DB: ${count}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
