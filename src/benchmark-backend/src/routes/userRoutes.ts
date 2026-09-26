import { Router } from 'express';
import { validate } from '../middleware/validate';
import { requireJwt } from '../middleware/requireJwt';
import { patchMeSchema } from '../schemas/userSchema';
import * as userController from '../controllers/userController';

const router = Router();

router.patch('/me', requireJwt, validate(patchMeSchema), userController.patchMe);

export default router;
