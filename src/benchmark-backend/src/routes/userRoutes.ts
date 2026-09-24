import { Router } from 'express';
import { patchMe } from '../controllers/authController';
import { requireJwt } from '../middleware/requireJwt';

const router = Router();

router.patch('/me', requireJwt, patchMe);

export default router;
