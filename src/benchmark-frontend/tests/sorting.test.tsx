import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Sorting behavior', () => {
  it('sorts products by price ascending (lowest first)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Sort by'), 'price-asc');

    const cards = screen.getAllByRole('article');
    expect(within(cards[0]).getByText('Jump Rope')).toBeInTheDocument();
    expect(within(cards[cards.length - 1]).getByText('Noise-Cancelling Headphones')).toBeInTheDocument();
  });

  it('sorts products by price descending (highest first)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Sort by'), 'price-desc');

    const cards = screen.getAllByRole('article');
    expect(within(cards[0]).getByText('Noise-Cancelling Headphones')).toBeInTheDocument();
    expect(within(cards[cards.length - 1]).getByText('Jump Rope')).toBeInTheDocument();
  });

  it('sorts products by rating descending (highest rated first)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Sort by'), 'rating-desc');

    const cards = screen.getAllByRole('article');
    expect(within(cards[0]).getByText('Yoga Mat')).toBeInTheDocument();
    expect(within(cards[cards.length - 1]).getByText('Desk Lamp')).toBeInTheDocument();
  });

  it('default order shows Wireless Mouse first', async () => {
    render(<App />);
    await screen.findByTestId('results-count');

    const cards = screen.getAllByRole('article');
    expect(within(cards[0]).getByText('Wireless Mouse')).toBeInTheDocument();
  });
});
