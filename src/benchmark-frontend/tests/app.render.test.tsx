import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {
  it('renders the page heading', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /product catalog/i })).toBeInTheDocument();
    await screen.findByTestId('results-count');
  });

  it('shows all 15 products after initial load', async () => {
    render(<App />);
    const count = await screen.findByTestId('results-count');
    expect(count).toHaveTextContent('Showing 15 products');
  });

  it('shows page 1 of 1 in the results count', async () => {
    render(<App />);
    const count = await screen.findByTestId('results-count');
    expect(count).toHaveTextContent('page 1 of 1');
  });

  it('renders a product card for each product', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByTestId('product-1')).toBeInTheDocument();
    expect(screen.getByTestId('product-15')).toBeInTheDocument();
  });

  it('renders the Filters panel and Sort by control', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('region', { name: /filters/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
  });
});
