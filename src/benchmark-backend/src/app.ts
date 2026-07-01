import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes';
import apiProductRoutes from './routes/apiProductRoutes';
import favouriteRoutes from './routes/favouriteRoutes';
import { requireAuth } from './middleware/auth';

const app = express();

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

export default app;
