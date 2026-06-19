import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'remote', 'contract'],
    required: [true, 'Job type is required'],
  },
  salary: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
  },
  requirements: {
    type: String,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer reference is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
