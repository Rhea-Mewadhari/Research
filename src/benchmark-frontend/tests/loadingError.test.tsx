import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Loading and error states', () => {
  it('shows the loading spinner immediately on mount', () => {
    render(<App />);
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });

  it('hides the spinner once data has loaded', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to fetch/i);
  });

  it('does not show the product list when an error occurs', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<App />);

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByTestId('results-count')).not.toBeInTheDocument();
  });
});
