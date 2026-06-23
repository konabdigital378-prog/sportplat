const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['user', 'system'],
    default: 'user'
  }
}, {
  timestamps: true
});

chatMessageSchema.index({ tournament: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
