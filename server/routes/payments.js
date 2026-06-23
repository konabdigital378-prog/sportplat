const express = require('express');
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/auth');

const router = express.Router();

const GENIUS_API_KEY = process.env.GENIUS_API_KEY || 'GPAY-2XVJ';
const GENIUS_API_SECRET = process.env.GENIUS_API_SECRET;
const GENIUS_BASE_URL = process.env.GENIUS_BASE_URL || 'https://pay.genius.ci/api/v1/merchant';
const CALLBACK_URL = process.env.CLIENT_URL || 'http://localhost:5174';

router.get('/config/:tournamentId', async (req, res) => {
  try {
    const { data: tournament } = await supabase
      .from('tournaments').select('name, entry_fee, payment_methods')
      .eq('id', req.params.tournamentId).single();

    res.json({
      enabled: !!tournament?.entry_fee && tournament.entry_fee > 0,
      amount: tournament?.entry_fee || 0,
      methods: tournament?.payment_methods || [],
      tournament: tournament?.name
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/initiate', protect, async (req, res) => {
  try {
    const { tournamentId, teamId, method } = req.body;
    const { data: tournament } = await supabase
      .from('tournaments').select('*').eq('id', tournamentId).single();
    if (!tournament || !tournament.entry_fee) {
      return res.status(400).json({ message: 'Paiement non requis' });
    }

    const { data: existing } = await supabase
      .from('payments').select('id').eq('tournament_id', tournamentId)
      .eq('user_id', req.user.id).eq('status', 'confirmed').maybeSingle();
    if (existing) return res.status(400).json({ message: 'Déjà payé' });

    const txnId = 'GP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const { data: payment, error } = await supabase.from('payments').insert({
      tournament_id: tournamentId, team_id: teamId, user_id: req.user.id,
      amount: tournament.entry_fee, method: method || 'orange_money',
      transaction_id: txnId
    }).select().single();

    if (error) return res.status(400).json({ message: error.message });

    let checkoutUrl = null;
    try {
      const response = await fetch(`${GENIUS_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'X-API-Key': GENIUS_API_KEY,
          'X-API-Secret': GENIUS_API_SECRET,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: tournament.entry_fee, currency: 'XOF',
          description: `Inscription: ${tournament.name}`,
          callback_url: `${CALLBACK_URL}/payment/callback?txnId=${txnId}&tournamentId=${tournamentId}`,
          reference: txnId
        })
      });
      const data = await response.json();
      checkoutUrl = data?.data?.checkout_url || data?.data?.payment_url || null;
    } catch (e) { /* Genius Pay indisponible */ }

    if (checkoutUrl) {
      await supabase.from('payments').update({ metadata: { checkoutUrl } }).eq('id', payment.id);
      return res.status(201).json({ payment, checkoutUrl, redirect: true });
    }

    res.status(201).json({
      payment, redirect: false, checkoutUrl: null,
      instructions: {
        message: `Envoyez ${tournament.entry_fee} FCFA et confirmez`,
        reference: txnId,
        steps: ['Effectuez le paiement', `Référence: ${txnId}`, 'Cliquez sur "J\'ai payé"']
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/confirm/:transactionId', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments').update({ status: 'confirmed', paid_at: new Date().toISOString() })
      .eq('transaction_id', req.params.transactionId).select().single();
    if (error) return res.status(404).json({ message: 'Non trouvé' });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/status/:tournamentId', protect, async (req, res) => {
  try {
    const { data } = await supabase
      .from('payments').select('*').eq('tournament_id', req.params.tournamentId)
      .eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
    res.json({ paid: data?.status === 'confirmed', payment: data });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/tournament/:tournamentId', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments').select('*, profiles(username, email), teams(name)')
      .eq('tournament_id', req.params.tournamentId)
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ message: error.message });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/webhook', async (req, res) => {
  try {
    const { event, payload: eventPayload } = req.body;
    const reference = eventPayload?.reference || eventPayload?.transaction_ref;
    if (event === 'payment.success' && reference) {
      await supabase.from('payments').update({ status: 'confirmed', paid_at: new Date().toISOString() })
        .eq('transaction_id', reference);
    }
    res.json({ status: 'ok' });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

module.exports = router;
