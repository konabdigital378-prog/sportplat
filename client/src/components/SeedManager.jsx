import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function SeedManager({ teams, tournamentId, onUpdate }) {
  const [seeds, setSeeds] = useState(
    teams.map(t => ({ teamId: t._id, name: t.name, seed: t.seed || 0 }))
  );
  const [saving, setSaving] = useState(false);

  const handleSeedChange = (teamId, value) => {
    const v = parseInt(value) || 0;
    setSeeds(prev => prev.map(s => s.teamId === teamId ? { ...s, seed: v } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/seeding/tournament/${tournamentId}`, { seeds });
      toast.success('Seeds mis à jour');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSeed = async () => {
    try {
      const res = await api.put(`/seeding/auto/${tournamentId}`);
      const updated = res.data.teams.map(t => ({ teamId: t._id, name: t.name, seed: t.seed }));
      setSeeds(updated);
      toast.success('Seeding automatique effectué');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Erreur');
    }
  };

  const sorted = [...seeds].sort((a, b) => (a.seed || 999) - (b.seed || 999));

  return (
    <div className="card-sport">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white">Seeding des équipes</h3>
        <button onClick={handleAutoSeed} className="btn-outline text-xs py-1.5 px-3">Auto-seed</button>
      </div>
      <div className="space-y-1 mb-4 max-h-60 overflow-y-auto">
        {sorted.map((s, i) => (
          <div key={s.teamId} className="flex items-center gap-3 p-2 bg-sport-black/50 border border-white/5">
            <span className="text-xs text-gray-500 w-6 text-right font-heading font-bold">{i + 1}</span>
            <span className="flex-1 text-sm text-white truncate">{s.name}</span>
            <input
              type="number"
              min="0"
              max={teams.length}
              value={s.seed}
              onChange={(e) => handleSeedChange(s.teamId, e.target.value)}
              className="w-16 text-center bg-sport-black border border-white/10 text-white text-sm py-1"
            />
          </div>
        ))}
      </div>
      <button onClick={handleSave} disabled={saving} className="btn-sport w-full text-xs py-2">
        {saving ? 'Sauvegarde...' : 'Sauvegarder les seeds'}
      </button>
    </div>
  );
}
