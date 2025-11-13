const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { body, validationResult, param, query } = require('express-validator');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const compression = require('compression');
const winston = require('winston');
const morgan = require('morgan');

// Configure Winston Logger for Security Events
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sanjana-security' },
  transports: [
    new winston.transports.File({ filename: 'logs/security-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Rate Limiting Configuration
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    skipSuccessfulRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      securityLogger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

const strictLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many attempts from this IP, please try again later.',
  true
);

const orderLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 orders per hour
  'Too many orders from this IP, please try again later.'
);

// Slow down repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 50
  maxDelayMs: 20000, // maximum delay of 20 seconds
});

// Input Validation Rules
const validateCustomerInfo = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must be 2-50 characters and contain only letters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name must be 2-50 characters and contain only letters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('mobile')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian mobile number'),
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be 10-200 characters long'),
  body('pincode')
    .isPostalCode('IN')
    .withMessage('Please provide a valid Indian pincode'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('City must be 2-50 characters and contain only letters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('State must be 2-50 characters and contain only letters'),
  body('country')
    .trim()
    .equals('India')
    .withMessage('Country must be India')
];

const validateProductId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer')
];

const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Search term contains invalid characters'),
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Category contains invalid characters'),
  query('sort')
    .optional()
    .isIn(['price-low', 'price-high', 'name-asc', 'name-desc', 'newest'])
    .withMessage('Invalid sort parameter')
];

// Validation Error Handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    securityLogger.warn('Validation failed', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      errors: errors.array()
    });
    return res.status(400).json({
      error: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

// XSS Protection Middleware
const xssProtection = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  if (req.query) {
    for (let key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    }
  }
  next();
};

// Security Headers Configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdnjs.cloudflare.com",
        "https://fonts.googleapis.com"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://cdn.socket.io"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:",
        "http:"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      connectSrc: [
        "'self'",
        "https:",
        "http:",
        "wss:",
        "ws:",
        "ws://localhost:3000",
        "ws://localhost:*",
        "wss://localhost:*"
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' }
});

// IP Whitelist for Admin Operations (if needed)
const ipWhitelist = process.env.ADMIN_IPS ? process.env.ADMIN_IPS.split(',') : [];

const checkIPWhitelist = (req, res, next) => {
  if (ipWhitelist.length > 0 && !ipWhitelist.includes(req.ip)) {
    securityLogger.error('Unauthorized IP access attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl
    });
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

// Suspicious Activity Detection
const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /(\<script\>|\<\/script\>)/gi,
    /(union\s+select|drop\s+table|delete\s+from)/gi,
    /(\.\.\/|\.\.\\)/g,
    /(\bor\b|\band\b)\s*\d+\s*=\s*\d+/gi
  ];
  
  const checkString = JSON.stringify(req.body) + JSON.stringify(req.query) + req.url;
  
  for (let pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      securityLogger.error('Suspicious activity detected', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        query: req.query,
        pattern: pattern.toString()
      });
      return res.status(403).json({ error: 'Suspicious activity detected' });
    }
  }
  next();
};

// Request Logging
const requestLogger = morgan('combined', {
  stream: {
    write: (message) => securityLogger.info(message.trim())
  }
});

// Error Handler for Security Issues
const securityErrorHandler = (err, req, res, next) => {
  securityLogger.error('Security error occurred', {
    error: err.message,
    stack: err.stack,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method
  });
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  securityHeaders,
  generalLimiter,
  strictLimiter,
  orderLimiter,
  speedLimiter,
  validateCustomerInfo,
  validateProductId,
  validateSearch,
  handleValidationErrors,
  xssProtection,
  mongoSanitize: mongoSanitize(),
  hpp: hpp(),
  compression: compression(),
  checkIPWhitelist,
  detectSuspiciousActivity,
  requestLogger,
  securityErrorHandler,
  securityLogger
};
