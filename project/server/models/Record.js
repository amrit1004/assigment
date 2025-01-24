import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true
  },
  verified: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  sheetName: {
    type: String,
    required: true
  },
  importedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
recordSchema.index({ date: 1, sheetName: 1 });

export const Record = mongoose.model('Record', recordSchema);