import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Context migration — SortSelect', () => {
  it('selecting a sort option re-orders the product list', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc');

    const productSection = screen.getByRole('region', { name: /product results/i });
    const headings = within(productSection)
      .getAllByRole('heading', { level: 3 })
      .map((el) => el.textContent ?? '');

    // Jump Rope is the cheapest product; it must appear first after price-asc sort
    expect(headings[0]).toMatch(/jump rope/i);
  });

  it('selecting price-desc puts the most expensive product first', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-desc');

    const productSection = screen.getByRole('region', { name: /product results/i });
    const headings = within(productSection)
      .getAllByRole('heading', { level: 3 })
      .map((el) => el.textContent ?? '');

    // Noise-Cancelling Headphones is the most expensive product
    expect(headings[0]).toMatch(/noise-cancelling headphones/i);
  });
});

describe('Context migration — category click', () => {
  it('clicking a product category button filters the list to that category', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    const [firstCategoryBtn] = screen.getAllByRole('button', { name: /filter by electronics/i });
    await user.click(firstCategoryBtn);

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
  });

  it('clicking a category button hides products from other categories', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    const [btn] = screen.getAllByRole('button', { name: /filter by fitness/i });
    await user.click(btn);

    expect(screen.queryByText(/wireless mouse/i)).not.toBeInTheDocument();
    expect(screen.getByText(/yoga mat/i)).toBeInTheDocument();
  });
});
