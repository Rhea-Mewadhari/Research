import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {
  it('renders the page heading', async () => {
    render(<App />);
    expect(screen.getByText('Product Catalog')).toBeInTheDocument();
  });

  it('shows a loading indicator while fetching', () => {
    render(<App />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
  });

  it('shows results count after loading', async () => {
    render(<App />);
    const count = await screen.findByTestId('results-count');
    expect(count).toHaveTextContent('Showing 15 products');
  });

  it('shows page 1 of 1 after loading', async () => {
    render(<App />);
    const count = await screen.findByTestId('results-count');
    expect(count).toHaveTextContent('page 1 of 1');
  });

  it('renders all 15 product cards after loading', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(15);
  });
});
