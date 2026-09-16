import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Clear filters', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
  });

  it('clicking Clear filters after category filter resets count to 15', async () => {
    await user.selectOptions(screen.getByLabelText('Category'), 'Fitness');
    expect(screen.getByTestId('results-count').textContent).toBe('Showing 5 products (page 1 of 1)');
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByTestId('results-count').textContent).toBe('Showing 15 products (page 1 of 1)');
  });

  it('clicking Clear filters resets all filter controls to initial state', async () => {
    await user.type(screen.getByLabelText('Search'), 'keyboard');
    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');
    await user.click(screen.getByLabelText('In-stock only'));
    await user.selectOptions(screen.getByLabelText('Sort by'), 'Price: Low to High');
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByLabelText('Search')).toHaveValue('');
    expect(screen.getByLabelText('Category')).toHaveValue('All');
    expect(screen.getByLabelText('In-stock only')).not.toBeChecked();
    expect(screen.getByLabelText('Sort by')).toHaveValue('default');
  });
});
