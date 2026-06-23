require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const tournamentRoutes = require('./routes/tournaments');
const matchRoutes = require('./routes/matches');
const teamRoutes = require('./routes/teams');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/upload');
const exportRoutes = require('./routes/exportData');
const seedingRoutes = require('./routes/seeding');
const paymentRoutes = require('./routes/payments');
const rolesRoutes = require('./routes/roles');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admin');
const teamMembersRoutes = require('./routes/teamMembers');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/seeding', seedingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/team-members', teamMembersRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const connectSupabase = require('./config/supabase');

module.exports = { app, connectSupabase };
