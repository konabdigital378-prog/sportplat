const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/:teamId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('team_members').select('*, user:user_id(username, id)')
      .eq('team_id', req.params.teamId);
    if (error) return res.status(400).json({ message: error.message });
    res.json(data || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { team_id, user_id } = req.body;
    const { data: team } = await supabase.from('teams').select('captain_id, tournament_id').eq('id', team_id).single();
    if (!team) return res.status(404).json({ message: 'Équipe non trouvée' });
    if (team.captain_id !== req.user.id) return res.status(403).json({ message: 'Seul le capitaine peut gérer les membres' });

    const { data: existing } = await supabase.from('team_members').select('id').eq('team_id', team_id).eq('user_id', user_id).maybeSingle();
    if (existing) return res.status(400).json({ message: 'Déjà membre' });

    const { data, error } = await supabase.from('team_members').insert({ team_id, user_id }).select('*, user:user_id(username, id)').single();
    if (error) return res.status(400).json({ message: error.message });
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const { data: member } = await supabase.from('team_members').select('*, teams!team_id(captain_id)').eq('id', req.params.id).single();
    if (!member) return res.status(404).json({ message: 'Membre non trouvé' });
    if (member.teams?.captain_id !== req.user.id) return res.status(403).json({ message: 'Seul le capitaine peut gérer les membres' });
    const { error } = await supabase.from('team_members').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: 'Membre retiré' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
