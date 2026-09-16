import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Clear filters', () => {
  it('clears search and restores all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    const searchInput = screen.getByRole('textbox', { name: /search/i });
    await user.type(searchInput, 'mouse');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products (page 1 of 1)');
    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products (page 1 of 1)');
    expect(screen.getByRole('textbox', { name: /search/i })).toHaveValue('');
  });
});
