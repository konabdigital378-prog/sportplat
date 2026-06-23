import { Link } from 'react-router-dom';

const statusColors = {
  draft: 'bg-gray-600 text-white',
  registration: 'bg-sport-green text-white',
  in_progress: 'bg-sport-red text-white',
  completed: 'bg-sport-gold text-black',
  cancelled: 'bg-gray-800 text-gray-400'
};

const statusLabels = {
  draft: 'Brouillon',
  registration: 'Inscriptions',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé'
};

export default function TournamentCard({ tournament }) {
  return (
    <Link to={`/tournament/${tournament._id}`} className="block bg-sport-dark border border-sport-green/20 p-6 hover:border-sport-green/60 transition-all duration-300 group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-sport-green scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-heading font-bold text-lg text-white group-hover:text-sport-green transition-colors uppercase tracking-wider">
            {tournament.name}
          </h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{tournament.game}</p>
        </div>
        <span className={`text-[10px] font-bold px-3 py-1 uppercase tracking-wider ${statusColors[tournament.status]}`}>
          {statusLabels[tournament.status]}
        </span>
      </div>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{tournament.description || 'Aucune description'}</p>
      <div className="flex items-center justify-between text-xs text-gray-600 border-t border-sport-green/10 pt-3">
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{tournament.participants?.length || 0}/{tournament.maxPlayers}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{new Date(tournament.startDate || tournament.createdAt).toLocaleDateString()}</span>
        </div>
        <span className="capitalize text-sport-green font-heading font-semibold text-[10px] uppercase tracking-wider">
          {tournament.type?.replace(/_/g, ' ')}
        </span>
      </div>
    </Link>
  );
}
