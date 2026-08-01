import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {
  it('filters products by search term', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText(/search/i), 'mouse');

    // "wireless mouse" is present in the unfiltered list too, so waiting on it
    // alone would resolve before the 300ms debounce settles — wait on the
    // count instead, which only reaches this value once filtering applies.
    await waitFor(() => {
      expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    });
    expect(screen.getByText(/wireless mouse/i)).toBeInTheDocument();
    expect(screen.queryByText(/yoga mat/i)).not.toBeInTheDocument();
  });

  it('filters products by category', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/category/i), 'Fitness');

    expect(screen.getByText(/yoga mat/i)).toBeInTheDocument();
    expect(screen.getByText(/resistance bands/i)).toBeInTheDocument();
    expect(screen.getByText(/foam roller/i)).toBeInTheDocument();
    expect(screen.queryByText(/wireless mouse/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
  });

  it('filters products by in-stock only', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByLabelText(/in-stock only/i));

    expect(screen.queryByText(/usb-c hub/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/noise-cancelling headphones/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/dumbbell set/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/desk lamp/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products');
  });
});
