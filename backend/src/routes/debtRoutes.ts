import { Router } from 'express';
import { getDebtors, getCustomerDebtDetails, recordPayment } from '../controllers/debtController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getDebtors);
router.get('/:id', getCustomerDebtDetails);
router.post('/payment', recordPayment);

export default router;
