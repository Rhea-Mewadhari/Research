import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Sorting behavior', () => {
  it('sorts by price ascending — Jump Rope first, Noise-Cancelling Headphones last', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Sort by'), 'price-asc');

    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards[0]).toHaveTextContent('Jump Rope');
    expect(cards[cards.length - 1]).toHaveTextContent('Noise-Cancelling Headphones');
  });

  it('sorts by price descending — Noise-Cancelling Headphones first, Jump Rope last', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Sort by'), 'price-desc');

    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards[0]).toHaveTextContent('Noise-Cancelling Headphones');
    expect(cards[cards.length - 1]).toHaveTextContent('Jump Rope');
  });

  it('sorts by rating descending — Yoga Mat first, then Mechanical Keyboard', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Sort by'), 'rating-desc');

    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards[0]).toHaveTextContent('Yoga Mat');
    expect(cards[1]).toHaveTextContent('Mechanical Keyboard');
  });

  it('default order — Wireless Mouse is first product', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Sort by'), 'price-asc');
    await user.selectOptions(screen.getByLabelText('Sort by'), 'default');

    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards[0]).toHaveTextContent('Wireless Mouse');
  });
});
