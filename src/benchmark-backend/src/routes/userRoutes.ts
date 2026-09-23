import { Router } from 'express';
import { updateProfile } from '../controllers/userController';
import { requireJwt } from '../middleware/requireJwt';

const router = Router();

router.patch('/me', requireJwt, updateProfile);

export default router;
