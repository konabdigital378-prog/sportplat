import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import usePolling from '../hooks/usePolling';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { if (user) loadNotifs(); }, [user]);
  usePolling(loadNotifs, 15000, !!user);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (Notification.permission === 'default') Notification.requestPermission();
  }, []);

  const loadNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnread(res.data.unread);
    } catch (err) { /* silent */ }
  };

  const handleReadAll = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch (err) { /* silent */ }
  };

  const handleRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (err) { /* silent */ }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative text-gray-400 hover:text-white transition-colors">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-sport-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-sport-dark border border-sport-green/20 shadow-2xl max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b border-sport-green/20">
            <span className="font-heading font-bold text-sm uppercase tracking-wider">Notifications</span>
            {unread > 0 && (
              <button onClick={handleReadAll} className="text-xs text-sport-green hover:underline">Tout lire</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">Aucune notification</div>
          ) : (
            notifications.map((n) => (
              <Link
                key={n._id}
                to={n.link || '#'}
                onClick={() => handleRead(n._id)}
                className={`block p-3 border-b border-white/5 hover:bg-sport-green/5 transition-colors ${!n.read ? 'bg-sport-green/5 border-l-2 border-l-sport-green' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'match_live' ? 'bg-sport-red' : n.type === 'match_result' ? 'bg-sport-gold' : 'bg-sport-green'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-600 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
