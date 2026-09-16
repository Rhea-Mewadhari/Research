import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { products } from '../src/data/products';

describe('Pagination controls', () => {
  it('Prev button is disabled on initial render when totalPages is 1', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled();
  });

  it('Next button is disabled on initial render when totalPages is 1', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('Next button is enabled on page 1 when totalPages is 2', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [...products],
          total: 20,
          page: 1,
          limit: 10,
          totalPages: 2,
        }),
      })
    );
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
  });

  it('Prev button is enabled after clicking Next when totalPages is 2', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [...products],
          total: 20,
          page: 1,
          limit: 10,
          totalPages: 2,
        }),
      })
    );
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: 'Prev' })).not.toBeDisabled();
  });
});
