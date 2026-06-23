const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nom du tournoi requis'],
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  game: {
    type: String,
    required: [true, 'Jeu/Type requis'],
    trim: true
  },
  type: {
    type: String,
    enum: ['single_elimination', 'double_elimination', 'round_robin', 'swiss', 'group_stage'],
    required: [true, 'Type de tournoi requis'],
    default: 'single_elimination'
  },
  status: {
    type: String,
    enum: ['draft', 'registration', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxPlayers: {
    type: Number,
    required: [true, 'Nombre maximum de joueurs requis'],
    min: 2,
    max: 256
  },
  minPlayers: {
    type: Number,
    default: 2,
    min: 2
  },
  teamSize: {
    type: Number,
    default: 1,
    min: 1,
    max: 50
  },
  isTeamBased: {
    type: Boolean,
    default: false
  },
  registrationDeadline: {
    type: Date
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  rules: {
    type: String,
    default: ''
  },
  prize: {
    type: String,
    default: ''
  },
  bracket: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  streamUrl: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  entryFee: {
    type: Number,
    default: 0
  },
  paymentMethods: [{
    type: String,
    enum: ['orange_money', 'moov', 'visa', 'mastercard'],
    default: []
  }],
  customRoles: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['moderator', 'referee', 'commentator'], default: 'moderator' }
  }]
}, {
  timestamps: true
});

tournamentSchema.index({ status: 1, startDate: 1 });
tournamentSchema.index({ organizer: 1 });

module.exports = mongoose.model('Tournament', tournamentSchema);
