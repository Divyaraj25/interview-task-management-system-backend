const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subtaskSchema = new Schema({
  taskId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Task', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  deleted: { 
    type: Boolean, 
    default: false,
  },
  status: { 
    type: String, 
    enum: ['assigned', 'inprogress', 'done'],
    default: 'assigned',
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'low',
    required: true 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  createdById: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
}, { timestamps: true });

subtaskSchema.index({ createdById: 1, status: 1, priority: 1, taskId: 1 });

module.exports = mongoose.model('Subtask', subtaskSchema);
