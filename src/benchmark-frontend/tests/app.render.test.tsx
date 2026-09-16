import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {
  it('shows results-count with 15 products on initial load', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByTestId('results-count')).toHaveTextContent(
      'Showing 15 products (page 1 of 1)'
    );
  });

  it('renders product names from all three categories', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    screen.getByText('Wireless Mouse');
    screen.getByText('Yoga Mat');
    screen.getByText('Laptop Stand');
  });
});
