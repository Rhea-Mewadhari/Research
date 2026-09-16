import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Clear filters', () => {
  it('after search filter Yoga, clicking Clear filters resets to 15 products', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.type(screen.getByLabelText(/search/i), 'Yoga');
    expect(screen.getByTestId('results-count')).toHaveTextContent(/Showing 1 products/);
    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent(/Showing 15 products/);
  });

  it('after clicking Clear filters, all controls reset to their defaults', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    const searchInput = screen.getByLabelText(/search/i) as HTMLInputElement;
    const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;
    const inStockCheckbox = screen.getByLabelText(/in-stock only/i) as HTMLInputElement;
    const sortSelect = screen.getByLabelText(/sort by/i) as HTMLSelectElement;
    await user.type(searchInput, 'Yoga');
    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(searchInput.value).toBe('');
    expect(categorySelect.value).toBe('All');
    expect(inStockCheckbox.checked).toBe(false);
    expect(sortSelect.value).toBe('default');
  });

  it('after category filter Electronics, clicking Clear filters resets to 15 products', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Electronics');
    expect(screen.getByTestId('results-count')).toHaveTextContent(/Showing 5 products/);
    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent(/Showing 15 products/);
  });
});
