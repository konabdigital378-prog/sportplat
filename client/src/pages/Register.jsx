import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Les mots de passe ne correspondent pas');
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Compte créé avec succès');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-sport-black pt-20">
      <div className="w-full max-w-md bg-sport-dark border border-sport-green/20 p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="SPORTPLAT" className="h-14 mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-white uppercase tracking-wider">Inscription</h1>
          <p className="text-gray-500 text-sm mt-1">Créez votre compte gratuitement</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-sport">Nom d'utilisateur</label>
            <input type="text" name="username" className="input-sport" value={form.username} onChange={handleChange} required minLength={3} placeholder="Votre pseudo" />
          </div>
          <div>
            <label className="label-sport">Email</label>
            <input type="email" name="email" className="input-sport" value={form.email} onChange={handleChange} required placeholder="votre@email.com" />
          </div>
          <div>
            <label className="label-sport">Mot de passe</label>
            <input type="password" name="password" className="input-sport" value={form.password} onChange={handleChange} required minLength={6} placeholder="••••••••" />
          </div>
          <div>
            <label className="label-sport">Confirmer le mot de passe</label>
            <input type="password" name="confirmPassword" className="input-sport" value={form.confirmPassword} onChange={handleChange} required minLength={6} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-sport w-full py-3.5 text-sm">
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-sport-green hover:underline font-semibold">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
