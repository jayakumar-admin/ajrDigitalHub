import { Request, Response, NextFunction } from 'express';
import { query } from '../db';
import { streamEmitter } from '../controllers/analytics.controller';
import { firestore } from '../config/firebase';

export const usageTracker = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (
    req.path.includes('.') || 
    req.path.startsWith('/_angular') || 
    req.path.startsWith('/media') || 
    req.path.startsWith('/assets') ||
    req.path.startsWith('/api/internal/log')
  ) {
    return next();
  }

  const startTime = Date.now();
  
  res.on('finish', async () => {
    const responseTime = Date.now() - startTime;
    const appId = req.headers['x-app-identifier'] as string || req.query['appId'] as string;
    
    // Only log if we have a valid UUID-like app_id, to avoid foreign key errors
    if (!appId || appId.length < 10) return;

    try {
      // 1. Insert into usage_logs
      await query(
        `INSERT INTO usage_logs (app_id, endpoint, hits, latency, status_code) VALUES ($1, $2, 1, $3, $4)`,
        [appId, req.path, responseTime, res.statusCode]
      );

      // 2. Broadcast to SSE Live Stream
      streamEmitter.emit(`log:${appId}`, {
        timestamp: new Date().toISOString(),
        method: req.method,
        endpoint: req.path,
        status: res.statusCode,
        latency: responseTime,
        type: res.statusCode >= 400 ? 'error' : 'success'
      });

      // 3. Sync to Firestore if active
      if (firestore) {
        const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await firestore.collection('edge_logs').doc(logId).set({
          id: logId,
          appId,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTime,
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Silent fail for usage log:', e);
    }
  });

  next();
};
