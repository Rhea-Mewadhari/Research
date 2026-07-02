import { Router } from 'express';
import { getById } from '../controllers/productController';
import { compare } from '../controllers/compareController';
import { validate } from '../middleware/validate';
import { productIdSchema, compareQuerySchema } from '../schemas/productSchema';

const router = Router();

// /compare must be registered before /:id — otherwise Express treats
// the literal string 'compare' as a value for the :id param.
router.get('/compare', validate(compareQuerySchema), compare);
router.get('/:id', validate(productIdSchema), getById);

export default router;
