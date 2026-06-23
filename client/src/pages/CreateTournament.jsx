import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CreateTournament() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', description: '', game: '', type: 'single_elimination',
    maxPlayers: 8, minPlayers: 2, teamSize: 1, isTeamBased: false,
    registrationDeadline: '', startDate: '', rules: '', prize: '', streamUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/tournaments', form);
      toast.success('Tournoi créé avec succès');
      navigate(`/tournament/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sport-black pt-24 px-8 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="section-tag">Création</div>
        <h1 className="heading-xl text-4xl md:text-5xl mb-8">Créer un <span className="text-sport-green">tournoi</span></h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-sport-dark border border-sport-green/20 p-8 space-y-6">
            <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-sport-green rounded-full" />
              Informations générales
            </h2>
            <div>
              <label className="label-sport">Nom du tournoi *</label>
              <input type="text" name="name" className="input-sport" value={form.name} onChange={handleChange} required placeholder="Ex: Summer Cup 2026" />
            </div>
            <div>
              <label className="label-sport">Description</label>
              <textarea name="description" className="input-sport h-24 resize-none" value={form.description} onChange={handleChange} placeholder="Description du tournoi..." />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-sport">Jeu / Type *</label>
                <input type="text" name="game" className="input-sport" value={form.game} onChange={handleChange} required placeholder="Ex: Valorant, Football" />
              </div>
              <div>
                <label className="label-sport">Format *</label>
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
                <label className="label-sport">Participants max *</label>
                <input type="number" name="maxPlayers" className="input-sport" value={form.maxPlayers} onChange={handleChange} min={2} max={256} />
              </div>
              <div>
                <label className="label-sport">Participants min</label>
                <input type="number" name="minPlayers" className="input-sport" value={form.minPlayers} onChange={handleChange} min={2} />
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
              <input type="text" name="prize" className="input-sport" value={form.prize} onChange={handleChange} placeholder="Ex: 1000€ + Trophée" />
            </div>
            <div>
              <label className="label-sport">Règles personnalisées</label>
              <textarea name="rules" className="input-sport h-20 resize-none" value={form.rules} onChange={handleChange} placeholder="Règles spécifiques du tournoi..." />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-sport w-full py-4 text-base">
            {loading ? 'Création en cours...' : 'Créer le tournoi'}
          </button>
        </form>
      </div>
    </div>
  );
}
