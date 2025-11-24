/**
 * Script pour tester le chargement de toutes les routes
 */

console.log('🔍 Test de chargement des routes...\n');

const routes = [
  './src/routes/auth.routes',
  './src/routes/teams.routes',
  './src/routes/tournaments.routes',
  './src/routes/scrims.routes',
  './src/routes/announcements.routes',
  './src/routes/matches.routes',
  './src/routes/mock.routes',
];

for (const route of routes) {
  try {
    console.log(`Test: ${route}`);
    require(route);
    console.log(`✅ ${route} OK\n`);
  } catch (error) {
    console.error(`❌ ${route} ERREUR:`);
    console.error(`   ${error.message}`);
    console.error(`   ${error.stack.split('\n')[1]}\n`);
    process.exit(1);
  }
}

console.log('✅ Toutes les routes chargent correctement !');

