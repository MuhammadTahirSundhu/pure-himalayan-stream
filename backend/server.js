// server.js — OneWater Pakistan API
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { initDB } from './db.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { authMiddleware } from './middleware/auth.js';

// Public routes
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import contactRouter from './routes/contact.js';
import promoRouter from './routes/promo.js';
import eventsRouter from './routes/events.js';
import clientsRouter from './routes/clients.js';
import offersRouter from './routes/offers.js';
import settingsRouter from './routes/settings.js';
import waitlistRouter from './routes/waitlist.js';

// Admin routes
import adminAuthRouter from './routes/admin/auth.js';
import adminOrdersRouter from './routes/admin/orders.js';
import adminStatsRouter from './routes/admin/stats.js';
import adminProductsRouter from './routes/admin/products.js';
import adminMessagesRouter from './routes/admin/messages.js';
import adminPromoCodesRouter from './routes/admin/promoCodes.js';
import adminSettingsRouter from './routes/admin/settings.js';
import adminClientsRouter from './routes/admin/clients.js';
import adminOffersRouter from './routes/admin/offers.js';
import adminInquiriesRouter from './routes/admin/inquiries.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be set and at least 32 characters.');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');

// Requests arrive via Vercel's rewrite and then Render's proxy. Trusting those
// hops lets rate limits key on the real visitor IP instead of the proxy's.
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 2));

app.use(helmet());

const allowedOrigins = new Set([
  'https://www.onewaterpakistan.com',
  'https://onewaterpakistan.com',
  ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:8080', 'http://localhost:5173']),
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((s) => s.trim()) : []),
]);
// Disallowed origins simply get no CORS headers (the browser blocks them).
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin)) }));

app.use(express.json({ limit: '100kb' }));
app.use(generalLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/promo', promoRouter);
app.use('/api/events', eventsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/waitlist', waitlistRouter);

app.use('/api/admin', adminAuthRouter); // POST /api/admin/login (public)
app.use('/api/admin/orders', authMiddleware, adminOrdersRouter);
app.use('/api/admin/stats', authMiddleware, adminStatsRouter);
app.use('/api/admin/products', authMiddleware, adminProductsRouter);
app.use('/api/admin/messages', authMiddleware, adminMessagesRouter);
app.use('/api/admin/promo-codes', authMiddleware, adminPromoCodesRouter);
app.use('/api/admin/settings', authMiddleware, adminSettingsRouter);
app.use('/api/admin/clients', authMiddleware, adminClientsRouter);
app.use('/api/admin/offers', authMiddleware, adminOffersRouter);
app.use('/api/admin/inquiries', authMiddleware, adminInquiriesRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'NotFound', message: 'This API route does not exist.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'That file is too large.' : 'Invalid file upload.';
    return res.status(400).json({ error: 'InvalidFile', message });
  }
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'TooLarge', message: 'Request is too large.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'BadJSON', message: 'Malformed request.' });
  if (err.expose && err.status) return res.status(err.status).json({ error: err.code || 'Error', message: err.message });
  console.error(`[server] ${req.method} ${req.originalUrl} failed:`, err);
  res.status(500).json({ error: 'ServerError', message: 'Something went wrong on our side. Please try again or WhatsApp us.' });
});

process.on('unhandledRejection', (reason) => console.error('[server] Unhandled rejection:', reason));

const PORT = process.env.PORT || 5000;
try {
  await initDB();
  app.listen(PORT, () => console.log(`🌊 OneWater API on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`));
} catch (err) {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
}
