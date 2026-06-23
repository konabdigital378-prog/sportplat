const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const SQL_FILES = [
  'supabase/migrations/0001_schema.sql',
  'supabase/migrations/0002_rls.sql'
];

async function runMigrations() {
  const client = new Client({
    connectionString: 'postgresql://postgres:2eRfEAwlqCdCICOa@db.regikibcgfmiytliurxy.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    console.log('Connecté à Supabase PostgreSQL');

    for (const file of SQL_FILES) {
      const fullPath = path.join(__dirname, '..', file);
      const sql = fs.readFileSync(fullPath, 'utf8');
      console.log(`Exécution: ${file}`);
      await client.query(sql);
      console.log(`✓ ${file} terminé`);
    }

    console.log('\n✅ Toutes les migrations exécutées avec succès !');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await client.end();
  }
}

runMigrations();
