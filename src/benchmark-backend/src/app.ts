import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes';
import apiProductRoutes from './routes/apiProductRoutes';
import favouriteRoutes from './routes/favouriteRoutes';
import { requireAuth } from './middleware/auth';
import { requestId } from './middleware/requestId';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(requestId);
app.use(rateLimiter);
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/products', requireAuth, productRoutes);
app.use('/api/products', apiProductRoutes);
app.use('/api/favourites', favouriteRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export default app;
