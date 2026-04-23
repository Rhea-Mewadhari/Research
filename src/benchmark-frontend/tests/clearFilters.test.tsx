import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Clear filters', () => {
  it('resets filters back to default values', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/search/i), 'lamp');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Accessories');
    await user.click(screen.getByLabelText(/in-stock only/i));
    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.getByLabelText(/search/i)).toHaveValue('');
    expect(screen.getByLabelText(/category/i)).toHaveValue('All');
    expect(screen.getByLabelText(/in-stock only/i)).not.toBeChecked();
    expect(screen.getByLabelText(/sort by/i)).toHaveValue('default');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 6 products');
  });
});