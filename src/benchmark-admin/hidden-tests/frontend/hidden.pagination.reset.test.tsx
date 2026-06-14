import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../../../benchmark-frontend/src/App';
import { products } from '../../../benchmark-frontend/src/data/products';

describe('Hidden: pagination reset on filter change', () => {
  it('resets to page 1 when a search filter is applied on page 2', async () => {
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
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: firstPage, total: 15, page: 1, limit: 10, totalPages: 2 }),
      } as Response);

    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() =>
      expect(screen.getByTestId('results-count')).toHaveTextContent('page 2 of 2')
    );

    await user.type(screen.getByLabelText(/search/i), 'mouse');

    await waitFor(() =>
      expect(screen.getByTestId('results-count')).toHaveTextContent('page 1')
    );
  });

  it('resets to page 1 when sort is changed on page 2', async () => {
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
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: firstPage, total: 15, page: 1, limit: 10, totalPages: 2 }),
      } as Response);

    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() =>
      expect(screen.getByTestId('results-count')).toHaveTextContent('page 2 of 2')
    );

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc');

    await waitFor(() =>
      expect(screen.getByTestId('results-count')).toHaveTextContent('page 1')
    );
  });
});
