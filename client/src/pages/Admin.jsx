import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { loadStats(); loadUsers(); loadTournaments(); }, []);

  const loadStats = async () => {
    try { setStats((await api.get('/admin/stats')).data); } catch (err) {}
  };

  const loadUsers = async () => {
    try { setUsers((await api.get('/admin/users', { params: { search } })).data); } catch (err) {}
  };

  const loadTournaments = async () => {
    try { setTournaments((await api.get('/admin/tournaments')).data); } catch (err) {}
  };

  const handleRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success('Rôle mis à jour');
      loadUsers();
    } catch (err) { toast.error('Erreur'); }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/admin/tournaments/${id}/status`, { status });
      toast.success('Statut mis à jour');
      loadTournaments();
    } catch (err) { toast.error('Erreur'); }
  };

  const tabs = [
    { key: 'stats', label: 'Statistiques' },
    { key: 'users', label: 'Utilisateurs' },
    { key: 'tournaments', label: 'Tournois' }
  ];

  return (
    <div className="min-h-screen bg-sport-black pt-24 px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="section-tag">Administration</div>
        <h1 className="heading-xl text-4xl md:text-5xl mb-8">Panneau d'<span className="text-sport-green">administration</span></h1>

        <div className="flex border-b border-sport-green/20 mb-8">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`font-heading text-xs font-bold uppercase tracking-wider px-6 py-3 transition-colors border-b-2 -mb-px ${tab === t.key ? 'text-sport-green border-sport-green' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'stats' && stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { num: stats.users, label: 'Utilisateurs', color: 'text-sport-green' },
              { num: stats.tournaments, label: 'Tournois', color: 'text-sport-gold' },
              { num: stats.matches, label: 'Matchs', color: 'text-sport-red' },
              { num: stats.teams, label: 'Équipes', color: 'text-blue-400' }
            ].map((s, i) => (
              <div key={i} className="bg-sport-dark border border-sport-green/20 p-6">
                <div className={`font-heading text-4xl font-black ${s.color}`}>{s.num}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'stats' && stats && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-sport-dark border border-sport-green/20 p-6">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-4">Tournois par statut</h3>
              <div className="space-y-2">
                {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between py-2 border-b border-sport-green/10">
                    <span className="text-gray-400 text-sm capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="font-heading font-bold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-sport-dark border border-sport-green/20 p-6">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-4">Derniers tournois</h3>
              <div className="space-y-2">
                {stats.recentTournaments?.map(t => (
                  <Link key={t.id} to={`/tournament/${t.id}`} className="flex items-center justify-between py-2 border-b border-sport-green/10 hover:bg-sport-green/5 px-2 -mx-2 transition-colors">
                    <span className="text-white text-sm">{t.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{t.status?.replace(/_/g, ' ')}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <div className="flex gap-3 mb-6">
              <input type="text" className="input-sport max-w-xs" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." onKeyDown={e => e.key === 'Enter' && loadUsers()} />
              <button onClick={loadUsers} className="btn-sport text-xs py-2 px-6">Rechercher</button>
            </div>
            <div className="bg-sport-dark border border-sport-green/20 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-sport-green/20 text-xs uppercase tracking-wider font-heading font-bold">
                    <th className="text-left py-3 px-4">Utilisateur</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-center py-3 px-4">Rôle</th>
                    <th className="text-center py-3 px-4">Inscrit le</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-sport-green/10 hover:bg-sport-green/5">
                      <td className="py-3 px-4">
                        <Link to={`/profile/${u.id}`} className="text-white font-medium hover:text-sport-green">{u.username}</Link>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{u.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-sport-red/10 text-sport-red' : u.role === 'organizer' ? 'bg-sport-green/10 text-sport-green' : 'bg-gray-700 text-gray-400'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center">
                        <select value={u.role} onChange={e => handleRole(u.id, e.target.value)} className="bg-sport-black border border-sport-green/20 text-xs px-2 py-1 text-gray-300">
                          <option value="user">User</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'tournaments' && (
          <div className="bg-sport-dark border border-sport-green/20 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-sport-green/20 text-xs uppercase tracking-wider font-heading font-bold">
                  <th className="text-left py-3 px-4">Tournoi</th>
                  <th className="text-left py-3 px-4">Organisateur</th>
                  <th className="text-center py-3 px-4">Statut</th>
                  <th className="text-center py-3 px-4">Créé le</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map(t => (
                  <tr key={t.id} className="border-b border-sport-green/10 hover:bg-sport-green/5">
                    <td className="py-3 px-4">
                      <Link to={`/tournament/${t.id}`} className="text-white font-medium hover:text-sport-green">{t.name}</Link>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{t.profiles?.username || 'N/A'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${t.status === 'in_progress' ? 'bg-sport-red/10 text-sport-red' : t.status === 'completed' ? 'bg-sport-gold/10 text-sport-gold' : t.status === 'registration' ? 'bg-sport-green/10 text-sport-green' : 'bg-gray-700 text-gray-400'}`}>
                        {t.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">
                      <select value={t.status} onChange={e => handleStatus(t.id, e.target.value)} className="bg-sport-black border border-sport-green/20 text-xs px-2 py-1 text-gray-300">
                        <option value="draft">Brouillon</option>
                        <option value="registration">Inscriptions</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminé</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
