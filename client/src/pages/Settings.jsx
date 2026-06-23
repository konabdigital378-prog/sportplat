import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ username: user?.username || '', phone: user?.phone || '', bio: user?.bio || '' });
  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/me', { username: form.username, phone: form.phone, bio: form.bio });
      localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
      toast.success('Profil mis à jour');
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handlePassword = async () => {
    if (password.newPass !== password.confirm) return toast.error('Les mots de passe ne correspondent pas');
    if (password.newPass.length < 6) return toast.error('Minimum 6 caractères');
    setSavingPass(true);
    try {
      await api.put('/auth/password', { currentPassword: password.current, newPassword: password.newPass });
      toast.success('Mot de passe mis à jour');
      setPassword({ current: '', newPass: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setSavingPass(false); }
  };

  return (
    <div className="min-h-screen bg-sport-black pt-24 px-8 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="section-tag">Paramètres</div>
        <h1 className="heading-xl text-4xl md:text-5xl mb-8">Paramètres du <span className="text-sport-green">compte</span></h1>

        <div className="bg-sport-dark border border-sport-green/20 p-8 mb-6">
          <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-sport-green rounded-full" />
            Profil
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label-sport">Nom d'utilisateur</label>
              <input type="text" className="input-sport" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label className="label-sport">Téléphone</label>
              <input type="text" className="input-sport" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+226 XX XX XX XX" />
            </div>
            <div>
              <label className="label-sport">Bio</label>
              <textarea className="input-sport h-20 resize-none" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Parlez de vous..." />
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-sport text-sm py-3 px-8">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        <div className="bg-sport-dark border border-sport-green/20 p-8">
          <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-sport-green rounded-full" />
            Mot de passe
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label-sport">Mot de passe actuel</label>
              <input type="password" className="input-sport" value={password.current} onChange={e => setPassword({ ...password, current: e.target.value })} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-sport">Nouveau mot de passe</label>
                <input type="password" className="input-sport" value={password.newPass} onChange={e => setPassword({ ...password, newPass: e.target.value })} />
              </div>
              <div>
                <label className="label-sport">Confirmer</label>
                <input type="password" className="input-sport" value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} />
              </div>
            </div>
            <button onClick={handlePassword} disabled={savingPass} className="btn-sport text-sm py-3 px-8">
              {savingPass ? 'Mise à jour...' : 'Changer le mot de passe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
