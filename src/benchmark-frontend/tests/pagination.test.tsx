import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../src/App';
import { products } from '../src/data/products';

describe('Pagination controls', () => {
  it('results-count includes page info', async () => {
    render(<App />);
    const el = await screen.findByTestId('results-count');
    expect(el).toHaveTextContent('page 1 of 1');
  });

  it('Prev button is disabled on the first page', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
  });

  it('Next button is disabled when there is only one page', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('Next button is enabled when more pages exist', async () => {
    const firstPage = products.slice(0, 10);
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: firstPage, total: 15, page: 1, limit: 10, totalPages: 2 }),
    } as Response);

    render(<App />);
    await screen.findByTestId('results-count');

    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
  });

  it('clicking Next fetches the next page', async () => {
    const user = userEvent.setup();
    const firstPage = products.slice(0, 10);
    const secondPage = products.slice(10);

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: firstPage, total: 15, page: 1, limit: 10, totalPages: 2 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: secondPage, total: 15, page: 2, limit: 10, totalPages: 2 }),
      } as Response);

    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() =>
      expect(screen.getByTestId('results-count')).toHaveTextContent('page 2 of 2')
    );
    expect(screen.getByRole('button', { name: /prev/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });
});
