// middleware/rateLimiter.js — OneWater Pakistan
// Keys on the real client IP; server.js sets `trust proxy` for Vercel → Render.
import rateLimit from 'express-rate-limit';

const make = (windowMinutes, max, message) => rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TooManyRequests', message },
});

export const generalLimiter = make(15, 300, 'Too many requests. Please try again in a few minutes.');
export const loginLimiter   = make(15, 10, 'Too many login attempts. Please try again after 15 minutes.');
export const orderLimiter   = make(15, 10, 'Too many orders from this connection. Please call or WhatsApp us.');
export const uploadLimiter  = make(15, 10, 'Too many uploads. Please try again in a few minutes.');
export const formLimiter    = make(15, 10, 'Too many submissions. Please try again later or WhatsApp us.');
export const trackLimiter   = make(15, 30, 'Too many lookups. Please try again in a few minutes.');
