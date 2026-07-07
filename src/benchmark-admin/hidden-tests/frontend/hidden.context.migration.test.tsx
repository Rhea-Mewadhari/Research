import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../benchmark-frontend/src/App';

describe('Hidden: context migration — sort wired to FilterContext', () => {
  it('sort dropdown value reflects FilterContext after selecting an option', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc');

    // If SortSelect is wired to local state instead of context, the select will
    // show the selected value visually but filterProducts will receive sortBy='default'
    // and the cheapest product will not appear first.
    const productSection = screen.getByRole('region', { name: /product results/i });
    const headings = within(productSection)
      .getAllByRole('heading', { level: 3 })
      .map((el) => el.textContent ?? '');

    expect(headings[0]).toMatch(/jump rope/i);
  });

  it('switching sort options twice produces the correct final order', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc');
    await user.selectOptions(screen.getByLabelText(/sort by/i), 'rating-desc');

    const productSection = screen.getByRole('region', { name: /product results/i });
    const headings = within(productSection)
      .getAllByRole('heading', { level: 3 })
      .map((el) => el.textContent ?? '');

    // Yoga Mat has the highest rating — appears first after rating-desc sort
    expect(headings[0]).toMatch(/yoga mat/i);
  });
});

describe('Hidden: context migration — category click writes to FilterContext', () => {
  it('clicking a category button updates the category filter control', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    const [btn] = screen.getAllByRole('button', { name: /filter by electronics/i });
    await user.click(btn);

    // If onCategoryClick is a no-op, FilterContext.category stays 'All'
    // and the <select> still shows 'All'. This proves FilterContext was actually written.
    expect(screen.getByLabelText(/category/i)).toHaveValue('Electronics');
  });

  it('clicking a category button then clearing filters resets to All', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    const [btn] = screen.getAllByRole('button', { name: /filter by fitness/i });
    await user.click(btn);

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');

    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
    expect(screen.getByLabelText(/category/i)).toHaveValue('All');
  });

  it('category click combined with sort produces correct filtered+sorted result', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    const [btn] = screen.getAllByRole('button', { name: /filter by fitness/i });
    await user.click(btn);
    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc');

    // Jump Rope is the cheapest Fitness product
    const productSection = screen.getByRole('region', { name: /product results/i });
    const headings = within(productSection)
      .getAllByRole('heading', { level: 3 })
      .map((el) => el.textContent ?? '');
    expect(headings[0]).toMatch(/jump rope/i);

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
  });
});
