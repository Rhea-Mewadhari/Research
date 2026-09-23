import { Router } from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController';
import { requireJwt } from '../middleware/requireJwt';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', requireJwt, getMe);

export default router;
