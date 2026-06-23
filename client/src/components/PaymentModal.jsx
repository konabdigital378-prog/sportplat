import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const methodIcons = {
  orange_money: '📱',
  moov: '📱',
  wave: '🌊',
  visa: '💳',
  mastercard: '💳',
  mtn_money: '📱'
};

const methodLabels = {
  orange_money: 'Orange Money',
  moov: 'Moov Money',
  wave: 'Wave',
  visa: 'Visa',
  mastercard: 'Mastercard',
  mtn_money: 'MTN Money'
};

export default function PaymentModal({ tournamentId, teamId, amount, methods = [], onPaid, onClose }) {
  const [selectedMethod, setSelectedMethod] = useState(methods[0] || 'orange_money');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('select');
  const [instructions, setInstructions] = useState(null);
  const [paid, setPaid] = useState(false);

  const handleInitiate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payments/initiate', {
        tournamentId,
        teamId,
        method: selectedMethod
      });

      if (res.data.redirect && res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }

      if (res.data.instructions) {
        setInstructions(res.data.instructions);
        setStep('instructions');
        toast.success('Instructions de paiement');
        return;
      }

      toast.error('Erreur de paiement');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleManualConfirm = async () => {
    if (!instructions?.reference) return;
    try {
      await api.post(`/payments/confirm/${instructions.reference}`);
      setPaid(true);
      toast.success('Paiement confirmé !');
      if (onPaid) onPaid();
    } catch (err) {
      toast.error('Erreur de confirmation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-sport-dark border border-sport-green/20 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-sport-green/20">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white">Paiement inscription</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
        </div>

        {paid ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-heading font-bold text-lg text-sport-green uppercase tracking-wider mb-2">Paiement confirmé !</h3>
            <p className="text-gray-400 text-sm mb-6">Votre inscription est validée.</p>
            <button onClick={onClose} className="btn-sport text-sm py-2 px-8">Fermer</button>
          </div>
        ) : step === 'instructions' ? (
          <div className="p-6 space-y-4">
            <div className="text-center mb-2">
              <div className="text-3xl mb-2">📋</div>
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-white">Instructions de paiement</h4>
              <p className="text-xs text-gray-500 mt-1">Genius Pay indisponible — mode manuel</p>
            </div>
            <div className="bg-sport-black/50 border border-sport-green/20 p-4 text-center">
              <p className="text-sport-green font-heading font-bold text-lg">{instructions?.message}</p>
              <p className="text-xs text-gray-500 mt-2">Référence: <span className="text-sport-gold font-mono">{instructions?.reference}</span></p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Étapes :</p>
              {instructions?.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-2 bg-sport-black/30">
                  <span className="w-5 h-5 bg-sport-green/20 text-sport-green text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-sm text-gray-300">{step}</span>
                </div>
              ))}
            </div>
            <button onClick={handleManualConfirm} className="btn-sport w-full text-sm py-2.5">
              J'ai payé
            </button>
            <p className="text-[10px] text-gray-600 text-center">* Paiement manuel en mode dégradé</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="text-center mb-4">
              <div className="text-2xl font-heading font-black text-sport-green">{amount.toLocaleString()} FCFA</div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mt-1">Frais d'inscription</p>
              <p className="text-gray-600 text-[10px] mt-1">Paiement sécurisé via Genius Pay</p>
            </div>
            <div className="space-y-2">
              {(methods.length > 0 ? methods : ['orange_money', 'moov', 'wave', 'visa', 'mastercard']).map(m => (
                <button key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={`w-full p-3 flex items-center gap-3 text-left transition-all ${selectedMethod === m ? 'bg-sport-green/10 border border-sport-green/40' : 'bg-sport-black/50 border border-white/5 hover:border-sport-green/20'}`}>
                  <span className="text-2xl">{methodIcons[m]}</span>
                  <div>
                    <span className="text-sm font-medium text-white">{methodLabels[m]}</span>
                  </div>
                  {selectedMethod === m && <span className="ml-auto text-sport-green">✓</span>}
                </button>
              ))}
            </div>
            <button onClick={handleInitiate} disabled={loading} className="btn-sport w-full py-3 text-sm">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion à Genius Pay...
                </span>
              ) : 'Payer avec Genius Pay'}
            </button>
          </div>
        )}

        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-600">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Paiement sécurisé — vos données sont protégées
          </div>
        </div>
      </div>
    </div>
  );
}
