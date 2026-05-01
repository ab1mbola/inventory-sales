import { Router } from 'express';
import { getReportStats } from '../controllers/reportController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', authenticate, getReportStats);

export default router;
