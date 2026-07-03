import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// Bug: /:id is registered before /compare.
// Express matches GET /api/products/compare as a product-by-id request with
// req.params.id === 'compare'. getById calls getProductById('compare'), gets null,
// and responds 404. The compare endpoint is unreachable.
write(
  path.join(repoRoot, 'src', 'routes', 'apiProductRoutes.ts'),
  `import { Router } from 'express';
import { getById } from '../controllers/productController';
import { compare } from '../controllers/compareController';
import { validate } from '../middleware/validate';
import { productIdSchema, compareQuerySchema } from '../schemas/productSchema';

const router = Router();

router.get('/:id', validate(productIdSchema), getById);
router.get('/compare', validate(compareQuerySchema), compare);

export default router;
`
);

console.log('Route order bug injected successfully.');
