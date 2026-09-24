import { Router } from 'express';
import { requireJwt } from '../middleware/requireJwt';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../schemas/userSchema';
import { patchMe } from '../controllers/authController';

const router = Router();

router.patch('/me', requireJwt, validate(updateUserSchema), patchMe);

export default router;
