const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/:tournamentId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('custom_roles').select('*, profiles!user_id(username, id)')
      .eq('tournament_id', req.params.tournamentId);
    if (error) return res.status(400).json({ message: error.message });
    res.json({ roles: data });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:tournamentId', protect, async (req, res) => {
  try {
    const { roles } = req.body;
    await supabase.from('custom_roles').delete().eq('tournament_id', req.params.tournamentId);

    if (roles && roles.length > 0) {
      const inserts = roles.map(r => ({
        tournament_id: req.params.tournamentId,
        user_id: r.userId, role: r.role
      }));
      await supabase.from('custom_roles').insert(inserts);
    }

    const { data } = await supabase
      .from('custom_roles').select('*, profiles!user_id(username, id)')
      .eq('tournament_id', req.params.tournamentId);
    res.json({ roles: data });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
