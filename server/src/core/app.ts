import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from '../modules/auth/auth.routes';
import dynamicRoutes from '../modules/dynamic/dynamic.routes';
import logsRoutes from '../modules/logs/logs.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import appsRoutes from '../modules/apps/apps.routes';
import uploadRoutes from '../modules/upload/upload.routes';
import marketplaceRoutes from '../modules/marketplace/marketplace.routes';
import settingsRoutes from '../modules/settings/settings.routes';
import shopsRoutes from '../modules/shops/shops.routes';
import { BaseService } from './base.service';

const app = express();
const logService = new BaseService('logs');

// Middlewares
app.use(helmet({ 
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Request Logging Middleware
app.use(async (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logService.create({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      response_time: duration,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }).catch(e => console.error('Auto-Log Error:', e));
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/admin/marketplace', marketplaceRoutes);
app.use('/api/admin/marketplace-items', marketplaceRoutes);
app.use('/api/marketplace-items', marketplaceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/apps', appsRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/shops', shopsRoutes);
app.use('/api/dynamic', dynamicRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/internal/log', logsRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Shared aliases
app.use('/api', dynamicRoutes);

app.get('/health', (req, res) => res.json({ status: 'UP', timestamp: new Date(), env: process.env['NODE_ENV'] }));

export default app;
