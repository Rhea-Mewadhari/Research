import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import ProductDetailPanel from '../src/components/ProductDetailPanel';
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

    // Product detail fetch resolves — panel renders product content (h2 in dialog)
    await screen.findByRole('heading', { name: /wireless mouse/i, level: 2 });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('ProductDetailPanel — focus management and accessibility', () => {
  it('focus moves to the close button when the panel opens (req 1)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /close panel/i }));
  });

  it('Tab on the last focusable element wraps focus to the first inside the panel (req 2)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));

    const dialog = document.querySelector('[role="dialog"]')!;
    const closeButton = screen.getByRole('button', { name: /close panel/i });

    expect(document.activeElement).toBe(closeButton);
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(closeButton);
  });

  it('Shift+Tab on the first focusable element wraps focus to the last inside the panel (req 3)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));

    const closeButton = screen.getByRole('button', { name: /close panel/i });
    expect(document.activeElement).toBe(closeButton);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(closeButton);
  });

  it('Escape key closes the panel even when focus is outside the panel (req 4)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));

    expect(screen.queryByRole('dialog')).toBeInTheDocument();

    document.body.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('focus returns to the previously-focused element when the panel closes (req 5)', async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <div>
        <button id="req5-trigger" type="button">Open Panel</button>
        <ProductDetailPanel productId={null} onClose={onClose} />
      </div>
    );

    const trigger = document.getElementById('req5-trigger') as HTMLElement;
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    rerender(
      <div>
        <button id="req5-trigger" type="button">Open Panel</button>
        <ProductDetailPanel productId="1" onClose={onClose} />
      </div>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    rerender(
      <div>
        <button id="req5-trigger" type="button">Open Panel</button>
        <ProductDetailPanel productId={null} onClose={onClose} />
      </div>
    );

    expect(document.activeElement).toBe(trigger);
  });

  it('Escape listener is removed when the panel closes — no listener leak (req 6)', async () => {
    const onClose = vi.fn();
    const { rerender } = render(<ProductDetailPanel productId="1" onClose={onClose} />);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<ProductDetailPanel productId={null} onClose={onClose} />);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('scroll lock is applied while the panel is open and cleared when it closes (req 10)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByTestId('product-1'));
    expect(document.body.style.overflow).toBe('hidden');

    await user.click(screen.getByRole('button', { name: /close panel/i }));
    expect(document.body.style.overflow).toBe('');
  });
});
