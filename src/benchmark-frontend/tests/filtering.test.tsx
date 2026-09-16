import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {
  it('filters by search "mouse" to show 1 product', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    const searchInput = screen.getByRole('textbox', { name: /search/i });
    await user.type(searchInput, 'mouse');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products (page 1 of 1)');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.queryByText('Yoga Mat')).toBeNull();
  });

  it('filters by Electronics category to show 5 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    await user.selectOptions(categorySelect, 'Electronics');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products (page 1 of 1)');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('USB-C Hub')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Webcam HD')).toBeInTheDocument();
    expect(screen.getByText('Noise-Cancelling Headphones')).toBeInTheDocument();
    expect(screen.queryByText('Yoga Mat')).toBeNull();
  });

  it('filters by In-stock only to show 11 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    const inStockCheckbox = screen.getByRole('checkbox', { name: /in-stock only/i });
    await user.click(inStockCheckbox);
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products (page 1 of 1)');
    expect(screen.queryByText('USB-C Hub')).toBeNull();
    expect(screen.queryByText('Noise-Cancelling Headphones')).toBeNull();
    expect(screen.queryByText('Dumbbell Set')).toBeNull();
    expect(screen.queryByText('Desk Lamp')).toBeNull();
  });

  it('combined Electronics + In-stock only shows 3 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    await user.selectOptions(categorySelect, 'Electronics');
    const inStockCheckbox = screen.getByRole('checkbox', { name: /in-stock only/i });
    await user.click(inStockCheckbox);
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 3 products (page 1 of 1)');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Webcam HD')).toBeInTheDocument();
    expect(screen.queryByText('USB-C Hub')).toBeNull();
    expect(screen.queryByText('Noise-Cancelling Headphones')).toBeNull();
  });
});
