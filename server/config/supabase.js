const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://regikibcgfmiytliurxy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlZ2lraWJjZ2ZtaXl0bGl1cnh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIyNTc2MCwiZXhwIjoyMDk3ODAxNzYwfQ.3T6wD5wWN5s4uZfWU72nl9Rk2yCRRyO7YTwZIPL5UL0';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_WUuh_4zDjPppBHbSAXC-Qg_VjamyOKP';

// Admin client (service_role) — for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Public client (anon) — for user-facing operations
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Verify connection
supabase.from('profiles').select('count', { count: 'exact', head: true }).then(({ error }) => {
  if (error && error.code === '42P01') {
    console.log('Supabase connecté. Tables à créer.');
  } else if (!error) {
    console.log('Supabase connecté. Tables existantes.');
  }
}).catch(() => {});

module.exports = { supabase, supabasePublic };
