import { useState, useEffect } from 'react';
import api from '../api/axios';

function Bar({ value, max, label, color = 'bg-sport-green', height = 100 }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-xs text-gray-400 font-heading font-bold">{value}</span>
      <div className="w-full bg-sport-black/50 rounded-none overflow-hidden" style={{ height: `${height}px` }}>
        <div className={`${color} transition-all duration-500`} style={{ height: `${pct}%`, marginTop: `${height - (height * pct / 100)}px` }} />
      </div>
      <span className="text-[10px] text-gray-500 text-center truncate w-full">{label}</span>
    </div>
  );
}

export default function StatsDashboard({ tournamentId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId) return;
    loadStats();
  }, [tournamentId]);

  const loadStats = async () => {
    try {
      const res = await api.get(`/stats/tournament/${tournamentId}`);
      setStats(res.data);
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-sport-green border-t-transparent rounded-full animate-spin" /></div>;
  if (!stats) return <div className="bg-sport-dark border border-sport-green/20 p-6 text-center text-gray-500">Aucune statistique disponible</div>;

  const maxScore = Math.max(...(stats.scoreDistribution?.map(s => s.count) || [0]));
  const maxRound = Math.max(...(stats.matchesByRound?.map(r => r.count) || [0]));
  const maxWR = Math.max(...(stats.winRate?.map(w => w.winRate) || [0]));

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Équipes', value: stats.overview.totalTeams, color: 'text-sport-green' },
          { label: 'Matchs', value: stats.overview.totalMatches, color: 'text-white' },
          { label: 'Terminés', value: stats.overview.completedMatches, color: 'text-sport-green' },
          { label: 'En direct', value: stats.overview.liveMatches, color: 'text-sport-red' },
          { label: 'Moy. scores', value: stats.overview.avgScore, color: 'text-sport-gold' }
        ].map((s, i) => (
          <div key={i} className="bg-sport-dark border border-sport-green/20 p-4 text-center">
            <div className={`font-heading text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Top teams */}
      <div className="bg-sport-dark border border-sport-green/20 p-6">
        <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white mb-4">Top 5 équipes</h4>
        <div className="space-y-2">
          {stats.topTeams.map((t, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-sport-black/50 border border-white/5">
              <span className={`text-lg font-heading font-black ${i === 0 ? 'text-sport-gold' : i < 3 ? 'text-gray-300' : 'text-gray-600'}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <span className="flex-1 text-sm text-white">{t.name}</span>
              <span className="text-xs text-sport-green font-bold">{t.wins}V</span>
              <span className="text-xs text-gray-500">|</span>
              <span className="text-xs text-sport-gold font-bold">{t.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Win rate chart */}
      <div className="bg-sport-dark border border-sport-green/20 p-6">
        <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white mb-4">Taux de victoire</h4>
        <div className="flex items-end gap-2 h-32">
          {stats.winRate?.slice(0, 8).map((w, i) => (
            <Bar key={i} value={w.winRate} max={100} label={w.name} color="bg-sport-green" height={100} />
          ))}
        </div>
      </div>

      {/* Score distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-sport-dark border border-sport-green/20 p-6">
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white mb-4">Distribution des scores</h4>
          <div className="flex items-end gap-2 h-24">
            {stats.scoreDistribution?.map((s, i) => (
              <Bar key={i} value={s.count} max={maxScore} label={`${s.score}`} color="bg-sport-red" height={80} />
            ))}
            {(!stats.scoreDistribution || stats.scoreDistribution.length === 0) && (
              <p className="text-gray-500 text-sm">Aucune donnée</p>
            )}
          </div>
        </div>

        {/* Matchs par round */}
        <div className="bg-sport-dark border border-sport-green/20 p-6">
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white mb-4">Matchs par round</h4>
          <div className="flex items-end gap-2 h-24">
            {stats.matchesByRound?.map((r, i) => (
              <Bar key={i} value={r.count} max={maxRound} label={`R${r.round}`} color="bg-sport-gold" height={80} />
            ))}
            {(!stats.matchesByRound || stats.matchesByRound.length === 0) && (
              <p className="text-gray-500 text-sm">Aucune donnée</p>
            )}
          </div>
        </div>
      </div>

      {/* Détails */}
      <div className="bg-sport-dark border border-sport-green/20 p-6">
        <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white mb-4">Détails des matchs</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total buts/points', value: stats.overview.totalGoals, color: 'text-sport-green' },
            { label: 'Moyenne par match', value: stats.overview.avgScore, color: 'text-sport-gold' },
            { label: 'Matchs terminés', value: `${((stats.overview.completedMatches / (stats.overview.totalMatches || 1)) * 100).toFixed(0)}%`, color: 'text-sport-green' },
            { label: 'En direct', value: stats.overview.liveMatches > 0 ? `${stats.overview.liveMatches} match(s)` : 'Aucun', color: stats.overview.liveMatches > 0 ? 'text-sport-red' : 'text-gray-500' }
          ].map((s, i) => (
            <div key={i} className="p-3 bg-sport-black/50 border border-white/5">
              <div className={`font-heading text-lg font-black ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
