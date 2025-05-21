const { spawn } = require('child_process');
const path = require('path');

console.log('Starting database reset process...');

// Function to run a script and wait for completion
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Running script: ${scriptPath}`);
    
    const scriptProcess = spawn('node', [scriptPath], {
      stdio: 'inherit',
      env: process.env,
      cwd: path.dirname(scriptPath)
    });
    
    scriptProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`Script ${path.basename(scriptPath)} completed successfully`);
        resolve();
      } else {
        console.error(`Script ${path.basename(scriptPath)} failed with code ${code}`);
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    scriptProcess.on('error', (err) => {
      console.error(`Failed to start script ${path.basename(scriptPath)}:`, err);
      reject(err);
    });
  });
}

async function resetDatabase() {
  try {
    // Define script paths
    const initDbScript = path.resolve(__dirname, 'initDb.js');
    const seedDataScript = path.resolve(__dirname, 'seedTestData.js');
    
    // Run initialization script
    await runScript(initDbScript);
    
    // Run seed test data script
    await runScript(seedDataScript);
    
    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error during database reset:', error);
    process.exit(1);
  }
}

resetDatabase(); 