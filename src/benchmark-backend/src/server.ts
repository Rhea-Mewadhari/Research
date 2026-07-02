import app from './app';
import { runMigrations } from './db/migrate';
import { seed } from './db/seed';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

async function start(): Promise<void> {
  runMigrations();
  await seed();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch(console.error);
