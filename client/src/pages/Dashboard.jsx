import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import TournamentCard from '../components/TournamentCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [myTournaments, setMyTournaments] = useState([]);
  const [participating, setParticipating] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [orgRes, partRes] = await Promise.all([
        api.get('/tournaments', { params: { limit: 50 } }),
        api.get(`/users/${user._id}/tournaments`)
      ]);
      const mine = orgRes.data.tournaments.filter(t => t.organizer?._id === user._id || t.organizer === user._id);
      setMyTournaments(mine);
      setParticipating(partRes.data);
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-sport-black pt-24 px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="section-tag">Dashboard</div>
            <h1 className="heading-xl text-4xl md:text-5xl">Bienvenue, <span className="text-sport-green">{user.username}</span></h1>
          </div>
          <Link to="/create-tournament" className="btn-sport text-sm py-3 px-8">+ Nouveau tournoi</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { num: myTournaments.length, label: 'Tournois organisés', color: 'text-sport-green' },
            { num: participating.length, label: 'Participations', color: 'text-sport-gold' },
            { num: myTournaments.filter(t => t.status === 'in_progress').length, label: 'En cours', color: 'text-sport-red' }
          ].map((s, i) => (
            <div key={i} className="bg-sport-dark border border-sport-green/20 p-6">
              <div className={`font-heading text-4xl font-black ${s.color}`}>{s.num}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-2 border-sport-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-sport-green rounded-full" />
                Mes tournois organisés
              </h2>
              {myTournaments.length === 0 ? (
                <div className="text-center py-12 text-gray-600 bg-sport-dark border border-sport-green/20">
                  <p className="mb-4">Vous n'avez pas encore créé de tournoi</p>
                  <Link to="/create-tournament" className="btn-sport inline-block">Créer un tournoi</Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTournaments.map(t => <TournamentCard key={t._id} tournament={t} />)}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-sport-gold rounded-full" />
                Mes participations
              </h2>
              {participating.length === 0 ? (
                <div className="text-center py-12 text-gray-600 bg-sport-dark border border-sport-green/20">
                  <p className="mb-4">Vous ne participez à aucun tournoi</p>
                  <Link to="/" className="btn-sport inline-block">Voir les tournois</Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {participating.map(t => <TournamentCard key={t._id} tournament={t} />)}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
