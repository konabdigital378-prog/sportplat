-- ============================================================
-- Migration 0002: Row Level Security Policies
-- ============================================================

-- PROFILES
CREATE POLICY "Profiles sont publiques (lecture)"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users peuvent modifier leur propre profil"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- TOURNAMENTS
CREATE POLICY "Tournois sont publiques (lecture)"
  ON tournaments FOR SELECT USING (true);

CREATE POLICY "Organisateurs peuvent créer des tournois"
  ON tournaments FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organisateurs peuvent modifier leurs tournois"
  ON tournaments FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Admins peuvent tout modifier"
  ON tournaments FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- TEAMS
CREATE POLICY "Équipes sont publiques (lecture)"
  ON teams FOR SELECT USING (true);

CREATE POLICY "Users peuvent créer une équipe"
  ON teams FOR INSERT WITH CHECK (auth.uid() = captain_id);

CREATE POLICY "Capitaines peuvent modifier leur équipe"
  ON teams FOR UPDATE USING (auth.uid() = captain_id);

-- TEAM MEMBERS
CREATE POLICY "Membres sont publiques (lecture)"
  ON team_members FOR SELECT USING (true);

CREATE POLICY "Capitaines peuvent gérer les membres"
  ON team_members FOR ALL USING (
    auth.uid() IN (SELECT captain_id FROM teams WHERE id = team_id)
  );

-- MATCHES
CREATE POLICY "Matchs sont publiques (lecture)"
  ON matches FOR SELECT USING (true);

CREATE POLICY "Organisateurs et admins peuvent modifier les matchs"
  ON matches FOR UPDATE USING (
    auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = tournament_id)
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- CHAT MESSAGES
CREATE POLICY "Messages sont publiques (lecture)"
  ON chat_messages FOR SELECT USING (true);

CREATE POLICY "Users peuvent envoyer des messages"
  ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users peuvent supprimer leurs propres messages"
  ON chat_messages FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "Users peuvent voir leurs notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users peuvent modifier leurs notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- PAYMENTS
CREATE POLICY "Users peuvent voir leurs paiements"
  ON payments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organisateurs peuvent voir les paiements de leurs tournois"
  ON payments FOR SELECT USING (
    auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = tournament_id)
  );

CREATE POLICY "Service role peut tout faire (payments)"
  ON payments FOR ALL USING (true);

-- CUSTOM ROLES
CREATE POLICY "Rôles sont publiques (lecture)"
  ON custom_roles FOR SELECT USING (true);

CREATE POLICY "Organisateurs peuvent gérer les rôles"
  ON custom_roles FOR ALL USING (
    auth.uid() IN (SELECT organizer_id FROM tournaments WHERE id = tournament_id)
  );
