import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {
  it('filters products by search term', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText('Search'), 'keyboard');

    const count = screen.getByTestId('results-count');
    expect(count).toHaveTextContent('Showing 1 products');
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  it('filters products by category — Electronics shows 5', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  it('filters products by category — Fitness shows 5', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Fitness');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
    expect(screen.getByText('Jump Rope')).toBeInTheDocument();
  });

  it('filters products to in-stock only — shows 11', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByLabelText('In-stock only'));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products');
    // out-of-stock products should not appear
    expect(screen.queryByText('USB-C Hub')).not.toBeInTheDocument();
    expect(screen.queryByText('Noise-Cancelling Headphones')).not.toBeInTheDocument();
    expect(screen.queryByText('Dumbbell Set')).not.toBeInTheDocument();
    expect(screen.queryByText('Desk Lamp')).not.toBeInTheDocument();
  });

  it('combined: category Fitness + in-stock only shows 4 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Fitness');
    await user.click(screen.getByLabelText('In-stock only'));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 4 products');
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
    expect(screen.getByText('Resistance Bands')).toBeInTheDocument();
    expect(screen.getByText('Foam Roller')).toBeInTheDocument();
    expect(screen.getByText('Jump Rope')).toBeInTheDocument();
    expect(screen.queryByText('Dumbbell Set')).not.toBeInTheDocument();
  });

  it('combined: search + category narrows results correctly', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');
    await user.type(screen.getByLabelText('Search'), 'webcam');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    expect(screen.getByText('Webcam HD')).toBeInTheDocument();
  });
});
