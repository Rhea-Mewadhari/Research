import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { products } from '../../benchmark-frontend/src/data/products';
import App from '../../benchmark-frontend/src/App';

describe('Hidden: sorting integrity', () => {
  it('default sort preserves original dataset order', () => {
    render(<App />);

    const renderedNames = screen
      .getAllByRole('heading', { level: 3 })
      .map((node) => node.textContent);

    const originalNames = products.map((p) => p.name);

    expect(renderedNames).toEqual(originalNames);
  });

  it('sorting does not mutate the original products array', async () => {
    const user = userEvent.setup();
    const snapshot = products.map((p) => ({ ...p }));

    render(<App />);

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc');
    await user.selectOptions(screen.getByLabelText(/sort by/i), 'rating-desc');
    await user.selectOptions(screen.getByLabelText(/sort by/i), 'default');

    expect(products).toEqual(snapshot);
  });
});