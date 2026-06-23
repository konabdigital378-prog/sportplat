import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Connecté avec succès');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-sport-black pt-20">
      <div className="w-full max-w-md bg-sport-dark border border-sport-green/20 p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="SPORTPLAT" className="h-14 mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-white uppercase tracking-wider">Connexion</h1>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-sport">Email</label>
            <input type="email" className="input-sport" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre@email.com" />
          </div>
          <div>
            <label className="label-sport">Mot de passe</label>
            <input type="password" className="input-sport" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-sport w-full py-3.5 text-sm">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-sport-green hover:underline font-semibold">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
