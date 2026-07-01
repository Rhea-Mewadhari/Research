import { Router } from 'express';
import { deleteFavourite, postFavourite } from '../controllers/favouritesController';

const router = Router();

router.post('/', postFavourite);
router.delete('/:id', deleteFavourite);

export default router;
