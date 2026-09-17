import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Clear filters', () => {
  it('resets search filter and shows all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText('Search'), 'keyboard');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });

  it('resets category filter to All and shows all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
    expect(screen.getByLabelText('Category')).toHaveValue('All');
  });

  it('resets in-stock filter and shows all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByLabelText('In-stock only'));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
    expect(screen.getByLabelText('In-stock only')).not.toBeChecked();
  });

  it('resets combined filters and shows all 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Fitness');
    await user.click(screen.getByLabelText('In-stock only'));
    await user.type(screen.getByLabelText('Search'), 'yoga');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });

  it('clears the search input text', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText('Search'), 'mouse');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByLabelText('Search')).toHaveValue('');
  });

  it('restores out-of-stock products after clearing in-stock filter', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByLabelText('In-stock only'));
    expect(screen.queryByText('USB-C Hub')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByText('USB-C Hub')).toBeInTheDocument();
    expect(screen.getByText('Noise-Cancelling Headphones')).toBeInTheDocument();
    expect(screen.getByText('Dumbbell Set')).toBeInTheDocument();
    expect(screen.getByText('Desk Lamp')).toBeInTheDocument();
  });
});
