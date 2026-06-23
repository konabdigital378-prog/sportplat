import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import FileUpload from './FileUpload';

const roleIcons = { moderator: '🛡️', referee: '⚖️', commentator: '🎙️' };
const roleLabels = { moderator: 'Modérateur', referee: 'Arbitre', commentator: 'Commentateur' };

export default function RoleManager({ tournamentId, isOrganizer }) {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('moderator');

  useEffect(() => { loadRoles(); }, [tournamentId]);

  const loadRoles = async () => {
    try {
      const res = await api.get(`/roles/${tournamentId}`);
      setRoles(res.data.roles);
    } catch (err) { /* silent */ }
  };

  const handleSearch = async (val) => {
    setSearch(val);
    if (val.length < 2) { setUsers([]); return; }
    try {
      const res = await api.get('/users', { params: { search: val } });
      setUsers(res.data);
    } catch (err) { /* silent */ }
  };

  const handleAdd = async () => {
    if (!selectedUser) return toast.error('Sélectionnez un utilisateur');
    const updated = [...roles.filter(r => r.userId?._id !== selectedUser), { userId: selectedUser, role: selectedRole }];
    try {
      await api.put(`/roles/${tournamentId}`, { roles: updated.map(r => ({ userId: r.userId?._id || r.userId, role: r.role })) });
      toast.success('Rôle ajouté');
      loadRoles();
    } catch (err) { toast.error('Erreur'); }
  };

  const handleRemove = async (userId) => {
    const updated = roles.filter(r => (r.userId?._id || r.userId) !== userId);
    try {
      await api.put(`/roles/${tournamentId}`, { roles: updated.map(r => ({ userId: r.userId?._id || r.userId, role: r.role })) });
      toast.success('Rôle retiré');
      loadRoles();
    } catch (err) { toast.error('Erreur'); }
  };

  if (!isOrganizer) return null;

  return (
    <div className="bg-sport-dark border border-sport-green/20 p-6">
      <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-sport-green rounded-full" />
        Gestion des rôles
      </h3>

      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-3 gap-2">
          {['moderator', 'referee', 'commentator'].map(role => (
            <button key={role} onClick={() => setSelectedRole(role)}
              className={`p-2 text-center text-xs transition-all ${selectedRole === role ? 'bg-sport-green/10 border border-sport-green/40 text-sport-green' : 'bg-sport-black/50 border border-white/5 text-gray-400 hover:border-sport-green/20'}`}>
              <div className="text-lg">{roleIcons[role]}</div>
              <div className="font-heading font-bold uppercase tracking-wider mt-1">{roleLabels[role]}</div>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" className="input-sport flex-1 text-sm" placeholder="Rechercher un utilisateur..." value={search} onChange={(e) => handleSearch(e.target.value)} />
          <button onClick={handleAdd} className="btn-sport text-xs py-2 px-4">Ajouter</button>
        </div>
        {users.length > 0 && (
          <div className="bg-sport-black border border-sport-green/20 max-h-32 overflow-y-auto">
            {users.map(u => (
              <button key={u._id} onClick={() => { setSelectedUser(u._id); setSearch(u.username); setUsers([]); }}
                className="w-full p-2 text-left text-sm text-gray-300 hover:bg-sport-green/10 border-b border-white/5">
                {u.username} <span className="text-gray-600">({u.email})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        {roles.length === 0 ? (
          <p className="text-gray-600 text-sm">Aucun rôle personnalisé</p>
        ) : (
          roles.map(r => (
            <div key={r.userId?._id || r._id} className="flex items-center justify-between p-3 bg-sport-black/50 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sport-green rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {(r.userId?.username || '?')[0].toUpperCase()}
                </div>
                <div>
                  <span className="text-sm text-white">{r.userId?.username || 'Utilisateur'}</span>
                  <span className="ml-2 text-[10px] text-sport-green font-heading font-bold uppercase">{roleIcons[r.role]} {roleLabels[r.role]}</span>
                </div>
              </div>
              <button onClick={() => handleRemove(r.userId?._id || r.userId)} className="text-xs text-sport-red hover:underline">
                Retirer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
