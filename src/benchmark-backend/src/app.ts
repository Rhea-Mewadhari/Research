import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes';
import { requireAuth } from './middleware/auth';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/products', requireAuth, productRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
