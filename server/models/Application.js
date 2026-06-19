import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required'],
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidate reference is required'],
  },
  coverLetter: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'hired', 'rejected'],
    default: 'pending',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
