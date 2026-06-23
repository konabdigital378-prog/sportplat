const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.put('/:tournamentId', protect, async (req, res) => {
  try {
    const { seeds } = req.body;
    if (!Array.isArray(seeds)) return res.status(400).json({ message: 'Seeds requis' });

    for (const s of seeds) {
      await supabase.from('teams').update({ seed: s.seed }).eq('id', s.teamId);
    }
    res.json({ message: 'Seeds mis à jour' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
