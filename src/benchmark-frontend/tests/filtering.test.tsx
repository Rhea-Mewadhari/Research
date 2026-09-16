import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {
  it('filters by search term', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText('Search'), 'Keyboard');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Fitness');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
  });

  it('filters by in-stock only', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByLabelText('In-stock only'));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products');
  });

  it('applies combined category and in-stock filters', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');
    await user.click(screen.getByLabelText('In-stock only'));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 3 products');
  });
});
