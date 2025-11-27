const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['download', 'transfer', 'ai_organize'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0
  },
  sourceUrl: String,
  filename: String,
  targetDrive: String,
  fileSize: String,
  speed: String,
  logs: [String],
  errorMessage: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', TaskSchema);