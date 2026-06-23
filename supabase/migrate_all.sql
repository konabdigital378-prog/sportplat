-- ============================================================
-- MIGRATION COMPLÈTE SPORTPLAT — Collez ceci dans
-- Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT DEFAULT '',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'organizer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. TOURNAMENTS
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  game TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'single_elimination' CHECK (type IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss', 'group_stage')),
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'registration', 'in_progress', 'completed', 'cancelled')),
  max_players INTEGER DEFAULT 16,
  is_team_based BOOLEAN DEFAULT false,
  team_size INTEGER DEFAULT 1,
  registration_deadline TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  rules TEXT DEFAULT '',
  prize TEXT DEFAULT '',
  bracket JSONB DEFAULT NULL,
  stream_url TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  entry_fee NUMERIC DEFAULT 0,
  payment_methods TEXT[] DEFAULT ARRAY[]::TEXT[],
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- 3. TEAMS
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tag TEXT DEFAULT '',
  seed INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  captain_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 4. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(team_id, user_id)
);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 5. MATCHES
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round INTEGER DEFAULT 1,
  position INTEGER DEFAULT 1,
  score1 INTEGER DEFAULT 0,
  score2 INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  team1_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team2_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  bracket_round INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 6. CHAT
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  username TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 7. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  link TEXT DEFAULT '',
  read BOOLEAN DEFAULT false,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 8. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'XOF',
  method TEXT NOT NULL CHECK (method IN ('orange_money', 'moov', 'wave', 'visa', 'mastercard', 'mtn_money')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
  transaction_id TEXT UNIQUE,
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 9. CUSTOM ROLES
CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('moderator', 'referee', 'commentator')),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  UNIQUE(user_id, tournament_id, role)
);
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer ON tournaments(organizer_id);
CREATE INDEX IF NOT EXISTS idx_teams_tournament ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_chat_tournament ON chat_messages(tournament_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_tournament ON payments(tournament_id);

-- TRIGGER: updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS POLICIES
CREATE POLICY "Profiles lecture publique" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles modif perso" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Tournois lecture publique" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Tournois creation" ON tournaments FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Tournois modif organisateur" ON tournaments FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Teams lecture publique" ON teams FOR SELECT USING (true);
CREATE POLICY "Teams creation" ON teams FOR INSERT WITH CHECK (auth.uid() = captain_id);
CREATE POLICY "Teams modif capitaine" ON teams FOR UPDATE USING (auth.uid() = captain_id);

CREATE POLICY "Members lecture publique" ON team_members FOR SELECT USING (true);
CREATE POLICY "Members gestion" ON team_members FOR ALL USING (
  auth.uid() IN (SELECT captain_id FROM teams WHERE id = team_id));

CREATE POLICY "Matchs lecture publique" ON matches FOR SELECT USING (true);
CREATE POLICY "Matchs modif org" ON matches FOR UPDATE USING (
  auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = tournament_id));

CREATE POLICY "Chat lecture" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Chat envoi" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Chat suppression" ON chat_messages FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Notifs lecture" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Notifs modif" ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Paiements lecture user" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Paiements lecture org" ON payments FOR SELECT USING (
  auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = tournament_id));

CREATE POLICY "Roles lecture" ON custom_roles FOR SELECT USING (true);
CREATE POLICY "Roles gestion" ON custom_roles FOR ALL USING (
  auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = tournament_id));

-- ENABLE REALTIME (pour les subscriptions automatiques)
BEGIN;
  DROP PUBLICATION IF EXISTS sportplat_realtime;
  CREATE PUBLICATION sportplat_realtime FOR TABLE matches, chat_messages, notifications, tournaments, teams;
COMMIT;

-- TRIGGER: auto-create profile on signup (will be called by Supabase Auth hook)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Sync existing auth users (if any)
INSERT INTO public.profiles (id, username, email)
SELECT id, COALESCE(raw_user_meta_data ->> 'username', split_part(email, '@', 1)), email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

SELECT '✅ Migration SPORTPLAT terminée avec succès !' as result;
