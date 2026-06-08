import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {
  it('filters products by search term', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/search/i), 'mouse');

    expect(screen.getByText(/wireless mouse/i)).toBeInTheDocument();
    expect(screen.queryByText(/yoga mat/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
  });

  it('filters products by category', async () => {
    const user = userEvent.setup();
    render(<App />);

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

    await user.click(screen.getByLabelText(/in-stock only/i));

    expect(screen.queryByText(/usb-c hub/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/noise-cancelling headphones/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/dumbbell set/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/desk lamp/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products');
  });
});
