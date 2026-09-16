import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Loading and error states', () => {
  it('shows spinner and no results-count while fetch is pending', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<App />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
    expect(screen.queryByTestId('results-count')).toBeNull();
  });

  it('shows error alert and no spinner when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Network error');
    expect(screen.queryByLabelText('loading')).toBeNull();
  });
});
