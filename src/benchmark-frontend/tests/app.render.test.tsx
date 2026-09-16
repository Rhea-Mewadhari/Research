import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {
  it('renders the Product Catalog heading', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByText('Product Catalog')).toBeInTheDocument();
  });

  it('shows results-count with all 15 products on initial load', async () => {
    render(<App />);
    const count = await screen.findByTestId('results-count');
    expect(count).toHaveTextContent('Showing 15 products');
  });

  it('shows page 1 of 1 in results-count', async () => {
    render(<App />);
    const count = await screen.findByTestId('results-count');
    expect(count).toHaveTextContent('page 1 of 1');
  });

  it('renders all 15 product cards', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(15);
  });
});
