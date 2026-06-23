import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export default function MatchCalendar({ tournamentId }) {
  const [matches, setMatches] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId) return;
    loadMatches();
  }, [tournamentId]);

  const loadMatches = async () => {
    try {
      const res = await api.get(`/matches/tournament/${tournamentId}`);
      setMatches(res.data);
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const getMatchesForDay = (day) => {
    const d = new Date(year, month, day);
    return matches.filter(m => {
      if (!m.scheduledDate) return false;
      const md = new Date(m.scheduledDate);
      return md.getDate() === day && md.getMonth() === month && md.getFullYear() === year;
    });
  };

  const getStatusColor = (status) => {
    if (status === 'live') return 'bg-sport-red';
    if (status === 'completed') return 'bg-sport-green';
    if (status === 'scheduled') return 'bg-sport-gold';
    return 'bg-gray-600';
  };

  return (
    <div className="bg-sport-dark border border-sport-green/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white">Calendrier des matchs</h3>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="text-gray-400 hover:text-white text-lg">&lt;</button>
          <span className="font-heading font-bold text-sm text-white">{monthNames[month]} {year}</span>
          <button onClick={nextMonth} className="text-gray-400 hover:text-white text-lg">&gt;</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-sport-green/10">
        {dayNames.map(d => (
          <div key={d} className="p-2 text-center text-[10px] text-gray-500 uppercase tracking-wider font-heading font-bold bg-sport-black">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2 bg-sport-black/50 min-h-[80px]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayMatches = getMatchesForDay(day);
          const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

          return (
            <div key={day} className={`p-1.5 bg-sport-black min-h-[80px] border border-white/5 ${isToday ? 'border-sport-green/40' : ''}`}>
              <div className={`text-xs mb-1 ${isToday ? 'text-sport-green font-bold' : 'text-gray-500'}`}>{day}</div>
              <div className="space-y-0.5">
                {dayMatches.slice(0, 3).map(m => (
                  <div key={m._id} className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusColor(m.status)}`} />
                    <span className="text-[10px] text-gray-300 truncate">{m.team1?.name || '?'} vs {m.team2?.name || '?'}</span>
                  </div>
                ))}
                {dayMatches.length > 3 && (
                  <span className="text-[10px] text-sport-green">+{dayMatches.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {matches.filter(m => m.scheduledDate).length === 0 && !loading && (
        <p className="text-center text-gray-500 text-sm mt-4">Aucun match programmé</p>
      )}
    </div>
  );
}
