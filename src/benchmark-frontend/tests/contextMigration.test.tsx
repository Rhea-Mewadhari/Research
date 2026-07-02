import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Context migration — SortSelect', () => {
  it('selecting a sort option re-orders the product list', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc');

    const headings = screen
      .getAllByRole('heading', { level: 3 })
      .map((el) => el.textContent ?? '');

    // Jump Rope is the cheapest product ($19); it must appear first after price-asc sort
    expect(headings[0]).toMatch(/jump rope/i);
  });

  it('selecting price-desc puts the most expensive product first', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-desc');

    const headings = screen
      .getAllByRole('heading', { level: 3 })
      .map((el) => el.textContent ?? '');

    // Ergonomic Chair is the most expensive ($549)
    expect(headings[0]).toMatch(/ergonomic chair/i);
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
