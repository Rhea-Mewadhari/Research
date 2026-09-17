import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../src/App';
import { products } from '../src/data/products';

describe('Pagination controls', () => {
  it('Prev button is disabled on the first page', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled();
  });

  it('Next button is disabled when there is only one page', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('Next button is enabled on the first page when totalPages > 1', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: products.slice(0, 8),
          total: products.length,
          page: 1,
          limit: 8,
          totalPages: 2,
        }),
      })
    );

    render(<App />);
    await screen.findByTestId('results-count');

    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('clicking Next advances to page 2 and enables Prev', async () => {
    const user = userEvent.setup();

    let currentPage = 1;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        const page = currentPage;
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: products.slice((page - 1) * 8, page * 8),
            total: products.length,
            page,
            limit: 8,
            totalPages: 2,
          }),
        });
      })
    );

    render(<App />);
    await screen.findByTestId('results-count');

    currentPage = 2;
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText(/page 2 of 2/);

    expect(screen.getByRole('button', { name: 'Prev' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('clicking Prev from page 2 returns to page 1 and disables Prev', async () => {
    const user = userEvent.setup();

    let currentPage = 1;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        const page = currentPage;
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: products.slice((page - 1) * 8, page * 8),
            total: products.length,
            page,
            limit: 8,
            totalPages: 2,
          }),
        });
      })
    );

    render(<App />);
    await screen.findByTestId('results-count');

    currentPage = 2;
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText(/page 2 of 2/);

    currentPage = 1;
    await user.click(screen.getByRole('button', { name: 'Prev' }));
    await screen.findByText(/page 1 of 2/);

    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });
});
