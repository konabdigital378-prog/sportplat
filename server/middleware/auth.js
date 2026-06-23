const { supabase } = require('../config/supabase');

// Verify Supabase JWT and return user + profile
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Non autorisé' });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ message: 'Token invalide' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = profile || { id: user.id, username: user.email?.split('@')[0], role: 'user' };
    req.user.email = user.email;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Erreur auth' });
  }
};

// Check user role
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  next();
};

module.exports = { protect, authorize };
