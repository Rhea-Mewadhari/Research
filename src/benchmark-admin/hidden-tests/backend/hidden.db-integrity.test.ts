import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../../../benchmark-backend/src/app';
import { addFavourite, getFavourites } from '../../../benchmark-backend/src/services/favouritesService';

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
    // Behavioural, not structural: any implementation is valid (explicit
    // SELECT-then-check, DB foreign-key constraint, etc.) as long as it
    // (a) rejects a nonexistent product with a proper not-found error and
    // (b) never leaves a favourite row behind when it does.
    const before = getFavourites().length;
    let caught: unknown;
    try {
      addFavourite('99999');
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as { statusCode?: number }).statusCode).toBe(404);
    expect(getFavourites().length).toBe(before);
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
