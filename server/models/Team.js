const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nom de l\'équipe requis'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  tag: {
    type: String,
    trim: true,
    maxlength: 10
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  seed: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  draws: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

teamSchema.index({ tournament: 1, name: 1 }, { unique: true });
teamSchema.index({ captain: 1 });

module.exports = mongoose.model('Team', teamSchema);
