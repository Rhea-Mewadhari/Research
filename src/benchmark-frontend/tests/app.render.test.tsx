import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {
  it('shows loading spinner immediately after render before fetch resolves', () => {
    render(<App />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
    expect(screen.queryByTestId('results-count')).toBeNull();
  });

  it('shows results-count with correct text after fetch resolves', async () => {
    render(<App />);
    const count = await screen.findByTestId('results-count');
    expect(count.textContent).toBe('Showing 15 products (page 1 of 1)');
  });

  it('renders all 15 product cards after fetch resolves', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    for (let id = 1; id <= 15; id++) {
      expect(screen.getByTestId(`product-${id}`)).toBeInTheDocument();
    }
  });
});
