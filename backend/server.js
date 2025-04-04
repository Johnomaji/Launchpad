// use -r dotenv/config while running and remove this line?
require('dotenv').config();
const http = require('http');
const cluster = require('cluster');
const os = require('os');
const colors = require('colors/safe');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { printRouteInfo } = require('./utils/routeLogger');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';
const ENABLE_CLUSTERING = process.env.ENABLE_CLUSTERING === 'true';
const numCPUs = os.cpus().length;

const gracefulShutdown = (server, options = { coredump: false, timeout: 30000 }) => {
  const exitFunction = options.coredump ? process.abort : () => process.exit(0);

  return function (code) {
    console.log(`Attempting graceful shutdown with code: ${code}`);

    process.removeListener('SIGINT', gracefulShutdown);
    process.removeListener('SIGTERM', gracefulShutdown);

    server.close(() => {
      console.log('Server closed');

      disconnectDB()
        .then(() => {
          console.log('Database connections closed');
          exitFunction();
        })
        .catch(err => {
          console.error('Error during database disconnect:', err);
          exitFunction();
        });
    });

    setTimeout(() => {
      console.error('Forcing server close after timeout');
      exitFunction();
    }, options.timeout).unref();
  };
};

const startServer = async () => {
  try {
    await connectDB();
    console.log(colors.green('✓ Connected to database'));

    const server = http.createServer(app);

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(colors.red(`Port ${PORT} is already in use`));
        process.exit(1);
      } else {
        console.error(colors.red('Server error:'), error);
        process.exit(1);
      }
    });

    server.listen(PORT, HOST, () => {
      console.log(colors.cyan('=============================================='));
      console.log(colors.cyan(`🚀 Server running in ${NODE_ENV} mode`));
      console.log(colors.cyan(`🔗 URL: http://${HOST}:${PORT}`));
      if (cluster.isWorker) {
        console.log(colors.cyan(`👷 Worker: ${cluster.worker.id}`));
      }
      console.log(colors.cyan('=============================================='));

      if (!ENABLE_CLUSTERING || cluster.isMaster || !cluster.isWorker) {
        printRouteInfo(app);
        console.log(colors.yellow(`📚 API Documentation: http://${HOST}:${PORT}/api-docs`));
      }
    });

    process.on('SIGTERM', gracefulShutdown(server));
    process.on('SIGINT', gracefulShutdown(server));

    return server;
  } catch (err) {
    console.error(colors.red('Failed to start server:'), err);
    process.exit(1);
  }
};

process.on('uncaughtException', (err) => {
  console.error(colors.red('UNCAUGHT EXCEPTION:'), err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error(colors.red('UNHANDLED REJECTION:'), err);
  process.exit(1);
});

if (ENABLE_CLUSTERING && NODE_ENV === 'production') {
  if (cluster.isPrimary || cluster.isMaster) { // Use isPrimary for Node.js 16+, isMaster for older versions
    console.log(colors.cyan(`Master process ${process.pid} is running`));
    console.log(colors.cyan(`Clustering enabled, launching ${numCPUs} workers...`));

    printRouteInfo(app);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(colors.yellow(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`));
      console.log(colors.yellow('Starting a new worker...'));
      cluster.fork();
    });

    cluster.on('online', (worker) => {
      console.log(colors.green(`Worker ${worker.process.pid} is online`));
    });
  } else {
    console.log(colors.cyan(`Starting worker ${process.pid}...`));
    startServer().catch(err => {
      console.error(colors.red(`Error starting server in worker ${process.pid}:`), err);
      process.exit(1);
    });
  }
} else {
  console.log(colors.cyan(`Starting server in non-clustered mode...`));
  startServer().catch(err => {
    console.error(colors.red('Error starting server:'), err);
    process.exit(1);
  });
}

module.exports = { startServer };
