import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../../../benchmark-backend/src/app';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Hidden: favourites edge-case behaviour', () => {
  it('POST /api/favourites with a non-existent productId returns 404', async () => {
    const res = await request(app)
      .post('/api/favourites')
      .send({ productId: '99999' });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/favourites/:productId for a non-existent favourite returns 404', async () => {
    const res = await request(app).delete('/api/favourites/99999');
    expect(res.status).toBe(404);
  });
});

describe('Hidden: DB integrity structural checks', () => {
  it('client.ts enables foreign key enforcement', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../../db/client.ts'),
      'utf8'
    );
    expect(content).toMatch(/foreign_keys\s*=\s*ON/i);
  });

  it('favouritesService uses INSERT OR IGNORE for atomic upsert', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../../services/favouritesService.ts'),
      'utf8'
    );
    expect(content).toMatch(/INSERT OR IGNORE/i);
  });

  it('favouritesService validates product existence before inserting', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../../services/favouritesService.ts'),
      'utf8'
    );
    // Accept either an explicit app-level existence check (e.g. a
    // `productExists` helper) or reliance on the DB's own foreign-key
    // constraint — SQLite always enforces FK violations even under
    // INSERT OR IGNORE, so catching that constraint error and converting
    // it to a not-found error is an equally valid way to satisfy this.
    const hasExplicitCheck = content.includes('productExists');
    const hasForeignKeyEnforcement =
      /FOREIGNKEY/i.test(content) && /ProductNotFoundError/.test(content);
    expect(hasExplicitCheck || hasForeignKeyEnforcement).toBe(true);
  });

  it('removeFavourite uses result.changes > 0 — not > -1', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../../services/favouritesService.ts'),
      'utf8'
    );
    expect(content).not.toMatch(/changes\s*>\s*-1/);
    expect(content).toMatch(/changes\s*>\s*0/);
  });
});
