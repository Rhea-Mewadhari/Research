import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../benchmark-frontend/src/App';

describe('Hidden: combined filter behavior', () => {
  it('combines category + inStockOnly + search correctly', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for async data load before categories are available in the dropdown
    await screen.findByRole('option', { name: 'Accessories' });
    await user.selectOptions(screen.getByLabelText(/category/i), 'Accessories');
    await user.click(screen.getByLabelText(/in-stock only/i));
    await user.type(screen.getByLabelText(/search/i), 'laptop');

    expect(screen.getByText(/laptop stand/i)).toBeInTheDocument();
    expect(screen.queryByText(/desk lamp/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
  });

  it('clear filters also resets sorting', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-desc');
    await user.type(screen.getByLabelText(/search/i), 'lamp');
    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.getByLabelText(/sort by/i)).toHaveValue('default');

    const productSection = screen.getByRole('region', { name: /product results/i });
    const names = within(productSection)
      .getAllByRole('heading', { level: 3 })
      .map((node) => node.textContent);

    expect(names).toEqual([
      'Wireless Mouse',
      'USB-C Hub',
      'Mechanical Keyboard',
      'Webcam HD',
      'Noise-Cancelling Headphones',
      'Yoga Mat',
      'Resistance Bands',
      'Foam Roller',
      'Dumbbell Set',
      'Jump Rope',
      'Laptop Stand',
      'Desk Lamp',
      'Cable Organiser',
      'Monitor Riser',
      'Ergonomic Wrist Rest',
    ]);
  });
});
