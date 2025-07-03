const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  status:{ type: String, enum: ['pending', 'completed'], default: 'pending' },
  dueDate: Date,
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
