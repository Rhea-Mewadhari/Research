import { vi, beforeAll, afterEach } from 'vitest';
import { runMigrations } from '../src/db/migrate';
import { seed } from '../src/db/seed';

// Initialize the in-memory test database once before this suite's tests run.
// The DB is a module-level singleton (client.ts), so this runs once per
// worker process — subsequent test files in the same worker reuse the seeded data.
beforeAll(async () => {
  runMigrations();
  await seed();
});

afterEach(() => {
  vi.unstubAllGlobals();
});
