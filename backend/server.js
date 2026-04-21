// server.js — OneWater Pakistan Backend
// Entry point: Express app with security middleware and all API routes

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initDB } from './db.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { authMiddleware } from './middleware/auth.js';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Route imports — Public
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import contactRouter from './routes/contact.js';
import promoRouter from './routes/promo.js';
import eventsRouter from './routes/events.js';

// Route imports — Admin
import adminAuthRouter from './routes/admin/auth.js';
import adminOrdersRouter from './routes/admin/orders.js';
import adminStatsRouter from './routes/admin/stats.js';
import adminProductsRouter from './routes/admin/products.js';
import adminMessagesRouter from './routes/admin/messages.js';
import adminPromoCodesRouter from './routes/admin/promoCodes.js';
import adminSettingsRouter from './routes/admin/settings.js';

dotenv.config();

const app = express();

// ─────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────

// Helmet sets secure HTTP response headers
app.use(helmet());

// CORS — tightly scoped to the frontend origin
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  process.env.FRONTEND_URL, // Set in .env to your Vercel domain
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin '${origin}' is not allowed.`));
  },
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// General rate limiter applied to all routes
app.use(generalLimiter);

// Static files for uploaded screenshots
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    brand: 'OneWater Pakistan',
    timestamp: new Date().toISOString() 
  });
});

// ─────────────────────────────────────────────
// Public Routes (no auth required)
// ─────────────────────────────────────────────
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/promo', promoRouter);
app.use('/api/events', eventsRouter);

// ─────────────────────────────────────────────
// Admin Auth Route (no auth middleware — this IS the login)
// ─────────────────────────────────────────────
app.use('/api/admin', adminAuthRouter);

// ─────────────────────────────────────────────
// Protected Admin Routes (JWT required)
// ─────────────────────────────────────────────
app.use('/api/admin/orders', authMiddleware, adminOrdersRouter);
app.use('/api/admin/stats', authMiddleware, adminStatsRouter);
app.use('/api/admin/products', authMiddleware, adminProductsRouter);
app.use('/api/admin/messages', authMiddleware, adminMessagesRouter);
app.use('/api/admin/promo-codes', authMiddleware, adminPromoCodesRouter);
app.use('/api/admin/settings', authMiddleware, adminSettingsRouter);

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err.message);
  res.status(500).json({ error: 'InternalServerError', message: 'Something went wrong.' });
});

// 404 fallback for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'NotFound', message: `Route ${req.method} ${req.path} does not exist.` });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Auto-initialize database tables and seed data on startup
    await initDB();
    app.listen(PORT, () => {
      console.log(`\n🌊 OneWater Pakistan — Backend Server`);
      console.log(`   Running on: http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
