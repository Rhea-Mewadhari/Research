import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Loading and error states', () => {
  it('shows a loading spinner while fetch is in progress', async () => {
    let resolvePromise!: (value: Response) => void;
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<App />);

    expect(screen.getByLabelText('loading')).toBeInTheDocument();
    expect(screen.queryByTestId('results-count')).toBeNull();

    resolvePromise({
      ok: true,
      json: async () => ({ data: [], total: 0, page: 1, limit: 15, totalPages: 1 }),
    } as Response);

    await screen.findByTestId('results-count');
  });

  it('shows spinner with aria-label="loading" during fetch', async () => {
    let resolvePromise!: (value: Response) => void;
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<App />);

    expect(screen.getByLabelText('loading')).toBeInTheDocument();

    resolvePromise({
      ok: true,
      json: async () => ({ data: [], total: 0, page: 1, limit: 15, totalPages: 1 }),
    } as Response);

    await screen.findByTestId('results-count');
  });

  it('shows an error message when fetch rejects', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network failure'));

    render(<App />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Network failure');
  });

  it('does not show the product list when there is a fetch error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Server error'));

    render(<App />);

    await screen.findByRole('alert');

    expect(screen.queryByTestId('results-count')).toBeNull();
  });
});
