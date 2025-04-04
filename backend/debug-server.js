require('dotenv').config();
const colors = require('colors/safe');
const cluster = require('cluster');
const os = require('os');

// Force debug logging
process.env.DEBUG = 'app:*';

// Set debugging environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.ENABLE_CLUSTERING = 'true';

console.log(colors.cyan('=============================================='));
console.log(colors.cyan('🐞 Server Debug Information'));
console.log(colors.cyan('=============================================='));
console.log(colors.yellow('Environment Variables:'));
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`ENABLE_CLUSTERING: ${process.env.ENABLE_CLUSTERING}`);
console.log(`PORT: ${process.env.PORT || 5000}`);
console.log(`HOST: ${process.env.HOST || 'localhost'}`);
console.log(`Number of CPUs: ${os.cpus().length}`);
console.log(colors.cyan('=============================================='));

// Check for required modules
try {
  console.log(colors.green('✓ Checking required modules...'));
  
  // List of modules to check
  const requiredModules = [
    'http', 'cluster', 'os', 'colors/safe', './app', 
    './config/db', './utils/routeLogger'
  ];
  
  for (const module of requiredModules) {
    try {
      require(module);
      console.log(colors.green(`✓ Module '${module}' loaded successfully`));
    } catch (err) {
      console.error(colors.red(`✗ Failed to load module '${module}': ${err.message}`));
    }
  }
} catch (err) {
  console.error(colors.red('Error checking modules:'), err);
}

console.log(colors.cyan('=============================================='));

// Add cluster event listeners before starting server
if (cluster.isMaster || cluster.isPrimary) {
  // Add more detailed worker event listeners
  cluster.on('fork', (worker) => {
    console.log(colors.yellow(`Worker ${worker.process.pid} is being created`));
  });

  cluster.on('online', (worker) => {
    console.log(colors.green(`Worker ${worker.process.pid} is online and ready`));
  });

  cluster.on('listening', (worker, address) => {
    console.log(colors.green(`Worker ${worker.process.pid} is listening on port ${address.port}`));
  });

  cluster.on('disconnect', (worker) => {
    console.log(colors.red(`Worker ${worker.process.pid} has disconnected`));
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(colors.red(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`));
  });
}

// Start the server with extra error handling
try {
  console.log(colors.yellow('Starting server with debug logging...'));
  require('./server');
} catch (err) {
  console.error(colors.red('Error starting server:'), err);
}
