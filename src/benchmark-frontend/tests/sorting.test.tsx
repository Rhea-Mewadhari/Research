import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Sorting behavior', () => {
  it('sorts by price ascending — cheapest product appears first', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'Price: Low to High');

    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveAttribute('data-testid', 'product-10'); // Jump Rope $15
    expect(cards[cards.length - 1]).toHaveAttribute('data-testid', 'product-5'); // Noise-Cancelling Headphones $149
  });

  it('sorts by price descending — most expensive product appears first', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'Price: High to Low');

    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveAttribute('data-testid', 'product-5'); // Noise-Cancelling Headphones $149
    expect(cards[cards.length - 1]).toHaveAttribute('data-testid', 'product-10'); // Jump Rope $15
  });

  it('sorts by rating descending — highest-rated product appears first', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'Rating');

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Yoga Mat'); // 4.8
    expect(headings[1]).toHaveTextContent('Mechanical Keyboard'); // 4.7
  });

  it('default sort preserves original product order', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'Price: Low to High');
    await user.selectOptions(screen.getByLabelText(/sort by/i), 'Default');

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Wireless Mouse'); // first in original dataset
    expect(headings[headings.length - 1]).toHaveTextContent('Ergonomic Wrist Rest'); // last in original dataset
  });
});
