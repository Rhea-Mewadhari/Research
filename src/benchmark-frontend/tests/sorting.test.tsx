import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Sorting behavior', () => {
  it('price-asc: Jump Rope first, Noise-Cancelling Headphones last', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByRole('combobox', { name: /sort/i }), 'price-asc');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Jump Rope');
    expect(headings[headings.length - 1]).toHaveTextContent('Noise-Cancelling Headphones');
  });

  it('price-desc: Noise-Cancelling Headphones first, Jump Rope last', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByRole('combobox', { name: /sort/i }), 'price-desc');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Noise-Cancelling Headphones');
    expect(headings[headings.length - 1]).toHaveTextContent('Jump Rope');
  });

  it('rating-desc: Yoga Mat first, Mechanical Keyboard second', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByRole('combobox', { name: /sort/i }), 'rating-desc');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Yoga Mat');
    expect(headings[1]).toHaveTextContent('Mechanical Keyboard');
  });

  it('default sort: Wireless Mouse is first', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Wireless Mouse');
  });
});
