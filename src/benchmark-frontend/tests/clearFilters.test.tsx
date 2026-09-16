import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Clear filters', () => {
  it('clears search filter and restores all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText('Search'), 'keyboard');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });

  it('clears category filter and restores all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
    expect(screen.getByLabelText('Category')).toHaveValue('All');
  });

  it('clears in-stock filter and restores all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByLabelText('In-stock only'));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
    expect(screen.getByLabelText('In-stock only')).not.toBeChecked();
  });

  it('clears combined filters (category + search + in-stock) and restores all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Fitness');
    await user.click(screen.getByLabelText('In-stock only'));
    await user.type(screen.getByLabelText('Search'), 'yoga');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
    expect(screen.getByLabelText('Category')).toHaveValue('All');
    expect(screen.getByLabelText('In-stock only')).not.toBeChecked();
    expect(screen.getByLabelText('Search')).toHaveValue('');
  });
});
