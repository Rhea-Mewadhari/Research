import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Loading and error states', () => {
  it('shows loading spinner before fetch resolves', () => {
    render(<App />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
  });

  it('shows error alert when fetch rejects and spinner is absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Network error');
    expect(screen.queryByLabelText('loading')).not.toBeInTheDocument();
  });
});
