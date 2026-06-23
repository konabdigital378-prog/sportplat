import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function EditTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', description: '', game: '', type: 'single_elimination',
    maxPlayers: 8, teamSize: 1, isTeamBased: false,
    registrationDeadline: '', startDate: '', rules: '', prize: '', streamUrl: '',
    entryFee: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      const res = await api.get(`/tournaments/${id}`);
      const t = res.data;
      if (t.organizer?._id !== user?._id && user?.role !== 'admin') {
        toast.error('Accès refusé');
        return navigate('/');
      }
      setForm({
        name: t.name || '', description: t.description || '', game: t.game || '',
        type: t.type || 'single_elimination', maxPlayers: t.maxPlayers || 8,
        teamSize: t.teamSize || 1, isTeamBased: t.isTeamBased || false,
        registrationDeadline: t.registrationDeadline ? t.registrationDeadline.split('T')[0] : '',
        startDate: t.startDate ? t.startDate.split('T')[0] : '',
        rules: t.rules || '', prize: t.prize || '',
        streamUrl: t.streamUrl || '', entryFee: t.entryFee || 0
      });
    } catch (err) { toast.error('Tournoi non trouvé'); navigate('/'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/tournaments/${id}`, form);
      toast.success('Tournoi mis à jour');
      navigate(`/tournament/${id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-sport-black pt-20"><div className="w-12 h-12 border-2 border-sport-green border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-sport-black pt-24 px-8 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="section-tag">Modification</div>
        <h1 className="heading-xl text-4xl md:text-5xl mb-8">Modifier le <span className="text-sport-green">tournoi</span></h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-sport-dark border border-sport-green/20 p-8 space-y-6">
            <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-sport-green rounded-full" />
              Informations générales
            </h2>
            <div>
              <label className="label-sport">Nom du tournoi</label>
              <input type="text" name="name" className="input-sport" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="label-sport">Description</label>
              <textarea name="description" className="input-sport h-24 resize-none" value={form.description} onChange={handleChange} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-sport">Jeu / Type</label>
                <input type="text" name="game" className="input-sport" value={form.game} onChange={handleChange} />
              </div>
              <div>
                <label className="label-sport">Format</label>
                <select name="type" className="input-sport" value={form.type} onChange={handleChange}>
                  <option value="single_elimination">Simple élimination</option>
                  <option value="double_elimination">Double élimination</option>
                  <option value="round_robin">Round Robin</option>
                  <option value="swiss">Système Suisse</option>
                  <option value="group_stage">Phase de groupes</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-sport-dark border border-sport-green/20 p-8 space-y-6">
            <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-sport-green rounded-full" />
              Participants
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-sport">Participants max</label>
                <input type="number" name="maxPlayers" className="input-sport" value={form.maxPlayers} onChange={handleChange} min={2} max={256} />
              </div>
              <div>
                <label className="label-sport">Frais d'inscription (FCFA)</label>
                <input type="number" name="entryFee" className="input-sport" value={form.entryFee} onChange={handleChange} min={0} />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isTeamBased" checked={form.isTeamBased} onChange={handleChange} className="w-4 h-4 accent-sport-green" />
              <span className="text-sm text-gray-300 font-heading font-semibold uppercase tracking-wider">Tournoi par équipes</span>
            </label>
            {form.isTeamBased && (
              <div>
                <label className="label-sport">Taille de l'équipe</label>
                <input type="number" name="teamSize" className="input-sport" value={form.teamSize} onChange={handleChange} min={1} max={50} />
              </div>
            )}
          </div>

          <div className="bg-sport-dark border border-sport-green/20 p-8 space-y-6">
            <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-sport-green rounded-full" />
              Dates & Streaming
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-sport">Date limite d'inscription</label>
                <input type="date" name="registrationDeadline" className="input-sport" value={form.registrationDeadline} onChange={handleChange} />
              </div>
              <div>
                <label className="label-sport">Date de début</label>
                <input type="date" name="startDate" className="input-sport" value={form.startDate} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="label-sport">Lien Stream (Twitch / YouTube)</label>
              <input type="url" name="streamUrl" className="input-sport" value={form.streamUrl} onChange={handleChange} placeholder="https://twitch.tv/..." />
            </div>
            <div>
              <label className="label-sport">Récompense / Prix</label>
              <input type="text" name="prize" className="input-sport" value={form.prize} onChange={handleChange} />
            </div>
            <div>
              <label className="label-sport">Règles personnalisées</label>
              <textarea name="rules" className="input-sport h-20 resize-none" value={form.rules} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-sport w-full py-4 text-base">
            {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>
    </div>
  );
}
