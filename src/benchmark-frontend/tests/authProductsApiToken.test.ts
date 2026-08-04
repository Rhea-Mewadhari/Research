import { vi } from 'vitest';
import { fetchProducts } from '../src/api/productsApi';

function mockOkFetch() {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
  });
}

describe('productsApi — attaches auth header', () => {
  it('attaches the stored JWT as the Authorization header when one is present', async () => {
    localStorage.setItem('auth_token', 'stored.jwt.token');
    const fetchMock = mockOkFetch();
    vi.stubGlobal('fetch', fetchMock);

    await fetchProducts(1);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer stored.jwt.token');
  });

  it('falls back to the existing benchmark token when no JWT is stored', async () => {
    const fetchMock = mockOkFetch();
    vi.stubGlobal('fetch', fetchMock);

    await fetchProducts(1);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer benchmark-token-2024');
  });
});
