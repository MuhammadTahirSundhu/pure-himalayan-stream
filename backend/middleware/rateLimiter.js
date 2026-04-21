// middleware/rateLimiter.js — OneWater Pakistan
// Rate limiting configs using express-rate-limit

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter — 120 requests per 15 minutes per IP.
 * Applied to all routes.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Strict limiter for admin login — 10 attempts per 15 minutes per IP.
 * Prevents brute-force attacks on the admin password.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

/**
 * Order submission limiter — max 20 orders per 15 minutes per IP.
 * Prevents order spam.
 */
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many order submissions. Please slow down.',
  },
});
