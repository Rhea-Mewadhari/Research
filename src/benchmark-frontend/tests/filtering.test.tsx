import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {
  it('typing "Yoga" shows only Yoga Mat', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.type(screen.getByRole('textbox', { name: /search/i }), 'Yoga');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products (page 1 of 1)');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Yoga Mat');
  });

  it('search is case-insensitive: typing "yoga" shows Yoga Mat', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.type(screen.getByRole('textbox', { name: /search/i }), 'yoga');
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Yoga Mat');
  });

  it('typing "zzz" shows no-products status and removes product section', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.type(screen.getByRole('textbox', { name: /search/i }), 'zzz');
    expect(screen.getByRole('status')).toHaveTextContent('No products found.');
    expect(screen.queryByRole('region', { name: 'Product results' })).not.toBeInTheDocument();
  });

  it('selecting Electronics shows 5 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Electronics');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products (page 1 of 1)');
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5);
  });

  it('selecting Fitness shows 5 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Fitness');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products (page 1 of 1)');
  });

  it('selecting Accessories shows 5 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Accessories');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products (page 1 of 1)');
  });

  it('checking in-stock only shows 11 products and removes OOS products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.click(screen.getByRole('checkbox', { name: /in-stock only/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products (page 1 of 1)');
    expect(screen.queryByText('USB-C Hub')).not.toBeInTheDocument();
    expect(screen.queryByText('Noise-Cancelling Headphones')).not.toBeInTheDocument();
    expect(screen.queryByText('Dumbbell Set')).not.toBeInTheDocument();
    expect(screen.queryByText('Desk Lamp')).not.toBeInTheDocument();
  });

  it('Electronics + in-stock only shows 3 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Electronics');
    await user.click(screen.getByRole('checkbox', { name: /in-stock only/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 3 products (page 1 of 1)');
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
  });

  it('typing "keyboard" with Electronics category shows only Mechanical Keyboard', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.type(screen.getByRole('textbox', { name: /search/i }), 'keyboard');
    await user.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Electronics');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });
});
