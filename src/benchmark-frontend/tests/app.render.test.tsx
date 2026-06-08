import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {
  it('renders the page heading and initial product count', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /product catalog/i })).toBeInTheDocument();
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });
});
