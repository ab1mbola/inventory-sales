import { Router } from 'express';
import { getReportStats } from '../controllers/reportController';

const router = Router();

router.get('/stats', getReportStats);

export default router;
