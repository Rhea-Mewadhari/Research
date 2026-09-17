import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Sorting behavior', () => {
  it('default order — first product is Wireless Mouse', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Wireless Mouse');
  });

  it('price-asc — cheapest first (Jump Rope $15)', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /sort by/i }), 'price-asc');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Jump Rope');
    expect(headings[1]).toHaveTextContent('Cable Organiser');
    expect(headings[2]).toHaveTextContent('Foam Roller');
  });

  it('price-desc — most expensive first (Noise-Cancelling Headphones $149)', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /sort by/i }), 'price-desc');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Noise-Cancelling Headphones');
    expect(headings[1]).toHaveTextContent('Mechanical Keyboard');
    expect(headings[2]).toHaveTextContent('Dumbbell Set');
  });

  it('rating-desc — highest rated first (Yoga Mat 4.8, then Mechanical Keyboard 4.7)', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /sort by/i }), 'rating-desc');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Yoga Mat');
    expect(headings[1]).toHaveTextContent('Mechanical Keyboard');
  });

  it('all 15 products are shown after sorting', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /sort by/i }), 'price-asc');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(15);
  });
});
