import { Router } from 'express';
import { list, add, remove } from '../controllers/favouriteController';
import { validate } from '../middleware/validate';
import { addFavouriteSchema } from '../schemas/favouriteSchema';

const router = Router();

router.get('/', list);
router.post('/', validate(addFavouriteSchema), add);
router.delete('/:productId', remove);

export default router;
