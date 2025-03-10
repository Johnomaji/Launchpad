require('dotenv').config();
const http = require('http');
const colors = require('colors/safe');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const server = http.createServer(app);

module.exports = async (req, res) => {
  try {
    // Connect to database per request
    await connectDB();
    console.log(colors.green('✓ Connected to database'));

    // Forward the request to the Express app
    server.emit('request', req, res);
  } catch (err) {
    console.error(colors.red('Failed to handle request:'), err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
};


// require('dotenv').config();
// const http = require('http');
// const cluster = require('cluster');
// const os = require('os');
// const colors = require('colors/safe');
// const app = require('./app');
// const { connectDB, disconnectDB } = require('./config/db');
// const { printRouteInfo } = require('./utils/routeLogger');

// // Configuration
// const PORT = process.env.PORT || 5000;
// const HOST = process.env.HOST || 'localhost';
// const NODE_ENV = process.env.NODE_ENV || 'development';
// const ENABLE_CLUSTERING = process.env.ENABLE_CLUSTERING === 'true';
// const numCPUs = os.cpus().length;

// // Graceful shutdown function
// const gracefulShutdown = (server, options = { coredump: false, timeout: 30000 }) => {
//   // Create a promise that resolves after options.timeout seconds
//   const exitFunction = options.coredump ? process.abort : () => process.exit(0);

//   return function (code) {
//     console.log(`Attempting graceful shutdown with code: ${code}`);

//     // Exit immediately if second signal is received
//     process.removeListener('SIGINT', gracefulShutdown);
//     process.removeListener('SIGTERM', gracefulShutdown);

//     // Stop accepting new connections
//     server.close(() => {
//       console.log('Server closed');

//       // Close database connections
//       disconnectDB()
//         .then(() => {
//           console.log('Database connections closed');
//           exitFunction();
//         })
//         .catch(err => {
//           console.error('Error during database disconnect:', err);
//           exitFunction();
//         });
//     });

//     // Force close server after timeout
//     setTimeout(() => {
//       console.error('Forcing server close after timeout');
//       exitFunction();
//     }, options.timeout).unref();
//   };
// };

// // Function to start server
// const startServer = async () => {
//   try {
//     // Connect to database
//     await connectDB();
//     console.log(colors.green('✓ Connected to database'));

//     // Create HTTP server
//     const server = http.createServer(app);

//     // Handle server errors
//     server.on('error', (error) => {
//       if (error.code === 'EADDRINUSE') {
//         console.error(colors.red(`Port ${PORT} is already in use`));
//         process.exit(1);
//       } else {
//         console.error(colors.red('Server error:'), error);
//         process.exit(1);
//       }
//     });

//     // Start server
//     server.listen(PORT, HOST, () => {
//       console.log(colors.cyan('=============================================='));
//       console.log(colors.cyan(`🚀 Server running in ${NODE_ENV} mode`));
//       console.log(colors.cyan(`🔗 URL: http://${HOST}:${PORT}`));
//       if (cluster.isWorker) {
//         console.log(colors.cyan(`👷 Worker: ${cluster.worker.id}`));
//       }
//       console.log(colors.cyan('=============================================='));

//       // Print all routes and their accepted methods
//       printRouteInfo(app);

//       // Log API documentation URL
//       console.log(colors.yellow(`📚 API Documentation: http://${HOST}:${PORT}/api-docs`));
//     });

//     // Setup graceful shutdown
//     process.on('SIGTERM', gracefulShutdown(server));
//     process.on('SIGINT', gracefulShutdown(server));

//     return server;
//   } catch (err) {
//     console.error(colors.red('Failed to start server:'), err);
//     process.exit(1);
//   }
// };

// // Handle uncaught exceptions and unhandled rejections
// process.on('uncaughtException', (err) => {
//   console.error(colors.red('UNCAUGHT EXCEPTION:'), err);
//   process.exit(1);
// });

// process.on('unhandledRejection', (err) => {
//   console.error(colors.red('UNHANDLED REJECTION:'), err);
//   process.exit(1);
// });

// // Start server with clustering if enabled
// if (ENABLE_CLUSTERING && cluster.isMaster && NODE_ENV === 'production') {
//   console.log(colors.cyan(`Master process ${process.pid} is running`));

//   // Fork workers
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   // Handle worker exit
//   cluster.on('exit', (worker, code, signal) => {
//     console.log(colors.yellow(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`));
//     console.log(colors.yellow('Starting a new worker...'));
//     cluster.fork();
//   });
// } else {
//   // Start server without clustering
//   startServer().catch(err => {
//     console.error(colors.red('Error starting server:'), err);
//     process.exit(1);
//   });
// }

// module.exports = { startServer };
