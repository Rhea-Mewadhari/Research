import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Loading and error states', () => {
  it('spinner is present synchronously while fetch is pending', () => {
    render(<App />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
  });

  it('spinner is removed and results-count is visible after successful load', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.queryByLabelText('loading')).toBeNull();
  });

  it('shows error alert containing Network error when fetch rejects, no results-count', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Network error');
    expect(screen.queryByTestId('results-count')).toBeNull();
  });

  it('shows error alert when fetch responds with ok:false, no results-count', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    render(<App />);
    await screen.findByRole('alert');
    expect(screen.queryByTestId('results-count')).toBeNull();
  });
});
