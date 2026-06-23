import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import BracketDisplay from '../components/BracketDisplay';
import ExportButtons from '../components/ExportButtons';

export default function BracketView() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [tr, mr] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/matches/tournament/${id}`)
      ]);
      setTournament(tr.data);
      setMatches(mr.data);
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-sport-black pt-20"><div className="w-12 h-12 border-2 border-sport-green border-t-transparent rounded-full animate-spin" /></div>;
  if (!tournament) return <div className="min-h-screen flex items-center justify-center bg-sport-black pt-20 text-gray-500">Tournoi non trouvé</div>;

  return (
    <div className="min-h-screen bg-sport-black pt-24 px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Link to={`/tournament/${id}`} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="heading-xl text-2xl md:text-3xl text-white">{tournament.name}</h1>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-heading font-semibold">Bracket — {tournament.type?.replace(/_/g, ' ')}</p>
          </div>
          <ExportButtons tournamentId={id} tournamentName={tournament.name} />
        </div>
        <div className="bg-sport-dark border border-sport-green/20 p-6 overflow-hidden">
          <BracketDisplay matches={matches} tournamentType={tournament.type} />
        </div>
      </div>
    </div>
  );
}
