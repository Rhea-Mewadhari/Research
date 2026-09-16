import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { products } from '../src/data/products';

describe('Pagination controls', () => {
  it('disables both Prev and Next when totalPages is 1', async () => {
    render(<App />);
    await screen.findByTestId('results-count');

    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('enables Next on page 1 and both on page 2 when totalPages is 3', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: products.slice(0, 5),
          total: 15,
          page: 1,
          limit: 5,
          totalPages: 3,
        }),
      })
    );

    render(<App />);
    await screen.findByTestId('results-count');

    const prevButton = screen.getByRole('button', { name: 'Prev' });
    const nextButton = screen.getByRole('button', { name: 'Next' });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    await user.click(nextButton);
    await screen.findByText('Showing 5 products (page 2 of 3)');

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });
});
