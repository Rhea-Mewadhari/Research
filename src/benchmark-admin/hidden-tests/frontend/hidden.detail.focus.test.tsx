import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../benchmark-frontend/src/App';
import { products } from '../../../benchmark-frontend/src/data/products';

// Serve a valid product shape for the detail endpoint so the panel can render
// without crashing on product.tags.map().
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

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Focus on open
// ---------------------------------------------------------------------------

describe('Hidden: detail panel — focus on open', () => {
  it('focus moves to the close button when the panel opens', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.click(screen.getByTestId('product-1'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: /close panel/i }),
    );
  });

  it('focus is NOT on the close button before the panel opens', async () => {
    render(<App />);
    await screen.findByTestId('results-count');

    // Panel hasn't opened yet — close button should not exist
    expect(screen.queryByRole('button', { name: /close panel/i })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Focus trap
// ---------------------------------------------------------------------------

describe('Hidden: detail panel — focus trap', () => {
  it('Tab keeps focus within the panel', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));

    const dialog = screen.getByRole('dialog');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /close panel/i }));

    // Tab from the (only) close button — focus must wrap back inside the panel
    await user.tab();

    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('Shift+Tab keeps focus within the panel', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));

    const dialog = screen.getByRole('dialog');

    await user.tab({ shift: true });

    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('focus does not reach the search input while the panel is open', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));

    // Tab multiple times — should never land on search input (behind the panel)
    await user.tab();
    await user.tab();
    await user.tab();

    expect(document.activeElement).not.toBe(screen.getByLabelText(/search/i));
  });
});

// ---------------------------------------------------------------------------
// Escape to close
// ---------------------------------------------------------------------------

describe('Hidden: detail panel — Escape key', () => {
  it('Escape closes the panel when focus is on the close button', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape closes the panel even when focus has moved outside the panel', async () => {
    // This is the trap test.
    //
    // If the agent attached the Escape listener via onKeyDown on the panel's
    // React root, it only fires when a panel element has focus. Moving focus
    // to the search input (which is outside the portal DOM subtree) would make
    // the listener unreachable.
    //
    // The correct implementation attaches to document, so Escape fires
    // regardless of where focus is.
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');
    await user.click(screen.getByTestId('product-1'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Programmatically move focus to an element outside the panel
    screen.getByLabelText(/search/i).focus();
    expect(document.activeElement).toBe(screen.getByLabelText(/search/i));

    // Press Escape from outside the panel — must still close it
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape does not close the panel when it is already closed', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    // Panel is not open — pressing Escape should not cause any errors
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Focus restore on close
// ---------------------------------------------------------------------------

describe('Hidden: detail panel — focus restore', () => {
  it('focus returns to the previously focused element after closing with Escape', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    // Establish a known focus target before opening the panel
    const searchInput = screen.getByLabelText(/search/i);
    searchInput.focus();
    expect(document.activeElement).toBe(searchInput);

    // Open the panel (click does not move keyboard focus from searchInput)
    await user.click(screen.getByTestId('product-1'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close with Escape
    await user.keyboard('{Escape}');

    // Focus must have returned to the element that had focus before the panel opened
    expect(document.activeElement).toBe(searchInput);
  });

  it('focus returns to the previously focused element after closing with the close button', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    const searchInput = screen.getByLabelText(/search/i);
    searchInput.focus();

    await user.click(screen.getByTestId('product-1'));

    await user.click(screen.getByRole('button', { name: /close panel/i }));

    expect(document.activeElement).toBe(searchInput);
  });
});
