import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function MatchScoreCard({ match, onUpdate }) {
  const [score1, setScore1] = useState(match.score1 || 0);
  const [score2, setScore2] = useState(match.score2 || 0);
  const [isLive, setIsLive] = useState(match.status === 'live');
  const [updating, setUpdating] = useState(false);

  const handleSetLive = async () => {
    try {
      await api.put(`/matches/${match._id}/live`);
      setIsLive(true);
      toast.success('Match passé en direct');
    } catch (err) { toast.error('Erreur'); }
  };

  const handleSubmitScore = async () => {
    setUpdating(true);
    try {
      const res = await api.put(`/matches/${match._id}/score`, { score1, score2, status: 'completed' });
      toast.success('Score mis à jour');
      if (onUpdate) onUpdate(res.data);
    } catch (err) { toast.error('Erreur'); }
    finally { setUpdating(false); }
  };

  const handleScoreChange = (setter, value) => {
    const v = Math.max(0, parseInt(value) || 0);
    setter(v);
  };

  const s1Wins = score1 > score2;
  const s2Wins = score2 > score1;

  return (
    <div className="bg-sport-dark border border-sport-green/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-gray-400">{match.bracketPosition || 'Match'}</h4>
        <div className="flex items-center gap-2">
          {match.status === 'live' && (
            <span className="flex items-center gap-1 text-sport-red text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-sport-red rounded-full animate-ping" />
              LIVE
            </span>
          )}
          {!isLive && match.status !== 'completed' && (
            <button onClick={handleSetLive} className="btn-outline text-[10px] py-1 px-2">Live</button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className={`flex items-center justify-between p-2 ${s1Wins ? 'bg-sport-green/10 border border-sport-green/30' : 'bg-sport-black/50 border border-white/5'}`}>
          <span className={`text-sm truncate flex-1 ${s1Wins ? 'text-sport-green font-semibold' : 'text-gray-300'}`}>
            {match.team1?.name || 'TBD'}
          </span>
          <input type="number" min="0" value={score1}
            onChange={(e) => handleScoreChange(setScore1, e.target.value)}
            className={`w-14 text-center bg-sport-black border border-white/10 text-white text-sm py-1 ${match.status === 'completed' ? 'opacity-50' : ''}`}
            disabled={match.status === 'completed'} />
        </div>
        <div className={`flex items-center justify-between p-2 ${s2Wins ? 'bg-sport-green/10 border border-sport-green/30' : 'bg-sport-black/50 border border-white/5'}`}>
          <span className={`text-sm truncate flex-1 ${s2Wins ? 'text-sport-green font-semibold' : 'text-gray-300'}`}>
            {match.team2?.name || 'TBD'}
          </span>
          <input type="number" min="0" value={score2}
            onChange={(e) => handleScoreChange(setScore2, e.target.value)}
            className={`w-14 text-center bg-sport-black border border-white/10 text-white text-sm py-1 ${match.status === 'completed' ? 'opacity-50' : ''}`}
            disabled={match.status === 'completed'} />
        </div>
      </div>

      {match.status !== 'completed' && (
        <button onClick={handleSubmitScore} disabled={updating} className="btn-sport w-full mt-3 text-xs py-2">
          {updating ? 'Mise à jour...' : 'Valider le score'}
        </button>
      )}

      {match.status === 'completed' && match.winner && (
        <div className="mt-3 text-center">
          <span className="badge-green text-xs">Vainqueur: {match.winner.name}</span>
        </div>
      )}
    </div>
  );
}
