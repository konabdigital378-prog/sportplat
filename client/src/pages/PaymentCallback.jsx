import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [payment, setPayment] = useState(null);

  const txnId = searchParams.get('txnId');
  const tournamentId = searchParams.get('tournamentId');

  useEffect(() => {
    if (!txnId || !tournamentId) {
      setStatus('error');
      return;
    }
    confirmPayment();
  }, [txnId, tournamentId]);

  const confirmPayment = async () => {
    try {
      const res = await api.post(`/payments/confirm/${txnId}`);
      setPayment(res.data);
      setStatus('success');
      toast.success('Paiement confirmé !');
    } catch (err) {
      setStatus('error');
      toast.error('Erreur de confirmation');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sport-black pt-20">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-sport-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Confirmation du paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sport-black pt-24 px-8 pb-20">
      <div className="max-w-md mx-auto text-center">
        {status === 'success' ? (
          <div className="bg-sport-dark border border-sport-green/20 p-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="font-heading font-black text-2xl text-sport-green mb-2">Paiement réussi !</h1>
            <p className="text-gray-400 text-sm mb-2">Votre inscription est confirmée.</p>
            {payment && (
              <p className="text-xs text-gray-500 mb-6">
                Réf: <span className="text-sport-gold font-mono">{payment.transactionId}</span>
              </p>
            )}
            <Link to={`/tournament/${tournamentId}`} className="btn-sport text-sm py-2.5 px-8">
              Retour au tournoi
            </Link>
          </div>
        ) : (
          <div className="bg-sport-dark border border-sport-red/20 p-8">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="font-heading font-black text-2xl text-sport-red mb-2">Erreur de paiement</h1>
            <p className="text-gray-400 text-sm mb-6">Une erreur est survenue. Contactez le support.</p>
            <Link to={tournamentId ? `/tournament/${tournamentId}` : '/'} className="btn-outline text-sm py-2.5 px-8">
              Retour
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
