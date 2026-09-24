import { Router } from 'express';
import { requireJwt } from '../middleware/requireJwt';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../schemas/userSchema';
import { updateMe } from '../controllers/userController';

const router = Router();

router.patch('/me', requireJwt, validate(updateUserSchema), updateMe);

export default router;
