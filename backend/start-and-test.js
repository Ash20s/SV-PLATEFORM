/**
 * Script pour démarrer le serveur et lancer les tests automatiquement
 */

const { spawn } = require('child_process');
const http = require('http');

const SERVER_URL = 'http://localhost:5000';
const MAX_WAIT_TIME = 30000; // 30 secondes
const CHECK_INTERVAL = 1000; // 1 seconde

let serverProcess = null;

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(`${SERVER_URL}/api/mock/stats`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer() {
  console.log('⏳ Attente du démarrage du serveur...');
  const startTime = Date.now();
  
  while (Date.now() - startTime < MAX_WAIT_TIME) {
    if (await checkServer()) {
      console.log('✅ Serveur démarré et accessible !');
      return true;
    }
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
  
  console.log('\n❌ Le serveur n\'a pas démarré dans les temps');
  return false;
}

function startServer() {
  console.log('🚀 Démarrage du serveur backend...');
  
  serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    shell: true,
    stdio: 'pipe'
  });

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server running') || output.includes('listening')) {
      console.log('📡 Serveur en cours de démarrage...');
    }
  });

  serverProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('DeprecationWarning') && !error.includes('ExperimentalWarning')) {
      console.error('⚠️  Erreur serveur:', error);
    }
  });

  serverProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`\n⚠️  Serveur arrêté avec le code ${code}`);
    }
  });

  return serverProcess;
}

async function runTests() {
  console.log('\n🧪 Lancement des tests...\n');
  
  const testProcess = spawn('node', ['test-api-endpoints.js'], {
    cwd: __dirname,
    shell: true,
    stdio: 'inherit'
  });

  return new Promise((resolve) => {
    testProcess.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function main() {
  try {
    // Démarrer le serveur
    startServer();
    
    // Attendre que le serveur soit prêt
    const serverReady = await waitForServer();
    
    if (!serverReady) {
      console.log('\n❌ Impossible de démarrer le serveur');
      if (serverProcess) {
        serverProcess.kill();
      }
      process.exit(1);
    }

    // Lancer les tests
    const testsPassed = await runTests();
    
    console.log('\n' + '='.repeat(60));
    if (testsPassed) {
      console.log('✅ Tous les tests sont passés !');
      console.log('\n💡 Le serveur continue de tourner en arrière-plan.');
      console.log('   Pour l\'arrêter, utilisez Ctrl+C ou fermez ce terminal.');
    } else {
      console.log('⚠️  Certains tests ont échoué');
    }
    console.log('='.repeat(60));
    
    // Garder le serveur en vie
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Arrêt du serveur...');
      if (serverProcess) {
        serverProcess.kill();
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(1);
  }
}

main();

