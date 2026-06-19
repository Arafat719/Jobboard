import { Router } from 'express';
import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import auth from '../middleware/auth.js';
import { requireCandidate, requireEmployer } from '../middleware/roleCheck.js';

const router = Router();

const VALID_STATUSES = ['reviewed', 'hired', 'rejected'];

// POST /api/applications — candidate only
router.post('/', auth, requireCandidate, async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (!job.isActive) {
      return res.status(400).json({ message: 'This job listing is no longer active' });
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      coverLetter,
    });

    res.status(201).json(application);
  } catch (err) {
    // Compound unique index violation — duplicate application
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already applied to this job' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/applications/my — candidate only
router.get('/my', auth, requireCandidate, async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title company location type isActive')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/applications/job/:jobId — employer only
router.get('/job/:jobId', auth, requireEmployer, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/applications/:id/status — employer only
router.put('/:id/status', auth, requireEmployer, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID' });
    }

    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id).populate('job', 'employer');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
