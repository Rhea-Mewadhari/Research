import { Router } from 'express';
import { validate } from '../middleware/validate';
import { requireJwt } from '../middleware/requireJwt';
import { registerSchema, loginSchema } from '../schemas/authSchema';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', requireJwt, authController.me);

export default router;
