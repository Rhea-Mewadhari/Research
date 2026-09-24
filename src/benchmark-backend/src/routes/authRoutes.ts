import { Router } from 'express';
import { validate } from '../middleware/validate';
import { requireJwt } from '../middleware/requireJwt';
import { registerSchema, loginSchema } from '../schemas/authSchema';
import { register, login, me } from '../controllers/authController';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', requireJwt, me);

export default router;
