import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usePolling from '../hooks/usePolling';
import api from '../api/axios';
import toast from 'react-hot-toast';
import BracketDisplay from '../components/BracketDisplay';
import LiveScoreBoard from '../components/LiveScoreBoard';
import MatchScoreCard from '../components/MatchScoreCard';
import StreamEmbed from '../components/StreamEmbed';
import ExportButtons from '../components/ExportButtons';
import SeedManager from '../components/SeedManager';
import FileUpload from '../components/FileUpload';
import Chat from '../components/Chat';
import PaymentModal from '../components/PaymentModal';
import RoleManager from '../components/RoleManager';
import MatchCalendar from '../components/MatchCalendar';
import StatsDashboard from '../components/StatsDashboard';

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [teamName, setTeamName] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const isOrganizer = user && tournament && (tournament.organizer?._id === user._id || tournament.organizer === user._id);
  const isRegistered = user && teams.some(t => t.captain?._id === user._id || t.captain === user._id);
  const isAdmin = user?.role === 'admin';

  useEffect(() => { loadTournament(); }, [id]);

  usePolling(() => {
    if (tournament && ['registration', 'in_progress'].includes(tournament.status)) {
      loadTournament();
    }
  }, 8000, !!tournament);

  const loadTournament = async () => {
    try {
      const res = await api.get(`/tournaments/${id}`);
      setTournament(res.data);
      if (res.data.matches?.length > 0) {
        const mr = await api.get(`/matches/tournament/${id}`);
        setMatches(mr.data);
      }
      const tr = await api.get(`/teams/tournament/${id}`);
      setTeams(tr.data);
    } catch (err) {
      toast.error('Tournoi non trouvé');
      navigate('/');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    try {
      const data = tournament.isTeamBased ? { name: teamName || `${user.username}'s Team` } : {};
      await api.post(`/tournaments/${id}/register`, data);
      toast.success('Inscription réussie');
      loadTournament();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur d'inscription");
    }
  };

  const handleStart = async () => {
    if (!window.confirm('Démarrer le tournoi ? Cette action générera le bracket.')) return;
    try {
      await api.post(`/tournaments/${id}/start`);
      toast.success('Tournoi démarré');
      loadTournament();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement ce tournoi ?')) return;
    try {
      await api.delete(`/tournaments/${id}`);
      toast.success('Tournoi supprimé');
      navigate('/dashboard');
    } catch (err) { toast.error('Erreur'); }
  };

  const handleMatchUpdate = (updated) => {
    setMatches(prev => prev.map(m => m._id === updated._id ? updated : m));
  };

  const handleCoverUpload = async (data) => {
    await api.put(`/tournaments/${id}`, { coverImage: data.url });
    loadTournament();
  };

  const statusColors = { draft: 'bg-gray-600', registration: 'bg-sport-green', in_progress: 'bg-sport-red', completed: 'bg-sport-gold text-black', cancelled: 'bg-gray-800 text-gray-400' };
  const statusLabels = { draft: 'Brouillon', registration: 'Inscriptions ouvertes', in_progress: 'En cours', completed: 'Terminé', cancelled: 'Annulé' };

  const tabs = [
    { key: 'overview', label: 'Aperçu' },
    { key: 'bracket', label: 'Bracket' },
    { key: 'matches', label: `Matchs (${matches.length})` },
    { key: 'standings', label: 'Classement' },
    { key: 'stream', label: 'Stream' },
    { key: 'seeding', label: 'Seeding' },
    { key: 'calendar', label: 'Calendrier' },
    { key: 'stats', label: 'Stats' },
    { key: 'roles', label: 'Rôles' }
  ];

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-sport-black pt-20"><div className="w-12 h-12 border-2 border-sport-green border-t-transparent rounded-full animate-spin" /></div>;
  if (!tournament) return null;

  return (
    <div className="min-h-screen bg-sport-black pt-24 px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-sport-dark border border-sport-green/20 p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="heading-xl text-3xl md:text-4xl text-white">{tournament.name}</h1>
                <span className={`${statusColors[tournament.status]} text-[10px] font-bold px-3 py-1 uppercase tracking-wider`}>
                  {statusLabels[tournament.status]}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 uppercase tracking-wider font-heading font-semibold">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-sport-green rounded-full" />{tournament.game}</span>
                <span className="capitalize">{tournament.type?.replace(/_/g, ' ')}</span>
                <span>{tournament.participants?.length || 0}/{tournament.maxPlayers} participants</span>
                {tournament.organizer && (
                  <span>Par <Link to={`/profile/${tournament.organizer._id}`} className="text-sport-green hover:underline">{tournament.organizer.username}</Link></span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <ExportButtons tournamentId={id} tournamentName={tournament.name} />
              {tournament.status === 'draft' && (isOrganizer || isAdmin) && (
                <button onClick={() => { api.put(`/tournaments/${id}`, { status: 'registration' }); loadTournament(); }} className="btn-outline text-xs py-2 px-4">Ouvrir inscriptions</button>
              )}
              {tournament.status === 'registration' && (isOrganizer || isAdmin) && (
                <button onClick={handleStart} className="btn-sport text-xs py-2.5 px-6">Démarrer</button>
              )}
              {(isOrganizer || isAdmin) && (
                <Link to={`/tournament/${id}/edit`} className="btn-outline text-xs py-2.5 px-6">Modifier</Link>
              )}
              {(isOrganizer || isAdmin) && (
                <button onClick={handleDelete} className="btn-danger-sport text-xs py-2.5 px-6">Supprimer</button>
              )}
            </div>
          </div>
          {tournament.description && <p className="text-gray-500 mt-4 text-sm">{tournament.description}</p>}
              {tournament.prize && <p className="text-sport-gold text-sm mt-2 font-semibold">🏆 Prix: {tournament.prize}</p>}
              {tournament.entryFee > 0 && <p className="text-sport-green text-sm mt-1 font-semibold">💰 Frais d'inscription: {tournament.entryFee.toLocaleString()} FCFA</p>}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
            {tournament.registrationDeadline && <span>Inscription jusqu'au {new Date(tournament.registrationDeadline).toLocaleDateString()}</span>}
            {tournament.startDate && <span>Début: {new Date(tournament.startDate).toLocaleDateString()}</span>}
          </div>
        </div>

        {/* LIVE SCORES */}
        <LiveScoreBoard tournamentId={id} />

        {/* STREAM */}
        {tournament.streamUrl && activeTab !== 'stream' && (
          <div className="mb-6">
            <StreamEmbed url={tournament.streamUrl} title="Stream en direct" />
          </div>
        )}

        {/* TABS */}
        <div className="flex border-b border-sport-green/20 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`font-heading text-xs font-bold uppercase tracking-wider px-5 py-3 transition-colors border-b-2 -mb-px flex-shrink-0 ${activeTab === tab.key ? 'text-sport-green border-sport-green' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {tournament.rules && (
                <div className="bg-sport-dark border border-sport-green/20 p-6">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-3">Règles</h3>
                  <p className="text-gray-400 text-sm whitespace-pre-line">{tournament.rules}</p>
                </div>
              )}
              {tournament.coverImage && (
                <img src={tournament.coverImage} alt="Cover" className="w-full border border-sport-green/20" />
              )}
              <div className="bg-sport-dark border border-sport-green/20 p-6">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sport-green rounded-full" />
                  Équipes inscrites ({teams.length})
                </h3>
                {teams.length === 0 ? (
                  <p className="text-gray-600 text-sm">Aucune équipe inscrite</p>
                ) : (
                  <div className="space-y-1">
                    {teams.map((team, i) => (
                      <div key={team._id} className="flex items-center justify-between p-3 bg-sport-black/50 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 text-xs font-heading font-bold w-6">{i + 1}</span>
                          <div>
                            <span className="text-white text-sm font-medium">{team.name}</span>
                            {team.tag && <span className="text-gray-600 ml-2 text-xs">[{team.tag}]</span>}
                          </div>
                          <span className="text-[10px] text-gray-600">par {team.captain?.username || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {team.seed > 0 && <span className="badge-green text-[10px]">Seed #{team.seed}</span>}
                          <span className="text-xs text-gray-500">{team.members?.length || 1} membre(s)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {tournament.status === 'registration' && user && !isRegistered && !isOrganizer && (
                <div className="bg-sport-dark border border-sport-green/40 p-6">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-sport-green mb-3">Rejoindre le tournoi</h3>
                  {tournament.isTeamBased && (
                    <input type="text" className="input-sport text-sm mb-3" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Nom de votre équipe" />
                  )}
                  {tournament.entryFee > 0 ? (
                    <button onClick={() => setShowPayment(true)} className="btn-sport w-full text-sm py-2.5">
                      Payer et s'inscrire ({tournament.entryFee.toLocaleString()} FCFA)
                    </button>
                  ) : (
                    <button onClick={handleRegister} className="btn-sport w-full text-sm py-2.5">
                      {tournament.isTeamBased ? 'Créer et rejoindre' : "S'inscrire"}
                    </button>
                  )}
                </div>
              )}
              {isRegistered && (
                <div className="bg-sport-dark border border-sport-green/40 p-6">
                  <div className="flex items-center gap-2 text-sport-green">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-heading font-bold text-sm uppercase tracking-wider">Inscrit</span>
                  </div>
                </div>
              )}
              <div className="bg-sport-dark border border-sport-green/20 p-6">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-3">Informations</h3>
                <dl className="space-y-2 text-xs">
                  {[
                    ['Type', tournament.type?.replace(/_/g, ' ')],
                    ['Participants', `${tournament.participants?.length}/${tournament.maxPlayers}`],
                    ['Format', tournament.isTeamBased ? `${tournament.teamSize} par équipe` : 'Solo'],
                    ['Créé le', new Date(tournament.createdAt).toLocaleDateString()]
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <dt className="text-gray-500 uppercase tracking-wider">{k}</dt>
                      <dd className="text-gray-200 capitalize">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {(isOrganizer || isAdmin) && (
                <div className="bg-sport-dark border border-sport-green/20 p-6">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-3">Upload Cover</h3>
                  <FileUpload onUpload={handleCoverUpload} accept="image/*" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* BRACKET */}
        {activeTab === 'bracket' && (
          <div className="bg-sport-dark border border-sport-green/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white">Bracket</h3>
              {(isOrganizer || isAdmin) && tournament.status === 'in_progress' && (
                <Link to={`/tournament/${id}/bracket`} className="btn-sport text-xs py-2 px-4">Vue détaillée</Link>
              )}
            </div>
            <BracketDisplay matches={matches} tournamentType={tournament.type} />
          </div>
        )}

        {/* MATCHES */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="bg-sport-dark border border-sport-green/20 p-12 text-center">
                <div className="text-4xl mb-4">🏟️</div>
                <p className="text-gray-500">Aucun match pour le moment</p>
                {(isOrganizer || isAdmin) && tournament.status === 'registration' && (
                  <button onClick={handleStart} className="btn-sport mt-4">Démarrer le tournoi</button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map(match => (
                  <MatchScoreCard key={match._id} match={match} onUpdate={handleMatchUpdate} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* STANDINGS */}
        {activeTab === 'standings' && (
          <div className="bg-sport-dark border border-sport-green/20 p-6">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-4">Classement</h3>
            {teams.length === 0 ? (
              <p className="text-gray-500">Aucune équipe</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-sport-green/20 text-xs uppercase tracking-wider font-heading font-bold">
                      <th className="text-left py-3 px-2">#</th>
                      <th className="text-left py-3 px-2">Équipe</th>
                      <th className="text-center py-3 px-2">MJ</th>
                      <th className="text-center py-3 px-2 text-sport-green">V</th>
                      <th className="text-center py-3 px-2 text-sport-gold">N</th>
                      <th className="text-center py-3 px-2 text-sport-red">D</th>
                      <th className="text-center py-3 px-2 text-white">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...teams]
                      .sort((a, b) => (b.points || 0) - (a.points || 0) || (b.wins || 0) - (a.wins || 0))
                      .map((team, i) => (
                        <tr key={team._id} className="border-b border-sport-green/10 hover:bg-sport-green/5">
                          <td className="py-3 px-2 text-gray-500 font-heading font-bold">{i + 1}</td>
                          <td className="py-3 px-2 text-white font-medium">{team.name}</td>
                          <td className="py-3 px-2 text-center text-gray-400">{(team.wins || 0) + (team.losses || 0) + (team.draws || 0)}</td>
                          <td className="py-3 px-2 text-center text-sport-green">{team.wins || 0}</td>
                          <td className="py-3 px-2 text-center text-sport-gold">{team.draws || 0}</td>
                          <td className="py-3 px-2 text-center text-sport-red">{team.losses || 0}</td>
                          <td className="py-3 px-2 text-center text-white font-bold font-heading">{team.points || 0}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* STREAM TAB */}
        {activeTab === 'stream' && (
          <div>
            <StreamEmbed url={tournament.streamUrl} title="Stream officiel du tournoi" />
            {(isOrganizer || isAdmin) && (
              <div className="mt-4 bg-sport-dark border border-sport-green/20 p-6">
                <label className="label-sport">URL du stream (Twitch / YouTube)</label>
                <div className="flex gap-2">
                  <input type="url" className="input-sport flex-1" placeholder="https://twitch.tv/..." value={tournament.streamUrl} onChange={(e) => api.put(`/tournaments/${id}`, { streamUrl: e.target.value }).then(loadTournament).catch(() => {})} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEEDING TAB */}
        {activeTab === 'seeding' && (isOrganizer || isAdmin) && (
          <SeedManager teams={teams} tournamentId={id} onUpdate={loadTournament} />
        )}
        {activeTab === 'seeding' && !isOrganizer && !isAdmin && (
          <div className="bg-sport-dark border border-sport-green/20 p-12 text-center text-gray-500">
            Seul l'organisateur peut gérer le seeding
          </div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && <MatchCalendar tournamentId={id} />}

        {/* STATS TAB */}
        {activeTab === 'stats' && <StatsDashboard tournamentId={id} />}

        {/* ROLES TAB */}
        {activeTab === 'roles' && (
          <RoleManager tournamentId={id} isOrganizer={isOrganizer || isAdmin} />
        )}
        {activeTab === 'roles' && !isOrganizer && !isAdmin && (
          <div className="bg-sport-dark border border-sport-green/20 p-12 text-center text-gray-500">
            Seul l'organisateur peut gérer les rôles
          </div>
        )}
      </div>

      {/* PAYMENT MODAL */}
      {showPayment && (
        <PaymentModal
          tournamentId={id}
          amount={tournament.entryFee}
          methods={tournament.paymentMethods}
          onPaid={() => { setShowPayment(false); handleRegister(); }}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* CHAT */}
      <Chat tournamentId={id} />
    </div>
  );
}
