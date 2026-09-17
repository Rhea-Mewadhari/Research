import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {
  it('filters by search term — "mouse" shows 1 product', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.type(screen.getByRole('textbox', { name: /search/i }), 'mouse');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
  });

  it('filters by search term — "keyboard" shows 1 product', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.type(screen.getByRole('textbox', { name: /search/i }), 'keyboard');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  it('filters by category — Electronics shows 5 products', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Electronics');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  it('filters by category — Fitness shows 5 products', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Fitness');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
    expect(screen.getByText('Jump Rope')).toBeInTheDocument();
  });

  it('filters by category — Accessories shows 5 products', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Accessories');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
    expect(screen.getByText('Laptop Stand')).toBeInTheDocument();
    expect(screen.getByText('Monitor Riser')).toBeInTheDocument();
  });

  it('filters in-stock only — shows 11 products', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.click(screen.getByRole('checkbox', { name: /in-stock only/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products');
    expect(screen.queryByText('USB-C Hub')).not.toBeInTheDocument();
    expect(screen.queryByText('Noise-Cancelling Headphones')).not.toBeInTheDocument();
    expect(screen.queryByText('Dumbbell Set')).not.toBeInTheDocument();
    expect(screen.queryByText('Desk Lamp')).not.toBeInTheDocument();
  });

  it('combined: Electronics + in-stock shows 3 products', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Electronics');
    await userEvent.click(screen.getByRole('checkbox', { name: /in-stock only/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 3 products');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Webcam HD')).toBeInTheDocument();
  });

  it('combined: Fitness + in-stock shows 4 products', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Fitness');
    await userEvent.click(screen.getByRole('checkbox', { name: /in-stock only/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 4 products');
    expect(screen.queryByText('Dumbbell Set')).not.toBeInTheDocument();
  });

  it('combined: search + category — "mat" in Fitness shows 1 product', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Fitness');
    await userEvent.type(screen.getByRole('textbox', { name: /search/i }), 'mat');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
  });
});
