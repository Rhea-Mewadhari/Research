import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {
  it('renders the page heading', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('heading', { name: /product catalog/i })).toBeInTheDocument();
  });

  it('shows 15 products in the results count after load', async () => {
    render(<App />);
    const count = await screen.findByTestId('results-count');
    expect(count).toHaveTextContent('Showing 15 products');
  });

  it('renders a product card for every product', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    for (let id = 1; id <= 15; id++) {
      expect(screen.getByTestId(`product-${id}`)).toBeInTheDocument();
    }
  });

  it('shows pagination info page 1 of 1', async () => {
    render(<App />);
    const count = await screen.findByTestId('results-count');
    expect(count).toHaveTextContent('page 1 of 1');
  });

  it('renders product names in the document', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
    expect(screen.getByText('Laptop Stand')).toBeInTheDocument();
  });
});
