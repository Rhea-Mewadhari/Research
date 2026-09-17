import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Clear filters', () => {
  it('clears search filter and restores all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText(/search/i), 'keyboard');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');

    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
    expect(screen.getByLabelText(/search/i)).toHaveValue('');
  });

  it('clears category filter and restores all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/category/i), 'Electronics');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');

    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
    expect(screen.getByLabelText(/category/i)).toHaveValue('All');
  });

  it('clears in-stock filter and restores all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByRole('checkbox', { name: /in-stock only/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products');

    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
    expect(screen.getByRole('checkbox', { name: /in-stock only/i })).not.toBeChecked();
  });

  it('clears combined filters and restores all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/category/i), 'Fitness');
    await user.click(screen.getByRole('checkbox', { name: /in-stock only/i }));
    await user.type(screen.getByLabelText(/search/i), 'mat');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');

    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
    expect(screen.getByLabelText(/search/i)).toHaveValue('');
    expect(screen.getByLabelText(/category/i)).toHaveValue('All');
    expect(screen.getByRole('checkbox', { name: /in-stock only/i })).not.toBeChecked();
  });
});
