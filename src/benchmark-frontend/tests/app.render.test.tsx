import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {
  it('renders the Product Catalog heading after initial load', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Product Catalog');
  });

  it('shows results count for all 15 products on initial load', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products (page 1 of 1)');
  });

  it('renders 15 product cards on initial load', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(15);
  });
});
