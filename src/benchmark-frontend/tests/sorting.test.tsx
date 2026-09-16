import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Sorting behavior', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
  });

  it('Price: Low to High puts Jump Rope first and Noise-Cancelling Headphones last', async () => {
    await user.selectOptions(screen.getByLabelText('Sort by'), 'Price: Low to High');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0].textContent).toBe('Jump Rope');
    expect(headings[14].textContent).toBe('Noise-Cancelling Headphones');
    expect(screen.getByTestId('results-count').textContent).toBe('Showing 15 products (page 1 of 1)');
  });

  it('Price: High to Low puts Noise-Cancelling Headphones first and Jump Rope last', async () => {
    await user.selectOptions(screen.getByLabelText('Sort by'), 'Price: High to Low');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0].textContent).toBe('Noise-Cancelling Headphones');
    expect(headings[14].textContent).toBe('Jump Rope');
  });

  it('Rating sort puts Yoga Mat first and Mechanical Keyboard second', async () => {
    await user.selectOptions(screen.getByLabelText('Sort by'), 'Rating');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0].textContent).toBe('Yoga Mat');
    expect(headings[1].textContent).toBe('Mechanical Keyboard');
  });

  it('Default sort preserves API order with Wireless Mouse first and Ergonomic Wrist Rest last', () => {
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0].textContent).toBe('Wireless Mouse');
    expect(headings[14].textContent).toBe('Ergonomic Wrist Rest');
  });
});
