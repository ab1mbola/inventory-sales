import { Router } from 'express';
import { 
  updateProfile, 
  changePassword, 
  getCompanySettings, 
  updateCompanySettings 
} from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Profile routes (Any authenticated user)
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);

// Company routes (OWNER/MANAGER only)
router.get('/company', authenticate, authorize(['OWNER', 'MANAGER']), getCompanySettings);
router.put('/company', authenticate, authorize(['OWNER', 'MANAGER']), updateCompanySettings);

export default router;
