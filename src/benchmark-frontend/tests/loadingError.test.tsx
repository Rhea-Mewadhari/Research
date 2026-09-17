import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Loading and error states', () => {
  it('shows a loading spinner while products are being fetched', () => {
    render(<App />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
  });

  it('hides the loading spinner after products load', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.queryByLabelText('loading')).not.toBeInTheDocument();
  });

  it('displays an error message when fetch rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error'))
    );

    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Network error');
  });

  it('displays an error message when the server returns a non-ok status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    );

    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Failed to fetch products: 500');
  });

  it('does not render the product list when there is a fetch error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error'))
    );

    render(<App />);
    await screen.findByRole('alert');
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});
