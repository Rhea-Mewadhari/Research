import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {
  it('filters by search term — single match', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText(/search/i), 'keyboard');

    const count = screen.getByTestId('results-count');
    expect(count).toHaveTextContent('Showing 1 products');
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  it('filters by search term — partial match', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText(/search/i), 'mat');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
  });

  it('filters by category — Electronics shows 5 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/category/i), 'Electronics');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  it('filters by category — Fitness shows 5 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/category/i), 'Fitness');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
    expect(screen.getByText('Jump Rope')).toBeInTheDocument();
  });

  it('filters by in-stock only — shows 11 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByRole('checkbox', { name: /in-stock only/i }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products');
    expect(screen.queryByTestId('product-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('product-5')).not.toBeInTheDocument();
    expect(screen.queryByTestId('product-9')).not.toBeInTheDocument();
    expect(screen.queryByTestId('product-12')).not.toBeInTheDocument();
  });

  it('combined — category Fitness + in-stock only shows 4 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/category/i), 'Fitness');
    await user.click(screen.getByRole('checkbox', { name: /in-stock only/i }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 4 products');
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
    expect(screen.getByText('Resistance Bands')).toBeInTheDocument();
    expect(screen.getByText('Foam Roller')).toBeInTheDocument();
    expect(screen.getByText('Jump Rope')).toBeInTheDocument();
    expect(screen.queryByText('Dumbbell Set')).not.toBeInTheDocument();
  });

  it('combined — search + category narrows results', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/category/i), 'Fitness');
    await user.type(screen.getByLabelText(/search/i), 'mat');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
  });

  it('shows no products message when nothing matches', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText(/search/i), 'xyznotaproduct');

    expect(screen.getByRole('status')).toHaveTextContent('No products found.');
  });
});
