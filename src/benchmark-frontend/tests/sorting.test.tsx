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
      'Jump Rope',
      'Cable Organiser',
      'Foam Roller',
      'Wireless Mouse',
      'Ergonomic Wrist Rest',
      'Resistance Bands',
      'Monitor Riser',
      'Yoga Mat',
      'Desk Lamp',
      'Laptop Stand',
      'USB-C Hub',
      'Webcam HD',
      'Dumbbell Set',
      'Mechanical Keyboard',
      'Noise-Cancelling Headphones',
    ]);
  });

  it('sorts by price descending', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-desc');

    const names = screen
      .getAllByRole('heading', { level: 3 })
      .map((node) => node.textContent);

    expect(names[0]).toBe('Noise-Cancelling Headphones');
    expect(names[1]).toBe('Mechanical Keyboard');
    expect(names[names.length - 1]).toBe('Jump Rope');
  });

  it('sorts by rating descending', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'rating-desc');

    const names = screen
      .getAllByRole('heading', { level: 3 })
      .map((node) => node.textContent);

    expect(names[0]).toBe('Yoga Mat');
    expect(names[1]).toBe('Mechanical Keyboard');
  });
});
