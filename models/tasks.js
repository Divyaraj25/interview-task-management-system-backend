const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['assigned', 'inprogress', 'done'],
    required: true,
    default: 'assigned',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
    default: 'low',
  },
  dueDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  createdById: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {timestamps: true});

taskSchema.index({ createdById: 1, status: 1, priority: 1 });

module.exports = mongoose.model('Task', taskSchema);
