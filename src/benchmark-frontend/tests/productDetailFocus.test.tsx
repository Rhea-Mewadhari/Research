import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { products } from '../src/data/products';

// Override the default fetch mock to serve both the product list and the
// individual product detail endpoint. The default setup.ts mock returns the
// paginated list shape for every URL; the detail endpoint requires a single
// Product object to render correctly.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) => {
      if (typeof url === 'string' && /\/api\/products\/\d+/.test(url)) {
        return Promise.resolve({ ok: true, json: async () => products[0] });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: [...products],
          total: products.length,
          page: 1,
          limit: products.length,
          totalPages: 1,
        }),
      });
    }),
  );
});

describe('ProductDetailPanel — open and close', () => {
  it('clicking a product card opens the detail panel', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.click(screen.getByTestId('product-1'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('panel contains a close button', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));

    expect(screen.getByRole('button', { name: /close panel/i })).toBeInTheDocument();
  });

  it('clicking the close button closes the panel', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));

    await user.click(screen.getByRole('button', { name: /close panel/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('clicking the backdrop closes the panel', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));

    await user.click(document.querySelector('.detail-backdrop')!);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('panel shows product data after loading', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));

    // Product detail fetch resolves — panel renders product content
    await screen.findByRole('heading', { name: /wireless mouse/i });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
