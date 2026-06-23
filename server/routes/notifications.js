const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications').select('*').eq('user_id', req.user.id)
      .order('created_at', { ascending: false }).limit(50);
    if (error) return res.status(400).json({ message: error.message });
    const unread = data.filter(n => !n.read).length;
    res.json({ notifications: data, unread });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/read-all', protect, async (req, res) => {
  try {
    await supabase.from('notifications').update({ read: true }).eq('user_id', req.user.id);
    res.json({ message: 'Tout lu' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    await supabase.from('notifications').update({ read: true })
      .eq('id', req.params.id).eq('user_id', req.user.id);
    res.json({ message: 'Lu' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { user_id, type, title, message, link, tournament_id, match_id } = req.body;
    const { data, error } = await supabase.from('notifications').insert({
      user_id, type: type || 'info', title, message: message || '',
      link: link || '', tournament_id, match_id
    }).select().single();
    if (error) return res.status(400).json({ message: error.message });
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
