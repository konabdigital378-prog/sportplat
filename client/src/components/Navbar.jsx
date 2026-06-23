import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import Notifications from './Notifications';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-sport-black/95 backdrop-blur-md border-b border-sport-green/20 h-20 flex items-center px-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <img src="/logo.png" alt="SPORTPLAT" className="h-12 object-contain" />
          <span className="font-heading font-bold text-lg text-white tracking-wider uppercase">TournoiPro</span>
        </Link>

        <div className="hidden lg:flex items-center space-x-8">
          <Link to="/" className="font-heading font-semibold text-sm tracking-wider uppercase text-gray-400 hover:text-white transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-sport-green after:scale-x-0 hover:after:scale-x-100 after:transition-transform">
            Accueil
          </Link>
          {user && (
            <Link to="/dashboard" className="font-heading font-semibold text-sm tracking-wider uppercase text-gray-400 hover:text-white transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-sport-green after:scale-x-0 hover:after:scale-x-100 after:transition-transform">
              Dashboard
            </Link>
          )}
          {user && (
            <Link to="/settings" className="font-heading font-semibold text-sm tracking-wider uppercase text-gray-400 hover:text-white transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-sport-green after:scale-x-0 hover:after:scale-x-100 after:transition-transform">
              Paramètres
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="font-heading font-semibold text-sm tracking-wider uppercase text-sport-red hover:text-white transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-sport-red after:scale-x-0 hover:after:scale-x-100 after:transition-transform">
              Admin
            </Link>
          )}
          <Link to="/" className="font-heading font-semibold text-sm tracking-wider uppercase text-gray-400 hover:text-white transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-sport-green after:scale-x-0 hover:after:scale-x-100 after:transition-transform">
            Tournois
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Notifications />
              <Link to="/profile" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors font-heading font-semibold text-sm tracking-wider uppercase">
                <div className="w-9 h-9 bg-sport-green rounded-full flex items-center justify-center text-sm font-bold text-white font-body">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="hidden lg:inline">{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="btn-outline text-xs py-2 px-4">
                Quitter
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-heading font-semibold text-sm tracking-wider uppercase text-gray-400 hover:text-white transition-colors">Connexion</Link>
              <Link to="/register" className="btn-sport text-xs py-2.5 px-6">Inscription</Link>
            </>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden flex flex-col gap-1.5 bg-none border-none cursor-pointer">
            <span className="block w-6 h-0.5 bg-white transition-all"></span>
            <span className="block w-6 h-0.5 bg-white transition-all"></span>
            <span className="block w-6 h-0.5 bg-white transition-all"></span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute top-20 left-0 right-0 bg-sport-black/98 border-b border-sport-green/20 p-8 flex flex-col gap-4 lg:hidden">
          <Link to="/" className="font-heading font-semibold text-sm tracking-wider uppercase text-white" onClick={() => setMobileOpen(false)}>Accueil</Link>
          {user && <Link to="/dashboard" className="font-heading font-semibold text-sm tracking-wider uppercase text-white" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
          {user && <Link to="/settings" className="font-heading font-semibold text-sm tracking-wider uppercase text-white" onClick={() => setMobileOpen(false)}>Paramètres</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="font-heading font-semibold text-sm tracking-wider uppercase text-sport-red" onClick={() => setMobileOpen(false)}>Admin</Link>}
          <Link to="/" className="font-heading font-semibold text-sm tracking-wider uppercase text-white" onClick={() => setMobileOpen(false)}>Tournois</Link>
        </div>
      )}
    </nav>
  );
}
