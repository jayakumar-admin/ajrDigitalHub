import { Request, Response } from 'express';
import { FirebaseService } from '../services/firebase.service';
import { query, isPostgresEnabled } from '../config/db';
import { BaseService } from '../core/base.service';

const firebaseService = new FirebaseService();

export const firebaseController = {
  async getStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const status = await firebaseService.getAppStatus(id);
      return res.json(status);
    } catch (err: any) {
      return res.status(err.message.includes('not configured') ? 404 : 500).json({ error: err.message });
    }
  },

  async getLogs(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const logs = await firebaseService.getFirebaseLogs(id);
      return res.json(logs);
    } catch (err: any) {
      return res.status(err.message.includes('not configured') ? 404 : 500).json({ error: err.message });
    }
  },

  async getAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const analytics = await firebaseService.getAnalytics(id);
      return res.json(analytics);
    } catch (err: any) {
      return res.status(err.message.includes('not configured') ? 404 : 500).json({ error: err.message });
    }
  },

  async getStorage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const storage = await firebaseService.getStorageUsage(id);
      return res.json(storage);
    } catch (err: any) {
      return res.status(err.message.includes('not configured') ? 404 : 500).json({ error: err.message });
    }
  },

  /**
   * GET /api/admin/apps/:id/firebase/billing
   * Returns real billing cost from Cloud Billing API using per-app projectId.
   */
  async getBilling(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const billing = await firebaseService.getBillingCost(id);
      return res.json(billing);
    } catch (err: any) {
      return res.status(err.message.includes('not configured') ? 404 : 500).json({ error: err.message });
    }
  },

  /**
   * GET /api/admin/apps/:id/firebase/realtime-analytics
   * Returns real Cloud Monitoring analytics history for the app's Firebase project.
   */
  async getRealtimeAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await firebaseService.getRealAnalyticsHistory(id);
      return res.json(data);
    } catch (err: any) {
      return res.status(err.message.includes('not configured') ? 404 : 500).json({ error: err.message });
    }
  },

  async saveConfig(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { projectId, apiKey, authDomain, storageBucket, appId, measurementId } = req.body;
      if (!projectId || !apiKey) {
        return res.status(400).json({ error: 'Project ID and API Key are required' });
      }

      // Validate app_id exists in apps table
      let appExists = false;
      if (isPostgresEnabled) {
        const appCheck = await query('SELECT 1 FROM apps WHERE id = $1', [id]);
        appExists = appCheck.rows.length > 0;
      } else {
        const appsService = new BaseService('apps');
        const app = await appsService.findOne(id);
        appExists = !!app;
      }

      if (!appExists) {
        return res.status(404).json({ error: `Application with ID ${id} does not exist` });
      }

      await firebaseService.saveFirebaseConfig(id, {
        projectId,
        apiKey,
        authDomain: authDomain || `${projectId}.firebaseapp.com`,
        storageBucket: storageBucket || `${projectId}.firebasestorage.app`,
        appId,
        measurementId: measurementId || ''
      });
      return res.json({ success: true, message: 'Firebase configuration saved successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async testConnection(req: Request, res: Response) {
    try {
      const { projectId, apiKey, authDomain, storageBucket, appId } = req.body;
      if (!projectId || !apiKey) {
        return res.status(400).json({ error: 'Project ID and API Key are required for connection test' });
      }
      const success = await firebaseService.testConnection({
        projectId,
        apiKey,
        authDomain: authDomain || '',
        storageBucket: storageBucket || '',
        appId: appId || ''
      });
      return res.json({ success });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  async liveLogs(req: Request, res: Response) {
    const { id } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send initial logs from the real API
    firebaseService.getFirebaseLogs(id).then(logs => {
      for (const log of logs.slice(0, 5)) {
        res.write(`data: ${JSON.stringify(log)}\n\n`);
      }
    }).catch(() => {
      // Non-fatal
    });

    // Keep SSE connection alive with heartbeats
    const intervalTimer = setInterval(async () => {
      try {
        const logs = await firebaseService.getFirebaseLogs(id);
        if (logs.length > 0) {
          // Send the most recent log as a live event
          const latestLog = logs[0];
          res.write(`data: ${JSON.stringify(latestLog)}\n\n`);
        }
      } catch {
        // Keep sending heartbeats even on error
        const fallback = {
          timestamp: new Date().toISOString(),
          severity: 'INFO',
          message: '[Firebase] Heartbeat - monitoring active'
        };
        res.write(`data: ${JSON.stringify(fallback)}\n\n`);
      }
    }, 5000);

    req.on('close', () => {
      clearInterval(intervalTimer);
      res.end();
    });
  }
};
