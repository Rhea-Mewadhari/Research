import { Router } from 'express';
import { register, login, me } from '../controllers/authController';
import { requireJwt } from '../middleware/requireJwt';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireJwt, me);

export default router;
