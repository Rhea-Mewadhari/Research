import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Pagination controls', () => {
  it('renders Prev and Next buttons after load', async () => {
    render(<App />);
    await screen.findByTestId('results-count');

    expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('Prev button is disabled on page 1', async () => {
    render(<App />);
    await screen.findByTestId('results-count');

    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled();
  });

  it('Next button is disabled on the last page (totalPages=1)', async () => {
    render(<App />);
    await screen.findByTestId('results-count');

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('shows page info in results count on page 1', async () => {
    render(<App />);
    await screen.findByTestId('results-count');

    expect(screen.getByTestId('results-count')).toHaveTextContent('page 1 of 1');
  });
});
