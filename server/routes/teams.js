const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teams').select('*, captain:captain_id(username, id)')
      .eq('tournament_id', req.params.tournamentId)
      .order('points', { ascending: false });
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/seed', protect, async (req, res) => {
  try {
    const { seed } = req.body;
    const { data, error } = await supabase
      .from('teams').update({ seed }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { points, wins, losses, draws } = req.body;
    const updates = {};
    if (points !== undefined) updates.points = points;
    if (wins !== undefined) updates.wins = wins;
    if (losses !== undefined) updates.losses = losses;
    if (draws !== undefined) updates.draws = draws;

    const { data, error } = await supabase
      .from('teams').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
