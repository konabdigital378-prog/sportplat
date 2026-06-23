const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('matches').select('*, team1:team1_id(name), team2:team2_id(name), winner:winner_id(name)')
      .eq('tournament_id', req.params.tournamentId)
      .order('round').order('position');
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { score1, score2, status, winner_id } = req.body;
    const updates = {};
    if (score1 !== undefined) updates.score1 = score1;
    if (score2 !== undefined) updates.score2 = score2;
    if (status) updates.status = status;
    if (winner_id) updates.winner_id = winner_id;
    if (status === 'completed') updates.completed_date = new Date().toISOString();

    const { data, error } = await supabase
      .from('matches').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ message: error.message });

    // Update team stats if completed
    if (status === 'completed' && winner_id) {
      await supabase.rpc('update_team_stats', {
        p_winner_id: winner_id,
        p_loser_id: data.team1_id === winner_id ? data.team2_id : data.team1_id
      });
    }

    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/score', protect, async (req, res) => {
  try {
    const { score1, score2 } = req.body;
    const { data, error } = await supabase
      .from('matches').update({ score1, score2 }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
