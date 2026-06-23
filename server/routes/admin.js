const express = require('express');
const { supabase } = require('../config/supabase');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: tournaments } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
    const { count: matches } = await supabase.from('matches').select('*', { count: 'exact', head: true });
    const { count: teams } = await supabase.from('teams').select('*', { count: 'exact', head: true });
    const { data: statusCounts } = await supabase.from('tournaments').select('status');
    const byStatus = {};
    if (statusCounts) statusCounts.forEach(t => { byStatus[t.status] = (byStatus[t.status] || 0) + 1; });
    const { count: payments } = await supabase.from('payments').select('*', { count: 'exact', head: true });
    const { data: recentT } = await supabase.from('tournaments').select('id, name, status, created_at').order('created_at', { ascending: false }).limit(5);
    res.json({ users: users || 0, tournaments: tournaments || 0, matches: matches || 0, teams: teams || 0, payments: payments || 0, byStatus, recentTournaments: recentT || [] });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    let query = supabase.from('profiles').select('id, username, email, phone, role, created_at');
    if (req.query.search) query = query.ilike('username', `%${req.query.search}%`);
    if (req.query.role) query = query.eq('role', req.query.role);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
    if (error) return res.status(400).json({ message: error.message });
    res.json(data || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/users/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'organizer', 'admin'].includes(role)) return res.status(400).json({ message: 'Rôle invalide' });
    const { data, error } = await supabase.from('profiles').update({ role }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/tournaments', protect, authorize('admin'), async (req, res) => {
  try {
    let query = supabase.from('tournaments').select('*, profiles!organizer_id(username, id)');
    if (req.query.status) query = query.eq('status', req.query.status);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
    if (error) return res.status(400).json({ message: error.message });
    res.json(data || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/tournaments/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['draft', 'registration', 'in_progress', 'completed', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Statut invalide' });
    const { data, error } = await supabase.from('tournaments').update({ status }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
