/**
 * Script de test automatisé pour les endpoints de l'API Mock
 * Teste tous les endpoints REST disponibles
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api/mock`;

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testEndpoint(name, method, path, data = null, expectedStatus = 200) {
  try {
    log(`\n🧪 Testing: ${name}`, 'cyan');
    log(`   ${method} ${path}`, 'blue');
    
    const response = await makeRequest(method, path, data);
    
    if (response.status === expectedStatus) {
      log(`   ✅ Status: ${response.status} (expected ${expectedStatus})`, 'green');
      if (response.data && typeof response.data === 'object') {
        console.log(`   📦 Response:`, JSON.stringify(response.data, null, 2).substring(0, 500));
      }
      return { success: true, response };
    } else {
      log(`   ❌ Status: ${response.status} (expected ${expectedStatus})`, 'red');
      return { success: false, response };
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 Tests automatisés des endpoints Mock API', 'cyan');
  log('='.repeat(60), 'cyan');

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  // Test 1: Stats
  results.total++;
  const statsTest = await testEndpoint(
    'Get Mock Stats',
    'GET',
    '/stats'
  );
  if (statsTest.success) results.passed++;
  else results.failed++;

  // Test 2: List Matches
  results.total++;
  const matchesTest = await testEndpoint(
    'List Mock Matches',
    'GET',
    '/matches?limit=5'
  );
  if (matchesTest.success) results.passed++;
  else results.failed++;

  let matchId = null;
  if (matchesTest.success && matchesTest.response.data.matches && matchesTest.response.data.matches.length > 0) {
    matchId = matchesTest.response.data.matches[0].matchId;
    log(`\n📌 Using match ID for further tests: ${matchId}`, 'yellow');
  }

  // Test 3: Get Match Details (via matches endpoint)
  if (matchId) {
    results.total++;
    const matchDetailsTest = await testEndpoint(
      'Get Match Details',
      'GET',
      `/matches/${matchId}`.replace('/api/mock', '')
    );
    if (matchDetailsTest.success) results.passed++;
    else results.failed++;
  }

  // Résumé
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Résumé des tests', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total: ${results.total}`, 'blue');
  log(`✅ Réussis: ${results.passed}`, 'green');
  log(`❌ Échoués: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log('='.repeat(60), 'cyan');

  if (results.failed === 0) {
    log('\n🎉 Tous les tests sont passés !', 'green');
  } else {
    log('\n⚠️  Certains tests ont échoué. Vérifiez que le serveur est démarré.', 'yellow');
    log('   Démarrez le serveur avec: cd backend && npm run dev', 'yellow');
  }

  return results.failed === 0;
}

// Vérifier si le serveur est accessible
async function checkServer() {
  try {
    await makeRequest('GET', '/stats');
    return true;
  } catch (error) {
    log('\n❌ Le serveur n\'est pas accessible !', 'red');
    log('   Assurez-vous que le serveur est démarré:', 'yellow');
    log('   cd backend && npm run dev', 'yellow');
    return false;
  }
}

// Main
(async () => {
  log('\n🔍 Vérification de la connexion au serveur...', 'cyan');
  const serverOnline = await checkServer();
  
  if (serverOnline) {
    await runTests();
  } else {
    process.exit(1);
  }
})();

