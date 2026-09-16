import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Loading and error states', () => {
  it('shows a loading spinner while fetch is in progress', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<App />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
  });

  it('hides the loading spinner after fetch resolves', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.queryByLabelText('loading')).not.toBeInTheDocument();
  });

  it('shows an error alert when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Network error');
  });

  it('shows a generic error message when fetch rejects with a non-Error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('oops'));
    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Failed to load products');
  });
});
