import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Loading and error states', () => {
  it('shows loading spinner immediately after render before async load', async () => {
    render(<App />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
    await screen.findByTestId('results-count');
  });

  it('shows error alert when fetch fails and results-count is absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Network error');
    expect(screen.queryByTestId('results-count')).toBeNull();
  });
});
