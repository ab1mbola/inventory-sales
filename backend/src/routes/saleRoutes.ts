import { Router } from 'express';
import { getSales, createSale } from '../controllers/saleController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getSales);
router.post('/', createSale);

export default router;
