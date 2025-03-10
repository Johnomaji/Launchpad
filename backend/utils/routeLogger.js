const colors = require('colors/safe');
const Table = require('cli-table3');

/**
 * Extracts and logs all routes from an Express application
 * @param {object} app - Express application instance
 */
const printRouteInfo = (app) => {
  const routes = extractRoutes(app);
  const routeTable = formatRoutesTable(routes);

  console.log(colors.cyan('\n📋 API ROUTES SUMMARY:'));
  console.log(routeTable.toString());
  console.log(colors.cyan(`Total Routes: ${routes.length}\n`));
};

/**
 * Extracts all routes from an Express application
 * @param {object} app - Express application instance
 * @returns {Array} Array of route objects with path, method, and middlewares
 */
const extractRoutes = (app) => {
  const routes = [];

  // Function to process route
  const processRoute = (layer, basePath = '') => {
    if (layer.route) {
      // It's a route
      const path = basePath + (layer.route.path || '');
      const methods = Object.keys(layer.route.methods)
        .filter(method => layer.route.methods[method])
        .map(method => method.toUpperCase());

      // Get middleware count
      const middlewareCount = layer.route.stack ? layer.route.stack.length : 0;

      routes.push({
        path,
        methods,
        middlewareCount
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      // It's a sub-router
      let routerPath = '';
      
      // Alternative approach to get the path from the route handler
      if (layer.regexp && layer.path) {
        // Use the path directly if available
        routerPath = layer.path;
      } else if (layer.regexp) {
        // Try to get the path from the 'handle' property of the layer
        routerPath = layer.regexp.source
          .replace(/^\^\\\//, '/') // Remove leading ^\/
          .replace(/\\\//g, '/') // Replace \/ with /
          .replace(/\(\?:([^)]+)\).*$/, '$1') // Remove complex regex patterns
          .replace(/\?(?:\/|$).*$/, '') // Remove query params and end markers
          .replace(/\/\?.*$/, '') // Remove path params
          .replace(/\\/g, ''); // Remove remaining backslashes
      }
      
      const newBasePath = basePath + routerPath;

      // Process all routes in this router
      layer.handle.stack.forEach(stackItem => {
        processRoute(stackItem, newBasePath);
      });
    } else if (layer.name !== 'bound dispatch' && layer.name !== 'expressInit' && layer.name !== 'query') {
      // It might be application-level middleware
      if (layer.regexp && layer.regexp.fast_slash) {
        // Skip global middleware
      } else if (layer.regexp) {
        // Get the path
        let path = '';
        
        if (layer.path) {
          path = layer.path;
        } else {
          path = layer.regexp.source
            .replace(/^\^\\\//, '/') // Remove leading ^\/
            .replace(/\\\//g, '/') // Replace \/ with /
            .replace(/\(\?:([^)]+)\).*$/, '$1') // Remove complex regex patterns
            .replace(/\?(?:\/|$).*$/, '') // Remove query params and end markers
            .replace(/\/\?.*$/, '') // Remove path params
            .replace(/\\/g, ''); // Remove remaining backslashes
        }
        
        if (path && path !== '/') {
          routes.push({
            path: basePath + path,
            methods: ['MIDDLEWARE'],
            middlewareCount: 1,
            middlewareName: layer.name || 'anonymous'
          });
        }
      }
    }
  };

  // Process all layers in the app
  const stack = app._router.stack;
  stack.forEach(layer => processRoute(layer));

  // Sort routes by path
  return routes.sort((a, b) => a.path.localeCompare(b.path));
};

/**
 * Formats routes into a CLI table
 * @param {Array} routes - Array of route objects
 * @returns {object} CLI-Table instance
 */
const formatRoutesTable = (routes) => {
  const table = new Table({
    head: [
      colors.green('Path'),
      colors.green('Methods'),
      colors.green('Content Types'),
      colors.green('Auth Required'),
    ],
    colWidths: [40, 25, 30, 15], // Adjust column widths
    style: {
      head: [], // Disable colors in header
      border: [] // Disable colors for borders
    }
  });

  routes.forEach(route => {
    // Skip middleware-only entries
    if (route.methods.includes('MIDDLEWARE')) return;

    // Add content types based on methods
    let contentTypes = [];
    if (route.methods.includes('POST') || route.methods.includes('PUT') || route.methods.includes('PATCH')) {
      contentTypes.push('application/json');

      // Add more content types for specific routes
      if (route.path.includes('/upload')) {
        contentTypes.push('multipart/form-data');
      }
    }
    if (route.methods.includes('GET')) {
      contentTypes.push('N/A');
    }

    // Determine if auth is likely required based on route path
    const authRequired = determineAuthRequired(route.path);

    table.push([
      colors.yellow(route.path),
      colors.cyan(route.methods.join(', ')),
      colors.magenta(contentTypes.length ? contentTypes.join(', ') : 'N/A'),
      colors.red(authRequired ? '✓' : '✗'),
    ]);
  });

  return table;
};

/**
 * Determine if authentication is likely required for a route
 * based on path patterns
 * @param {string} path - Route path
 * @returns {boolean} True if auth is likely required
 */
const determineAuthRequired = (path) => {
  // List of paths that typically don't require auth
  const publicPaths = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/forgot-password',
    '/api/v1/auth/reset-password',
    '/health',
    '/api-docs',
    '/public'
  ];

  // Check if path is in the public paths list
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return false;
  }

  // Check if path contains common patterns that suggest auth requirement
  const authPatterns = [
    '/users/',
    '/admin/',
    '/profile',
    '/portfolio',
    '/transactions',
    '/memecoins/create',
  ];

  return authPatterns.some(pattern => path.includes(pattern));
};

module.exports = {
  printRouteInfo,
  extractRoutes
};
