/**
 * ZippyMCP Services Registry
 * Unified service management for all API tiers
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import service modules
const publicAPI = require('./public-api');
const premiumAPI = require('./premium-api');
const privateAPI = require('./private-api');

// Service registry
const services = {
  public: {
    router: publicAPI,
    basePath: '/api/public',
    tier: 'public',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50
    }
  },
  premium: {
    router: premiumAPI,
    basePath: '/api/premium',
    tier: 'premium',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200
    }
  },
  private: {
    router: privateAPI,
    basePath: '/api/private',
    tier: 'private',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000
    }
  }
};

/**
 * Create and configure the main application
 */
function createApp(config = {}) {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  }));

  // CORS configuration
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests from configured origins
      const allowedOrigins = config.allowedOrigins || [
        'https://your-domain.com',
        'http://localhost:3001',
        'https://localhost:3001'
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

  // Logging
  if (config.env !== 'test') {
    app.use(morgan('combined'));
  }

  // Body parsing
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Request ID middleware
  app.use((req, res, next) => {
    req.id = require('crypto').randomUUID();
    res.setHeader('X-Request-ID', req.id);
    next();
  });

  return app;
}

/**
 * Register all services with the application
 */
function registerServices(app, config = {}) {
  console.log('🔗 Registering ZippyMCP services...');

  // Health check endpoint (available to all)
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ZippyMCP',
      version: require('../../package.json').version,
      uptime: process.uptime()
    });
  });

  // API info endpoint
  app.get('/api', (req, res) => {
    res.json({
      name: 'ZippyMCP API',
      version: require('../../package.json').version,
      tiers: ['public', 'premium', 'private'],
      documentation: '/docs',
      status: 'operational'
    });
  });

  // Register each service
  Object.entries(services).forEach(([serviceName, service]) => {
    const fullPath = service.basePath;

    console.log(`   📡 Registering ${serviceName} API at ${fullPath}`);

    app.use(fullPath, service.router);

    // Add service info to request context
    app.use(fullPath, (req, res, next) => {
      req.zippyService = {
        name: serviceName,
        tier: service.tier,
        basePath: fullPath
      };
      next();
    });
  });

  console.log('✅ All services registered successfully');
}

/**
 * Start the server with all services
 */
async function startServer(port = 3000, config = {}) {
  const app = createApp(config);

  registerServices(app, config);

  return new Promise((resolve, reject) => {
    const server = app.listen(port, (error) => {
      if (error) {
        reject(error);
      } else {
        console.log(`🚀 ZippyMCP server running on port ${port}`);
        console.log(`📊 Service tiers available:`);
        console.log(`   🆓 Public API: http://localhost:${port}/api/public`);
        console.log(`   💎 Premium API: http://localhost:${port}/api/premium`);
        console.log(`   🔐 Private API: http://localhost:${port}/api/private`);
        console.log(`   💊 Health Check: http://localhost:${port}/health`);

        resolve(server);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  });
}

/**
 * Service discovery and health monitoring
 */
const ServiceMonitor = {
  /**
   * Get service health status
   */
  async getServiceHealth() {
    const health = {
      overall: 'healthy',
      services: {},
      timestamp: new Date().toISOString()
    };

    // Check each service
    Object.entries(services).forEach(([name, service]) => {
      health.services[name] = {
        status: 'operational',
        tier: service.tier,
        endpoints: Object.keys(service.router.stack || [])
      };
    });

    return health;
  },

  /**
   * Get service metrics
   */
  async getServiceMetrics(timeframe = '1h') {
    // In a real implementation, this would aggregate metrics from monitoring systems
    return {
      requests: {
        total: 0,
        byTier: {
          public: 0,
          premium: 0,
          private: 0
        }
      },
      responseTimes: {
        average: 0,
        p95: 0,
        p99: 0
      },
      errors: {
        total: 0,
        rate: 0
      }
    };
  }
};

/**
 * Middleware for service-specific features
 */
const ServiceMiddleware = {
  /**
   * Authentication middleware factory
   */
  createAuthMiddleware(tier) {
    return (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          error: 'Authentication required',
          tier
        });
      }

      // Verify token based on tier requirements
      // Implementation would vary based on authentication system

      req.auth = { tier, verified: true };
      next();
    };
  },

  /**
   * Request logging middleware
   */
  createLoggingMiddleware(serviceName) {
    return (req, res, next) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
      });

      next();
    };
  },

  /**
   * Rate limiting middleware factory
   */
  createRateLimiter(tier) {
    const limits = {
      public: { windowMs: 15 * 60 * 1000, max: 50 },
      premium: { windowMs: 15 * 60 * 1000, max: 200 },
      private: { windowMs: 15 * 60 * 1000, max: 1000 }
    };

    const rateLimit = require('express-rate-limit');
    return rateLimit(limits[tier]);
  }
};

// Export everything needed for ZippyMCP services
module.exports = {
  createApp,
  registerServices,
  startServer,
  services,
  ServiceMonitor,
  ServiceMiddleware
};
