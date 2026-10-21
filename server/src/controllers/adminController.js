import User from '../models/User.js';
import Attempt from '../models/Attempt.js';
import { NotFoundError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/admin/students
export const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 });

  // Group candidate attempts from Exam Attempts
  const attemptCandidates = await Attempt.aggregate([
    {
      $group: {
        _id: '$studentName',
        totalAttempts: { $sum: 1 },
        lastAttemptDate: { $max: '$submittedAt' },
        avgScore: { $avg: '$percentage' },
      },
    },
  ]);

  // Combine registered accounts with their attempt metrics
  const combined = await Promise.all(
    users.map(async (u) => {
      const attemptCount = await Attempt.countDocuments({
        $or: [{ userId: u._id }, { studentName: u.name }],
        status: { $in: ['submitted', 'expired'] },
      });
      return {
        ...u.toObject(),
        totalAttempts: attemptCount,
      };
    })
  );

  // Add exam candidates who entered via shared password
  const registeredNames = new Set(users.map((u) => u.name?.toLowerCase()));
  for (const cand of attemptCandidates) {
    if (cand._id && !registeredNames.has(cand._id.toLowerCase())) {
      if (
        !search ||
        cand._id.toLowerCase().includes(search.toLowerCase())
      ) {
        combined.push({
          _id: `cand_${Buffer.from(cand._id).toString('hex').slice(0, 24)}`,
          name: cand._id,
          email: 'Exam Access Candidate',
          role: 'student',
          isActive: true,
          createdAt: cand.lastAttemptDate || new Date(),
          totalAttempts: cand.totalAttempts,
          isGuestCandidate: true,
        });
      }
    }
  }

  const total = combined.length;
  const paginated = combined.slice(skip, skip + parseInt(limit));

  res.json({
    success: true,
    students: paginated,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)) || 1,
    },
  });
});

// PATCH /api/admin/students/:id/status
export const updateStudentStatus = asyncHandler(async (req, res) => {
  if (req.params.id.startsWith('cand_')) {
    return res.json({
      success: true,
      message: 'Candidate session verified.',
    });
  }

  const student = await User.findById(req.params.id);
  if (!student) throw new NotFoundError('Student not found');

  const { isActive, role } = req.body;

  if (isActive !== undefined) student.isActive = isActive;
  if (role && ['student', 'admin'].includes(role)) student.role = role;

  await student.save();

  res.json({
    success: true,
    message: 'Student status updated',
    student,
  });
});
