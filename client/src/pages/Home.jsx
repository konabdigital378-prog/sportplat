import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import TournamentCard from '../components/TournamentCard';

export default function Home() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { loadTournaments(); }, []);

  const loadTournaments = async (status = '') => {
    setLoading(true);
    try {
      const params = { limit: 12 };
      if (status) params.status = status;
      const res = await api.get('/tournaments', { params });
      setTournaments(res.data);
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  const filters = [
    { key: '', label: 'Tous' },
    { key: 'registration', label: 'Inscriptions' },
    { key: 'in_progress', label: 'En cours' },
    { key: 'completed', label: 'Terminés' }
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_70%_50%,rgba(0,158,73,0.12)_0%,transparent_70%),radial-gradient(ellipse_40%_60%_at_10%_80%,rgba(239,43,45,0.08)_0%,transparent_60%),radial-gradient(ellipse_50%_50%_at_90%_10%,rgba(252,209,22,0.05)_0%,transparent_50%)] bg-sport-black" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#009E49 1px, transparent 1px), linear-gradient(90deg, #009E49 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="max-w-7xl mx-auto px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-sport-green/10 border border-sport-green/40 px-4 py-1.5 mb-8 font-heading text-xs font-bold tracking-[2px] uppercase text-sport-green">
                <span className="w-2 h-2 bg-sport-green rounded-full animate-pulse" />
                SPORTPLAT — Plateforme de Tournois
              </div>
              <h1 className="heading-xl text-6xl md:text-7xl lg:text-8xl leading-[0.9]">
                <span className="text-sport-green block">Compétition</span>
                <span className="text-white block">Digitale</span>
                <span className="text-transparent block" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>Temps Réel</span>
              </h1>
              <p className="mt-6 text-lg text-gray-400 max-w-lg leading-relaxed">
                Créez, gérez et participez à des tournois en direct. Brackets automatiques, <span className="text-sport-gold font-semibold">scores en temps réel</span>, chat intégré et streaming live.
              </p>
              <div className="mt-8 flex gap-4 flex-wrap">
                {user ? (
                  <Link to="/create-tournament" className="btn-sport text-base py-4 px-10">
                    Créer un tournoi
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-sport text-base py-4 px-10">Commencer</Link>
                    <Link to="/login" className="btn-outline text-base py-4 px-8">Connexion</Link>
                  </>
                )}
              </div>
              <div className="mt-10 flex gap-8">
                {[
                  { num: '5', label: 'Types de tournois' },
                  { num: '∞', label: 'Participants' },
                  { num: '100%', label: 'Temps réel' }
                ].map((s, i) => (
                  <div key={i}>
                    <div className="font-heading text-3xl font-black text-sport-green leading-none">{s.num}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center relative">
              <div className="absolute w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,158,73,0.25)_0%,transparent_70%)] rounded-full animate-pulse" />
              <div className="absolute w-[550px] h-[550px] border border-sport-green/20 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute w-[650px] h-[650px] border border-sport-gold/10 rounded-full animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
              <img src="/logo.png" alt="SPORTPLAT" className="relative z-10 w-full max-w-md animate-bounce-slow glow-green"
                style={{ animation: 'float 6s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-[10px] uppercase tracking-widest">
          <div className="w-px h-12 bg-gradient-to-b from-sport-green to-transparent animate-pulse" />
          <span>Découvrir</span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-sport-dark py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="section-tag">Fonctionnalités</div>
          <h2 className="heading-xl text-4xl md:text-5xl mb-12">Tout ce qu'il vous <span className="text-sport-green">faut</span></h2>
          <div className="grid md:grid-cols-3 gap-0 border border-sport-green/20">
            {[
              { icon: '🏆', title: 'Multi-types', desc: 'Simple/Double élimination, Round Robin, Suisse, Phase de groupes', tag: '5 formats' },
              { icon: '⚡', title: 'Temps réel', desc: 'Scores en direct, notifications instantanées et chat intégré via WebSocket', tag: 'Live' },
              { icon: '👥', title: 'Multi-joueurs', desc: 'Gestion des équipes, rôles utilisateurs et profils complets', tag: 'Équipes' },
              { icon: '📺', title: 'Streaming live', desc: 'Intégration Twitch/YouTube pour diffuser vos matchs en direct', tag: 'Twitch/YT' },
              { icon: '📊', title: 'Export données', desc: 'Exportez brackets et classements en CSV, JSON ou imprimez', tag: 'CSV/JSON' },
              { icon: '💬', title: 'Chat intégré', desc: 'Salon de discussion en direct pour chaque tournoi', tag: 'Temps réel' }
            ].map((f, i) => (
              <div key={i} className="p-8 bg-sport-black border border-sport-green/20 hover:bg-sport-green/5 transition-all group cursor-pointer">
                <div className="font-heading text-5xl font-black text-sport-green/10 group-hover:text-sport-green/20 transition-colors leading-none mb-4">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-heading font-bold text-lg uppercase tracking-wider mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                <span className="inline-block mt-4 text-[10px] font-semibold uppercase tracking-wider text-sport-green bg-sport-green/10 border border-sport-green/20 px-3 py-1">{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOURNOIS */}
      <section className="py-20 px-8 bg-sport-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="section-tag">Tournois</div>
              <h2 className="heading-xl text-4xl md:text-5xl">Tournois <span className="text-sport-green">disponibles</span></h2>
            </div>
            <div className="flex gap-2">
              {filters.map(f => (
                <button key={f.key} onClick={() => { setFilter(f.key); loadTournaments(f.key); }}
                  className={`font-heading text-xs font-bold uppercase tracking-wider px-4 py-2 transition-all ${filter === f.key ? 'bg-sport-green text-white' : 'bg-sport-dark text-gray-400 border border-white/10 hover:text-white'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-sport-green border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-20 text-gray-600 border border-sport-green/20 bg-sport-dark">
              <div className="text-4xl mb-4">🏟️</div>
              <p className="text-lg">Aucun tournoi trouvé</p>
              {user && <Link to="/create-tournament" className="btn-sport mt-6 inline-block">Créer le premier tournoi</Link>}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map(t => <TournamentCard key={t._id} tournament={t} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 bg-gradient-to-r from-sport-dark via-sport-black to-sport-dark border-t border-sport-green/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-xl text-4xl md:text-5xl mb-6">Prêt à <span className="text-sport-green">dominer</span> ?</h2>
          <p className="text-gray-400 text-lg mb-8">Rejoignez la plateforme de tournois en temps réel et organisez vos compétitions comme un pro.</p>
          {user ? (
            <Link to="/create-tournament" className="btn-sport text-lg py-4 px-12">Créer un tournoi</Link>
          ) : (
            <Link to="/register" className="btn-sport text-lg py-4 px-12">Créer un compte gratuit</Link>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-sport-dark border-t border-sport-green/20 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/logo.png" alt="SPORTPLAT" className="h-14 mb-4" />
              <p className="text-gray-500 text-sm leading-relaxed">Plateforme de gestion de tournois en temps réel propulsée par SPORTPLAT SOLUTIONS.</p>
            </div>
            {[
              { title: 'Plateforme', links: ['Tournois', 'Créer', 'Dashboard', 'Classements'] },
              { title: 'Types', links: ['Simple élimination', 'Double élimination', 'Round Robin', 'Suisse'] },
              { title: 'Contact', links: ['Support', 'Bug report', 'Suggestions', 'API'] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-4 pb-2 border-b border-sport-green/20">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}><a href="#" className="text-gray-500 text-sm hover:text-sport-green transition-colors flex items-center gap-2"><span className="text-sport-green">›</span>{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs text-gray-600">
            <span>© 2026 SPORTPLAT SOLUTIONS — Burkina Faso. Tous droits réservés.</span>
            <div className="flex gap-3">
              {['FB', 'IG', 'TW', 'YT'].map(s => (
                <span key={s} className="w-8 h-8 bg-sport-dark2 border border-white/10 flex items-center justify-center text-gray-500 text-[10px] font-heading font-bold hover:bg-sport-green hover:text-white hover:border-sport-green transition-all cursor-pointer">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
}
