import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {
  it('filters by search term "keyboard" to 1 product', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.type(screen.getByLabelText('Search'), 'keyboard');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    screen.getByText('Mechanical Keyboard');
  });

  it('filters by category Electronics to 5 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
  });

  it('filters by category Fitness to 5 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText('Category'), 'Fitness');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
  });

  it('filters by category Accessories to 5 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText('Category'), 'Accessories');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
  });

  it('filters by inStockOnly to 11 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.click(screen.getByLabelText(/in-stock only/i));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products');
  });

  it('combined Electronics + inStockOnly shows 3 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');
    await user.click(screen.getByLabelText(/in-stock only/i));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 3 products');
    screen.getByText('Wireless Mouse');
    screen.getByText('Mechanical Keyboard');
    screen.getByText('Webcam HD');
    expect(screen.queryByText('USB-C Hub')).toBeNull();
    expect(screen.queryByText('Noise-Cancelling Headphones')).toBeNull();
  });
});
