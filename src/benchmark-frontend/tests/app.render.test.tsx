import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {
  it('renders the page heading', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('heading', { name: /product catalog/i })).toBeInTheDocument();
  });

  it('shows 15 products after loading', async () => {
    render(<App />);
    const count = await screen.findByTestId('results-count');
    expect(count).toHaveTextContent('Showing 15 products');
  });

  it('displays pagination page info', async () => {
    render(<App />);
    const count = await screen.findByTestId('results-count');
    expect(count).toHaveTextContent('page 1 of 1');
  });

  it('renders product cards', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
  });

  it('shows Prev and Next pagination buttons', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });
});
