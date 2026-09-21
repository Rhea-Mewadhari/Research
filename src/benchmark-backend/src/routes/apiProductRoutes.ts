import { Router } from 'express';
import { getById } from '../controllers/productController';
import { compare } from '../controllers/compareController';
import { validate } from '../middleware/validate';
import { productIdSchema, compareQuerySchema } from '../schemas/productSchema';

const router = Router();

router.get('/compare', validate(compareQuerySchema), compare);
router.get('/:id', validate(productIdSchema), getById);

export default router;
