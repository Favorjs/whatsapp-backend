// const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
// const { RateLimiterPostgres } = require('rate-limiter-flexible');
// const sequelize = require('../config/database');

// HTTP security headers
exports.secureHeaders = helmet();

// // API rate limiting
// exports.apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes (or increase to 1 hour)
//   max: 10000, // Allow 10,000 requests per 15 mins (instead of 1000)
//   message: 'Too many requests, please try again later',
// });
// // WhatsApp-specific rate limiting
// exports.whatsappLimiter = new RateLimiterPostgres({
//   storeClient: sequelize,
//   points: 10000, // 10,000 requests per hour (instead of 1000)
//   duration: 60 * 60, // Per hour
//   keyPrefix: 'whatsapp_limit',
//   tableName: 'rate_limiting',
//   blockDuration: 0, // No blocking (or set to a few seconds if needed)
// });


// Replace the existing exports with no-op (dummy) middlewares
exports.apiLimiter = (req, res, next) => next(); // No rate limiting
exports.whatsappLimiter = (req, res, next) => next(); // No rate limiting