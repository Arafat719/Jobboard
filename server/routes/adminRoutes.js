import { Router } from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';

const router = Router();

// GET /api/admin/stats
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalJobs, totalApplications, activeJobs, typeAgg, recentJobs] =
      await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
        Application.countDocuments(),
        Job.countDocuments({ isActive: true }),
        Job.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
        Job.find().sort({ createdAt: -1 }).limit(5).populate('employer', 'name'),
      ]);

    const jobsByType = {};
    for (const { _id, count } of typeAgg) jobsByType[_id] = count;

    res.json({ totalUsers, totalJobs, totalApplications, activeJobs, jobsByType, recentJobs });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin accounts' });

    if (user.role === 'employer') {
      const jobs = await Job.find({ employer: user._id }, '_id');
      const jobIds = jobs.map((j) => j._id);
      if (jobIds.length) await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ employer: user._id });
    }

    await Application.deleteMany({ candidate: user._id });
    await user.deleteOne();

    res.json({ message: `User "${user.name}" and all associated data deleted` });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/jobs
router.get('/jobs', auth, requireAdmin, async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).populate('employer', 'name email');
    res.json(jobs);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/jobs/:id/toggle
router.put('/jobs/:id/toggle', auth, requireAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.isActive = !job.isActive;
    await job.save();
    res.json(job);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
