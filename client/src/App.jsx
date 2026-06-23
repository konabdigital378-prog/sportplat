import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTournament from './pages/CreateTournament';
import TournamentDetail from './pages/TournamentDetail';
import BracketView from './pages/BracketView';
import Profile from './pages/Profile';
import PaymentCallback from './pages/PaymentCallback';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import EditTournament from './pages/EditTournament';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-sport-black">
      <div className="w-12 h-12 border-2 border-sport-green border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-sport-black">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/create-tournament" element={<PrivateRoute><CreateTournament /></PrivateRoute>} />
        <Route path="/tournament/:id" element={<TournamentDetail />} />
        <Route path="/tournament/:id/bracket" element={<BracketView />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/tournament/:id/edit" element={<PrivateRoute><EditTournament /></PrivateRoute>} />
      </Routes>
    </div>
  );
}
