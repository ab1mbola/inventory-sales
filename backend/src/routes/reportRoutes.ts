import { Router } from 'express';
import { getReportStats } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/stats', authenticate, getReportStats);

export default router;
