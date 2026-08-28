import { Router } from 'express';
import { getSales, createSale } from '../controllers/saleController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getSales);
router.post('/', createSale);

export default router;
