import { Router } from 'express';
import { register, login, me } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { requireJwt } from '../middleware/auth';
import { registerSchema, loginSchema } from '../schemas/authSchema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', requireJwt, me);

export default router;
