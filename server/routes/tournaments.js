const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let query = supabase.from('tournaments').select('*, profiles!organizer_id(username, id)');
    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.game) query = query.ilike('game', `%${req.query.game}%`);
    query = query.order('created_at', { ascending: false }).limit(50);

    const { data, error } = await query;
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tournaments').select('*')
      .eq('organizer_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tournaments').select('*, profiles!organizer_id(username, id)')
      .eq('id', req.params.id).single();
    if (error) return res.status(404).json({ message: 'Tournoi non trouvé' });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, game, type, description, max_players, is_team_based, team_size,
            registration_deadline, start_date, end_date, rules, prize,
            entry_fee, payment_methods } = req.body;

    const { data, error } = await supabase.from('tournaments').insert({
      name, game: game || 'Générique', type: type || 'single_elimination',
      description: description || '', max_players: max_players || 16,
      is_team_based: is_team_based || false, team_size: team_size || 1,
      registration_deadline, start_date, end_date, rules: rules || '',
      prize: prize || '', entry_fee: entry_fee || 0,
      payment_methods: payment_methods || [],
      organizer_id: req.user.id
    }).select().single();

    if (error) return res.status(400).json({ message: error.message });
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const allowed = ['name','game','type','description','status','max_players','rules','prize','stream_url','cover_image','entry_fee','payment_methods','registration_deadline','start_date'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const { data, error } = await supabase
      .from('tournaments').update(updates).eq('id', req.params.id)
      .eq('organizer_id', req.user.id).select().single();

    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const { error } = await supabase
      .from('tournaments').delete().eq('id', req.params.id).eq('organizer_id', req.user.id);
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: 'Tournoi supprimé' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/register', protect, async (req, res) => {
  try {
    const { data: tournament } = await supabase
      .from('tournaments').select('*').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ message: 'Tournoi non trouvé' });
    if (tournament.status !== 'registration') return res.status(400).json({ message: 'Inscriptions fermées' });

    const teamName = tournament.is_team_based ? req.body.name : `${req.user.username}'s Team`;

    const { data: existing } = await supabase
      .from('teams').select('id').eq('tournament_id', req.params.id).eq('captain_id', req.user.id).maybeSingle();
    if (existing) return res.status(400).json({ message: 'Déjà inscrit' });

    const { data: team, error } = await supabase.from('teams').insert({
      name: teamName, captain_id: req.user.id, tournament_id: req.params.id
    }).select().single();

    if (error) return res.status(400).json({ message: error.message });
    res.status(201).json(team);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/start', protect, async (req, res) => {
  try {
    const { data: tournament } = await supabase
      .from('tournaments').select('*, teams(*)').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ message: 'Tournoi non trouvé' });

    const teams = tournament.teams || [];
    if (teams.length < 2) return res.status(400).json({ message: 'Minimum 2 équipes requises' });

    const bracket = generateBracket(teams, tournament.type);
    const matches = bracket.matches.map((m, i) => ({
      tournament_id: req.params.id,
      round: m.round, position: m.position, bracket_round: m.bracket_round || m.round,
      team1_id: m.team1_id, team2_id: m.team2_id, status: 'scheduled'
    }));

    const { data: created, error: matchError } = await supabase
      .from('matches').insert(matches).select();
    if (matchError) return res.status(400).json({ message: matchError.message });

    await supabase.from('tournaments').update({
      status: 'in_progress', bracket: bracket.tree
    }).eq('id', req.params.id);

    res.json({ message: 'Tournoi démarré', matches: created, bracket: bracket.tree });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

function generateBracket(teams, type) {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const matches = [];
  const numTeams = shuffled.length;
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(numTeams)));

  for (let i = 0; i < nextPow2 / 2; i++) {
    matches.push({
      round: 1, position: i + 1, bracket_round: 1,
      team1_id: shuffled[i * 2]?.id || null,
      team2_id: shuffled[i * 2 + 1]?.id || null
    });
  }

  return { tree: { rounds: 1, matches: matches.length }, matches };
}

module.exports = router;
