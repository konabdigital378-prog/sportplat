const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    let query = supabase.from('profiles').select('id, username, email, phone, avatar_url');
    if (req.query.search) {
      query = query.ilike('username', `%${req.query.search}%`);
    }
    const { data, error } = await query.limit(20);
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id/tournaments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teams').select('tournament_id').eq('captain_id', req.params.id);
    if (error) return res.status(400).json({ message: error.message });

    const ids = data.map(t => t.tournament_id);
    if (ids.length === 0) return res.json([]);

    const { data: tournaments, error: tError } = await supabase
      .from('tournaments').select('*, profiles!organizer_id(username, id)')
      .in('id', ids).order('created_at', { ascending: false });
    if (tError) return res.status(400).json({ message: tError.message });
    res.json(tournaments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
