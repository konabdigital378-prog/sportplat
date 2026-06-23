const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/:tournamentId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, user:user_id(username, id)')
      .eq('tournament_id', req.params.tournamentId)
      .order('created_at', { ascending: false })
      .limit(parseInt(req.query.limit) || 50);
    if (error) return res.status(400).json({ message: error.message });
    res.json(data.reverse());
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { tournamentId, message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message vide' });

    const { data, error } = await supabase.from('chat_messages').insert({
      tournament_id: tournamentId,
      user_id: req.user.id,
      username: req.user.username,
      message: message.trim()
    }).select('*, user:user_id(username, id)').single();

    if (error) return res.status(400).json({ message: error.message });
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await supabase.from('chat_messages').delete()
      .eq('id', req.params.id).eq('user_id', req.user.id);
    res.json({ message: 'Message supprimé' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
