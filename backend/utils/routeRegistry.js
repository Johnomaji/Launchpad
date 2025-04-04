/**
 * Registry for documenting API routes and their metadata
 */
class RouteRegistry {
  constructor() {
    this.routes = [];
    this.routeGroups = {};
  }

  /**
   * Register a new route with its metadata
   * @param {string} path - Route path
   * @param {string} method - HTTP method
   * @param {object} options - Route options
   */
  registerRoute(path, method, options = {}) {
    const {
      description = '',
      requiredAuth = false,
      contentType = [],
      requestSchema = null,
      responseSchema = null,
      group = 'general'
    } = options;

    // Create route object
    const route = {
      path,
      method: method.toUpperCase(),
      description,
      requiredAuth,
      contentType: Array.isArray(contentType) ? contentType : [contentType],
      requestSchema,
      responseSchema,
      group
    };

    // Add to routes array
    this.routes.push(route);

    // Add to route groups
    if (!this.routeGroups[group]) {
      this.routeGroups[group] = [];
    }
    this.routeGroups[group].push(route);

    return this;
  }

  /**
   * Get all registered routes
   * @returns {Array} Array of route objects
   */
  getRoutes() {
    return this.routes;
  }

  /**
   * Get routes by group
   * @param {string} group - Group name
   * @returns {Array} Array of route objects in the specified group
   */
  getRoutesByGroup(group) {
    return this.routeGroups[group] || [];
  }

  /**
   * Get all route groups
   * @returns {object} Object with group names as keys and arrays of routes as values
   */
  getRouteGroups() {
    return this.routeGroups;
  }

  /**
   * Clear all registered routes
   */
  clearRoutes() {
    this.routes = [];
    this.routeGroups = {};
  }

  /**
   * Register routes from Express app
   * This is a utility method to extract and register routes from an Express app
   * @param {object} app - Express application
   */
  registerRoutes(app) {
    try {
      if (!app || !app._router || !app._router.stack) {
        console.warn('Unable to register routes: Invalid Express app');
        return;
      }

      // First, clear existing routes
      this.clearRoutes();

      // Function to process route
      const processRoute = (layer, basePath = '') => {
        if (layer.route) {
          // It's a route
          const path = basePath + (layer.route.path || '');

          // Get methods
          Object.keys(layer.route.methods)
            .filter(method => layer.route.methods[method])
            .forEach(method => {
              // Determine group based on path
              let group = 'general';
              if (path.includes('/auth')) group = 'auth';
              else if (path.includes('/users')) group = 'users';
              else if (path.includes('/memecoins')) group = 'memecoins';

              // Determine content types
              let contentTypes = [];
              if (method === 'post' || method === 'put' || method === 'patch') {
                contentTypes.push('application/json');
                if (path.includes('/upload')) {
                  contentTypes.push('multipart/form-data');
                }
              }

              // Determine if auth is required
              const authRequired = this._determineAuthRequired(path);

              // Register route
              this.registerRoute(path, method, {
                description: `${method.toUpperCase()} ${path}`,
                requiredAuth: authRequired,
                contentType: contentTypes,
                group
              });
            });
        } else if (layer.name === 'router' && layer.handle.stack) {
          // It's a sub-router
          const routerPath = layer.regexp && layer.regexp.source
            .replace('^', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace(/\\\//g, '/');

          const newBasePath = basePath + (routerPath !== '/' ? routerPath : '');

          // Process all routes in this router
          layer.handle.stack.forEach(stackItem => {
            processRoute(stackItem, newBasePath);
          });
        }
      };

      // Process all layers in the app
      const stack = app._router.stack;
      stack.forEach(layer => processRoute(layer));

      console.log(`Registered ${this.routes.length} routes in ${Object.keys(this.routeGroups).length} groups`);
    } catch (error) {
      console.error('Error registering routes:', error);
    }
  }

  /**
   * Determine if a route requires authentication
   * @private
   * @param {string} path - Route path
   * @returns {boolean} True if auth is required
   */
  _determineAuthRequired(path) {
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

    // Check for common authenticated route patterns
    const authPatterns = [
      '/users/',
      '/admin/',
      '/profile',
      '/portfolio',
      '/transactions',
      '/memecoins/create',
    ];

    return authPatterns.some(pattern => path.includes(pattern));
  }
}

// Create and export singleton instance
const registry = new RouteRegistry();
module.exports = registry;
