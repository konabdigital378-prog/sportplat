import { useState, useEffect } from 'react';
import api from '../api/axios';
import usePolling from '../hooks/usePolling';

export default function LiveScoreBoard({ tournamentId }) {
  const [liveMatches, setLiveMatches] = useState([]);

  const loadLiveMatches = async () => {
    try {
      const res = await api.get(`/matches/tournament/${tournamentId}`);
      setLiveMatches(res.data.filter(m => m.status === 'live'));
    } catch (err) { /* silent */ }
  };

  useEffect(() => { if (tournamentId) loadLiveMatches(); }, [tournamentId]);
  usePolling(loadLiveMatches, 5000, !!tournamentId);

  if (liveMatches.length === 0) return null;

  return (
    <div className="bg-sport-dark border border-sport-red/30 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex w-3 h-3">
          <span className="animate-ping absolute w-full h-full rounded-full bg-sport-red opacity-75" />
          <span className="relative w-3 h-3 rounded-full bg-sport-red" />
        </span>
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white">Matchs en direct</h3>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {liveMatches.map(match => (
          <div key={match._id} className="bg-sport-black/50 border border-sport-green/20 p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${match.score1 > match.score2 ? 'text-sport-green' : 'text-gray-200'}`}>{match.team1?.name || 'TBD'}</span>
                  <span className="font-heading text-xl font-bold text-white">{match.score1}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`font-medium ${match.score2 > match.score1 ? 'text-sport-green' : 'text-gray-200'}`}>{match.team2?.name || 'TBD'}</span>
                  <span className="font-heading text-xl font-bold text-white">{match.score2}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
