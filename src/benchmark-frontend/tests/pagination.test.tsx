import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Pagination controls', () => {
  it('disables Prev and Next buttons when totalPages is 1', async () => {
    render(<App />);
    await screen.findByTestId('results-count');

    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
