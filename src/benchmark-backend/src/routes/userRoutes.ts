import { Router } from 'express';
import { requireJwt } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { userUpdateSchema } from '../schemas/userSchema';
import { updateMe } from '../controllers/userController';

const router = Router();

router.patch('/me', requireJwt, validate(userUpdateSchema), updateMe);

export default router;
