import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Sorting behavior', () => {
  it('sorts by price-asc: Jump Rope first, Noise-Cancelling Headphones last', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
    await user.selectOptions(sortSelect, 'price-asc');
    const articles = screen.getAllByRole('article');
    expect(articles[0]).toHaveTextContent('Jump Rope');
    expect(articles[articles.length - 1]).toHaveTextContent('Noise-Cancelling Headphones');
  });

  it('sorts by price-desc: Noise-Cancelling Headphones first, Jump Rope last', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
    await user.selectOptions(sortSelect, 'price-desc');
    const articles = screen.getAllByRole('article');
    expect(articles[0]).toHaveTextContent('Noise-Cancelling Headphones');
    expect(articles[articles.length - 1]).toHaveTextContent('Jump Rope');
  });

  it('sorts by rating-desc: Yoga Mat first, Mechanical Keyboard second', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
    await user.selectOptions(sortSelect, 'rating-desc');
    const articles = screen.getAllByRole('article');
    expect(articles[0]).toHaveTextContent('Yoga Mat');
    expect(articles[1]).toHaveTextContent('Mechanical Keyboard');
  });

  it('default sort: Wireless Mouse first, Ergonomic Wrist Rest last', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    const articles = screen.getAllByRole('article');
    expect(articles[0]).toHaveTextContent('Wireless Mouse');
    expect(articles[articles.length - 1]).toHaveTextContent('Ergonomic Wrist Rest');
  });
});
