import { Router } from 'express';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import auth from '../middleware/auth.js';
import { requireEmployer } from '../middleware/roleCheck.js';

const router = Router();

const ALLOWED_TYPES = ['full-time', 'part-time', 'remote', 'contract'];
const EDITABLE_FIELDS = ['title', 'company', 'location', 'type', 'salary', 'description', 'requirements', 'isActive'];

// GET /api/jobs
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.type) {
      if (!ALLOWED_TYPES.includes(req.query.type)) {
        return res.status(400).json({ message: `Invalid type. Must be one of: ${ALLOWED_TYPES.join(', ')}` });
      }
      filter.type = req.query.type;
    }

    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    if (req.query.search) {
      const regex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [{ title: regex }, { company: regex }];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/jobs/my — Protected, employer only (must be before /:id)
router.get('/my', auth, requireEmployer, async (req, res) => {
  try {
    const jobs = await Job.aggregate([
      { $match: { employer: new mongoose.Types.ObjectId(req.user.id) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'job',
          as: 'applications',
        },
      },
      { $addFields: { applicationCount: { $size: '$applications' } } },
      { $project: { applications: 0 } },
    ]);

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(req.params.id).populate('employer', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/jobs — employer only
router.post('/', auth, requireEmployer, async (req, res) => {
  try {
    const { title, company, location, type, salary, description, requirements } = req.body;

    if (!title || !company || !location || !type || !description) {
      return res.status(400).json({ message: 'title, company, location, type, and description are required' });
    }

    const job = await Job.create({
      title,
      company,
      location,
      type,
      salary,
      description,
      requirements,
      employer: req.user.id,
    });

    res.status(201).json(job);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/jobs/:id — employer only, must own the job
router.put('/:id', auth, requireEmployer, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this job' });
    }

    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/jobs/:id — employer only, must own the job
router.delete('/:id', auth, requireEmployer, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();

    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
