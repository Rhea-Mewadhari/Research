import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Sorting behavior', () => {
  it('price-asc makes Jump Rope first and Noise-Cancelling Headphones last', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByRole('combobox', { name: /sort by/i }), 'price-asc');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Jump Rope');
    expect(headings[14]).toHaveTextContent('Noise-Cancelling Headphones');
  });

  it('price-desc makes Noise-Cancelling Headphones first and Jump Rope last', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByRole('combobox', { name: /sort by/i }), 'price-desc');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Noise-Cancelling Headphones');
    expect(headings[14]).toHaveTextContent('Jump Rope');
  });

  it('rating-desc makes Yoga Mat first and Mechanical Keyboard second', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByRole('combobox', { name: /sort by/i }), 'rating-desc');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Yoga Mat');
    expect(headings[1]).toHaveTextContent('Mechanical Keyboard');
  });

  it('default order makes Wireless Mouse the first product', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Wireless Mouse');
  });
});
