import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Sorting behavior', () => {
  it('sorts by price ascending', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc');

    const names = screen
      .getAllByRole('heading', { level: 3 })
      .map((node) => node.textContent);

    expect(names).toEqual([
      'Wireless Mouse',
      'Resistance Bands',
      'Yoga Mat',
      'Desk Lamp',
      'Laptop Stand',
      'USB-C Hub'
    ]);
  });

  it('sorts by rating descending', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'rating-desc');

    const names = screen
      .getAllByRole('heading', { level: 3 })
      .map((node) => node.textContent);

    expect(names[0]).toBe('Yoga Mat');
    expect(names[1]).toBe('Laptop Stand');
  });
});