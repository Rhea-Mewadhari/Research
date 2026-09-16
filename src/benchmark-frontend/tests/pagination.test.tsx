import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Pagination controls', () => {
  it('disables the Prev button on initial load when totalPages is 1', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled();
  });

  it('disables the Next button on initial load when totalPages is 1', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
