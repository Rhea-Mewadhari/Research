import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { vi } from 'vitest';
import request from 'supertest';
import app from '../../../benchmark-backend/src/app';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Distinct far-future epochs for each behavioural test so prior-test timestamps
// are always outside the 60-second window (10 000 000 seconds ≈ 115 days apart).
const T_HEALTH = 1_800_000_000_000;  // /health exemption test epoch
const T_PRUNE  = 1_810_000_000_000;  // pruning test epoch  (T_HEALTH + 10 000 000 s)
const T_RETRY  = 1_820_000_000_000;  // Retry-After test epoch (T_PRUNE + 10 000 000 s)

beforeAll(() => {
  // Only fake Date — leave timers/microtasks real so async request handling works.
  vi.useFakeTimers({ toFake: ['Date'] });
});

afterAll(() => {
  vi.useRealTimers();
});

// ─── Structural checks ────────────────────────────────────────────────────────

describe('Hidden: rate limiter structural checks', () => {
  it('rateLimiter.ts prunes expired timestamps on each request', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../../middleware/rateLimiter.ts'),
      'utf8'
    );
    // Must have a .filter( call that removes old entries from the array
    expect(content).toMatch(/\.filter\(/);
  });

  it('rateLimiter.ts exempts /health with a correctly formed path string', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../../middleware/rateLimiter.ts'),
      'utf8'
    );
    // Must contain '/health' (with the leading slash)
    expect(content).toMatch(/['"]\/health['"]/);
    // Must NOT compare against the bare string 'health' (without slash)
    expect(content).not.toMatch(/===\s*['"]health['"]/);
  });

  it('rateLimiter.ts computes Retry-After dynamically, not as a hardcoded constant', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../../middleware/rateLimiter.ts'),
      'utf8'
    );
    // The bug pattern: `retryAfter = 60`
    expect(content).not.toMatch(/retryAfter\s*=\s*60[^0-9_]/);
    // The fix requires arithmetic on timestamp data
    expect(content).toMatch(/WINDOW_MS\s*-\s*now|now\s*-\s*oldest|oldest\s*\+\s*WINDOW_MS/);
  });
});

// ─── Behavioural checks ───────────────────────────────────────────────────────

describe('Hidden: /health is exempt from rate limiting', () => {
  it('/health returns 200 even after the rate limit is exhausted', async () => {
    vi.setSystemTime(T_HEALTH);

    // Exhaust the rate limit on a non-exempt endpoint
    for (let i = 0; i < 10; i++) {
      await request(app).get('/api/products/compare?ids=1,2');
    }

    // /health must bypass the rate limiter regardless of how many prior requests
    // were made — if the path check is wrong ('health' vs '/health') this is 429.
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});

describe('Hidden: expired timestamps are pruned so the window resets', () => {
  it('a request succeeds after the window has expired', async () => {
    // T_PRUNE is 10 000 000 s after T_HEALTH, so the 10 timestamps written at
    // T_HEALTH are well outside the 60-second window from T_PRUNE's perspective.
    // With pruning: those entries are removed → count = 0 → request succeeds.
    // Without pruning: those entries remain → count ≥ MAX_REQUESTS → 429.
    vi.setSystemTime(T_PRUNE);

    const res = await request(app).get('/api/products/compare?ids=1,2');
    expect(res.status).not.toBe(429);
  });
});

describe('Hidden: Retry-After reflects actual seconds until window resets', () => {
  it('Retry-After is less than 60 when the oldest in-window request is recent', async () => {
    vi.setSystemTime(T_RETRY);

    // Fill the limit — all 10 timestamps land at T_RETRY
    for (let i = 0; i < 10; i++) {
      await request(app).get('/api/products/compare?ids=1,2');
    }

    // Advance 30 seconds into the window — the oldest entry is now 30 s old,
    // so the correct Retry-After is ceil((T_RETRY + 60 000 - (T_RETRY + 30 000)) / 1000) = 30.
    // If hardcoded the value would always be 60.
    vi.setSystemTime(T_RETRY + 30_000);

    const res = await request(app).get('/api/products/compare?ids=1,2');
    expect(res.status).toBe(429);

    const retryAfter = Number(res.headers['retry-after']);
    expect(retryAfter).toBeGreaterThanOrEqual(1);
    expect(retryAfter).toBeLessThan(60); // hardcoded bug would produce exactly 60
    expect(retryAfter).toBeLessThanOrEqual(35); // correct value ≈ 30, allow slight variance
  });
});
