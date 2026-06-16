import express from 'express';
import cors from 'cors';
import marketplaceRoutes from './routes/marketplace.routes';
import saasRoutes from './routes/saas.routes';
import adminDataRoutes from './routes/admin-data.routes';
import { authController } from './controllers/auth.controller';
import { usageTracker } from './middlewares/usage';

const app = express();

app.use(cors());
app.use(express.json());
app.use(usageTracker);

// Auth
app.post('/api/auth/login', authController.login);
app.post('/api/admin/login', authController.login);

// Module Routes
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/admin/apps', saasRoutes);
app.use('/api/admin/data', adminDataRoutes);

// Dynamic Data Handler (The Dynamic Schema system requested)
import dynamicRoutes from './routes/dynamic.routes';
app.use('/api/dynamic', dynamicRoutes);

// Generic Aliases for Dynamic Collections
app.use('/api/settings', dynamicRoutes);
app.use('/api/menus', dynamicRoutes);
app.use('/api/categories', dynamicRoutes);
app.use('/api/pages', dynamicRoutes);
app.use('/api/testimonials', dynamicRoutes);
app.use('/api/admin/settings', dynamicRoutes);
app.use('/api/admin/menus', dynamicRoutes);
app.use('/api/admin/categories', dynamicRoutes);
app.use('/api/admin/pages', dynamicRoutes);

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'AJR Digital HUB Backend' }));

export default app;
