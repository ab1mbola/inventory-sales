import { Router } from 'express';
import { triggerKeepAlive } from '../controllers/keepAliveController.js';

const router = Router();

// GET /api/cron/keep-alive
router.get('/keep-alive', triggerKeepAlive);

export default router;
