import { Router } from 'express';
import { getDebtors, getCustomerDebtDetails, recordPayment } from '../controllers/debtController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getDebtors);
router.get('/:id', getCustomerDebtDetails);
router.post('/payment', recordPayment);

export default router;
