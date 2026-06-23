import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '' });

  const profileId = id || currentUser?._id;
  const isOwnProfile = currentUser && (profileId === currentUser._id);

  useEffect(() => { if (profileId) loadProfile(); }, [profileId]);

  const loadProfile = async () => {
    try {
      const [ur, tr] = await Promise.all([
        api.get(`/users/${profileId}`),
        api.get(`/users/${profileId}/tournaments`)
      ]);
      setProfile(ur.data);
      setTournaments(tr.data);
      setForm({ username: ur.data.username, bio: ur.data.bio || '' });
    } catch (err) { toast.error('Utilisateur non trouvé'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      const res = await api.put('/auth/profile', form);
      setProfile(res.data);
      setEditing(false);
      toast.success('Profil mis à jour');
    } catch (err) { toast.error('Erreur'); }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-sport-black pt-20"><div className="w-10 h-10 border-2 border-sport-green border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center bg-sport-black pt-20 text-gray-500">Profil non trouvé</div>;

  return (
    <div className="min-h-screen bg-sport-black pt-24 px-8 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-sport-dark border border-sport-green/20 p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-sport-green rounded-full flex items-center justify-center text-3xl font-bold text-white font-heading flex-shrink-0">
              {profile.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input type="text" className="input-sport" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                  <textarea className="input-sport h-20 resize-none" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Bio..." />
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="btn-sport text-xs py-2 px-6">Sauvegarder</button>
                    <button onClick={() => setEditing(false)} className="btn-outline text-xs py-2 px-4">Annuler</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h1 className="heading-xl text-2xl text-white">{profile.username}</h1>
                    {isOwnProfile && (
                      <button onClick={() => setEditing(true)} className="btn-outline text-[10px] py-1.5 px-3">Modifier</button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs uppercase tracking-wider font-heading font-semibold mt-1">
                    <span className={`px-2 py-0.5 ${profile.role === 'admin' ? 'bg-sport-red/10 text-sport-red' : profile.role === 'organizer' ? 'bg-sport-green/10 text-sport-green' : 'bg-gray-700 text-gray-400'} text-[10px]`}>
                      {profile.role === 'admin' ? 'Admin' : profile.role === 'organizer' ? 'Organisateur' : 'Joueur'}
                    </span>
                    <span className="text-gray-500">Membre depuis {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                  {profile.bio && <p className="text-gray-400 mt-3 text-sm">{profile.bio}</p>}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-sport-dark border border-sport-green/20 p-8">
          <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-sport-green rounded-full" />
            Tournois
          </h2>
          {tournaments.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun tournoi</p>
          ) : (
            <div className="space-y-1">
              {tournaments.map(t => (
                <Link key={t._id} to={`/tournament/${t._id}`}
                  className="flex items-center justify-between p-3 bg-sport-black/50 border border-white/5 hover:bg-sport-green/5 transition-colors">
                  <div>
                    <span className="text-white text-sm font-medium">{t.name}</span>
                    <span className="text-gray-500 text-xs ml-2">{t.game}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="capitalize text-gray-500">{t.type?.replace(/_/g, ' ')}</span>
                    {t.team && <span className="text-sport-green font-heading font-bold">{t.team.name}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
