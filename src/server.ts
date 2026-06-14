import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request, Response, NextFunction } from 'express';
import {join} from 'node:path';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';
import {
  dbInit,
  getInvoiceConfig,
  saveInvoiceConfig,
  getTestimonials,
  getAllTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getAppSettings,
  saveAppSettings,
  getApps,
  createApp,
  updateApp,
  deleteApp,
  getPlans,
  createPlan,
  updatePlan,
  getSubscriptions,
  subscribeApp,
  addUsageLog,
  getUsageLogsByApp,
  addWhatsappLog,
  getWhatsappLogsByApp,
  getHtmlTemplates,
  saveHtmlTemplate,
  publishHtmlTemplate,
  getAnalyticsOverview,
  getUserByUsername,
  getAllUsers,
  getAllProductsExtended,
  getAllOrdersExtended,
  getAllTicketsExtended,
  getAllKanbanTasksExtended,
  updateAnyTable,
  getProducts,
  createProduct,
  getOrdersByUser,
  createOrder,
  getTicketsByUser,
  getKanbanTasks,
  updateKanbanTaskStatus,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
  addCategory,
  getPages,
  getPageBySlug,
  savePage,
  getMarketplaceItems,
  getMarketplaceItemById,
  addMarketplaceItem,
  updateMarketplaceItem,
  deleteMarketplaceItem
} from './api/db';

const JWT_SECRET = process.env['JWT_SECRET'] || 'ajr-hub-secret-2026';

// Initialize Database connection when server module loads
dbInit();

const app = express();
const sysPath = process.cwd();
const browserDistFolder = join(sysPath, 'dist/app/browser');

app.use(express.json());

// -------------------------------------------------------------
// Core usage logging & plan enforcement middleware
// -------------------------------------------------------------
const usageTrackerAndPlanEnforcer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // If request is for static assets or angular internals, bypass tracking
  if (
    req.path.includes('.') || 
    req.path.startsWith('/_angular') || 
    req.path.startsWith('/media') || 
    req.path.startsWith('/assets')
  ) {
    next();
    return;
  }

  // Determine client app context from workspace custom headers or fallback query param
  const appIdHeader = req.headers['x-saas-api-key'] as string || req.headers['x-app-identifier'] as string;
  let appId = 1; // Default tenant ID

  if (appIdHeader) {
    if (!isNaN(Number(appIdHeader))) {
      appId = Number(appIdHeader);
    } else {
      // Find app by API key
      try {
        const allApps = await getApps();
        const matchedApp = allApps.find(a => a.api_key === appIdHeader);
        if (matchedApp) appId = matchedApp.id;
      } catch (e) {
        console.warn('Could not match API key:', e);
      }
    }
  } else if (req.query['appId']) {
    appId = Number(req.query['appId']);
  }

  // Enforce Plan Limits
  try {
    const allApps = await getApps();
    const currentApp = allApps.find(a => a.id === appId);
    if (currentApp) {
      if (!currentApp.active) {
        res.status(403).json({ error: 'This application is deactivated.', code: 'APP_DEACTIVATED' });
        return;
      }

      // Check current api requests counts against limit matching
      const analyticsInfo = await getAnalyticsOverview(appId, 30);
      const currentUsage = analyticsInfo.totalRequests;
      const apiLimit = currentApp.api_limit || 1000;

      if (currentUsage >= apiLimit) {
        res.status(403).json({ 
          error: 'API request limit exceeded for this subscription plan. Please upgrade.', 
          code: 'PLAN_LIMIT_EXCEEDED',
          usage: currentUsage,
          limit: apiLimit
        });
        return;
      }
    }
  } catch (err) {
    console.warn('Plan enforcement check error:', err);
  }

  // Capture Response Time & Log Usage
  const startTime = Date.now();
  res.on('finish', async () => {
    const responseTime = Date.now() - startTime;
    const deviceInfo = req.headers['user-agent'] || 'Unknown Browser';
    try {
      await addUsageLog(appId, req.path, req.method, res.statusCode, responseTime, deviceInfo);
    } catch (e) {
      console.error('Error adding usage logs:', e);
    }
  });

  next();
};

app.use(usageTrackerAndPlanEnforcer);

const angularApp = new AngularNodeAppEngine();

// -------------------------------------------------------------
// Invoice Configuration API Endpoints
// -------------------------------------------------------------

app.get('/api/shops/:shopId/invoice-config', async (req: Request, res: Response): Promise<void> => {
  try {
    const shopId = req.params['shopId'] as string;
    const config = await getInvoiceConfig(shopId);
    if (!config) {
      res.status(404).json({ error: 'Config not found' });
      return;
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/shops/:shopId/invoice-config', async (req: Request, res: Response): Promise<void> => {
  try {
    const shopId = req.params['shopId'] as string;
    const config = await saveInvoiceConfig(shopId, req.body);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// -------------------------------------------------------------
// Testimonials API Endpoints
// -------------------------------------------------------------

app.get('/api/testimonials', async (req: Request, res: Response) => {
  try {
    const testimonials = await getTestimonials();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

// -------------------------------------------------------------
// Authentication Middleware & Routes
// -------------------------------------------------------------
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Check if it's the hardcoded admin token for legacy compatibility (if needed)
    if (authHeader === 'Bearer admin-secret-token') {
      req.user = { id: 1, username: 'admin', role: 'admin' };
      return next();
    }
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded as AuthenticatedRequest['user'];
    return next();
  });
};

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await getUserByUsername(username);
    if (!user || user.password_hash !== password) { // Simple compare for this prototype
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await getUserByUsername(username);
    if (!user || user.password_hash !== password || user.role !== 'admin') {
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Legacy Admin routes protection
const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  authenticateToken(req, res, () => {
    if (req.user?.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Admin access required' });
    }
  });
};

// Admin-only Testimonials CRUD
app.get('/api/admin/testimonials', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const testimonials = await getAllTestimonials();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/testimonials', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const newDoc = await addTestimonial(req.body);
    res.json(newDoc);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/admin/testimonials/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const idStr = req.params['id'] as string;
    const updated = await updateTestimonial(parseInt(idStr), req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/admin/testimonials/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const idStr = req.params['id'] as string;
    await deleteTestimonial(parseInt(idStr));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// -------------------------------------------------------------
// App Settings API Endpoints
// -------------------------------------------------------------

app.get('/api/settings/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const keyStr = req.params['key'] as string;
    const value = await getAppSettings(keyStr);
    if (!value) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }
    res.json(value);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/admin/settings/:key', authenticateAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const keyStr = req.params['key'] as string;
    const updated = await saveAppSettings(keyStr, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// -------------------------------------------------------------
// SaaS Multi-Application API Endpoints
// -------------------------------------------------------------

app.get('/api/admin/apps', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const appsList = await getApps();
    res.json(appsList);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/apps', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const appData = await createApp(req.body);
    res.json(appData);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/admin/apps/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const idStr = req.params['id'] as string;
    const updated = await updateApp(parseInt(idStr), req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/admin/apps/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const idStr = req.params['id'] as string;
    await deleteApp(parseInt(idStr));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// -------------------------------------------------------------
// SaaS Plans API Endpoints
// -------------------------------------------------------------

app.get('/api/admin/plans', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const plansList = await getPlans();
    res.json(plansList);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/plans', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const planData = await createPlan(req.body);
    res.json(planData);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/admin/plans/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const idStr = req.params['id'] as string;
    const updated = await updatePlan(parseInt(idStr), req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// -------------------------------------------------------------
// SaaS Subscriptions API Endpoints
// -------------------------------------------------------------

app.get('/api/admin/subscriptions', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const list = await getSubscriptions();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/subscribe', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { appId, planId } = req.body;
    const sub = await subscribeApp(parseInt(appId), parseInt(planId));
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// -------------------------------------------------------------
// SaaS Analytics & Usage Logs API Endpoints
// -------------------------------------------------------------

app.get('/api/admin/analytics', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const appIdStr = req.query['appId'] as string;
    const appId = appIdStr ? parseInt(appIdStr) : undefined;
    const daysStr = req.query['daysRange'] as string;
    const daysRange = daysStr ? parseInt(daysStr) : 7;
    const stats = await getAnalyticsOverview(appId, daysRange);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/admin/apps/:appId/usage-logs', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const appIdStr = req.params['appId'] as string;
    const logs = await getUsageLogsByApp(parseInt(appIdStr));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/deploy-simulation', authenticateAdmin, async (req: Request, res: Response) => {
  const { appId } = req.body;
  // Simulate a delay for "deployment"
  setTimeout(() => {
    res.json({ success: true, message: `Application ${appId} successfully deployed to Cloud Hub Edge.` });
  }, 2000);
});

// -------------------------------------------------------------
// WhatsApp API Tracking Endpoints
// -------------------------------------------------------------

app.get('/api/admin/apps/:appId/whatsapp-logs', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const appIdStr = req.params['appId'] as string;
    const logs = await getWhatsappLogsByApp(parseInt(appIdStr));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/apps/:appId/whatsapp-logs', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const appIdStr = req.params['appId'] as string;
    const { messageType, status, estimatedCost, errorMessage } = req.body;
    const log = await addWhatsappLog(
      parseInt(appIdStr),
      messageType,
      status,
      parseFloat(estimatedCost || '0'),
      errorMessage || null
    );
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// -------------------------------------------------------------
// Marketplace API Endpoints
// -------------------------------------------------------------
app.get('/api/marketplace/products', async (req: Request, res: Response) => {
  try {
    const category = req.query['category'] as string;
    const search = req.query['search'] as string;
    const list = await getProducts(category, search);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/marketplace/purchase', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, amount } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const order = await createOrder({
      user_id: user.id,
      product_id: parseInt(productId),
      amount: parseFloat(amount),
      status: 'completed'
    });
    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

// -------------------------------------------------------------
// Client Dashboard API Endpoints
// -------------------------------------------------------------
app.get('/api/client/orders', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const list = await getOrdersByUser(user.id);
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/client/tickets', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const list = await getTicketsByUser(user.id);
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/client/kanban', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const list = await getKanbanTasks(user.id);
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/client/kanban/:id', authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const ok = await updateKanbanTaskStatus(parseInt(req.params['id'] as string), status);
    return res.json({ success: ok });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

// -------------------------------------------------------------
// Seller Portal API Endpoints
// -------------------------------------------------------------
app.post('/api/seller/products', authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== 'seller' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Seller privileges required' });
    }
    const product = await createProduct({
      ...req.body,
      seller_id: user.id
    });
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

// -------------------------------------------------------------
// Invoice PDF Generation
// -------------------------------------------------------------
app.get('/api/invoices/:id/pdf', async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params['id'];
    // In a real app we'd fetch the order/invoice details here
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Add content
    doc.fillColor('#444444').fontSize(20).text('AJR DIGITAL HUB - INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Invoice Number: INV-${invoiceId}`, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();
    
    doc.text('Bill To:', { underline: true });
    doc.text('Client Name');
    doc.text('Client Address Line 1');
    doc.moveDown();

    // Table Header
    const tableTop = 250;
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Quantity', 250, tableTop);
    doc.text('Price', 350, tableTop);
    doc.text('Total', 450, tableTop);
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    
    // Table Row
    doc.font('Helvetica');
    doc.text('Professional Web Development Services', 50, tableTop + 25);
    doc.text('1', 250, tableTop + 25);
    doc.text('$2,500.00', 350, tableTop + 25);
    doc.text('$2,500.00', 450, tableTop + 25);

    doc.moveTo(50, tableTop + 45).lineTo(550, tableTop + 45).stroke();
    
    // Footer Total
    doc.moveDown(5);
    doc.fontSize(14).font('Helvetica-Bold').text('Grand Total: $2,500.00', { align: 'right' });

    doc.end();
  } catch (_err) {
    res.status(500).send('Error generating PDF');
  }
});

// -------------------------------------------------------------
// Admin Master Data Explorer Endpoint
// -------------------------------------------------------------
app.get('/api/admin/data/:table', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const table = req.params['table'] as string;
    let data = [];
    switch (table) {
      case 'users':
        data = await getAllUsers();
        break;
      case 'products':
        data = await getAllProductsExtended();
        break;
      case 'orders':
        data = await getAllOrdersExtended();
        break;
      case 'tickets':
        data = await getAllTicketsExtended();
        break;
      case 'kanban_tasks':
        data = await getAllKanbanTasksExtended();
        break;
      case 'subscriptions':
        data = await getSubscriptions();
        break;
      case 'menu_items':
        data = await getMenuItems();
        break;
      case 'categories':
        data = await getCategories();
        break;
      default:
        res.status(400).json({ error: 'Invalid table requested' });
        return;
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/admin/data/:table/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const table = req.params['table'] as string;
    const id = parseInt(req.params['id'] as string);
    const updated = await updateAnyTable(table, id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/admin/settings', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await getAppSettings('system_settings');
    res.json(settings || { 
      maintenance_mode: false, 
      registration_enabled: true, 
      global_api_limit: 100000,
      notification_webhook: '' 
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/settings', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await saveAppSettings('system_settings', req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// -------------------------------------------------------------
// Live HTML Builder Templates Endpoints
// -------------------------------------------------------------

app.get('/api/admin/apps/:appId/html-templates', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const appIdStr = req.params['appId'] as string;
    const list = await getHtmlTemplates(parseInt(appIdStr));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/apps/:appId/html-templates', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const appIdStr = req.params['appId'] as string;
    const { id, name, htmlContent, cssContent } = req.body;
    const templ = await saveHtmlTemplate(
      parseInt(appIdStr),
      id ? parseInt(id) : 0,
      name,
      htmlContent,
      cssContent || ''
    );
    res.json(templ);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/apps/:appId/html-templates/:id/publish', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const idStr = req.params['id'] as string;
    const appIdStr = req.params['appId'] as string;
    const ok = await publishHtmlTemplate(parseInt(idStr), parseInt(appIdStr));
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});


// -------------------------------------------------------------
// Core Upgrade: Global Menus, Categories and Custom Pages Routes
// -------------------------------------------------------------

// --- Menus ---
app.get('/api/menus', async (req: Request, res: Response) => {
  try {
    const list = await getMenuItems();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/menus', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const item = await addMenuItem(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/admin/menus/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);
    const updated = await updateMenuItem(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/admin/menus/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);
    const ok = await deleteMenuItem(id);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// --- Categories ---
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const list = await getCategories();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/categories', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const cat = await addCategory(req.body);
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// --- Custom Pages ---
app.get('/api/pages/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params['slug'] as string;
    const page = await getPageBySlug(slug);
    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/settings/pages', async (req: Request, res: Response) => {
  try {
    const pages = await getPages();
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/admin/pages', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const page = await savePage(req.body);
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/admin/marketplace-items', async (req: Request, res: Response) => {
  try {
    const items = await getMarketplaceItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.get('/api/marketplace-items/:id', async (req: Request, res: Response) => {
  try {
    const item = await getMarketplaceItemById(Number(req.params['id']));
    if (!item) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

app.post('/api/admin/marketplace-items', async (req: Request, res: Response) => {
  try {
    const item = await addMarketplaceItem(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item' });
  }
});

app.put('/api/admin/marketplace-items/:id', async (req: Request, res: Response) => {
  try {
    const item = await updateMarketplaceItem(Number(req.params['id']), req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/api/admin/marketplace-items/:id', async (req: Request, res: Response) => {
  try {
    await deleteMarketplaceItem(Number(req.params['id']));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});


/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
