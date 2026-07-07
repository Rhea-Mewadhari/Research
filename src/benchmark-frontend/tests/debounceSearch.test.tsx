import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Debounce — search filtering', () => {
  it('typing a search term eventually filters the product list', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText(/search/i), 'wireless');

    // findByText waits for the debounce to settle and the filter to apply
    await screen.findByText(/wireless mouse/i);

    expect(screen.queryByText(/yoga mat/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
  });

  it('clearing the search field restores all products', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText(/search/i), 'wireless');
    await screen.findByText(/wireless mouse/i);

    await user.clear(screen.getByLabelText(/search/i));

    await screen.findByText(/yoga mat/i);
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });

  it('search is case-insensitive', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText(/search/i), 'KEYBOARD');

    await screen.findByRole('heading', { name: /mechanical keyboard/i });
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
  });

  it('search combines correctly with category filter', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/category/i), 'Electronics');
    await user.type(screen.getByLabelText(/search/i), 'hub');

    await screen.findByRole('heading', { name: /usb-c hub/i });
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
  });

  it('clearing search while a category is active keeps the category filter', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/category/i), 'Fitness');
    await user.type(screen.getByLabelText(/search/i), 'yoga');
    await screen.findByText(/yoga mat/i);

    await user.clear(screen.getByLabelText(/search/i));

    // Should show all 5 Fitness products, not all 15
    await screen.findByText(/resistance bands/i);
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
  });
});
