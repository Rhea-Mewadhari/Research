import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {
  it('renders the page heading and initial product count', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /product catalog/i })).toBeInTheDocument();
    expect(await screen.findByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });
});
