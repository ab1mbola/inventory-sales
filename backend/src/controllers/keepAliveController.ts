import { Request, Response, NextFunction } from 'express';
import { pingAllDatabases } from '../services/keepAliveService';

export async function triggerKeepAlive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cronSecret = process.env.CRON_SECRET;
    
    // Determine authorization
    // 1. Check Authorization header: Bearer <secret>
    // 2. Check query param: ?token=<secret>
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token as string;
    
    let isAuthorized = false;
    
    if (cronSecret) {
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token === cronSecret) {
          isAuthorized = true;
        }
      }
      if (queryToken === cronSecret) {
        isAuthorized = true;
      }
    } else {
      // If CRON_SECRET is not configured, allow it ONLY in development for easier verification
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        isAuthorized = true;
        console.warn('WARNING: CRON_SECRET is not set. Allowing keep-alive trigger because NODE_ENV is development.');
      } else {
        res.status(500).json({ 
          error: 'Configuration Error', 
          message: 'CRON_SECRET environment variable is missing on the server.' 
        });
        return;
      }
    }
    
    if (!isAuthorized) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or missing CRON_SECRET token.' 
      });
      return;
    }
    
    console.log('Keep-alive database ping request received.');
    const results = await pingAllDatabases();
    
    const overallSuccess = results.development.success && results.production.success;
    
    res.status(overallSuccess ? 200 : 207).json({
      success: overallSuccess,
      results
    });
  } catch (error: any) {
    next(error);
  }
}
