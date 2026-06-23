const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username: username || email.split('@')[0] } }
    });
    if (error) return res.status(400).json({ message: error.message });

    res.status(201).json({
      token: data.session?.access_token || null,
      user: { id: data.user?.id, email: data.user?.email, username, role: 'user' },
      message: data.session ? 'Inscription réussie' : 'Email de confirmation envoyé'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', data.user.id).single();

    res.json({
      token: data.session.access_token,
      user: profile || { id: data.user.id, email: data.user.email, username: email.split('@')[0], role: 'user' }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

router.put('/me', protect, async (req, res) => {
  try {
    const { username, phone, avatar_url } = req.body;
    const updates = {};
    if (username) updates.username = username;
    if (phone !== undefined) updates.phone = phone;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const { data, error } = await supabase
      .from('profiles').update(updates).eq('id', req.user.id).select().single();

    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
