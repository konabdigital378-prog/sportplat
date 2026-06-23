-- ============================================================
-- Migration 0001: Schéma complet SPORTPLAT
-- Supabase PostgreSQL
-- ============================================================

-- 1. PROFILES (extension de auth.users)
CREATE TABLE profiles (
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
CREATE TABLE tournaments (
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
CREATE TABLE teams (
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

-- 4. TEAM MEMBERS (for team-based tournaments)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(team_id, user_id)
);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 5. MATCHES
CREATE TABLE matches (
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

-- 6. CHAT MESSAGES
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  username TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 7. NOTIFICATIONS
CREATE TABLE notifications (
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
CREATE TABLE payments (
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

-- 9. CUSTOM ROLES (per tournament)
CREATE TABLE custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('moderator', 'referee', 'commentator')),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  UNIQUE(user_id, tournament_id, role)
);
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);
CREATE INDEX idx_teams_tournament ON teams(tournament_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_chat_tournament ON chat_messages(tournament_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_tournament ON payments(tournament_id);
CREATE INDEX idx_custom_roles_tournament ON custom_roles(tournament_id);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
