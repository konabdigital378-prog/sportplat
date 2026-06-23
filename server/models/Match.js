const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  round: {
    type: Number,
    required: true,
    default: 1
  },
  bracketPosition: {
    type: String,
    default: ''
  },
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  score1: {
    type: Number,
    default: 0
  },
  score2: {
    type: Number,
    default: 0
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  loser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled', 'walkover'],
    default: 'scheduled'
  },
  scheduledDate: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0
  },
  bestOf: {
    type: Number,
    enum: [1, 3, 5, 7],
    default: 3
  },
  games: [{
    gameNumber: Number,
    score1: { type: Number, default: 0 },
    score2: { type: Number, default: 0 },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
  }],
  nextMatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  nextLoserMatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

matchSchema.index({ tournament: 1, round: 1 });
matchSchema.index({ status: 1 });

module.exports = mongoose.model('Match', matchSchema);
