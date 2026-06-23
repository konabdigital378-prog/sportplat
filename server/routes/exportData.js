const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('matches').select('*, teams!team1_id(name), teams!team2_id(name)')
      .eq('tournament_id', req.params.tournamentId)
      .order('round').order('position');

    if (error) return res.status(400).json({ message: error.message });

    const csv = convertToCsv(data);
    const json = JSON.stringify(data, null, 2);

    const format = req.query.format || 'json';
    if (format === 'csv') res.setHeader('Content-Type', 'text/csv');
    else res.setHeader('Content-Type', 'application/json');
    res.send(format === 'csv' ? csv : json);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

function convertToCsv(data) {
  if (!data.length) return '';
  const headers = ['Round', 'Position', 'Equipe1', 'Score1', 'Equipe2', 'Score2', 'Status', 'Vainqueur'];
  const rows = data.map(m => [
    m.round, m.position,
    m.team1?.name || 'TBD', m.score1,
    m.team2?.name || 'TBD', m.score2,
    m.status, m.winner_name || ''
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

module.exports = router;
