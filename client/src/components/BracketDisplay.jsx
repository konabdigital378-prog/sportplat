export default function BracketDisplay({ matches, tournamentType }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">🏆</div>
        <p className="font-heading font-bold text-lg uppercase tracking-wider">Aucun match pour le moment</p>
        <p className="text-sm mt-1">Démarrez le tournoi pour générer le bracket</p>
      </div>
    );
  }

  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
  const maxRound = Math.max(...rounds);

  return (
    <div className="overflow-x-auto pb-8">
      <div className="flex gap-8 min-w-max p-4">
        {rounds.map((round, ri) => {
          const roundMatches = matches.filter(m => m.round === round);
          const isFinal = round === maxRound;
          const spacing = Math.pow(2, maxRound - round) * 40;

          return (
            <div key={round} className="flex flex-col justify-around" style={{ minWidth: '220px' }}>
              <div className="text-center mb-4">
                <span className="font-heading text-xs font-bold text-sport-green uppercase tracking-[3px]">
                  {isFinal ? '🏆 Finale' : round === maxRound - 1 ? 'Demi-finale' : `Round ${round}`}
                </span>
              </div>
              <div className="flex flex-col justify-around" style={{ gap: `${spacing}px` }}>
                {roundMatches.map((match) => (
                  <MatchNode key={match._id} match={match} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchNode({ match }) {
  const getScore = (team, score) => {
    const win = team === 'team1' ? match.score1 > match.score2 : match.score2 > match.score1;
    if (match.status === 'completed') return <span className={`font-bold ml-2 ${win ? 'text-sport-green' : 'text-sport-red'}`}>{score}</span>;
    if (match.status === 'live') return <span className="font-bold ml-2 text-sport-gold">{score}</span>;
    return <span className="text-gray-600 ml-2">{score || '-'}</span>;
  };

  return (
    <div className="relative bg-sport-black border border-sport-green/20 p-3 min-w-[200px] hover:border-sport-green/50 transition-colors">
      {match.status === 'live' && (
        <span className="absolute -top-1 -right-1 flex w-3 h-3">
          <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-sport-red opacity-75" />
          <span className="relative inline-flex w-3 h-3 rounded-full bg-sport-red" />
        </span>
      )}
      <div className={`flex items-center justify-between text-sm py-1 border-b border-sport-green/10 ${match.score1 > match.score2 && match.status === 'completed' ? 'bg-sport-green/5 -mx-3 -mt-3 px-3 pt-3 border-t-0' : ''}`}>
        <span className="text-gray-200 truncate flex-1 text-xs">{match.team1?.name || 'TBD'}</span>
        <span className="font-heading font-bold text-sm">{match.score1}</span>
      </div>
      <div className={`flex items-center justify-between text-sm py-1 ${match.score2 > match.score1 && match.status === 'completed' ? 'bg-sport-green/5 -mx-3 -mb-3 px-3 pb-3' : ''}`}>
        <span className="text-gray-200 truncate flex-1 text-xs">{match.team2?.name || 'TBD'}</span>
        <span className="font-heading font-bold text-sm">{match.score2}</span>
      </div>
      <div className="text-[10px] text-gray-600 mt-1 font-heading uppercase tracking-wider">
        {match.status === 'completed' && match.winner && <span className="text-sport-green">Vainqueur: {match.winner.name}</span>}
        {match.status === 'live' && <span className="text-sport-red font-bold">EN DIRECT</span>}
        {match.status === 'scheduled' && (!match.team1 || !match.team2) && <span>À venir</span>}
        {match.status === 'walkover' && <span className="text-sport-gold">Forfait</span>}
      </div>
    </div>
  );
}
