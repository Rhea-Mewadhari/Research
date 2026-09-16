import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Pagination controls', () => {
  it('Prev button is disabled on page 1', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    const btn = screen.getByRole('button', { name: /prev/i });
    expect(btn).toBeDisabled();
  });

  it('Next button is disabled when totalPages equals current page', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    const btn = screen.getByRole('button', { name: /next/i });
    expect(btn).toBeDisabled();
  });
});
