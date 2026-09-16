import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {
  it('results-count shows correct text after fetch resolves', async () => {
    render(<App />);
    const resultsCount = await screen.findByTestId('results-count');
    expect(resultsCount).toHaveTextContent('Showing 15 products (page 1 of 1)');
  });

  it('Product Catalog heading is present after load', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('heading', { name: /Product Catalog/i })).toBeInTheDocument();
  });

  it('all filter controls are present after load', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/in-stock only/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });
});
