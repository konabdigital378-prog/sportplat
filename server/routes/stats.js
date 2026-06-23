const express = require('express');
const { supabase } = require('../config/supabase');
const router = express.Router();

router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const tid = req.params.tournamentId;

    const { data: teams } = await supabase
      .from('teams').select('*').eq('tournament_id', tid);
    const { data: matches } = await supabase
      .from('matches').select('*').eq('tournament_id', tid);

    const totalTeams = teams?.length || 0;
    const totalMatches = matches?.length || 0;
    const completedMatches = matches?.filter(m => m.status === 'completed').length || 0;
    const liveMatches = matches?.filter(m => m.status === 'live').length || 0;
    const totalGoals = matches?.reduce((sum, m) => sum + (m.score1 || 0) + (m.score2 || 0), 0) || 0;
    const avgScore = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : 0;

    const topTeams = (teams || [])
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 5)
      .map(t => ({ name: t.name, wins: t.wins || 0, points: t.points || 0 }));

    const winRate = (teams || [])
      .filter(t => (t.wins || 0) + (t.losses || 0) > 0)
      .map(t => ({
        name: t.name,
        winRate: Math.round(((t.wins || 0) / ((t.wins || 0) + (t.losses || 0))) * 100)
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 10);

    const scoreDistribution = {};
    const matchesByRound = {};
    for (const m of matches || []) {
      if (m.status === 'completed') {
        const total = (m.score1 || 0) + (m.score2 || 0);
        scoreDistribution[total] = (scoreDistribution[total] || 0) + 1;
      }
      const round = m.bracket_round || m.round || 1;
      matchesByRound[round] = (matchesByRound[round] || 0) + 1;
    }

    res.json({
      overview: { totalTeams, totalMatches, completedMatches, liveMatches, totalGoals, avgScore },
      topTeams,
      winRate,
      scoreDistribution: Object.entries(scoreDistribution).map(([score, count]) => ({ score: parseInt(score), count })),
      matchesByRound: Object.entries(matchesByRound).map(([round, count]) => ({ round: parseInt(round), count }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
