import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Sorting behavior', () => {
  it('sorts by price ascending — cheapest product appears first', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Sort by'), 'price-asc');

    const cards = screen.getAllByRole('article');
    expect(within(cards[0]).getByRole('heading', { level: 3 })).toHaveTextContent('Jump Rope');
    expect(within(cards[cards.length - 1]).getByRole('heading', { level: 3 })).toHaveTextContent('Noise-Cancelling Headphones');
  });

  it('sorts by price descending — most expensive product appears first', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Sort by'), 'price-desc');

    const cards = screen.getAllByRole('article');
    expect(within(cards[0]).getByRole('heading', { level: 3 })).toHaveTextContent('Noise-Cancelling Headphones');
    expect(within(cards[1]).getByRole('heading', { level: 3 })).toHaveTextContent('Mechanical Keyboard');
  });

  it('sorts by rating descending — highest-rated product appears first', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Sort by'), 'rating-desc');

    const cards = screen.getAllByRole('article');
    expect(within(cards[0]).getByRole('heading', { level: 3 })).toHaveTextContent('Yoga Mat');
    expect(within(cards[1]).getByRole('heading', { level: 3 })).toHaveTextContent('Mechanical Keyboard');
  });

  it('default sort preserves original product order', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Sort by'), 'price-asc');
    await user.selectOptions(screen.getByLabelText('Sort by'), 'default');

    const cards = screen.getAllByRole('article');
    expect(within(cards[0]).getByRole('heading', { level: 3 })).toHaveTextContent('Wireless Mouse');
  });
});
