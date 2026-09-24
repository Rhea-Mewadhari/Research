import { Router } from 'express';
import { registerHandler, loginHandler, meHandler } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { requireJwt } from '../middleware/requireJwt';
import { registerSchema, loginSchema } from '../schemas/authSchema';

const router = Router();

router.post('/register', validate(registerSchema), registerHandler);
router.post('/login', validate(loginSchema), loginHandler);
router.get('/me', requireJwt, meHandler);

export default router;
