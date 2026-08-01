import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Debounce — search filtering', () => {
  it('typing a search term eventually filters the product list', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText(/search/i), 'wireless');

    // "wireless mouse" is present in the unfiltered list too, so waiting on it
    // alone resolves before the 300ms debounce settles — wait on the count
    // instead, which only reaches this value once filtering actually applies.
    await waitFor(() => {
      expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    });
    expect(screen.getByText(/wireless mouse/i)).toBeInTheDocument();
    expect(screen.queryByText(/yoga mat/i)).not.toBeInTheDocument();
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

    // The heading is present in the unfiltered list too, so wait on the
    // count settling instead of the heading appearing.
    await waitFor(() => {
      expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    });
    expect(screen.getByRole('heading', { name: /mechanical keyboard/i })).toBeInTheDocument();
  });

  it('search combines correctly with category filter', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/category/i), 'Electronics');
    await user.type(screen.getByLabelText(/search/i), 'hub');

    // "USB-C Hub" is already visible from the category filter alone, so
    // waiting on the heading resolves before the search debounce settles —
    // wait on the count instead, which only drops to 1 once both apply.
    await waitFor(() => {
      expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    });
    expect(screen.getByRole('heading', { name: /usb-c hub/i })).toBeInTheDocument();
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
