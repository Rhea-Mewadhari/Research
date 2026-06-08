import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../benchmark-frontend/src/App';

describe('Hidden: async data loading', () => {
  it('shows a loading indicator before products appear', async () => {
    render(<App />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders all products once loading completes', async () => {
    render(<App />);

    await waitFor(
      () => expect(screen.getByText(/wireless mouse/i)).toBeInTheDocument(),
      { timeout: 2000 }
    );

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });

  it('filtering works correctly after data loads', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(
      () => expect(screen.getByText(/wireless mouse/i)).toBeInTheDocument(),
      { timeout: 2000 }
    );

    await user.type(screen.getByLabelText(/search/i), 'yoga');

    expect(screen.getByText(/yoga mat/i)).toBeInTheDocument();
    expect(screen.queryByText(/wireless mouse/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
  });

  it('does not produce console errors during async load and interaction', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy  = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<App />);

    await waitFor(
      () => expect(screen.getByText(/wireless mouse/i)).toBeInTheDocument(),
      { timeout: 2000 }
    );

    await user.type(screen.getByLabelText(/search/i), 'mouse');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Electronics');
    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
