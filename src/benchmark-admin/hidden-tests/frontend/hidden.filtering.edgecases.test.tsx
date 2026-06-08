import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../benchmark-frontend/src/App';

describe('Hidden: filtering edge cases', () => {
  it('search is case-insensitive', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/search/i), 'MOUSE');

    expect(screen.getByText(/wireless mouse/i)).toBeInTheDocument();
    expect(screen.queryByText(/yoga mat/i)).not.toBeInTheDocument();
  });

  it('search trims leading and trailing whitespace', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/search/i), '   foam   ');

    expect(screen.getByText(/foam roller/i)).toBeInTheDocument();
    expect(screen.queryByText(/wireless mouse/i)).not.toBeInTheDocument();
  });

  it('category "All" does not filter anything', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/category/i), 'All');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });

  it('search only matches product name, not category text', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/search/i), 'electronics');

    expect(screen.getByRole('status')).toHaveTextContent('No products found.');
    expect(screen.queryByText(/wireless mouse/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/usb-c hub/i)).not.toBeInTheDocument();
  });

  it('shows empty state when no results match', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/search/i), 'zzzzzz');

    expect(screen.getByRole('status')).toHaveTextContent('No products found.');
  });
});
