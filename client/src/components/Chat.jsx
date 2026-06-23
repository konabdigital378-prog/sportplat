import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import usePolling from '../hooks/usePolling';

export default function Chat({ tournamentId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!tournamentId || !open) return;
    loadMessages();
  }, [tournamentId, open]);

  usePolling(loadMessages, 8000, open && !!tournamentId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/chat/${tournamentId}?limit=50`);
      setMessages(res.data);
    } catch (err) { /* silent */ }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await api.post('/chat', { tournamentId, message: input.trim() });
      setInput('');
      loadMessages();
    } catch (err) { /* silent */ }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 btn-sport w-14 h-14 flex items-center justify-center text-2xl"
        style={{ clipPath: 'none', borderRadius: '50%', padding: 0 }}
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-sport-dark border border-sport-green/20 flex flex-col shadow-2xl">
          <div className="bg-sport-green px-4 py-3 flex items-center justify-between">
            <span className="font-heading font-bold text-sm uppercase tracking-wider text-white">Chat du tournoi</span>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={msg._id || i} className={`flex ${msg.user?._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 ${msg.user?._id === user?._id ? 'bg-sport-green/20 border border-sport-green/30' : 'bg-sport-dark3 border border-white/10'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-heading font-bold uppercase text-sport-green">{msg.username || msg.user?.username}</span>
                    <span className="text-[10px] text-gray-600">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-gray-200 break-words">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-sport-green/20 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-sport flex-1 text-sm"
              placeholder="Votre message..."
              maxLength={500}
            />
            <button type="submit" className="btn-sport text-xs py-2 px-4">Envoyer</button>
          </form>
        </div>
      )}
    </>
  );
}
