import { Router } from 'express';
import { updateMeHandler } from '../controllers/userController';
import { requireJwt } from '../middleware/requireJwt';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../schemas/userSchema';

const router = Router();

router.patch('/me', requireJwt, validate(updateUserSchema), updateMeHandler);

export default router;
