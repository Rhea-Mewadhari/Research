import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Loading and error states', () => {
  it('shows a loading spinner while fetching', () => {
    // Never resolves so isLoading stays true
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    render(<App />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
  });

  it('does not show results-count while loading', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    render(<App />);
    expect(screen.queryByTestId('results-count')).not.toBeInTheDocument();
  });

  it('shows an error message when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error'))
    );
    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Network error');
  });

  it('does not show results-count when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error'))
    );
    render(<App />);
    await screen.findByRole('alert');
    expect(screen.queryByTestId('results-count')).not.toBeInTheDocument();
  });

  it('shows a generic error message for non-Error rejections', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('oops'));
    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Failed to load products');
  });
});
