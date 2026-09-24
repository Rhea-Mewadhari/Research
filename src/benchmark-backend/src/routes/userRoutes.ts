import { Router } from 'express';
import { patchMeHandler } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { requireJwt } from '../middleware/requireJwt';
import { patchMeSchema } from '../schemas/userSchema';

const router = Router();

router.patch('/me', requireJwt, validate(patchMeSchema), patchMeHandler);

export default router;
