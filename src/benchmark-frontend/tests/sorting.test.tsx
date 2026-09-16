import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Sorting behavior', () => {
  it('price-asc: Jump Rope appears first', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc');
    expect(screen.getAllByRole('article')[0]).toHaveAttribute('data-testid', 'product-10');
  });

  it('price-desc: Noise-Cancelling Headphones appears first', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-desc');
    expect(screen.getAllByRole('article')[0]).toHaveAttribute('data-testid', 'product-5');
  });

  it('rating-desc: Yoga Mat first, Mechanical Keyboard second', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText(/sort by/i), 'rating-desc');
    const articles = screen.getAllByRole('article');
    expect(articles[0]).toHaveAttribute('data-testid', 'product-6');
    expect(articles[1]).toHaveAttribute('data-testid', 'product-3');
  });

  it('default sort: Wireless Mouse is first product', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getAllByRole('article')[0]).toHaveAttribute('data-testid', 'product-1');
  });
});
