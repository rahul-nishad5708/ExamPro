import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Import models
import User from '../src/models/User.js';
import Exam from '../src/models/Exam.js';
import Question from '../src/models/Question.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exampro';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Exam.deleteMany({}),
      Question.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@exampro.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'ExamPro Admin';

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`👤 Admin created: ${adminEmail}`);

    // Create sample student
    const student = await User.create({
      name: 'John Student',
      email: 'student@exampro.com',
      password: 'Student@123',
      role: 'student',
    });
    console.log(`👤 Student created: student@exampro.com`);

    // ====================== EXAMS & QUESTIONS ======================

    // Exam 1: Data Structures and Algorithms
    const dsaExam = await Exam.create({
      title: 'Data Structures & Algorithms Fundamentals',
      description: 'Test your knowledge of fundamental data structures and algorithms including arrays, linked lists, trees, sorting, and searching.',
      category: 'Data Structures and Algorithms',
      difficulty: 'Medium',
      durationMinutes: 30,
      marksPerQuestion: 2,
      negativeMarks: 0.5,
      passingPercentage: 40,
      instructions: '1. This exam contains 10 multiple choice questions.\n2. Each correct answer awards 2 marks.\n3. Each wrong answer deducts 0.5 marks.\n4. Unanswered questions carry zero marks.\n5. You have 30 minutes to complete the exam.\n6. Click Submit when done or the exam will auto-submit when time runs out.',
      status: 'published',
      totalQuestions: 10,
      showAnswerKey: true,
      maxAttempts: 3,
      createdBy: admin._id,
    });

    await Question.insertMany([
      {
        examId: dsaExam._id, order: 0, difficulty: 'Easy', topic: 'Arrays',
        questionText: 'What is the time complexity of accessing an element in an array by its index?',
        options: [{ text: 'O(n)' }, { text: 'O(1)' }, { text: 'O(log n)' }, { text: 'O(n²)' }],
        correctOption: 1,
        explanation: 'Arrays provide constant-time O(1) access to elements using their index because elements are stored in contiguous memory locations.',
      },
      {
        examId: dsaExam._id, order: 1, difficulty: 'Medium', topic: 'Linked Lists',
        questionText: 'What is the time complexity of inserting an element at the beginning of a singly linked list?',
        options: [{ text: 'O(n)' }, { text: 'O(n log n)' }, { text: 'O(1)' }, { text: 'O(log n)' }],
        correctOption: 2,
        explanation: 'Inserting at the head of a singly linked list is O(1) because you only need to create a new node and update the head pointer.',
      },
      {
        examId: dsaExam._id, order: 2, difficulty: 'Easy', topic: 'Stacks',
        questionText: 'Which data structure follows the Last-In-First-Out (LIFO) principle?',
        options: [{ text: 'Queue' }, { text: 'Array' }, { text: 'Stack' }, { text: 'Linked List' }],
        correctOption: 2,
        explanation: 'A Stack follows the LIFO principle — the last element pushed is the first one to be popped.',
      },
      {
        examId: dsaExam._id, order: 3, difficulty: 'Medium', topic: 'Sorting',
        questionText: 'What is the average time complexity of Quick Sort?',
        options: [{ text: 'O(n)' }, { text: 'O(n log n)' }, { text: 'O(n²)' }, { text: 'O(log n)' }],
        correctOption: 1,
        explanation: 'Quick Sort has an average-case time complexity of O(n log n). Its worst case is O(n²) when the pivot selection is poor.',
      },
      {
        examId: dsaExam._id, order: 4, difficulty: 'Hard', topic: 'Trees',
        questionText: 'What is the maximum number of nodes in a binary tree of height h?',
        options: [{ text: '2^h' }, { text: '2^(h+1) - 1' }, { text: '2h + 1' }, { text: 'h²' }],
        correctOption: 1,
        explanation: 'A binary tree of height h can have at most 2^(h+1) - 1 nodes (when every level is completely filled).',
      },
      {
        examId: dsaExam._id, order: 5, difficulty: 'Medium', topic: 'Graphs',
        questionText: 'Which algorithm is used to find the shortest path in an unweighted graph?',
        options: [{ text: "Dijkstra's Algorithm" }, { text: 'Depth-First Search (DFS)' }, { text: 'Breadth-First Search (BFS)' }, { text: "Bellman-Ford Algorithm" }],
        correctOption: 2,
        explanation: 'BFS explores nodes level by level, naturally finding the shortest path in unweighted graphs.',
      },
      {
        examId: dsaExam._id, order: 6, difficulty: 'Easy', topic: 'Searching',
        questionText: 'What is the time complexity of Binary Search on a sorted array?',
        options: [{ text: 'O(n)' }, { text: 'O(log n)' }, { text: 'O(n²)' }, { text: 'O(1)' }],
        correctOption: 1,
        explanation: 'Binary search halves the search space with each comparison, resulting in O(log n) time complexity.',
      },
      {
        examId: dsaExam._id, order: 7, difficulty: 'Medium', topic: 'Hash Tables',
        questionText: 'What is the average time complexity of search in a hash table?',
        options: [{ text: 'O(n)' }, { text: 'O(log n)' }, { text: 'O(n log n)' }, { text: 'O(1)' }],
        correctOption: 3,
        explanation: 'Hash tables provide O(1) average-case time complexity for search operations using hash functions.',
      },
      {
        examId: dsaExam._id, order: 8, difficulty: 'Hard', topic: 'Dynamic Programming',
        questionText: 'What is the time complexity of solving the 0/1 Knapsack problem using dynamic programming with n items and capacity W?',
        options: [{ text: 'O(n)' }, { text: 'O(nW)' }, { text: 'O(2^n)' }, { text: 'O(n log n)' }],
        correctOption: 1,
        explanation: 'The DP solution builds a table of size n × W, giving a pseudo-polynomial time complexity of O(nW).',
      },
      {
        examId: dsaExam._id, order: 9, difficulty: 'Medium', topic: 'Heaps',
        questionText: 'What is the time complexity of inserting an element into a max-heap?',
        options: [{ text: 'O(1)' }, { text: 'O(n)' }, { text: 'O(log n)' }, { text: 'O(n log n)' }],
        correctOption: 2,
        explanation: 'Inserting into a heap requires placing the element at the end and "bubbling up" through at most log n levels.',
      },
    ]);

    // Exam 2: Operating Systems
    const osExam = await Exam.create({
      title: 'Operating Systems Concepts',
      description: 'A comprehensive exam covering process management, memory management, file systems, and concurrency in operating systems.',
      category: 'Operating Systems',
      difficulty: 'Medium',
      durationMinutes: 25,
      marksPerQuestion: 2,
      negativeMarks: 0.5,
      passingPercentage: 40,
      instructions: '1. This exam has 10 questions on OS concepts.\n2. Each correct answer: +2 marks.\n3. Each incorrect answer: -0.5 marks.\n4. Duration: 25 minutes.\n5. Read each question carefully before answering.',
      status: 'published',
      totalQuestions: 10,
      showAnswerKey: true,
      maxAttempts: 3,
      createdBy: admin._id,
    });

    await Question.insertMany([
      {
        examId: osExam._id, order: 0, difficulty: 'Easy', topic: 'Process Management',
        questionText: 'Which of the following is NOT a valid process state?',
        options: [{ text: 'Running' }, { text: 'Waiting' }, { text: 'Compiling' }, { text: 'Ready' }],
        correctOption: 2,
        explanation: '"Compiling" is not a standard process state. The typical states are New, Ready, Running, Waiting, and Terminated.',
      },
      {
        examId: osExam._id, order: 1, difficulty: 'Medium', topic: 'Scheduling',
        questionText: 'Which scheduling algorithm may cause starvation?',
        options: [{ text: 'Round Robin' }, { text: 'First Come First Serve' }, { text: 'Shortest Job First (non-preemptive)' }, { text: 'Priority Scheduling' }],
        correctOption: 3,
        explanation: 'In Priority Scheduling, low-priority processes may wait indefinitely if higher-priority processes keep arriving (starvation).',
      },
      {
        examId: osExam._id, order: 2, difficulty: 'Medium', topic: 'Memory Management',
        questionText: 'What is the purpose of a page table in virtual memory?',
        options: [{ text: 'To store process priorities' }, { text: 'To map virtual addresses to physical addresses' }, { text: 'To manage CPU scheduling' }, { text: 'To handle I/O operations' }],
        correctOption: 1,
        explanation: 'A page table maps virtual (logical) addresses to physical (real) addresses in memory.',
      },
      {
        examId: osExam._id, order: 3, difficulty: 'Hard', topic: 'Deadlocks',
        questionText: 'Which of the following is NOT a necessary condition for deadlock?',
        options: [{ text: 'Mutual Exclusion' }, { text: 'Hold and Wait' }, { text: 'Preemption' }, { text: 'Circular Wait' }],
        correctOption: 2,
        explanation: 'The four necessary conditions for deadlock are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. "Preemption" is not — it is "No Preemption" that is required.',
      },
      {
        examId: osExam._id, order: 4, difficulty: 'Easy', topic: 'File Systems',
        questionText: 'What does FIFO stand for in the context of page replacement?',
        options: [{ text: 'First In First Out' }, { text: 'Fast Input Fast Output' }, { text: 'File In File Out' }, { text: 'Frame In Frame Out' }],
        correctOption: 0,
        explanation: 'FIFO stands for First In First Out — the oldest page in memory is replaced first.',
      },
      {
        examId: osExam._id, order: 5, difficulty: 'Medium', topic: 'Concurrency',
        questionText: 'What is a semaphore in operating systems?',
        options: [{ text: 'A type of interrupt' }, { text: 'A synchronization primitive used to control access to shared resources' }, { text: 'A CPU register' }, { text: 'A memory management technique' }],
        correctOption: 1,
        explanation: 'A semaphore is a synchronization primitive that uses a counter to control access to shared resources by multiple processes.',
      },
      {
        examId: osExam._id, order: 6, difficulty: 'Medium', topic: 'Memory Management',
        questionText: 'Which page replacement algorithm is known as the optimal algorithm?',
        options: [{ text: 'FIFO' }, { text: 'LRU' }, { text: 'Optimal (OPT/MIN)' }, { text: 'Clock' }],
        correctOption: 2,
        explanation: 'The Optimal (OPT/MIN) algorithm replaces the page that will not be used for the longest time in the future, giving the lowest possible page fault rate.',
      },
      {
        examId: osExam._id, order: 7, difficulty: 'Easy', topic: 'Process Management',
        questionText: 'What is the function of a Process Control Block (PCB)?',
        options: [{ text: 'To store program source code' }, { text: 'To store information about a process for the OS' }, { text: 'To compile the program' }, { text: 'To manage network connections' }],
        correctOption: 1,
        explanation: 'A PCB contains process state, program counter, CPU registers, memory management info, and I/O status — everything the OS needs to manage the process.',
      },
      {
        examId: osExam._id, order: 8, difficulty: 'Hard', topic: 'File Systems',
        questionText: 'In the inode structure, what do indirect pointers provide?',
        options: [{ text: 'Faster access to small files' }, { text: 'Access to larger files by pointing to blocks of pointers' }, { text: 'Security for file access' }, { text: 'Encryption of file data' }],
        correctOption: 1,
        explanation: 'Indirect pointers allow inodes to reference larger files by pointing to blocks that themselves contain pointers to data blocks.',
      },
      {
        examId: osExam._id, order: 9, difficulty: 'Medium', topic: 'Scheduling',
        questionText: 'In Round Robin scheduling, what happens when a process\'s time quantum expires?',
        options: [{ text: 'The process is terminated' }, { text: 'The process is moved to the ready queue' }, { text: 'The process gets more time' }, { text: 'The process goes to sleep' }],
        correctOption: 1,
        explanation: 'When a process\'s time quantum expires in Round Robin, it is preempted and placed at the back of the ready queue.',
      },
    ]);

    // Exam 3: DBMS
    const dbmsExam = await Exam.create({
      title: 'Database Management Systems',
      description: 'Test your understanding of relational databases, SQL, normalization, transactions, and database design principles.',
      category: 'DBMS',
      difficulty: 'Easy',
      durationMinutes: 20,
      marksPerQuestion: 1,
      negativeMarks: 0.25,
      passingPercentage: 35,
      instructions: '1. 10 MCQ questions on DBMS fundamentals.\n2. +1 mark for each correct answer.\n3. -0.25 for incorrect answers.\n4. 20 minutes duration.',
      status: 'published',
      totalQuestions: 10,
      showAnswerKey: true,
      maxAttempts: 3,
      createdBy: admin._id,
    });

    await Question.insertMany([
      {
        examId: dbmsExam._id, order: 0, difficulty: 'Easy', topic: 'SQL',
        questionText: 'Which SQL command is used to retrieve data from a database?',
        options: [{ text: 'INSERT' }, { text: 'SELECT' }, { text: 'UPDATE' }, { text: 'DELETE' }],
        correctOption: 1,
        explanation: 'SELECT is the SQL DML command used to query and retrieve data from database tables.',
      },
      {
        examId: dbmsExam._id, order: 1, difficulty: 'Medium', topic: 'Normalization',
        questionText: 'Which normal form deals with removing transitive dependencies?',
        options: [{ text: 'First Normal Form (1NF)' }, { text: 'Second Normal Form (2NF)' }, { text: 'Third Normal Form (3NF)' }, { text: 'BCNF' }],
        correctOption: 2,
        explanation: '3NF requires that no non-prime attribute is transitively dependent on the primary key.',
      },
      {
        examId: dbmsExam._id, order: 2, difficulty: 'Easy', topic: 'Keys',
        questionText: 'What is a primary key?',
        options: [{ text: 'A key that allows null values' }, { text: 'A key that allows duplicate values' }, { text: 'A unique identifier for each record in a table' }, { text: 'A foreign reference to another table' }],
        correctOption: 2,
        explanation: 'A primary key uniquely identifies each record in a table and cannot contain NULL values.',
      },
      {
        examId: dbmsExam._id, order: 3, difficulty: 'Medium', topic: 'Transactions',
        questionText: 'What does the "A" in ACID properties stand for?',
        options: [{ text: 'Availability' }, { text: 'Atomicity' }, { text: 'Authentication' }, { text: 'Authorization' }],
        correctOption: 1,
        explanation: 'Atomicity ensures that all operations in a transaction are completed or none are applied — it is all or nothing.',
      },
      {
        examId: dbmsExam._id, order: 4, difficulty: 'Medium', topic: 'SQL',
        questionText: 'Which SQL clause is used to filter groups?',
        options: [{ text: 'WHERE' }, { text: 'GROUP BY' }, { text: 'HAVING' }, { text: 'ORDER BY' }],
        correctOption: 2,
        explanation: 'HAVING is used to filter groups created by GROUP BY, whereas WHERE filters individual rows before grouping.',
      },
      {
        examId: dbmsExam._id, order: 5, difficulty: 'Easy', topic: 'Joins',
        questionText: 'Which type of join returns all rows from both tables?',
        options: [{ text: 'INNER JOIN' }, { text: 'LEFT JOIN' }, { text: 'RIGHT JOIN' }, { text: 'FULL OUTER JOIN' }],
        correctOption: 3,
        explanation: 'A FULL OUTER JOIN returns all rows from both tables, with NULLs where there is no match.',
      },
      {
        examId: dbmsExam._id, order: 6, difficulty: 'Hard', topic: 'Concurrency',
        questionText: 'Which protocol is used to ensure serializability in transaction management?',
        options: [{ text: 'TCP/IP Protocol' }, { text: 'Two-Phase Locking (2PL)' }, { text: 'HTTP Protocol' }, { text: 'FTP Protocol' }],
        correctOption: 1,
        explanation: 'Two-Phase Locking (2PL) ensures serializability by dividing lock management into growing and shrinking phases.',
      },
      {
        examId: dbmsExam._id, order: 7, difficulty: 'Easy', topic: 'ER Model',
        questionText: 'In an ER diagram, what does a diamond shape represent?',
        options: [{ text: 'Entity' }, { text: 'Attribute' }, { text: 'Relationship' }, { text: 'Primary Key' }],
        correctOption: 2,
        explanation: 'In ER diagrams, diamonds represent relationships between entities.',
      },
      {
        examId: dbmsExam._id, order: 8, difficulty: 'Medium', topic: 'Indexing',
        questionText: 'What is the primary advantage of creating an index on a database table?',
        options: [{ text: 'Reduces storage space' }, { text: 'Speeds up data retrieval' }, { text: 'Prevents data duplication' }, { text: 'Ensures data integrity' }],
        correctOption: 1,
        explanation: 'Indexes speed up data retrieval by providing quick access paths to rows, similar to a book index.',
      },
      {
        examId: dbmsExam._id, order: 9, difficulty: 'Medium', topic: 'SQL',
        questionText: 'Which SQL command is used to remove a table and all its data permanently?',
        options: [{ text: 'DELETE' }, { text: 'TRUNCATE' }, { text: 'DROP' }, { text: 'REMOVE' }],
        correctOption: 2,
        explanation: 'DROP TABLE removes the table structure and all its data permanently from the database.',
      },
    ]);

    // Exam 4: Networking
    const networkExam = await Exam.create({
      title: 'Computer Networking Essentials',
      description: 'Evaluate your knowledge of networking concepts including OSI model, TCP/IP, protocols, and network security.',
      category: 'Networking',
      difficulty: 'Medium',
      durationMinutes: 25,
      marksPerQuestion: 2,
      negativeMarks: 0.5,
      passingPercentage: 40,
      instructions: '1. 10 MCQ questions on Networking.\n2. +2 marks per correct answer.\n3. -0.5 marks per incorrect answer.\n4. 25 minutes duration.',
      status: 'published',
      totalQuestions: 10,
      showAnswerKey: true,
      maxAttempts: 3,
      createdBy: admin._id,
    });

    await Question.insertMany([
      {
        examId: networkExam._id, order: 0, difficulty: 'Easy', topic: 'OSI Model',
        questionText: 'How many layers does the OSI model have?',
        options: [{ text: '4' }, { text: '5' }, { text: '7' }, { text: '6' }],
        correctOption: 2,
        explanation: 'The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application.',
      },
      {
        examId: networkExam._id, order: 1, difficulty: 'Easy', topic: 'Protocols',
        questionText: 'Which protocol is used for sending emails?',
        options: [{ text: 'HTTP' }, { text: 'FTP' }, { text: 'SMTP' }, { text: 'DNS' }],
        correctOption: 2,
        explanation: 'SMTP (Simple Mail Transfer Protocol) is used for sending emails between servers.',
      },
      {
        examId: networkExam._id, order: 2, difficulty: 'Medium', topic: 'TCP/IP',
        questionText: 'What is the main difference between TCP and UDP?',
        options: [{ text: 'TCP is faster than UDP' }, { text: 'TCP is connection-oriented while UDP is connectionless' }, { text: 'UDP provides error correction' }, { text: 'TCP is used for video streaming' }],
        correctOption: 1,
        explanation: 'TCP is connection-oriented (ensures reliable delivery), while UDP is connectionless (faster but no guarantee of delivery).',
      },
      {
        examId: networkExam._id, order: 3, difficulty: 'Medium', topic: 'IP Addressing',
        questionText: 'How many bits are in an IPv4 address?',
        options: [{ text: '16' }, { text: '32' }, { text: '64' }, { text: '128' }],
        correctOption: 1,
        explanation: 'An IPv4 address is 32 bits long, divided into 4 octets (e.g., 192.168.1.1).',
      },
      {
        examId: networkExam._id, order: 4, difficulty: 'Easy', topic: 'Network Devices',
        questionText: 'Which device operates at Layer 3 (Network Layer) of the OSI model?',
        options: [{ text: 'Hub' }, { text: 'Switch' }, { text: 'Router' }, { text: 'Repeater' }],
        correctOption: 2,
        explanation: 'Routers operate at Layer 3 and make forwarding decisions based on IP addresses.',
      },
      {
        examId: networkExam._id, order: 5, difficulty: 'Hard', topic: 'Subnetting',
        questionText: 'What is the subnet mask for a /24 network?',
        options: [{ text: '255.255.0.0' }, { text: '255.255.255.0' }, { text: '255.255.255.128' }, { text: '255.0.0.0' }],
        correctOption: 1,
        explanation: 'A /24 network has 24 bits for the network portion, giving a subnet mask of 255.255.255.0.',
      },
      {
        examId: networkExam._id, order: 6, difficulty: 'Medium', topic: 'DNS',
        questionText: 'What does DNS stand for?',
        options: [{ text: 'Dynamic Network Service' }, { text: 'Domain Name System' }, { text: 'Data Network Security' }, { text: 'Digital Naming Standard' }],
        correctOption: 1,
        explanation: 'DNS (Domain Name System) translates human-readable domain names to IP addresses.',
      },
      {
        examId: networkExam._id, order: 7, difficulty: 'Medium', topic: 'Security',
        questionText: 'Which protocol provides secure communication over the internet?',
        options: [{ text: 'HTTP' }, { text: 'FTP' }, { text: 'HTTPS/TLS' }, { text: 'Telnet' }],
        correctOption: 2,
        explanation: 'HTTPS uses TLS (Transport Layer Security) to encrypt communication between client and server.',
      },
      {
        examId: networkExam._id, order: 8, difficulty: 'Easy', topic: 'Network Topologies',
        questionText: 'In which topology are all devices connected to a central hub?',
        options: [{ text: 'Ring' }, { text: 'Bus' }, { text: 'Star' }, { text: 'Mesh' }],
        correctOption: 2,
        explanation: 'In a Star topology, all devices are connected to a central hub or switch.',
      },
      {
        examId: networkExam._id, order: 9, difficulty: 'Hard', topic: 'Routing',
        questionText: 'Which routing protocol uses link-state algorithm?',
        options: [{ text: 'RIP' }, { text: 'OSPF' }, { text: 'BGP' }, { text: 'EIGRP' }],
        correctOption: 1,
        explanation: 'OSPF (Open Shortest Path First) uses a link-state routing algorithm where each router builds a complete topology map.',
      },
    ]);

    // Exam 5: Cybersecurity
    const cyberExam = await Exam.create({
      title: 'Cybersecurity Fundamentals',
      description: 'Assess your knowledge of cybersecurity principles, threats, encryption, and security best practices.',
      category: 'Cybersecurity',
      difficulty: 'Hard',
      durationMinutes: 30,
      marksPerQuestion: 2,
      negativeMarks: 0.5,
      passingPercentage: 45,
      instructions: '1. 10 questions on cybersecurity.\n2. +2 marks per correct, -0.5 per incorrect.\n3. 30 minutes to complete.',
      status: 'published',
      totalQuestions: 10,
      showAnswerKey: true,
      maxAttempts: 2,
      createdBy: admin._id,
    });

    await Question.insertMany([
      {
        examId: cyberExam._id, order: 0, difficulty: 'Easy', topic: 'Basics',
        questionText: 'What does CIA stand for in information security?',
        options: [{ text: 'Central Intelligence Agency' }, { text: 'Confidentiality, Integrity, Availability' }, { text: 'Computer Information Access' }, { text: 'Cyber Intelligence Analysis' }],
        correctOption: 1,
        explanation: 'The CIA triad — Confidentiality, Integrity, and Availability — forms the foundation of information security.',
      },
      {
        examId: cyberExam._id, order: 1, difficulty: 'Medium', topic: 'Attacks',
        questionText: 'What type of attack involves tricking a user into revealing sensitive information?',
        options: [{ text: 'DDoS Attack' }, { text: 'Phishing' }, { text: 'SQL Injection' }, { text: 'Buffer Overflow' }],
        correctOption: 1,
        explanation: 'Phishing is a social engineering attack where attackers impersonate trusted entities to steal credentials or personal information.',
      },
      {
        examId: cyberExam._id, order: 2, difficulty: 'Hard', topic: 'Encryption',
        questionText: 'Which encryption algorithm uses a public-private key pair?',
        options: [{ text: 'AES' }, { text: 'DES' }, { text: 'RSA' }, { text: 'RC4' }],
        correctOption: 2,
        explanation: 'RSA is an asymmetric encryption algorithm that uses a public key for encryption and a private key for decryption.',
      },
      {
        examId: cyberExam._id, order: 3, difficulty: 'Medium', topic: 'Authentication',
        questionText: 'What is multi-factor authentication (MFA)?',
        options: [{ text: 'Using multiple passwords' }, { text: 'Using two or more different types of authentication factors' }, { text: 'Logging in from multiple devices' }, { text: 'Having multiple user accounts' }],
        correctOption: 1,
        explanation: 'MFA requires users to provide two or more verification factors (something you know, have, or are) to gain access.',
      },
      {
        examId: cyberExam._id, order: 4, difficulty: 'Easy', topic: 'Malware',
        questionText: 'What is ransomware?',
        options: [{ text: 'A virus that deletes files' }, { text: 'Malware that encrypts data and demands payment for decryption' }, { text: 'A program that speeds up your computer' }, { text: 'A type of firewall' }],
        correctOption: 1,
        explanation: 'Ransomware encrypts the victim\'s files and demands a ransom payment to restore access.',
      },
      {
        examId: cyberExam._id, order: 5, difficulty: 'Medium', topic: 'Web Security',
        questionText: 'What is Cross-Site Scripting (XSS)?',
        options: [{ text: 'A server configuration error' }, { text: 'An attack where malicious scripts are injected into trusted websites' }, { text: 'A database backup method' }, { text: 'A type of firewall rule' }],
        correctOption: 1,
        explanation: 'XSS attacks inject malicious scripts into web pages viewed by other users, potentially stealing session cookies or credentials.',
      },
      {
        examId: cyberExam._id, order: 6, difficulty: 'Hard', topic: 'Network Security',
        questionText: 'What is a zero-day vulnerability?',
        options: [{ text: 'A vulnerability that has been patched' }, { text: 'A vulnerability unknown to the vendor with no available patch' }, { text: 'A vulnerability in Day 1 of deployment' }, { text: 'A minor software bug' }],
        correctOption: 1,
        explanation: 'A zero-day vulnerability is a security flaw unknown to the vendor, with no patch available — attackers can exploit it before a fix is released.',
      },
      {
        examId: cyberExam._id, order: 7, difficulty: 'Medium', topic: 'Firewalls',
        questionText: 'What is the primary function of a firewall?',
        options: [{ text: 'To encrypt data' }, { text: 'To monitor and filter incoming and outgoing network traffic' }, { text: 'To detect viruses' }, { text: 'To manage user passwords' }],
        correctOption: 1,
        explanation: 'A firewall monitors and filters network traffic based on security rules, creating a barrier between trusted and untrusted networks.',
      },
      {
        examId: cyberExam._id, order: 8, difficulty: 'Easy', topic: 'Best Practices',
        questionText: 'Which of the following is a recommended password practice?',
        options: [{ text: 'Using the same password everywhere' }, { text: 'Writing passwords on sticky notes' }, { text: 'Using unique, complex passwords with a password manager' }, { text: 'Sharing passwords with trusted colleagues' }],
        correctOption: 2,
        explanation: 'Using unique, complex passwords stored in a password manager is the recommended best practice for password security.',
      },
      {
        examId: cyberExam._id, order: 9, difficulty: 'Hard', topic: 'Cryptography',
        questionText: 'What is a hash function primarily used for in security?',
        options: [{ text: 'Encrypting files for transmission' }, { text: 'Creating a fixed-size digest to verify data integrity' }, { text: 'Generating random numbers' }, { text: 'Compressing data' }],
        correctOption: 1,
        explanation: 'Hash functions produce a fixed-size digest (hash) of input data, used to verify data integrity and store password hashes.',
      },
    ]);

    // Exam 6: Aptitude & Reasoning
    const aptExam = await Exam.create({
      title: 'Aptitude & Logical Reasoning',
      description: 'Challenge your quantitative aptitude, logical reasoning, and analytical thinking skills.',
      category: 'Aptitude and Reasoning',
      difficulty: 'Easy',
      durationMinutes: 20,
      marksPerQuestion: 1,
      negativeMarks: 0,
      passingPercentage: 50,
      instructions: '1. 10 aptitude and reasoning questions.\n2. +1 mark per correct answer, no negative marking.\n3. 20 minutes duration.',
      status: 'published',
      totalQuestions: 10,
      showAnswerKey: true,
      maxAttempts: 5,
      createdBy: admin._id,
    });

    await Question.insertMany([
      {
        examId: aptExam._id, order: 0, difficulty: 'Easy', topic: 'Number Series',
        questionText: 'What is the next number in the series: 2, 6, 12, 20, 30, ?',
        options: [{ text: '36' }, { text: '40' }, { text: '42' }, { text: '44' }],
        correctOption: 2,
        explanation: 'The differences between consecutive terms are 4, 6, 8, 10, 12. So the next term is 30 + 12 = 42.',
      },
      {
        examId: aptExam._id, order: 1, difficulty: 'Easy', topic: 'Percentages',
        questionText: 'If a shirt costs ₹800 and is sold at 25% discount, what is the selling price?',
        options: [{ text: '₹500' }, { text: '₹600' }, { text: '₹650' }, { text: '₹700' }],
        correctOption: 1,
        explanation: 'Discount = 25% of 800 = ₹200. Selling price = 800 - 200 = ₹600.',
      },
      {
        examId: aptExam._id, order: 2, difficulty: 'Medium', topic: 'Time and Work',
        questionText: 'A can finish a work in 12 days, B can finish it in 18 days. Working together, how many days will they take?',
        options: [{ text: '6.5 days' }, { text: '7.2 days' }, { text: '8 days' }, { text: '9 days' }],
        correctOption: 1,
        explanation: 'A\'s rate = 1/12, B\'s rate = 1/18. Combined rate = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 days.',
      },
      {
        examId: aptExam._id, order: 3, difficulty: 'Easy', topic: 'Profit and Loss',
        questionText: 'A shopkeeper buys an article for ₹500 and sells it for ₹600. What is the profit percentage?',
        options: [{ text: '10%' }, { text: '15%' }, { text: '20%' }, { text: '25%' }],
        correctOption: 2,
        explanation: 'Profit = 600 - 500 = ₹100. Profit% = (100/500) × 100 = 20%.',
      },
      {
        examId: aptExam._id, order: 4, difficulty: 'Medium', topic: 'Logical Reasoning',
        questionText: 'If all roses are flowers and some flowers are red, which statement must be true?',
        options: [{ text: 'All roses are red' }, { text: 'Some roses are red' }, { text: 'No definite conclusion about roses being red' }, { text: 'All flowers are roses' }],
        correctOption: 2,
        explanation: 'We know all roses are flowers, and some flowers are red. But we cannot conclude that any roses are red — the "some flowers" that are red might not include roses.',
      },
      {
        examId: aptExam._id, order: 5, difficulty: 'Easy', topic: 'Averages',
        questionText: 'The average of 5 numbers is 20. If one number is removed, the average becomes 15. What was the removed number?',
        options: [{ text: '30' }, { text: '35' }, { text: '40' }, { text: '25' }],
        correctOption: 2,
        explanation: 'Sum of 5 numbers = 5 × 20 = 100. Sum of remaining 4 = 4 × 15 = 60. Removed number = 100 - 60 = 40.',
      },
      {
        examId: aptExam._id, order: 6, difficulty: 'Medium', topic: 'Coding-Decoding',
        questionText: 'If COMPUTER is coded as RFUVQNPD, how is LAPTOP coded? (Each letter shifted by +1)',
        options: [{ text: 'MBQUPQ' }, { text: 'MBQUPO' }, { text: 'KZOSNO' }, { text: 'NCRVQP' }],
        correctOption: 0,
        explanation: 'Each letter is shifted +1 position: L→M, A→B, P→Q, T→U, O→P, P→Q. Result: MBQUPQ.',
      },
      {
        examId: aptExam._id, order: 7, difficulty: 'Easy', topic: 'Ratio and Proportion',
        questionText: 'If the ratio of ages of A and B is 3:5, and B is 25 years old, how old is A?',
        options: [{ text: '12' }, { text: '15' }, { text: '18' }, { text: '20' }],
        correctOption: 1,
        explanation: '3/5 = A/25 → A = (3 × 25)/5 = 15 years.',
      },
      {
        examId: aptExam._id, order: 8, difficulty: 'Medium', topic: 'Speed and Distance',
        questionText: 'A train 200m long crosses a pole in 10 seconds. What is its speed in km/h?',
        options: [{ text: '60 km/h' }, { text: '72 km/h' }, { text: '80 km/h' }, { text: '90 km/h' }],
        correctOption: 1,
        explanation: 'Speed = 200/10 = 20 m/s. Convert to km/h: 20 × 18/5 = 72 km/h.',
      },
      {
        examId: aptExam._id, order: 9, difficulty: 'Hard', topic: 'Probability',
        questionText: 'Two dice are thrown. What is the probability that the sum is 7?',
        options: [{ text: '1/9' }, { text: '1/6' }, { text: '5/36' }, { text: '7/36' }],
        correctOption: 1,
        explanation: 'Favorable outcomes for sum 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 outcomes. Total = 36. Probability = 6/36 = 1/6.',
      },
    ]);

    // Exam 7: Computer Science Fundamentals (Draft)
    const csExam = await Exam.create({
      title: 'Computer Science Fundamentals',
      description: 'A broad exam covering programming basics, computer architecture, and software engineering concepts.',
      category: 'Computer Science',
      difficulty: 'Easy',
      durationMinutes: 25,
      marksPerQuestion: 1,
      negativeMarks: 0,
      passingPercentage: 40,
      instructions: '1. 10 MCQ questions.\n2. +1 per correct answer, no negative marks.\n3. 25 minutes.',
      status: 'published',
      totalQuestions: 10,
      showAnswerKey: true,
      maxAttempts: 3,
      createdBy: admin._id,
    });

    await Question.insertMany([
      {
        examId: csExam._id, order: 0, difficulty: 'Easy', topic: 'Programming',
        questionText: 'Which of the following is NOT a programming language?',
        options: [{ text: 'Python' }, { text: 'Java' }, { text: 'HTML' }, { text: 'C++' }],
        correctOption: 2,
        explanation: 'HTML is a markup language for structuring web content, not a programming language.',
      },
      {
        examId: csExam._id, order: 1, difficulty: 'Easy', topic: 'Architecture',
        questionText: 'What does CPU stand for?',
        options: [{ text: 'Central Processing Unit' }, { text: 'Computer Personal Unit' }, { text: 'Central Program Utility' }, { text: 'Computer Processing Utility' }],
        correctOption: 0,
        explanation: 'CPU stands for Central Processing Unit — the primary component that executes instructions.',
      },
      {
        examId: csExam._id, order: 2, difficulty: 'Medium', topic: 'OOP',
        questionText: 'Which OOP concept involves hiding internal implementation details?',
        options: [{ text: 'Inheritance' }, { text: 'Polymorphism' }, { text: 'Encapsulation' }, { text: 'Abstraction' }],
        correctOption: 2,
        explanation: 'Encapsulation bundles data and methods that operate on that data within a class, hiding internal details.',
      },
      {
        examId: csExam._id, order: 3, difficulty: 'Easy', topic: 'Number Systems',
        questionText: 'What is the binary representation of the decimal number 10?',
        options: [{ text: '1010' }, { text: '1100' }, { text: '1001' }, { text: '1110' }],
        correctOption: 0,
        explanation: '10 in binary is 1010 (8 + 0 + 2 + 0 = 10).',
      },
      {
        examId: csExam._id, order: 4, difficulty: 'Medium', topic: 'Software Engineering',
        questionText: 'Which software development model is known for iterative and incremental delivery?',
        options: [{ text: 'Waterfall Model' }, { text: 'Agile Model' }, { text: 'V-Model' }, { text: 'Big Bang Model' }],
        correctOption: 1,
        explanation: 'Agile emphasizes iterative development, delivering working software in short sprints with continuous feedback.',
      },
      {
        examId: csExam._id, order: 5, difficulty: 'Easy', topic: 'Memory',
        questionText: 'Which type of memory is volatile?',
        options: [{ text: 'ROM' }, { text: 'RAM' }, { text: 'Hard Disk' }, { text: 'SSD' }],
        correctOption: 1,
        explanation: 'RAM is volatile memory — it loses its contents when power is turned off.',
      },
      {
        examId: csExam._id, order: 6, difficulty: 'Medium', topic: 'Networking',
        questionText: 'What is the purpose of an IP address?',
        options: [{ text: 'To encrypt data' }, { text: 'To uniquely identify a device on a network' }, { text: 'To store data' }, { text: 'To run programs' }],
        correctOption: 1,
        explanation: 'An IP address uniquely identifies a device on a network, enabling communication between devices.',
      },
      {
        examId: csExam._id, order: 7, difficulty: 'Easy', topic: 'Programming',
        questionText: 'What is a variable in programming?',
        options: [{ text: 'A function that performs calculations' }, { text: 'A named storage location that holds a value' }, { text: 'A type of loop' }, { text: 'A hardware component' }],
        correctOption: 1,
        explanation: 'A variable is a named storage location in memory that holds a value which can be changed during program execution.',
      },
      {
        examId: csExam._id, order: 8, difficulty: 'Medium', topic: 'Algorithms',
        questionText: 'What is an algorithm?',
        options: [{ text: 'A programming language' }, { text: 'A step-by-step procedure to solve a problem' }, { text: 'A hardware device' }, { text: 'A type of database' }],
        correctOption: 1,
        explanation: 'An algorithm is a finite sequence of well-defined, step-by-step instructions for solving a problem or performing a task.',
      },
      {
        examId: csExam._id, order: 9, difficulty: 'Hard', topic: 'Complexity',
        questionText: 'What does Big-O notation describe?',
        options: [{ text: 'The exact runtime of an algorithm' }, { text: 'The upper bound of an algorithm\'s growth rate' }, { text: 'The memory used by a program' }, { text: 'The number of lines of code' }],
        correctOption: 1,
        explanation: 'Big-O notation describes the upper bound of an algorithm\'s time complexity — its worst-case growth rate as input size increases.',
      },
    ]);

    console.log('\n✅ Seed data created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Admin: ' + adminEmail + ' / ' + adminPassword);
    console.log('📧 Student: student@exampro.com / Student@123');
    console.log('📝 7 exams created with 10 questions each');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
