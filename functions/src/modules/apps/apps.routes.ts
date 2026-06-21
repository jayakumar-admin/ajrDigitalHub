import { Router } from 'express';
import { saasController } from '../../controllers/saas.controller';
import { analyticsController } from '../../controllers/analytics.controller';
import { firebaseController } from '../../controllers/firebase.controller';
import { authenticate, authorizeAdmin, optionalAuth } from '../../middlewares/auth.middleware';

const router = Router();

// ── Streaming endpoints (SSE) - bypass strict auth ─────────────────────────
// Native EventSource does not easily send Authorization headers in browsers
router.get('/:id/live-stream', optionalAuth, analyticsController.liveStream);
router.get('/:id/firebase/live-logs', optionalAuth, firebaseController.liveLogs);

// ── All other routes require authentication ─────────────────────────────────
router.use(authenticate, authorizeAdmin);

// Apps - list & create
router.get('/', saasController.getApps);
router.post('/provision', saasController.createApp);

// Configs
router.put('/:id/config', saasController.updateConfig);
router.put('/:id/rate-limit', saasController.updateRateLimit);
router.post('/:id/whatsapp-config', saasController.updateWhatsappConfig);
router.post('/:id/email-config', saasController.updateEmailConfig);
router.post('/:id/firebase-config', firebaseController.saveConfig);
router.post('/:id/firebase/test-connection', firebaseController.testConnection);

// Services & Monitoring
router.post('/:id/services/toggle', saasController.toggleService);
router.get('/:id/status', saasController.getStatus);

// Analytics
router.get('/:id/analytics', analyticsController.getAnalytics);
router.post('/:id/firebase-sync', saasController.syncToFirebase);

// ── Firebase Monitoring Integration ─────────────────────────────────────────
// IMPORTANT: All /:id/firebase/* routes MUST be registered BEFORE /:id catch-all
router.get('/:id/firebase/status', firebaseController.getStatus);
router.get('/:id/firebase/logs', firebaseController.getLogs);
router.get('/:id/firebase/analytics', firebaseController.getAnalytics);
router.get('/:id/firebase/storage', firebaseController.getStorage);
router.get('/:id/firebase/billing', firebaseController.getBilling);
router.get('/:id/firebase/realtime-analytics', firebaseController.getRealtimeAnalytics);

// !! /:id catch-all MUST come LAST - after all sub-routes !!
router.get('/:id', saasController.getAppById);

export default router;
