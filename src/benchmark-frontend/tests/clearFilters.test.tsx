import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Clear filters', () => {
  it('clears search input and restores 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.type(screen.getByLabelText('Search'), 'yoga');
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByLabelText('Search')).toHaveValue('');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });

  it('clears category filter and restores 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByLabelText('Category')).toHaveValue('All');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });

  it('clears inStockOnly checkbox and restores 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.click(screen.getByLabelText(/in-stock only/i));
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByLabelText(/in-stock only/i)).not.toBeChecked();
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });
});
