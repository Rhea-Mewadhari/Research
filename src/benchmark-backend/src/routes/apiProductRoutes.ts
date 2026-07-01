import { Router } from 'express';
import { getCompareProducts, getProductDetail } from '../controllers/productController';

const router = Router();

// /compare must come before /:id so the literal string isn't caught as an id param
router.get('/compare', getCompareProducts);
router.get('/:id', getProductDetail);

export default router;
